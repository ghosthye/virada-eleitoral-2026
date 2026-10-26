import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sectionAPI} from '../server/section-api.mjs';
const root=fileURLToPath(new URL('../docs/',import.meta.url)),port=Number(process.env.PORT||8787);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost:'+port);if(u.pathname==='/api/section'){const result=await sectionAPI(new Request(u.href,{method:req.method}));res.writeHead(result.status,Object.fromEntries(result.headers));return res.end(Buffer.from(await result.arrayBuffer()));}const rel=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname).slice(1),file=path.resolve(root,rel);if(!file.startsWith(path.resolve(root)+path.sep)||!fs.statSync(file,{throwIfNoEntry:false})?.isFile()){res.writeHead(404);return res.end('Pagina nao encontrada');}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);}catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:'A consulta nao pode ser concluida.'}));}}).listen(port,'0.0.0.0',()=>console.log(`A Virada: http://localhost:${port}`));
