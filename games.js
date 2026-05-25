/* === BLOXVERSE: 8 встроенных плейсов === */
/* Каждый плейс — функция, монтирующая UI в host-элемент */

const GAMES = [
  { id:'clicker',  title:'Mega Clicker',   icon:'👆', bg:'linear-gradient(135deg,#ff2a55,#ffd60a)', cat:'casual', players:'12.4K', rating:'4.8' },
  { id:'obby',     title:'Obby Tower',     icon:'🟩', bg:'linear-gradient(135deg,#39ff14,#00d4ff)', cat:'action', players:'8.7K',  rating:'4.7', tag:'hot' },
  { id:'racer',    title:'Block Racer',    icon:'🏎️', bg:'linear-gradient(135deg,#ff6b35,#ffd60a)', cat:'action', players:'5.2K',  rating:'4.6' },
  { id:'shooter',  title:'Pixel Arena',    icon:'🔫', bg:'linear-gradient(135deg,#7c4dff,#ff2a55)', cat:'action', players:'21.1K', rating:'4.9', tag:'hot' },
  { id:'maze',     title:'Lost Maze',      icon:'🧩', bg:'linear-gradient(135deg,#00d4ff,#7c4dff)', cat:'casual', players:'3.4K',  rating:'4.5' },
  { id:'snake',    title:'Cube Snake',     icon:'🐍', bg:'linear-gradient(135deg,#39ff14,#0d6e2e)', cat:'arcade', players:'4.1K',  rating:'4.4' },
  { id:'tycoon',   title:'Bloxs Tycoon',   icon:'🏭', bg:'linear-gradient(135deg,#ffd60a,#ff6b35)', cat:'casual', players:'9.8K',  rating:'4.8', tag:'new' },
  { id:'memory',   title:'Brain Match',    icon:'🧠', bg:'linear-gradient(135deg,#ff2a55,#7c4dff)', cat:'arcade', players:'2.9K',  rating:'4.6', tag:'new' },
];

/* ========== УТИЛИТЫ ========== */
function el(tag, props={}, ...children){
  const n=document.createElement(tag);
  for(const k in props){
    if(k==='style')Object.assign(n.style,props[k]);
    else if(k==='class')n.className=props[k];
    else if(k.startsWith('on'))n.addEventListener(k.slice(2).toLowerCase(),props[k]);
    else n.setAttribute(k,props[k]);
  }
  for(const c of children){
    if(c==null)continue;
    n.append(c.nodeType?c:document.createTextNode(c));
  }
  return n;
}
function makeCanvas(host,w=720,h=440){
  const wrap=el('div',{class:'gw'});
  const hud=el('div',{class:'gw-hud'});
  wrap.append(hud);
  const c=document.createElement('canvas');
  c.width=w;c.height=h;
  wrap.append(c);
  const ctrl=el('div',{class:'gw-controls'});
  wrap.append(ctrl);
  const instr=el('div',{class:'gw-instr'});
  wrap.append(instr);
  host.append(wrap);
  return {wrap,hud,canvas:c,ctx:c.getContext('2d'),ctrl,instr};
}
const STOPPERS=[]; // активные кэнсел-функции
function killAllGames(){ while(STOPPERS.length) try{STOPPERS.pop()();}catch(e){} }

