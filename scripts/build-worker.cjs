const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const repo=path.resolve(__dirname,'..'),site=path.resolve(process.argv[2]||'');if(!process.argv[2])throw Error('Uso: node scripts/build-worker.cjs <checkout-do-Site>');
const rev=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(rev))throw Error('Commit de dados invalido');
const assetFiles=['index.html','styles.css','editorial.css','reading-nav.js','app.js','favicon.svg'],assets={};for(const f of assetFiles){const value=fs.readFileSync(path.join(repo,'docs',f),'utf8');assets['/'+f]=value;if(f==='index.html')assets['/']=value;}
const parser=fs.readFileSync(path.join(repo,'server/parse-bu.mjs'),'utf8');
const api=fs.readFileSync(path.join(repo,'server/section-api.mjs'),'utf8').replace(/^import .*;\r?\n/,'');
const worker=parser+'\n'+api+'\nconst ATLAS_ASSETS='+JSON.stringify(assets)+';\nconst DATA_REV='+JSON.stringify(rev)+';\n'+fs.readFileSync(path.join(repo,'deploy/worker-handler.mjs.txt'),'utf8');
fs.mkdirSync(path.join(site,'worker'),{recursive:true});fs.mkdirSync(path.join(site,'dist/server'),{recursive:true});fs.mkdirSync(path.join(site,'dist/.openai'),{recursive:true});fs.writeFileSync(path.join(site,'worker/index.js'),worker);fs.writeFileSync(path.join(site,'dist/server/index.js'),worker);
const manifest=JSON.parse(fs.readFileSync(path.join(site,'.openai/hosting.json')));delete manifest.static;manifest.d1=null;manifest.r2=null;fs.writeFileSync(path.join(site,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(site,'dist/.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(site,'package.json'),JSON.stringify({name:'virada-site-worker',private:true,type:'module'},null,2)+'\n');console.log(JSON.stringify({rev,workerBytes:Buffer.byteLength(worker),project_id:manifest.project_id}));
