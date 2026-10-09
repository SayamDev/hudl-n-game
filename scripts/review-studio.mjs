import {chromium} from 'playwright';import fs from 'node:fs';
const dir='.impeccable/review/studio';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
for(const [width,height] of [[320,740],[390,844],[1440,1000]]) {
 await page.setViewportSize({width,height});await page.goto('http://localhost:4173');await page.getByRole('button',{name:'Packs',exact:true}).click();await page.waitForTimeout(900);
 await page.screenshot({path:`${dir}/studio-${width}.png`,fullPage:true,animations:'disabled'});
}
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Mix my pack'}).click();await page.waitForTimeout(900);await page.screenshot({path:`${dir}/draft.png`,fullPage:true,animations:'disabled'});
await page.getByRole('button',{name:'Switch to dark mode'}).click();await page.waitForTimeout(400);await page.screenshot({path:`${dir}/dark.png`,fullPage:true,animations:'disabled'});
await page.getByRole('button',{name:'Switch to light mode'}).click();await page.getByRole('button',{name:'AI theme',exact:true}).click();await page.getByLabel('Your theme').fill('Rainy day adventures');await page.getByLabel('Words in your mix').selectOption('12');await page.getByRole('button',{name:'Generate AI draft'}).click();await page.waitForFunction(()=>document.querySelector('.studio-draft p')?.textContent?.includes('AI draft'),{},{timeout:35000});await page.waitForTimeout(400);
await page.screenshot({path:`${dir}/live-ai.png`,fullPage:true,animations:'disabled'});
await page.getByRole('button',{name:'Edit & save this draft'}).click();const name=await page.getByLabel('Pack name',{exact:true}).inputValue();await page.getByRole('button',{name:'Save pack',exact:true}).click();await page.getByText('Pack saved. Choose it in Imposter or Heads Up settings.').waitFor();
console.log(JSON.stringify({liveAI:true,savedPack:name,keyExposed:false}));await browser.close();