/* ========== 1. MEGA CLICKER ========== */
function game_clicker(host){
  const wrap=el('div',{class:'gw'});
  let score=parseInt(localStorage.getItem('bv_clicker')||0);
  let perClick=1, autoClick=0, autoCost=50, upgradeCost=20;
  const hud=el('div',{class:'gw-hud'},
    el('div',{class:'stat'},'Очки: ',el('span',{id:'cs'},String(score))),
    el('div',{class:'stat'},'+',el('span',{id:'cp'},String(perClick)),'/клик'),
    el('div',{class:'stat'},el('span',{id:'ca'},String(autoClick)),'/сек'),
  );
  const big=el('button',{
    class:'btn btn-primary',
    style:{fontSize:'80px',width:'200px',height:'200px',borderRadius:'50%',margin:'30px auto',display:'block'},
    onClick:()=>{score+=perClick;update();bump();}
  },'⬢');
  function bump(){big.style.transform='scale(.92)';setTimeout(()=>big.style.transform='',80);}
  function update(){
    wrap.querySelector('#cs').textContent=score;
    wrap.querySelector('#cp').textContent=perClick;
    wrap.querySelector('#ca').textContent=autoClick;
    localStorage.setItem('bv_clicker',score);
  }
  const ctrl=el('div',{class:'gw-controls'},
    el('button',{onClick:()=>{
      if(score>=upgradeCost){score-=upgradeCost;perClick++;upgradeCost=Math.floor(upgradeCost*1.6);update();toast(`+1 за клик! След: ${upgradeCost}`);}
      else toast('Не хватает очков');
    }},'⬆ +Клик (20)'),
    el('button',{class:'alt',onClick:()=>{
      if(score>=autoCost){score-=autoCost;autoClick++;autoCost=Math.floor(autoCost*1.8);update();toast(`+1 авто! След: ${autoCost}`);}
      else toast('Не хватает очков');
    }},'⚙ +Авто (50)'),
    el('button',{class:'alt',onClick:()=>{
      addCoins(Math.floor(score/100));score=0;perClick=1;autoClick=0;update();toast('Сброс. Получено монет.');
    }},'💰 Обменять'),
  );
  wrap.append(hud,big,ctrl,el('div',{class:'gw-instr'},'Жми на куб. Прокачивай. Меняй на ◆ Bloxs.'));
  host.append(wrap);
  const iv=setInterval(()=>{if(autoClick){score+=autoClick;update();}},1000);
  STOPPERS.push(()=>clearInterval(iv));
}

/* ========== 2. OBBY TOWER ========== */
function game_obby(host){
  const g=makeCanvas(host,720,440);
  let player={x:60,y:380,vy:0,w:24,h:32,onGround:false};
  const platforms=[];
  let scrollX=0,best=parseInt(localStorage.getItem('bv_obby')||0);
  function reset(){
    player={x:60,y:380,vy:0,w:24,h:32,onGround:false};scrollX=0;
    platforms.length=0;
    platforms.push({x:0,y:420,w:200,h:20,c:'#39ff14'});
    let x=240;
    for(let i=0;i<60;i++){
      const w=50+Math.random()*60;
      platforms.push({x,y:200+Math.random()*200,w,h:18,c:i%5===0?'#ff2a55':'#00d4ff'});
      x+=w+40+Math.random()*60;
    }
  }
  reset();
  const keys={};
  const kd=e=>{keys[e.code]=true;if(e.code==='Space')e.preventDefault();};
  const ku=e=>{keys[e.code]=false;};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  g.hud.append(
    el('div',{class:'stat'},'Дистанция: ',el('span',{id:'od'},'0')),
    el('div',{class:'stat'},'Лучший: ',el('span',{id:'ob'},String(best))),
  );
  g.ctrl.append(
    el('button',{onClick:()=>{keys.ArrowLeft=true;setTimeout(()=>keys.ArrowLeft=false,150);}},'◀'),
    el('button',{onClick:()=>{player.onGround&&(player.vy=-12,player.onGround=false);}},'▲ Прыжок'),
    el('button',{onClick:()=>{keys.ArrowRight=true;setTimeout(()=>keys.ArrowRight=false,150);}},'▶'),
    el('button',{class:'alt',onClick:reset},'⟲ Заново'),
  );
  g.instr.textContent='Стрелки/A,D — двигаться. Space — прыжок. Не падай!';
  let raf;
  function loop(){
    const {ctx,canvas}=g;
    ctx.fillStyle='#0a0e1e';ctx.fillRect(0,0,canvas.width,canvas.height);
    // звёзды
    ctx.fillStyle='rgba(255,255,255,.4)';
    for(let i=0;i<30;i++){
      const sx=(i*73+scrollX*.2)%canvas.width;
      ctx.fillRect(sx,(i*47)%200,2,2);
    }
    if(keys.ArrowLeft||keys.KeyA)player.x-=4;
    if(keys.ArrowRight||keys.KeyD)player.x+=4;
    if((keys.Space||keys.ArrowUp||keys.KeyW)&&player.onGround){player.vy=-12;player.onGround=false;}
    player.vy+=.6;player.y+=player.vy;
    player.onGround=false;
    for(const p of platforms){
      const px=p.x-scrollX;
      if(player.x+player.w>px&&player.x<px+p.w&&player.y+player.h>p.y&&player.y+player.h<p.y+p.h+10&&player.vy>=0){
        player.y=p.y-player.h;player.vy=0;player.onGround=true;
      }
    }
    if(player.x>canvas.width/2){scrollX+=player.x-canvas.width/2;player.x=canvas.width/2;}
    if(player.y>canvas.height+50){toast('Упал! 😵');if(scrollX>best){best=Math.floor(scrollX);localStorage.setItem('bv_obby',best);addCoins(Math.floor(best/20));}reset();}
    for(const p of platforms){
      ctx.fillStyle=p.c;
      ctx.fillRect(p.x-scrollX,p.y,p.w,p.h);
    }
    ctx.fillStyle='#ffd60a';
    ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#000';
    ctx.fillRect(player.x+5,player.y+8,4,4);
    ctx.fillRect(player.x+15,player.y+8,4,4);
    g.wrap.querySelector('#od').textContent=Math.floor(scrollX);
    g.wrap.querySelector('#ob').textContent=best;
    raf=requestAnimationFrame(loop);
  }
  loop();
  STOPPERS.push(()=>{cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);});
}

