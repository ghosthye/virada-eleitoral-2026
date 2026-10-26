/* Minimal, fail-closed reader of the official TSE 2026 ASN.1 BU schema.
 * Source: https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/formato-arquivos-de-bu-rdv-e-assinatura-digital
 * Reads official second-round presidential BUs only. It does not verify signatures.
 * Numeric totals and identity are checked; unrecognized layouts are rejected.
 */
export function parseBU(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength < 50 || bytes.byteLength > 2_000_000) throw new Error('BU: tamanho inválido');
  let nodeCount = 0;
  function fail(message) { throw new Error('BU: ' + message); }
  function read(offset, limit, depth = 0) {
    if (depth > 32 || ++nodeCount > 20000 || offset + 2 > limit) fail('estrutura excede limites');
    const tag = bytes[offset++];
    if ((tag & 31) === 31) fail('tag longa não suportada');
    let length = bytes[offset++];
    if (length & 128) {
      const count = length & 127;
      if (!count || count > 4 || offset + count > limit) fail('comprimento inválido');
      length = 0;
      for (let i = 0; i < count; i++) length = length * 256 + bytes[offset++];
    }
    const end = offset + length;
    if (!Number.isSafeInteger(end) || end > limit) fail('conteúdo truncado');
    const node = {tag, start: offset, end, children: null};
    if (tag & 32) {
      node.children = [];
      for (let p = offset; p < end;) { const child = read(p, end, depth + 1); node.children.push(child); p = child.end; }
    }
    return node;
  }
  function expect(node, tag, count) {
    if (!node || node.tag !== tag) fail('layout inesperado');
    if (count !== undefined && node.children?.length !== count) fail('quantidade inesperada de campos');
    return node;
  }
  function seq(node, count) { return expect(node, 0x30, count).children; }
  function integer(node, tag = 2, max = 99999999) {
    expect(node, tag);
    const size = node.end - node.start;
    if (!size || size > 6 || bytes[node.start] & 128) fail('inteiro inválido');
    let value = 0;
    for (let p = node.start; p < node.end; p++) value = value * 256 + bytes[p];
    if (!Number.isSafeInteger(value) || value > max) fail('inteiro fora do intervalo');
    return value;
  }
  const text = node => new TextDecoder('utf-8', {fatal:true}).decode(bytes.subarray(node.start,node.end));
  function identity(node, tag) {
    const fields = expect(node, tag, 3).children, mz = seq(fields[0], 2);
    return {municipality:integer(mz[0],2,99999),zone:integer(mz[1],2,9999),location:integer(fields[1],2,9999),section:integer(fields[2],2,9999)};
  }
  function header(node) {
    const fields=seq(node,2);
    expect(fields[0],27); const generated=text(fields[0]);
    if (!/^2026\d{4}T\d{6}$/.test(generated)) fail('data de geração inválida para 2026');
    if (integer(fields[1],0x82,99999)!==3221) fail('pleito não corresponde a 3221');
    return generated;
  }
  const root=read(0,bytes.length);
  if(root.end!==bytes.length)fail('bytes extras');
  const envelope=seq(root);
  if(envelope.length!==5)fail('envelope criptografado ou variante não suportada');
  const generated=header(envelope[0]);
  if(integer(envelope[1],10)!==2)fail('ambiente não oficial');
  let outerIdentity;
  if(envelope[2]?.tag===0xA0)outerIdentity=identity(envelope[2],0xA0);
  else if(envelope[2]?.tag===0xA1){
    const contingency=expect(envelope[2],0xA1,1).children,mz=seq(contingency[0],2);
    outerIdentity={municipality:integer(mz[0],2,99999),zone:integer(mz[1],2,9999)};
  }else fail('identificação de urna desconhecida');
  if(integer(envelope[3],10)!==1)fail('arquivo não é Boletim de Urna');
  const octet=expect(envelope[4],4), body=read(octet.start,octet.end);
  if(body.end!==octet.end)fail('conteúdo inconsistente');
  const fields=seq(body);
  if(fields.length<9||fields.length>11)fail('estrutura do BU desconhecida');
  header(fields[0]);
  if(integer(fields[1],10)!==2)fail('conteúdo não oficial');
  seq(fields[2]); // Urna; not needed to interpret the vote totals.
  const id=identity(fields[3],0x30);
  for(const key of ['municipality','zone','section','location'])if(outerIdentity[key]!==undefined&&id[key]!==outerIdentity[key])fail('identidade interna e externa divergente');
  expect(fields[4],27);
  if(![0xA0,0xA1].includes(fields[5]?.tag))fail('origem da apuração desconhecida');
  const isManualApportionment=fields[5].tag===0xA1,attendance=integer(fields[6],2,9999);
  let index=7;
  if(fields[index]?.tag===0xA1){
    const detail=expect(fields[index++],0xA1,3).children;
    if(detail.reduce((s,n)=>s+integer(n,2,9999),0)!==attendance)fail('detalhamento de comparecimento divergente');
  }
  const elections=seq(fields[index++]);
  seq(fields[index++]); // Histórico dos códigos de carga.
  if(index<fields.length)seq(fields[index++]); // Histórico de voto impresso, quando presente.
  if(index!==fields.length)fail('campos adicionais desconhecidos');
  const selected=elections.filter(node=>integer(seq(node)[0],2,99999)===6258);
  if(selected.length!==1)fail('eleição presidencial 6258 ausente ou duplicada');
  const election=seq(selected[0],7), registered=integer(election[1],2,9999),original=integer(election[2],2,9999),temporary=integer(election[3],2,9999);
  if(original+temporary!==registered||attendance>registered)fail('aptos inconsistentes');
  const result={election:6258,municipality:id.municipality,zone:id.zone,section:id.section,location:id.location,registered,attendance,lula:0,flavio:0,valid:0,blank:0,nulls:0,others:0,generated,source:'TSE · BU oficial 2026',signatureVerified:false};
  let presidentCount=0;
  for(const votingNode of seq(election[4])){
    const voting=seq(votingNode,3);
    const cargoType=integer(voting[0],10),cargoAttendance=integer(voting[1],2,9999);
    for(const cargoNode of seq(voting[2])){
      const cargo=seq(cargoNode,3);
      if(cargo[0].tag!==0x81||integer(cargo[0],0x81,99)!==1)continue;
      if(cargoType!==1||++presidentCount!==1)fail('cargo presidencial inconsistente');
      // A Sistema de Apuração BU can report zero in the urn-level attendance
      // field while retaining the actual count in ResultadoVotacao for president.
      if(isManualApportionment&&attendance===0)result.attendance=cargoAttendance;
      else if(cargoAttendance!==attendance)fail('comparecimento presidencial divergente');
      integer(cargo[1],2,99);
      const seen=new Set();
      for(const voteNode of seq(cargo[2])){
        const v=seq(voteNode);
        if(v.length!==4&&v.length!==5)fail('tupla de votos inesperada');
        const type=integer(v[0],0x81,5),votes=integer(v[1],0x82,9999);
        if(![1,2,3].includes(type))fail('tipo de voto inesperado para presidente');
        let candidate=null,ordinal;
        if(type===1){
          if(v.length!==5)fail('identificação de candidato ausente');
          const ident=expect(v[2],0xA3,2).children;
          const party=integer(ident[0],2,99);candidate=integer(ident[1],2,99999);
          if(![13,22].includes(candidate)||party!==candidate)fail('candidato inesperado em 6258');
          result[candidate===13?'lula':'flavio']+=votes;result.valid+=votes;ordinal=3;
        }else{
          if(v.length!==4)fail('identificação em voto branco/nulo');
          result[type===2?'blank':'nulls']+=votes;ordinal=2;
        }
        const key=type+':'+(candidate??'');if(seen.has(key))fail('tupla de voto duplicada');seen.add(key);
        integer(v[ordinal],2,9999);expect(v[ordinal+1],4);
      }
    }
  }
  if(presidentCount!==1||result.valid+result.blank+result.nulls!==result.attendance||result.attendance>registered)fail('soma presidencial não fecha');
  result.apportionment=isManualApportionment?'Sistema de Apuração':'Urna eletrônica';
  return result;
}

// Select the officially totalized generation from EA18. Never choose the first
// hash blindly, and never build a BU filename by guessing.
export function selectTotalizedBU(aux){
  if(aux?.f!=='o'||aux.st!=='Totalizada'||!Array.isArray(aux.hashes))throw new Error('BU não totalizado');
  const choices=aux.hashes.filter(h=>h.st==='Totalizado').flatMap(h=>(h.arq||[]).filter(a=>['bu','busa'].includes(a.tp)&&/^[a-z0-9-]+\.dat$/.test(a.nm)).map(a=>({hash:h.hash,name:a.nm,type:a.tp})));
  if(choices.length!==1||! /^[a-f0-9]+$/.test(choices[0].hash))throw new Error('Geração totalizada ambígua ou ausente');
  return choices[0];
}
