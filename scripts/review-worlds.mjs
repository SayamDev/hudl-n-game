import AxeBuilder from '@axe-core/playwright';
import {chromium} from 'playwright';import fs from 'node:fs';
const dir='.impeccable/review/worlds';fs.mkdirSync(dir,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true});const context=await b.newContext();const p=await context.newPage();
for(const width of [320,390,1440]) {await p.setViewportSize({width,height:width===1440?1000:844});await p.goto('http://localhost:4173');await p.waitForTimeout(900);await p.screenshot({path:`${dir}/home-${width}.png`,fullPage:true,animations:'disabled'});console.log(width,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Switch to dark mode'}).click();await p.screenshot({path:`${dir}/home-dark.png`,fullPage:true,animations:'disabled'});await p.getByRole('button',{name:'Switch to light mode'}).click();
await p.locator('article').first().getByRole('button',{name:'Let’s play'}).click();for(const name of ['Maya','Noah','Zara','Leo','Amira']) {await p.getByLabel('Player name',{exact:true}).fill(name);await p.getByRole('button',{name:'Add player',exact:true}).click();}await p.screenshot({path:`${dir}/crew.png`,fullPage:true,animations:'disabled'});await p.getByRole('button',{name:'Back to the party'}).click();
for(const [id,name] of [['imposter','Imposter'],['mafia','Mafia'],['spy','Where Are We?'],['charades','Heads Up!'],['party','Most Likely To']]) {
 await p.locator('article').filter({has:p.getByRole('heading',{name,exact:true})}).getByRole('button',{name:'Let’s play'}).click();await p.waitForTimeout(800);await p.screenshot({path:`${dir}/${id}-setup.png`,fullPage:true,animations:'disabled'});await p.getByRole('button',{name:'Quick start'}).click();
 if(id==='charades') await p.getByRole('button',{name:'Start the clock'}).click();
 await p.waitForTimeout(800);await p.screenshot({path:`${dir}/${id}-play.png`,fullPage:true,animations:'disabled'});
 const scan=await new AxeBuilder({page:p}).analyze();console.log(id,scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));if(scan.violations.length) throw Error('Accessibility issue in '+id);
 await p.getByRole('button',{name:'Pause game'}).click();await p.getByRole('button',{name:'Leave this game',exact:true}).click();await p.getByRole('button',{name:'Leave round',exact:true}).click();
}
await b.close();