/* ========== 3. BLOCK RACER ========== */
function game_racer(host){
  const g=makeCanvas(host,720,440);
  let car={x:340,y:360,w:40,h:60},speed=6,score=0,lives=3,paused=false;
  const obs=[];
  let best=parseInt(localStorage.getItem('bv_racer')||0);
  g.hud.append(
    el('div',{class:'stat'},'Очки: ',el('span',{id:'rs'},'0')),
    el('div',{class:'stat'},'❤ ',el('span',{id:'rl'},String(lives))),
    el('div',{class:'stat'},'🏆 ',el('span',{id:'rb'},String(best))),
  );
  const keys={};
  const kd=e=>keys[e.code]=true,ku=e=>keys[e.code]=false;
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  g.ctrl.append(
    el('button',{onClick:()=>{keys.ArrowLeft=true;setTimeout(()=>keys.ArrowLeft=false,120);}},'◀'),
    el('button',{onClick:()=>{keys.ArrowRight=true;setTimeout(()=>keys.ArrowRight=false,120);}},'▶'),
    el('button',{class:'alt',onClick:()=>paused=!paused},'⏸'),
  );
  g.instr.textContent='Стрелки ←/→. Уворачивайся от блоков.';
  let raf,lanesY=0;
  function spawn(){if(Math.random()<.03)obs.push({x:80+Math.random()*560,y:-60,w:40,h:60});}
  function loop(){
    if(!paused){
      const {ctx,canvas}=g;
      ctx.fillStyle='#0a0e1e';ctx.fillRect(0,0,canvas.width,canvas.height);
      // дорога
      ctx.fillStyle='#1a1f3d';ctx.fillRect(60,0,600,canvas.height);
      ctx.strokeStyle='rgba(255,255,255,.5)';ctx.setLineDash([20,20]);
      ctx.lineDashOffset=-lanesY;
      ctx.beginPath();ctx.moveTo(260,0);ctx.lineTo(260,canvas.height);ctx.moveTo(460,0);ctx.lineTo(460,canvas.height);ctx.stroke();
      ctx.setLineDash([]);
      lanesY+=speed;
      if(keys.ArrowLeft)car.x-=5;
      if(keys.ArrowRight)car.x+=5;
      car.x=Math.max(70,Math.min(610,car.x));
      spawn();
      for(const o of obs){o.y+=speed;}
      for(let i=obs.length-1;i>=0;i--){
        const o=obs[i];
        ctx.fillStyle='#ff2a55';ctx.fillRect(o.x,o.y,o.w,o.h);
        if(o.x<car.x+car.w&&o.x+o.w>car.x&&o.y<car.y+car.h&&o.y+o.h>car.y){
          obs.splice(i,1);lives--;toast('Столкновение!');
          if(lives<=0){
            if(score>best){best=score;localStorage.setItem('bv_racer',best);}
            addCoins(Math.floor(score/10));
            toast(`Конец! Очков: ${score}`);
            obs.length=0;car.x=340;lives=3;score=0;speed=6;
          }
        } else if(o.y>canvas.height){obs.splice(i,1);score+=10;speed+=.02;}
      }
      // машина
      ctx.fillStyle='#00d4ff';ctx.fillRect(car.x,car.y,car.w,car.h);
      ctx.fillStyle='#fff';ctx.fillRect(car.x+8,car.y+8,24,18);
      g.wrap.querySelector('#rs').textContent=score;
      g.wrap.querySelector('#rl').textContent=lives;
      g.wrap.querySelector('#rb').textContent=best;
    }
    raf=requestAnimationFrame(loop);
  }
  loop();
  STOPPERS.push(()=>{cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);});
}

