(() => {
  'use strict';
  const $=s=>document.querySelector(s), canvas=$('#game'), ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height,GROUND=445;
  const UI={menu:$('#menu'),story:$('#story'),ending:$('#ending'),paused:$('#paused'),title:$('#storyTitle'),text:$('#storyText'),number:$('#storyNumber')};
  const keys={left:false,right:false,jump:false,action:false};
  let mode='menu',levelIndex=0,level=null,camera=0,elapsed=0,score=0,collected=0,lives=3,notes=0,soundOn=true,audio=null,last=performance.now(),shake=0;
  const player={x:80,y:350,w:34,h:52,vx:0,vy:0,grounded:false,facing:1,inv:0,actionCd:0};

  const LEVELS=[
    {name:'Vila do Mandacaru',subtitle:'A primeira nota',story:'A música desapareceu da vila. Atravesse as casas coloridas, recolha cajus e encontre a primeira nota da Sanfona Dourada.',width:3300,theme:'village',sky:'#70d2df',ground:'#d9873c',accent:'#e65f32',
      platforms:[[360,360,150],[660,305,140],[940,365,180],[1260,315,140],[1510,260,150],[1800,350,190],[2140,300,150],[2430,360,170],[2750,300,160]],
      coins:[[420,320],[720,265],[1010,325],[1330,275],[1580,220],[1870,310],[2210,260],[2500,320],[2820,260],[3050,400]],enemies:[[560,415,500,820],[1120,415,1080,1430],[1990,415,1940,2320],[2600,415,2570,2900]]},
    {name:'Feira das Cores',subtitle:'Toldos ao vento',story:'A segunda nota passou voando pela feira. Salte sobre barracas, use os toldos como trampolins e acompanhe o ritmo da praça.',width:3400,theme:'market',sky:'#77d8df',ground:'#cc7738',accent:'#d94c45',
      platforms:[[300,365,170],[590,310,150],[850,245,140],[1120,345,190],[1450,285,150],[1730,360,170],[2050,300,170],[2350,235,140],[2650,330,180],[2980,270,160]],
      coins:[[380,325],[660,270],[920,205],[1210,305],[1520,245],[1810,320],[2130,260],[2420,195],[2730,290],[3060,230]],enemies:[[500,415,480,760],[1320,415,1300,1650],[1890,415,1850,2220],[2790,415,2760,3160]]},
    {name:'Chapada dos Ventos',subtitle:'O caminho do céu',story:'A terceira nota está no alto da chapada. Enfrente rajadas de vento, atravesse pedras antigas e alcance o Santuário de Barro.',width:3500,theme:'chapada',sky:'#78cde0',ground:'#a86139',accent:'#6d934a',wind:true,
      platforms:[[330,370,150],[620,300,130],[890,230,130],[1160,330,170],[1460,260,150],[1760,195,150],[2070,290,170],[2380,220,150],[2690,340,180],[3030,270,170]],
      coins:[[400,330],[680,260],[950,190],[1240,290],[1530,220],[1830,155],[2150,250],[2450,180],[2770,300],[3110,230]],enemies:[[520,415,500,800],[1350,415,1320,1660],[2200,415,2160,2520],[2860,415,2820,3240]]},
    {name:'Santuário do Carcará',subtitle:'O guardião encantado',story:'O Carcará de Barro protege a última nota, mas está preso ao feitiço do redemoinho. Use a sanfona para libertá-lo.',width:1900,theme:'temple',sky:'#4f6690',ground:'#81503a',accent:'#ffc43b',boss:true,
      platforms:[[260,355,150],[560,300,140],[850,360,150],[1190,290,150],[1470,350,160]],coins:[[330,315],[630,260],[920,320],[1260,250],[1540,310]],enemies:[]}
  ];

  let platforms=[],coins=[],enemies=[],particles=[],projectiles=[],boss=null;
  function tone(f,d=.07,type='square'){if(!soundOn)return;audio||=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
  function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function show(el){[UI.menu,UI.story,UI.ending].forEach(x=>x.classList.remove('show'));el?.classList.add('show')}

  function presentLevel(i){levelIndex=i;level=LEVELS[i];mode='story';UI.number.textContent=`FASE ${i+1} • ${level.subtitle}`;UI.title.textContent=level.name;UI.text.textContent=level.story;show(UI.story)}
  function loadLevel(){
    platforms=level.platforms.map(([x,y,w],i)=>({x,y,w,h:22,bounce:level.theme==='market'&&i%3===1}));
    coins=level.coins.map(([x,y],i)=>({x,y,w:22,h:26,got:false,p:i*.6}));
    enemies=level.enemies.map(([x,y,min,max],i)=>({x,y,min,max,w:38,h:30,vx:i%2?68:-68,alive:true}));
    particles=[];projectiles=[];boss=level.boss?{x:1550,y:150,w:120,h:95,hp:8,maxHp:8,vx:-105,phase:0,cooldown:1.5,flash:0}:null;
    Object.assign(player,{x:75,y:350,vx:0,vy:0,grounded:false,facing:1,inv:0,actionCd:0});camera=0;elapsed=0;mode='playing';show(null);canvas.focus();tone(330);setTimeout(()=>tone(494,.1),80)
  }
  function restartJourney(){score=0;collected=0;lives=3;notes=0;presentLevel(0)}
  function completeLevel(){
    if(level.boss){notes=4;mode='ending';show(UI.ending);$('#endingText').textContent=`Ravi libertou o Carcará, recuperou as quatro notas e levou a música de volta à vila. Pontuação final: ${score}.`;tone(659,.35);return}
    notes++;score+=500;particlesBurst(player.x,player.y,'#ffc43b',20);tone(659,.18);setTimeout(()=>tone(784,.2),150);presentLevel(levelIndex+1)
  }

  function hurt(fall=false){if(player.inv>0||mode!=='playing')return;lives--;shake=.35;tone(130,.18,'sawtooth');if(lives<=0){lives=3;score=Math.max(0,score-300);loadLevel();return}player.x=Math.max(60,player.x-(fall?300:100));player.y=320;player.vx=0;player.vy=-280;player.inv=1.6}
  function particlesBurst(x,y,color,count=9){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*220,vy:-Math.random()*220-40,life:.7+Math.random()*.5,color})}
  function playNote(){if(player.actionCd>0)return;player.actionCd=.4;tone(520,.08);projectiles.push({x:player.x+(player.facing>0?player.w:-18),y:player.y+17,w:18,h:15,vx:player.facing*420,life:1.8,friendly:true})}

  function update(dt){
    if(mode!=='playing')return;elapsed+=dt;player.inv=Math.max(0,player.inv-dt);player.actionCd=Math.max(0,player.actionCd-dt);shake=Math.max(0,shake-dt);
    const accel=1400;if(keys.left){player.vx-=accel*dt;player.facing=-1}if(keys.right){player.vx+=accel*dt;player.facing=1}if(!keys.left&&!keys.right)player.vx*=Math.pow(.001,dt);player.vx=Math.max(-270,Math.min(270,player.vx));
    if(keys.jump&&player.grounded){player.vy=-610;player.grounded=false;tone(420)}keys.jump=false;if(keys.action){playNote();keys.action=false}
    if(level.wind){const gust=Math.sin(elapsed*1.7)>0.38?80:0;player.vx+=gust*dt}
    player.vy+=1580*dt;player.x+=player.vx*dt;player.x=Math.max(5,Math.min(level.width-player.w,player.x));const oldBottom=player.y+player.h;player.y+=player.vy*dt;player.grounded=false;
    const surfaces=[{x:0,y:GROUND,w:level.width,h:H-GROUND},...platforms];for(const p of surfaces){if(player.vy>=0&&oldBottom<=p.y+9&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;if(p.bounce){player.vy=-750;tone(590,.07)}else{player.vy=0;player.grounded=true}}}
    if(player.y>H+80)hurt(true);
    for(const c of coins)if(!c.got&&hit(player,{x:c.x-11,y:c.y-13,w:22,h:26})){c.got=true;collected++;score+=100;tone(790,.055);particlesBurst(c.x,c.y,'#ffc43b')}
    for(const e of enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x+e.w>e.max)e.vx*=-1;if(hit(player,e)){if(player.vy>120&&player.y+player.h<e.y+20){e.alive=false;player.vy=-360;score+=150;tone(180);particlesBurst(e.x,e.y,'#e66031')}else hurt()}}
    updateProjectiles(dt);if(boss)updateBoss(dt);else if(player.x>level.width-150)completeLevel();
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
    camera+=(player.x-W*.38-camera)*Math.min(1,dt*5);camera=Math.max(0,Math.min(level.width-W,camera));
  }

  function updateProjectiles(dt){for(const p of projectiles){p.x+=p.vx*dt;p.life-=dt;if(!p.friendly&&hit(player,p)){p.life=0;hurt()}if(p.friendly&&boss&&hit(p,boss)){p.life=0;boss.hp--;boss.flash=.18;score+=250;shake=.18;tone(220,.08);particlesBurst(p.x,p.y,'#ffc43b',14);if(boss.hp<=0){score+=1500;boss=null;setTimeout(completeLevel,700)}}}projectiles=projectiles.filter(p=>p.life>0&&p.x>-100&&p.x<level.width+100)}
  function updateBoss(dt){boss.flash=Math.max(0,boss.flash-dt);boss.phase=1-boss.hp/boss.maxHp;boss.x+=boss.vx*dt*(1+boss.phase*.55);if(boss.x<930||boss.x+boss.w>1780)boss.vx*=-1;boss.y=125+Math.sin(elapsed*2.3)*70;boss.cooldown-=dt;if(boss.cooldown<=0){boss.cooldown=Math.max(.55,1.45-boss.phase*.7);const dx=player.x-boss.x,dy=player.y-boss.y,len=Math.hypot(dx,dy)||1;projectiles.push({x:boss.x+45,y:boss.y+60,w:22,h:22,vx:dx/len*230,vy:dy/len*230,life:4,friendly:false})}for(const p of projectiles)if(!p.friendly&&p.vy)p.y+=p.vy*dt;if(hit(player,boss))hurt()}

  function background(){rect(0,0,W,H,level?.sky||'#70d2df');const cam=camera;rect(735-cam*.04,55,72,72,level?.theme==='temple'?'#f4db83':'#ffd44c');
    for(let i=0;i<7;i++){const x=i*390-(cam*.16%2730)-80,y=75+(i%3)*38;rect(x,y+14,110,22,'#fff0d3');rect(x+20,y,40,25,'#fff0d3');rect(x+60,y+6,35,22,'#fff0d3')}
    for(let i=0;i<9;i++){const x=i*370-(cam*.38%3330)-100;ctx.fillStyle=level?.theme==='temple'?'#374d6d':level?.theme==='chapada'?'#7d7746':'#599049';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+180,235+(i%2)*30);ctx.lineTo(x+370,GROUND);ctx.fill()}
    drawDecor();rect(0,GROUND,W,H-GROUND,level?.ground||'#d9873c');rect(0,GROUND,W,13,level?.theme==='temple'?'#b27b4b':'#5a9148');for(let x=-(cam%52);x<W;x+=52){rect(x,GROUND+30,18,7,'rgba(92,49,37,.28)');rect(x+27,GROUND+63,13,6,'rgba(255,197,92,.3)')}
  }
  function drawDecor(){const theme=level?.theme;if(theme==='village')for(let x=180;x<level.width;x+=720)house(x-camera,340,x%3?'#f4b44c':'#72b6a0',x%2?'#da5532':'#e9bb39');if(theme==='market')for(let x=140;x<level.width;x+=420)stall(x-camera,350,['#e95f45','#f6ba3d','#4f9ca5'][(x/420)%3|0]);if(theme==='chapada')for(let x=210;x<level.width;x+=560){cactus(x-camera,GROUND);rect(x-camera+90,360,95,85,'#a9673e');rect(x-camera+100,346,75,15,'#d98b4d')}if(theme==='temple'){for(let x=80;x<level.width;x+=300){rect(x-camera,320,78,125,'#9c6948');rect(x-camera-10,305,98,17,'#cb9157');rect(x-camera+22,270,34,35,'#9c6948')}rect(1370-camera,230,360,215,'#754637');rect(1410-camera,270,280,175,'#a36a45')}}
  function house(x,y,wall,roof){rect(x,y,120,GROUND-y,wall);rect(x+15,y+34,27,GROUND-y-34,'#34778a');rect(x+75,y+38,30,GROUND-y-38,'#814831');ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-14,y+4);ctx.lineTo(x+59,y-48);ctx.lineTo(x+134,y+4);ctx.fill();rect(x-12,y+4,142,9,'#753c2e');cactus(x+150,GROUND)}
  function stall(x,y,color){rect(x,y,145,GROUND-y,'#e0a256');rect(x-8,y-17,161,21,color);for(let i=0;i<5;i++)rect(x-8+i*32,y-17,16,21,'#fff0d0');rect(x+16,y+23,112,10,'#78412e');for(let i=0;i<4;i++)rect(x+23+i*27,y+10,13,12,['#e65f32','#ffc43b','#4f9a4c'][i%3])}
  function cactus(x,y){rect(x+12,y-68,18,68,'#357d47');rect(x+6,y-76,30,13,'#449952');rect(x-7,y-48,20,13,'#357d47');rect(x-10,y-61,13,27,'#357d47');rect(x+29,y-36,21,12,'#357d47');rect(x+40,y-49,13,25,'#357d47');rect(x+16,y-87,10,13,'#df5066')}
  function drawPlatforms(){for(const p of platforms){const x=p.x-camera;if(x>W||x+p.w<0)continue;rect(x,p.y,p.w,p.h,p.bounce?'#d75043':'#895033');rect(x,p.y,p.w,7,p.bounce?'#ffc43b':'#efb24b');for(let q=x+9;q<x+p.w;q+=29)rect(q,p.y+11,11,5,'rgba(70,38,31,.45)')}}
  function drawCoin(c){const x=c.x-camera,y=c.y+Math.sin(elapsed*5+c.p)*4;rect(x-8,y-12,16,24,'#e65c2e');rect(x-12,y-8,24,16,'#e65c2e');rect(x-4,y-9,8,18,'#ffc43b');rect(x+1,y-16,4,6,'#397e46');rect(x+5,y-17,8,4,'#54a050')}
  function drawEnemy(e){const x=e.x-camera,y=e.y;rect(x+5,y+3,28,24,'#ae5631');rect(x,y+10,38,14,'#ae5631');rect(x+7,y,9,7,'#f09b41');rect(x+23,y,9,7,'#f09b41');rect(x+10,y+9,5,5,'#fff3d0');rect(x+25,y+9,5,5,'#fff3d0');rect(x+12,y+11,3,3,'#142d49');rect(x+25,y+11,3,3,'#142d49');rect(x+7,y+26,10,4,'#63392b');rect(x+23,y+26,10,4,'#63392b')}
  function drawPlayer(){if(player.inv>0&&Math.floor(player.inv*12)%2===0)return;const x=player.x-camera,y=player.y;ctx.save();if(player.facing<0){ctx.translate(x+player.w,0);ctx.scale(-1,1)}else ctx.translate(x,0);rect(6,y,21,9,'#243e72');rect(11,y-5,15,8,'#243e72');rect(8,y+9,21,17,'#9a593b');rect(25,y+13,6,8,'#35251f');rect(12,y+15,4,4,'#fff3d0');rect(14,y+16,3,3,'#142d49');rect(5,y+25,25,18,'#efb438');rect(2,y+29,7,16,'#9a593b');rect(29,y+29,6,14,'#9a593b');rect(8,y+43,9,9,'#254b77');rect(21,y+43,9,9,'#254b77');rect(5,y+49,13,5,'#673b2e');rect(20,y+49,13,5,'#673b2e');rect(6,y+25,24,5,'#e65f31');rect(27,y+25,11,17,'#d39228');ctx.restore()}
  function drawExit(){if(level.boss)return;const x=level.width-115-camera;rect(x,300,9,145,'#6b402d');rect(x-8,290,25,15,'#f0bb3c');rect(x+12,316,40,61,'#cf772e');rect(x+18,307,20,77,'#f3b83d');rect(x+37,321,26,50,'#d34e2f');for(let i=0;i<4;i++)rect(x+20,317+i*15,13,4,'#6b3a2a')}
  function drawBoss(){if(!boss)return;const x=boss.x-camera,y=boss.y;ctx.save();if(boss.flash>0)ctx.globalAlpha=.45;rect(x+25,y+20,70,62,'#a7653e');rect(x+5,y+32,35,32,'#c07a47');rect(x+80,y+31,35,32,'#c07a47');rect(x+41,y+7,42,30,'#b66e42');rect(x+49,y+18,8,8,'#fff3d0');rect(x+70,y+18,8,8,'#fff3d0');rect(x+52,y+21,4,4,'#142d49');rect(x+70,y+21,4,4,'#142d49');rect(x+56,y+31,22,13,'#df9d42');rect(x+10,y+70,27,13,'#754330');rect(x+83,y+70,27,13,'#754330');ctx.restore();rect(W/2-170,20,340,22,'#142d49');rect(W/2-164,26,328*(boss.hp/boss.maxHp),10,'#e66031');ctx.fillStyle='#fff3d0';ctx.font='900 12px Courier New';ctx.textAlign='center';ctx.fillText('CARCARÁ DE BARRO',W/2,57);ctx.textAlign='left'}
  function drawProjectiles(){for(const p of projectiles){const x=p.x-camera;if(p.friendly){ctx.fillStyle='#ffc43b';ctx.font='bold 27px serif';ctx.fillText('♪',x,p.y+18)}else{rect(x,p.y,p.w,p.h,'#794b79');rect(x+5,p.y+5,p.w-10,p.h-10,'#e66073')}}}
  function hud(){rect(16,16,330,60,'rgba(20,45,73,.92)');ctx.fillStyle='#fff3d0';ctx.font='900 12px Courier New';ctx.fillText(`CAJUS ${String(collected).padStart(2,'0')}   VIDAS ${'♥'.repeat(lives)}`,31,42);ctx.fillText(`NOTAS ${notes}/4   FASE ${levelIndex+1}/4`,31,65);rect(W-190,16,174,42,'rgba(20,45,73,.92)');ctx.fillText(`${level.wind?'VENTO  ':''}${String(Math.ceil(elapsed)).padStart(3,'0')}s`,W-174,43)}
  function draw(){ctx.imageSmoothingEnabled=false;ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*8,(Math.random()-.5)*8);background();drawPlatforms();drawExit();coins.filter(c=>!c.got).forEach(drawCoin);enemies.filter(e=>e.alive).forEach(drawEnemy);drawProjectiles();drawBoss();drawPlayer();for(const p of particles)rect(p.x-camera,p.y,5,5,p.color);hud();ctx.restore()}
  function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);if(level)draw();else{ctx.fillStyle='#70d2df';ctx.fillRect(0,0,W,H)}requestAnimationFrame(loop)}

  const map={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump',x:'action',X:'action'};
  addEventListener('keydown',e=>{if(map[e.key]){e.preventDefault();keys[map[e.key]]=true}if(e.key==='Escape'&&mode==='playing'){mode='paused';UI.paused.classList.add('show')}else if(e.key==='Escape'&&mode==='paused'){mode='playing';UI.paused.classList.remove('show')}});addEventListener('keyup',e=>{if(map[e.key])keys[map[e.key]]=false});addEventListener('blur',()=>{keys.left=keys.right=keys.jump=keys.action=false});
  document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key,down=e=>{e.preventDefault();keys[k]=true;b.classList.add('down')},up=e=>{e.preventDefault();keys[k]=false;b.classList.remove('down')};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)});
  $('#start').onclick=restartJourney;$('#continue').onclick=loadLevel;$('#again').onclick=restartJourney;$('#sound').onclick=()=>{soundOn=!soundOn;$('#sound').textContent=`SOM: ${soundOn?'ON':'OFF'}`;if(soundOn)tone(440)};$('#pause').onclick=()=>{if(mode==='playing'){mode='paused';UI.paused.classList.add('show')}else if(mode==='paused'){mode='playing';UI.paused.classList.remove('show')}};
  requestAnimationFrame(loop);
})();
