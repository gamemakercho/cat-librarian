// Refresh the bundled runtime from the real game folders, preserving explicit story patches.
// Patches are checked in a temporary tree before any bundled file is replaced.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,mkdtempSync,existsSync,rmSync} from 'node:fs';
import {resolve,dirname,join,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),read=f=>readFileSync(join(root,f),'utf8');
const config=JSON.parse(read('scripts/game-sources.json')),stage=mkdtempSync(join(tmpdir(),'cat-game-sync-')),records={version:1,sources:{}};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const [name,s]of Object.entries(config)){
 if(!existsSync(s.source))throw Error('원본 폴더 없음: '+s.source);
 const commit=execFileSync('git',['--git-dir='+join(s.source,'.git'),'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files=[];
 for(const file of s.files){const dest=join(stage,name,file),bytes=readFileSync(join(s.source,file));mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes);files.push({file,sourceSha256:hash(bytes),adapted:s.adapted.includes(file)});}
 const patch=join(root,'scripts/game-adaptations',name+'.patch');if(readFileSync(patch,'utf8').trim())execFileSync('git',['apply','--no-index','--whitespace=nowarn',patch],{cwd:stage,stdio:'pipe'});
 for(const file of files)file.bundledSha256=hash(readFileSync(join(stage,name,file.file)));
 records.sources[name]={repository:s.repository,commit,files};
}
// All adapters applied cleanly. A changed upstream context fails above, leaving the app intact.
for(const [name,s]of Object.entries(config))for(const file of s.files){const dest=join(root,'games',name,file);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(stage,name,file),dest);}
writeFileSync(join(root,'games/upstream-lock.json'),JSON.stringify(records,null,2)+'\n');
const origins=JSON.parse(read('games/origins.json'));for(const a of [...origins.assets,...origins.unchangedRules]){const bytes=readFileSync(join(root,'games',a.file));a.sha256=hash(bytes);if(a.bytes)a.bytes=bytes.length;}
for(const file of ['book-catch/assets/clear-success.webp','book-catch/assets/clear-failure.webp'])if(!origins.assets.some(a=>a.file===file)){const bytes=readFileSync(join(root,'games',file));origins.assets.push({file,bytes:bytes.length,sha256:hash(bytes)});}
writeFileSync(join(root,'games/origins.json'),JSON.stringify(origins,null,2)+'\n');
const runner=JSON.parse(read('games/ending-chase/SOURCE.json'));runner.version='fullscreen7';runner.commit=records.sources['ending-chase'].commit;runner.localChanges='2026-10-25 fullscreen/touch-only controls and mixed second burst; original repository and bundled runtime match';for(const f of runner.unchanged)f.sha256=hash(readFileSync(join(root,'games/ending-chase',f.file)));writeFileSync(join(root,'games/ending-chase/SOURCE.json'),JSON.stringify(runner,null,2)+'\n');
if(dirname(stage)!==resolve(tmpdir())||!basename(stage).startsWith('cat-game-sync-'))throw Error('Unexpected staging path');
rmSync(stage,{recursive:true,force:true});
console.log(JSON.stringify(Object.fromEntries(Object.entries(records.sources).map(([k,s])=>[k,{commit:s.commit,files:s.files.length,adaptations:s.files.filter(f=>f.adapted).length}]))));