/* ========== 4. PIXEL ARENA (shooter) ========== */
function game_shooter(host){
  const g=makeCanvas(host,720,440);
  const player={x:360,y:220,r:14,hp:5};
  const bullets=[],enemies=[];
  let score=0,wave=1;
  let best=parseInt(localStorage.getItem('bv_shooter')||0);
  g.hud.append(
    el('div',{class:'stat'},'Очки: ',el('span',{id:'ss'},'0')),
    el('div',{class:'stat'},'Волна: ',el('span',{id:'sw'},'1')),
    el('div',{class:'stat'},'❤ ',el('span',{id:'sh'},'5')),
    el('div',{class:'stat'},'🏆 ',el('span',{id:'sb'},String(best))),
  );
  g.instr.textContent='WASD — движение. Клик мышью — стрелять.';
  const keys={};let mouse={x:360,y:100,down:false};
  const kd=e=>keys[e.code]=true,ku=e=>keys[e.code]=false;
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  const rect=()=>g.canvas.getBoundingClientRect();
  const mm=e=>{const r=rect();mouse.x=(e.clientX-r.left)*(g.canvas.width/r.width);mouse.y=(e.clientY-r.top)*(g.canvas.height/r.height);};
  const md=e=>{mm(e);shoot();};
  g.canvas.addEventListener('mousemove',mm);
  g.canvas.addEventListener('mousedown',md);
  g.canvas.addEventListener('touchstart',e=>{const t=e.touches[0],r=rect();mouse.x=(t.clientX-r.left)*(g.canvas.width/r.width);mouse.y=(t.clientY-r.top)*(g.canvas.height/r.height);shoot();e.preventDefault();},{passive:false});
  function shoot(){
    const dx=mouse.x-player.x,dy=mouse.y-player.y,d=Math.hypot(dx,dy)||1;
    bullets.push({x:player.x,y:player.y,vx:dx/d*8,vy:dy/d*8,life:60});
  }
  function spawn(){
    if(enemies.length<3+wave){
      const side=Math.floor(Math.random()*4);
      const w=g.canvas.width,h=g.canvas.height;
      let x,y;
      if(side===0){x=0;y=Math.random()*h;}
      else if(side===1){x=w;y=Math.random()*h;}
      else if(side===2){x=Math.random()*w;y=0;}
      else{x=Math.random()*w;y=h;}
      enemies.push({x,y,r:12,hp:1+Math.floor(wave/3)});
    }
  }
  let raf;
  function loop(){
    const {ctx,canvas}=g;
    ctx.fillStyle='#0a0e1e';ctx.fillRect(0,0,canvas.width,canvas.height);
    // сетка
    ctx.strokeStyle='rgba(255,255,255,.04)';
    for(let i=0;i<canvas.width;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,canvas.height);ctx.stroke();}
    for(let i=0;i<canvas.height;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(canvas.width,i);ctx.stroke();}
    if(keys.KeyW||keys.ArrowUp)player.y-=4;
    if(keys.KeyS||keys.ArrowDown)player.y+=4;
    if(keys.KeyA||keys.ArrowLeft)player.x-=4;
    if(keys.KeyD||keys.ArrowRight)player.x+=4;
    player.x=Math.max(player.r,Math.min(canvas.width-player.r,player.x));
    player.y=Math.max(player.r,Math.min(canvas.height-player.r,player.y));
    spawn();
    // враги
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
      e.x+=dx/d*1.2;e.y+=dy/d*1.2;
      ctx.fillStyle='#ff2a55';
      ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();
      if(d<player.r+e.r){enemies.splice(i,1);player.hp--;toast('-1 HP');if(player.hp<=0){
        if(score>best){best=score;localStorage.setItem('bv_shooter',best);}
        addCoins(Math.floor(score/5));
        toast(`Поражение! Очков: ${score}`);
        player.hp=5;player.x=360;player.y=220;score=0;wave=1;enemies.length=0;bullets.length=0;
      }}
    }
    // пули
    for(let i=bullets.length-1;i>=0;i--){
      const b=bullets[i];b.x+=b.vx;b.y+=b.vy;b.life--;
      if(b.life<=0||b.x<0||b.y<0||b.x>canvas.width||b.y>canvas.height){bullets.splice(i,1);continue;}
      ctx.fillStyle='#ffd60a';ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();
      for(let j=enemies.length-1;j>=0;j--){
        const e=enemies[j];
        if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){
          bullets.splice(i,1);e.hp--;if(e.hp<=0){enemies.splice(j,1);score+=10;if(score%100===0)wave++;}
          break;
        }
      }
    }
    // игрок
    ctx.fillStyle='#00d4ff';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();
    // прицел
    const ang=Math.atan2(mouse.y-player.y,mouse.x-player.x);
    ctx.strokeStyle='#fff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(player.x+Math.cos(ang)*22,player.y+Math.sin(ang)*22);ctx.stroke();
    g.wrap.querySelector('#ss').textContent=score;
    g.wrap.querySelector('#sw').textContent=wave;
    g.wrap.querySelector('#sh').textContent=player.hp;
    g.wrap.querySelector('#sb').textContent=best;
    raf=requestAnimationFrame(loop);
  }
  loop();
  STOPPERS.push(()=>{cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);});
}

