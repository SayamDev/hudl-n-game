import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const dir='.impeccable/review/welcome';fs.mkdirSync(dir,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const c=await b.newContext();const p=await c.newPage();
const evidence=[];
async function capture(name){await p.waitForTimeout(450);await p.screenshot({path:`${dir}/${name}.png`,fullPage:true,animations:'disabled'});evidence.push({name,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),violations:(await new AxeBuilder({page:p}).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
await p.setViewportSize({width:390,height:844});await p.goto('http://localhost:4173');await capture('welcome-390');await p.getByRole('button',{name:'Next',exact:true}).click();await capture('practice-390');await p.getByRole('button',{name:'Next',exact:true}).click();await capture('ready-390');await p.getByRole('button',{name:'Add my crew'}).click();
for(const name of ['Maya','Noah','Zara','Leo','Amira']) {await p.getByLabel('Player name',{exact:true}).fill(name);await p.getByRole('button',{name:'Add player',exact:true}).click();}
for(const width of [390,320,1440]) {
 await p.setViewportSize({width,height:width===1440?1000:844});
 for(const name of ['Crew','Scores','Packs']) {await p.getByRole('button',{name,exact:true}).click();await capture(`${name.toLowerCase()}-${width}`);}
}
await p.setViewportSize({width:390,height:844});await p.getByRole('button',{name:'Write your own',exact:true}).click();await capture('write-390');await p.getByRole('button',{name:'Saved (0)',exact:true}).click();await capture('saved-390');await p.getByRole('button',{name:'Games',exact:true}).click();await capture('home-390');await p.setViewportSize({width:1440,height:1000});await capture('home-1440');
await p.getByRole('button',{name:'Switch to dark mode'}).click();await p.getByRole('button',{name:'Crew',exact:true}).click();await capture('crew-dark');await p.getByRole('button',{name:'Scores',exact:true}).click();await capture('scores-dark');
fs.writeFileSync(`${dir}/checks.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));await b.close();
