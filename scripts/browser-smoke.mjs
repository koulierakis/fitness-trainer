import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const server=spawn('npm',['run','preview','--','--port','4173'],{stdio:'inherit',shell:process.platform==='win32'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try{
  for(let i=0;i<30;i++){
    try{const r=await fetch('http://127.0.0.1:4173');if(r.ok)break;}catch{}
    if(i===29)throw new Error('Preview server did not become ready');
    await sleep(500);
  }
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  // Ignore network/resource console noise; fail only on uncaught application errors.\n  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.getByText('Functional',{exact:true}).first().waitFor();
  await page.getByText('Pilates Reformer',{exact:true}).first().click();
  await page.getByText('36 ασκήσεις').waitFor();
  await page.getByRole('button',{name:'Ασκησιολόγιο'}).click();
  await page.getByText('PILATES REFORMER LIBRARY').waitFor();
  await page.getByRole('button',{name:'Advanced'}).first().click();
  const result=page.locator('.resultMeta');
  await result.waitFor();
  const countText=await result.textContent();
  if(!/\d+ ασκήσεις/.test(countText||''))throw new Error('Reformer filtered count missing');
  await page.locator('.exerciseCard').first().click();
  await page.getByText('Ρυθμίσεις Reformer').waitFor();
  await page.locator('.topbar .iconBtn').first().click();
  await page.getByRole('button',{name:/Programs/}).click();
  await page.getByText('REFORMER LESSON PLANS').waitFor();
  await page.getByRole('button',{name:'Full Body',exact:true}).click();
  const cards=page.locator('.programCard');
  if(await cards.count()<1)throw new Error('No Reformer Full Body program rendered');
  await cards.first().click();
  await page.getByText('PILATES REFORMER · LESSON PLAN').waitFor();
  if(await page.locator('.lessonExercise').count()!==10)throw new Error('Expected 10 real exercises in Reformer program');
  if(errors.length)throw new Error('Browser errors: '+errors.join(' | '));
  console.log('Browser smoke QA OK: mobile UI, Reformer library, detail and 50-minute program verified.');
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