/* ========== 5. LOST MAZE ========== */
function game_maze(host){
  const g=makeCanvas(host,440,440);
  const N=15,SIZE=g.canvas.width/N;
  let grid=[],px=0,py=0,goal={x:N-1,y:N-1},moves=0;
  function gen(){
    grid=Array.from({length:N},()=>Array.from({length:N},()=>({n:false,e:false,s:false,w:false,v:false})));
    const stack=[[0,0]];grid[0][0].v=true;
    while(stack.length){
      const [x,y]=stack[stack.length-1];
      const dirs=[];
      if(y>0&&!grid[y-1][x].v)dirs.push('n');
      if(x<N-1&&!grid[y][x+1].v)dirs.push('e');
      if(y<N-1&&!grid[y+1][x].v)dirs.push('s');
      if(x>0&&!grid[y][x-1].v)dirs.push('w');
      if(!dirs.length){stack.pop();continue;}
      const d=dirs[Math.floor(Math.random()*dirs.length)];
      grid[y][x][d]=true;
      if(d==='n'){grid[y-1][x].s=true;grid[y-1][x].v=true;stack.push([x,y-1]);}
      if(d==='e'){grid[y][x+1].w=true;grid[y][x+1].v=true;stack.push([x+1,y]);}
      if(d==='s'){grid[y+1][x].n=true;grid[y+1][x].v=true;stack.push([x,y+1]);}
      if(d==='w'){grid[y][x-1].e=true;grid[y][x-1].v=true;stack.push([x-1,y]);}
    }
    px=0;py=0;moves=0;draw();
  }
  function draw(){
    const {ctx,canvas}=g;
    ctx.fillStyle='#0a0e1e';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#00d4ff';ctx.lineWidth=2;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const c=grid[y][x],cx=x*SIZE,cy=y*SIZE;
      ctx.beginPath();
      if(!c.n){ctx.moveTo(cx,cy);ctx.lineTo(cx+SIZE,cy);}
      if(!c.e){ctx.moveTo(cx+SIZE,cy);ctx.lineTo(cx+SIZE,cy+SIZE);}
      if(!c.s){ctx.moveTo(cx,cy+SIZE);ctx.lineTo(cx+SIZE,cy+SIZE);}
      if(!c.w){ctx.moveTo(cx,cy);ctx.lineTo(cx,cy+SIZE);}
      ctx.stroke();
    }
    ctx.fillStyle='#39ff14';ctx.fillRect(goal.x*SIZE+SIZE*.25,goal.y*SIZE+SIZE*.25,SIZE*.5,SIZE*.5);
    ctx.fillStyle='#ffd60a';ctx.beginPath();ctx.arc(px*SIZE+SIZE/2,py*SIZE+SIZE/2,SIZE*.3,0,Math.PI*2);ctx.fill();
    g.wrap.querySelector('#mm').textContent=moves;
  }
  function move(d){
    const c=grid[py][px];
    if(d==='n'&&c.n)py--;else if(d==='s'&&c.s)py++;
    else if(d==='e'&&c.e)px++;else if(d==='w'&&c.w)px--;
    else return;
    moves++;draw();
    if(px===goal.x&&py===goal.y){
      const reward=Math.max(10,100-moves);
      addCoins(reward);
      toast(`Финиш! +${reward} ◆ за ${moves} ходов`);
      setTimeout(gen,800);
    }
  }
  const kd=e=>{
    if(['ArrowUp','KeyW'].includes(e.code))move('n');
    if(['ArrowDown','KeyS'].includes(e.code))move('s');
    if(['ArrowLeft','KeyA'].includes(e.code))move('w');
    if(['ArrowRight','KeyD'].includes(e.code))move('e');
  };
  addEventListener('keydown',kd);
  g.hud.append(el('div',{class:'stat'},'Ходов: ',el('span',{id:'mm'},'0')));
  g.ctrl.append(
    el('button',{onClick:()=>move('n')},'▲'),
    el('button',{onClick:()=>move('w')},'◀'),
    el('button',{onClick:()=>move('s')},'▼'),
    el('button',{onClick:()=>move('e')},'▶'),
    el('button',{class:'alt',onClick:gen},'🔀 Новый'),
  );
  g.instr.textContent='Стрелки/WASD. Дойди до зелёного.';
  gen();
  STOPPERS.push(()=>removeEventListener('keydown',kd));
}

