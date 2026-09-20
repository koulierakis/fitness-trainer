import { exercises } from '../src/data.js';
import { CURATED_GIF_NAME_MAP } from '../src/curatedMediaMap.js';

const API='https://oss.exercisedb.dev/api/v1/exercises';
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_–—-]+/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();

async function loadSource(){
  const all=[]; const seen=new Set(); let after=null; let guard=0;
  do{
    const url=new URL(API); url.searchParams.set('limit','100'); if(after)url.searchParams.set('after',after);
    const res=await fetch(url,{headers:{accept:'application/json'}});
    if(!res.ok)throw new Error(`ExerciseDB HTTP ${res.status}`);
    const payload=await res.json();
    for(const item of payload?.data||[]) if(item?.exerciseId&&!seen.has(item.exerciseId)){seen.add(item.exerciseId);all.push(item)}
    after=payload?.meta?.hasNextPage?payload?.meta?.nextCursor:null;
    if(++guard>100)throw new Error('pagination guard exceeded');
  }while(after);
  return all;
}

async function urlOk(url){
  if(!url)return false;
  try{
    const head=await fetch(url,{method:'HEAD',redirect:'follow'});
    if(head.ok)return true;
    const get=await fetch(url,{headers:{Range:'bytes=0-0'},redirect:'follow'});
    return get.ok||get.status===206;
  }catch{return false}
}

const source=await loadSource();
const byName=new Map();
for(const item of source){
  const key=norm(item.name);
  if(key&&!byName.has(key))byName.set(key,item);
}

if(exercises.length!==201)throw new Error(`Expected 201 curated exercises, got ${exercises.length}`);

const canonicalIds=new Set(exercises.map(x=>x.id));
const unknownMappings=Object.keys(CURATED_GIF_NAME_MAP).filter(id=>!canonicalIds.has(id));
if(unknownMappings.length)throw new Error(`Mappings for unknown canonical IDs: ${unknownMappings.join(', ')}`);

const rows=[];
for(const ex of exercises){
  const exact=byName.get(norm(ex.name));
  const alias=CURATED_GIF_NAME_MAP[ex.id];
  const mapped=exact||byName.get(norm(alias));
  rows.push({id:ex.id,name:ex.name,match:exact?'exact':mapped?'alias':'fallback',source:mapped?.name||'',gif:mapped?.gifUrl||''});
}

const invalidAliases=rows.filter(r=>CURATED_GIF_NAME_MAP[r.id]&&r.match==='fallback');
if(invalidAliases.length)throw new Error(`Alias targets missing from ExerciseDB: ${invalidAliases.map(x=>x.id).join(', ')}`);

const matched=rows.filter(r=>r.match!=='fallback');
const uniqueUrls=[...new Set(matched.map(r=>r.gif).filter(Boolean))];
const broken=[];
for(let i=0;i<uniqueUrls.length;i+=12){
  const batch=uniqueUrls.slice(i,i+12);
  const checks=await Promise.all(batch.map(async url=>[url,await urlOk(url)]));
  broken.push(...checks.filter(([,ok])=>!ok).map(([url])=>url));
}
if(broken.length)throw new Error(`Broken GIF assets: ${broken.join(', ')}`);

const exact=rows.filter(r=>r.match==='exact').length;
const alias=rows.filter(r=>r.match==='alias').length;
const fallback=rows.filter(r=>r.match==='fallback');
const duplicateSourceNames=[...matched.reduce((m,r)=>m.set(norm(r.source),(m.get(norm(r.source))||[]).concat(r.id)),new Map())]
  .filter(([,ids])=>ids.length>1);

console.log(JSON.stringify({
  curated:exercises.length,
  sourceRecords:source.length,
  exactMatches:exact,
  reviewedAliasMatches:alias,
  realGifCoverage:matched.length,
  fallbackCount:fallback.length,
  coveragePercent:Number((matched.length/exercises.length*100).toFixed(1)),
  brokenGifAssets:broken.length,
  duplicateSourceMappings:duplicateSourceNames,
  fallbackExercises:fallback.map(x=>({id:x.id,name:x.name}))
},null,2));
