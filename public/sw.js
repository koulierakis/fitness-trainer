// Network-first with runtime cache. Bumping CACHE forces every client to drop
// stale bundles (older builds shipped a dead "skeletal animation" fallback).
const CACHE='fitness-trainer-v3';
const PRECACHE=['/','/index.html','/manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const cacheable=url.origin===location.origin
    ||/\.glb$/i.test(url.pathname)
    ||url.pathname.endsWith('/exercises.json');
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')&&cacheable){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(req).then(hit=>hit
      ||(req.mode==='navigate'?caches.match('/index.html'):undefined))
    )
  );
});