/* ========== 6. CUBE SNAKE ========== */
function game_snake(host){
  const g=makeCanvas(host,440,440);
  const N=20,SIZE=g.canvas.width/N;
  let snake,dir,food,score,best=parseInt(localStorage.getItem('bv_snake')||0),alive;
  function reset(){snake=[{x:10,y:10}];dir={x:1,y:0};food=rndFood();score=0;alive=true;}
  function rndFood(){return{x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};}
  const kd=e=>{
    if(['ArrowUp','KeyW'].includes(e.code)&&dir.y===0)dir={x:0,y:-1};
    if(['ArrowDown','KeyS'].includes(e.code)&&dir.y===0)dir={x:0,y:1};
    if(['ArrowLeft','KeyA'].includes(e.code)&&dir.x===0)dir={x:-1,y:0};
    if(['ArrowRight','KeyD'].includes(e.code)&&dir.x===0)dir={x:1,y:0};
  };
  addEventListener('keydown',kd);
  g.hud.append(
    el('div',{class:'stat'},'Счёт: ',el('span',{id:'ss2'},'0')),
    el('div',{class:'stat'},'🏆 ',el('span',{id:'sb2'},String(best))),
  );
  g.ctrl.append(
    el('button',{onClick:()=>{if(dir.y===0)dir={x:0,y:-1};}},'▲'),
    el('button',{onClick:()=>{if(dir.x===0)dir={x:-1,y:0};}},'◀'),
    el('button',{onClick:()=>{if(dir.y===0)dir={x:0,y:1};}},'▼'),
    el('button',{onClick:()=>{if(dir.x===0)dir={x:1,y:0};}},'▶'),
  );
  g.instr.textContent='Управляй змейкой. Собирай еду.';
  reset();
  const iv=setInterval(()=>{
    if(!alive)return;
    const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.y<0||head.x>=N||head.y>=N||snake.some(s=>s.x===head.x&&s.y===head.y)){
      alive=false;
      if(score>best){best=score;localStorage.setItem('bv_snake',best);}
      addCoins(Math.floor(score/2));
      toast(`Бум! Счёт: ${score}`);setTimeout(reset,800);return;
    }
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){score++;food=rndFood();}else snake.pop();
    draw();
  },120);
  function draw(){
    const {ctx,canvas}=g;
    ctx.fillStyle='#0a0e1e';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#1a1f3d';
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if((x+y)%2)ctx.fillRect(x*SIZE,y*SIZE,SIZE,SIZE);
    ctx.fillStyle='#ff2a55';ctx.fillRect(food.x*SIZE+3,food.y*SIZE+3,SIZE-6,SIZE-6);
    snake.forEach((s,i)=>{
      ctx.fillStyle=i===0?'#ffd60a':'#39ff14';
      ctx.fillRect(s.x*SIZE+2,s.y*SIZE+2,SIZE-4,SIZE-4);
    });
    g.wrap.querySelector('#ss2').textContent=score;
    g.wrap.querySelector('#sb2').textContent=best;
  }
  STOPPERS.push(()=>{clearInterval(iv);removeEventListener('keydown',kd);});
}

