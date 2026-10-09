import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage();
const root='.impeccable/review/club';fs.mkdirSync(root,{recursive:true});
for(const [name,width,height] of [['mobile',390,844],['small-phone',320,740],['desktop',1440,1000]]){
 await page.setViewportSize({width,height});await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);await page.screenshot({path:`${root}/${name}.png`,fullPage:true});
 console.log(name,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})));
}
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Switch to dark mode'}).click();await page.screenshot({path:`${root}/dark.png`,fullPage:true});
await page.getByRole('button',{name:'Settings',exact:true}).click();await page.waitForTimeout(500);await page.screenshot({path:`${root}/preferences.png`,fullPage:true});
await page.getByRole('button',{name:'Classic',exact:true}).click();await page.getByRole('button',{name:'hudl n game home'}).click();await page.waitForTimeout(500);await page.screenshot({path:`${root}/classic.png`,fullPage:true});
await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Social Club',exact:true}).click();await page.getByLabel('Dark party mode').uncheck();await page.getByRole('button',{name:'hudl n game home'}).click();
await page.locator('article').first().getByRole('button',{name:'Let’s play'}).click();for(const name of ['Maya','Noah','Zara']){await page.getByLabel('Player name',{exact:true}).fill(name);await page.getByRole('button',{name:'Add player',exact:true}).click()}
await page.waitForTimeout(500);await page.screenshot({path:`${root}/crew.png`,fullPage:true});await page.getByRole('button',{name:'Let’s play, all 3 of us'}).click();await page.getByRole('button',{name:'Quick start'}).click();
// Seed a deterministic role using the persisted session, then resume normally.
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hudl-game-v1')));saved.state.session.roles[saved.state.players[0].id]='Imposter';await page.addInitScript(data=>localStorage.setItem('hudl-game-v1',JSON.stringify(data)),saved);await page.reload();await page.getByRole('button',{name:'Resume game'}).click();await page.waitForTimeout(3300);await page.screenshot({path:`${root}/peek.png`,fullPage:true});await page.getByRole('button',{name:'Hold to peek'}).focus();await page.keyboard.down('Space');await page.getByRole('heading',{name:'IMPOSTER',exact:true}).waitFor();await page.screenshot({path:`${root}/imposter.png`,fullPage:true});await page.keyboard.up('Space');
await browser.close();
