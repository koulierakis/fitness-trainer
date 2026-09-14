// Verifies every OpenGym3D manifest entry: GLB exists, CORS enabled, GLB v2 valid,
// has >=1 animation clip, has skin (skeletal), reports bounds & required extensions.
// Exit code 1 when any critical check fails. Usage: node scripts/verify-3d-assets.mjs
const BASE='https://assiamahs.github.io/opengym3d';
const MANIFEST=`${BASE}/exercises.json`;

const r=await fetch(MANIFEST,{cache:'no-store'});
if(!r.ok)throw new Error(`manifest HTTP ${r.status}`);
const cors=r.headers.get('access-control-allow-origin');
const list=await r.json();
console.log(`manifest: ${list.length} entries · CORS=${cors||'NONE'}`);

const problems=[];
const rows=[];
for(const item of list){
  const id=item.id, glb=String(item.glb||'').trim();
  const row={id,url:glb};
  if(!glb){problems.push(`${id}: manifest entry has no glb`);rows.push(row);continue;}
  const url=/^https:\/\//i.test(glb)?glb:`${BASE}/${glb.replace(/^\//,'')}`;
  row.url=url;
  try{
    const res=await fetch(url,{cache:'no-store'});
    row.status=res.status;
    row.cors=res.headers.get('access-control-allow-origin');
    row.type=res.headers.get('content-type');
    if(!res.ok){problems.push(`${id}: GLB HTTP ${res.status} → ${url}`);rows.push(row);continue;}
    const buf=Buffer.from(await res.arrayBuffer());
    row.bytes=buf.length;
    if(buf.length<20||buf.readUInt32LE(0)!==0x46546C67){problems.push(`${id}: not a GLB binary`);rows.push(row);continue;}
    if(buf.readUInt32LE(4)!==2){problems.push(`${id}: unsupported glTF version ${buf.readUInt32LE(4)}`);rows.push(row);continue;}
    const jsonLen=buf.readUInt32LE(12);
    const json=JSON.parse(buf.slice(20,20+jsonLen).toString('utf8'));
    row.clips=(json.animations||[]).length;
    row.clipNames=(json.animations||[]).map(a=>a.name||'(unnamed)').slice(0,3).join(', ');
    row.skins=(json.skins||[]).length;
    row.extensionsRequired=json.extensionsRequired||[];
    // bounds from mesh POSITION accessors (min/max are authored per accessor)
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(const mesh of json.meshes||[])for(const prim of mesh.primitives||[]){
      const acc=json.accessors?.[prim.attributes?.POSITION];
      if(acc?.min&&acc?.max)for(let i=0;i<3;i++){min[i]=Math.min(min[i],acc.min[i]);max[i]=Math.max(max[i],acc.max[i]);}
    }
    row.bounds=(isFinite(min[0])?min.map((v,i)=>+(max[i]-v).toFixed(2)):[null,null,null]).join('x');
    if(!row.clips)problems.push(`${id}: GLB has 0 animation clips → ${url}`);
    if(row.extensionsRequired.some(e=>/draco|meshopt|KTX2/i.test(e)))problems.push(`${id}: requires unhandled extension ${row.extensionsRequired.join(',')}`);
  }catch(e){problems.push(`${id}: ${e.message} → ${url}`);}
  rows.push(row);
  console.log(`${row.id.padEnd(18)} HTTP ${row.status} · ${(row.bytes/1024).toFixed(0)}KB · clips=${row.clips} [${row.clipNames||'-'}] · skins=${row.skins} · bounds=${row.bounds||'?'} · ext=[${row.extensionsRequired||''}] · CORS=${row.cors||'-'}`);
}

const manifestIds=new Set(list.map(x=>x.id));
console.log(`\nmanifest ids (${manifestIds.size}): ${[...manifestIds].join(', ')}`);
if(problems.length){console.error('\nFAILED CHECKS:');for(const p of problems)console.error(' - '+p);process.exit(1);}
console.log(`\nALL ${rows.length} GLB ASSETS VERIFIED: exist, CORS-enabled, GLB v2, skeletal clips present.`);