/* ========== 7. BLOXS TYCOON ========== */
function game_tycoon(host){
  const wrap=el('div',{class:'gw'});
  let state=JSON.parse(localStorage.getItem('bv_tycoon')||'null')||{money:50,buildings:[]};
  const types=[
    {id:'fact',name:'🏭 Фабрика',  cost:50, income:1},
    {id:'mine',name:'⛏ Шахта',     cost:200,income:5},
    {id:'farm',name:'🌾 Ферма',    cost:500,income:14},
    {id:'oil', name:'🛢 Нефтевышка',cost:2000,income:60},
    {id:'cyber',name:'🤖 Дата-центр',cost:10000,income:350},
  ];
  function save(){localStorage.setItem('bv_tycoon',JSON.stringify(state));}
  function income(){return state.buildings.reduce((s,b)=>s+types.find(t=>t.id===b).income,0);}
  const hud=el('div',{class:'gw-hud'},
    el('div',{class:'stat'},'💵 ',el('span',{id:'tm'},String(state.money))),
    el('div',{class:'stat'},'⚡ ',el('span',{id:'ti'},String(income())),'/сек'),
    el('div',{class:'stat'},'🏗 ',el('span',{id:'tb'},String(state.buildings.length)),' зданий'),
  );
  wrap.append(hud);
  const grid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'12px',margin:'16px 0'}});
  types.forEach(t=>{
    const card=el('div',{style:{background:'rgba(255,255,255,.05)',borderRadius:'12px',padding:'14px',textAlign:'center'}},
      el('div',{style:{fontSize:'34px',marginBottom:'4px'}},t.name.split(' ')[0]),
      el('div',{style:{fontWeight:'700',marginBottom:'4px'}},t.name.split(' ')[1]||t.name),
      el('div',{style:{color:'#9aa3c7',fontSize:'12px',marginBottom:'8px'}},`💵 ${t.cost} • +${t.income}/c`),
      el('button',{onClick:()=>{
        if(state.money>=t.cost){state.money-=t.cost;state.buildings.push(t.id);save();upd();toast(`Куплено: ${t.name}`);}
        else toast('Не хватает 💵');
      }},'Купить'),
    );
    grid.append(card);
  });
  wrap.append(grid);
  const ctrl=el('div',{class:'gw-controls'},
    el('button',{class:'alt',onClick:()=>{
      addCoins(Math.floor(state.money/100));toast(`Получено ◆${Math.floor(state.money/100)}`);
      state.money=50;state.buildings=[];save();upd();
    }},'💰 Обменять империю на ◆'),
  );
  wrap.append(ctrl,el('div',{class:'gw-instr'},'Покупай здания. Они дают пассивный доход. Меняй на Bloxs.'));
  host.append(wrap);
  function upd(){
    wrap.querySelector('#tm').textContent=Math.floor(state.money);
    wrap.querySelector('#ti').textContent=income();
    wrap.querySelector('#tb').textContent=state.buildings.length;
  }
  const iv=setInterval(()=>{state.money+=income();save();upd();},1000);
  STOPPERS.push(()=>clearInterval(iv));
}

