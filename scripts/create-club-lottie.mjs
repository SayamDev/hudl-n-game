import fs from 'node:fs';
const f=k=>({a:0,k});const c=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).concat(1);
const k=(t,s,e)=>({t,s,e,i:{x:[.2],y:[1]},o:{x:[.15],y:[0]}});
const rect=(x,y,w,h,r,color)=>[{ty:'rc',p:f([x,y]),s:f([w,h]),r:f(r)},{ty:'fl',c:f(c(color)),o:f(100),r:1}];
const group=(name,items)=>({ty:'gr',nm:name,it:[...items,{ty:'tr',p:f([0,0]),a:f([0,0]),s:f([100,100]),r:f(0),o:f(100),sk:f(0),sa:f(0)}]});
const cards=['#d4fa77','#dacdeb','#c9e4d7'].map((color,i)=>({ddd:0,ind:i+1,ty:4,nm:`Identity card ${i+1}`,sr:1,ks:{o:f(100),p:{a:1,k:[k(0,[120+(i-1)*5,145,0],[120+(i-1)*54,115,0]),k(28,[120+(i-1)*54,115,0],[120+(i-1)*26,116,0]),{t:60,s:[120+(i-1)*26,116,0]}]},a:f([0,0,0]),s:{a:1,k:[k(0,[80,80,100],[105,105,100]),k(30,[105,105,100],[100,100,100]),{t:60,s:[100,100,100]}]},r:{a:1,k:[k(0,[(i-1)*2],[(i-1)*24]),k(30,[(i-1)*24],[(i-1)*12]),{t:60,s:[(i-1)*12]}]}},ao:0,shapes:[group('Eyes',i===0?[...rect(-16,-5,12,8,0,color),...rect(16,-5,12,8,0,color)]:i===1?[...rect(-16,-5,17,17,8,color),...rect(16,-5,17,17,8,color)]:rect(0,-5,22,22,11,color)),group('Mask',rect(0,-5,65,30,4,'#19211c')),group('Signature',rect(0,35,30,4,2,'#19211c')),group('Card',rect(0,0,i===1?108:92,i===2?108:124,i===1?30:i===2?3:12,color))],ip:0,op:100,st:0,bm:0}));
const scene={v:'5.12.2',fr:60,ip:0,op:100,w:240,h:240,nm:'HUDL identities: deal, fan, settle',assets:[],layers:cards};
for(const base of ['public','.lottie-player/public']){const dir=`${base}/projects/hudl/scene-2`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/lottie.json`,JSON.stringify(scene));}