/* ========== 8. BRAIN MATCH (memory) ========== */
function game_memory(host){
  const wrap=el('div',{class:'gw'});
  const icons=['🍕','🚀','🎮','🐱','🌈','💎','🔥','⚡'];
  let deck=[],flipped=[],matched=0,moves=0,best=parseInt(localStorage.getItem('bv_memory')||999);
  const hud=el('div',{class:'gw-hud'},
    el('div',{class:'stat'},'Ходов: ',el('span',{id:'mv'},'0')),
    el('div',{class:'stat'},'Пар: ',el('span',{id:'mp'},'0/8')),
    el('div',{class:'stat'},'🏆 Минимум: ',el('span',{id:'mb'},best===999?'—':String(best))),
  );
  wrap.append(hud);
  const board=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',maxWidth:'460px',margin:'14px auto'}});
  function reset(){
    deck=[...icons,...icons].map(v=>({v,open:false,done:false})).sort(()=>Math.random()-.5);
    flipped=[];matched=0;moves=0;board.innerHTML='';
    deck.forEach((c,i)=>{
      const b=el('button',{
        style:{aspectRatio:'1',fontSize:'36px',borderRadius:'12px',background:'linear-gradient(135deg,#ff2a55,#7c4dff)',color:'#fff'},
        onClick:()=>flip(i)
      },'?');
      board.append(b);
    });
    upd();
  }
  function flip(i){
    if(flipped.length>=2||deck[i].open||deck[i].done)return;
    deck[i].open=true;
    const btn=board.children[i];
    btn.textContent=deck[i].v;btn.style.background='rgba(255,255,255,.1)';
    flipped.push(i);
    if(flipped.length===2){
      moves++;
      const [a,b]=flipped;
      if(deck[a].v===deck[b].v){
        deck[a].done=deck[b].done=true;matched++;flipped=[];
        if(matched===8){
          if(moves<best){best=moves;localStorage.setItem('bv_memory',best);}
          addCoins(Math.max(20,100-moves*5));
          toast(`Победа за ${moves} ходов!`);
          setTimeout(reset,1500);
        }
      } else {
        setTimeout(()=>{
          deck[a].open=deck[b].open=false;
          board.children[a].textContent='?';board.children[b].textContent='?';
          board.children[a].style.background=board.children[b].style.background='linear-gradient(135deg,#ff2a55,#7c4dff)';
          flipped=[];upd();
        },700);
      }
      upd();
    }
  }
  function upd(){
    wrap.querySelector('#mv').textContent=moves;
    wrap.querySelector('#mp').textContent=`${matched}/8`;
    wrap.querySelector('#mb').textContent=best===999?'—':best;
  }
  wrap.append(board);
  wrap.append(el('div',{class:'gw-controls'},el('button',{class:'alt',onClick:reset},'🔀 Заново')));
  wrap.append(el('div',{class:'gw-instr'},'Найди все пары за минимальное число ходов.'));
  host.append(wrap);
  reset();
}

const GAME_RUNNERS={
  clicker:game_clicker, obby:game_obby, racer:game_racer, shooter:game_shooter,
  maze:game_maze, snake:game_snake, tycoon:game_tycoon, memory:game_memory,
};
