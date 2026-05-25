/* === BLOXVERSE: главный скрипт === */

const STATE={
  coins: parseInt(localStorage.getItem('bv_coins')||'1250'),
  avatar: JSON.parse(localStorage.getItem('bv_avatar')||'{"head":"😎","color":"#ff2a55"}'),
};

function saveState(){
  localStorage.setItem('bv_coins',STATE.coins);
  localStorage.setItem('bv_avatar',JSON.stringify(STATE.avatar));
}
function setCoins(n){STATE.coins=Math.max(0,n);document.getElementById('coinCount').textContent=STATE.coins;saveState();}
function addCoins(n){if(!n)return;setCoins(STATE.coins+n);if(n>0)toast(`+${n} ◆ Bloxs`);}

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>t.classList.remove('show'),2200);
}

/* === Render games === */
function renderGames(filter='all'){
  const grid=document.getElementById('gamesGrid');
  grid.innerHTML='';
  GAMES.filter(g=>filter==='all'||g.cat===filter).forEach(g=>{
    const card=document.createElement('div');
    card.className='game-card';
    card.innerHTML=`
      <div class="game-thumb" style="background:${g.bg}">
        ${g.tag?`<span class="game-tag ${g.tag}">${g.tag==='hot'?'🔥 ТОП':'✨ NEW'}</span>`:''}
        <span style="position:relative;z-index:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))">${g.icon}</span>
      </div>
      <div class="game-info">
        <h4>${g.title}</h4>
        <div class="game-meta">
          <span class="players">${g.players}</span>
          <span class="rating">★ ${g.rating}</span>
        </div>
      </div>`;
    card.onclick=()=>launchGame(g);
    grid.appendChild(card);
  });
}

function launchGame(g){
  document.getElementById('gameTitle').textContent=g.title;
  const host=document.getElementById('gameHost');
  host.innerHTML='';
  const runner=GAME_RUNNERS[g.id];
  if(runner)runner(host);
  else host.innerHTML='<div class="gw">Игра скоро появится...</div>';
  document.getElementById('gameModal').classList.add('open');
}
function closeGame(){
  killAllGames();
  document.getElementById('gameHost').innerHTML='';
  document.getElementById('gameModal').classList.remove('open');
}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

/* === Shop === */
const SHOP=[
  {icon:'⚔️',name:'Меч силы',price:300},
  {icon:'🛡',name:'Щит героя',price:250},
  {icon:'🎩',name:'Шляпа цилиндр',price:120},
  {icon:'🦄',name:'Питомец единорог',price:800},
  {icon:'🌟',name:'VIP-статус',price:1500},
  {icon:'🚁',name:'Вертолёт',price:2000},
  {icon:'🎁',name:'Лут-бокс',price:100},
  {icon:'💍',name:'Кольцо удачи',price:600},
];
function renderShop(){
  const grid=document.getElementById('shopGrid');
  grid.innerHTML='';
  SHOP.forEach(s=>{
    const owned=localStorage.getItem('bv_own_'+s.name)==='1';
    const item=document.createElement('div');
    item.className='shop-item';
    item.innerHTML=`
      <div class="shop-icon">${s.icon}</div>
      <div class="shop-name">${s.name}</div>
      <div class="shop-price">◆ ${s.price}</div>
      <button class="btn ${owned?'btn-ghost':'btn-primary'}">${owned?'✓ Куплено':'Купить'}</button>`;
    item.querySelector('button').onclick=()=>{
      if(owned){toast('Уже у тебя');return;}
      if(STATE.coins>=s.price){
        setCoins(STATE.coins-s.price);
        localStorage.setItem('bv_own_'+s.name,'1');
        toast(`Куплено: ${s.name}`);
        renderShop();
      } else toast('Не хватает ◆ Bloxs');
    };
    grid.appendChild(item);
  });
}

/* === Friends === */
const FRIENDS=[
  {name:'CubeNinja',status:'online',game:'Pixel Arena',icon:'🥷'},
  {name:'LavaLord',status:'online',game:'Obby Tower',icon:'🔥'},
  {name:'MissBloxy',status:'busy',game:'Bloxs Tycoon',icon:'💎'},
  {name:'NeoRacer',status:'online',game:'Block Racer',icon:'🏁'},
  {name:'PixelPanda',status:'online',game:'Mega Clicker',icon:'🐼'},
  {name:'AlienAce',status:'busy',game:'Lost Maze',icon:'👽'},
  {name:'QuantumQ',status:'online',game:'Brain Match',icon:'🧠'},
  {name:'SnakeKing',status:'online',game:'Cube Snake',icon:'🐍'},
];
function renderFriends(){
  const grid=document.getElementById('friendsGrid');
  grid.innerHTML='';
  FRIENDS.forEach(f=>{
    const card=document.createElement('div');
    card.className='friend-card';
    card.innerHTML=`
      <div class="friend-avatar">${f.icon}<span class="friend-status ${f.status==='busy'?'busy':''}"></span></div>
      <div class="friend-info">
        <b>${f.name}</b>
        <span>${f.status==='busy'?'в игре · ':'играет в '}${f.game}</span>
      </div>`;
    grid.appendChild(card);
  });
}

/* === Avatar === */
function renderAvatar(){
  document.getElementById('avHead').textContent=STATE.avatar.head;
  document.getElementById('avBody').style.background=STATE.avatar.color;
  document.querySelectorAll('#headPicker button').forEach(b=>{
    b.classList.toggle('selected',b.textContent===STATE.avatar.head);
    b.onclick=()=>{STATE.avatar.head=b.textContent;saveState();renderAvatar();};
  });
  document.querySelectorAll('#colorPicker button').forEach(b=>{
    const c=b.style.background;
    b.classList.toggle('selected', rgbToHexLoose(c)===STATE.avatar.color.toLowerCase());
    b.onclick=()=>{STATE.avatar.color=b.style.backgroundColor||b.style.background;saveState();renderAvatar();};
  });
  // sync mini avatar
  document.querySelector('.avatar-mini').textContent=STATE.avatar.head;
}
function rgbToHexLoose(s){
  const m=s.match(/\d+/g);
  if(!m)return s.toLowerCase();
  return '#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
}
function saveAvatar(){saveState();toast('Аватар сохранён ✓');}

/* === Filters === */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderGames(btn.dataset.filter);
  };
});

/* === Nav active === */
document.querySelectorAll('.nav a').forEach(a=>{
  a.onclick=(e)=>{
    document.querySelectorAll('.nav a').forEach(x=>x.classList.remove('active'));
    a.classList.add('active');
  };
});

function scrollToGames(){
  document.getElementById('games').scrollIntoView({behavior:'smooth'});
}

/* === Online counter — фейковая динамика === */
function tickOnline(){
  const el=document.getElementById('onlineCount');
  if(!el)return;
  let n=parseInt(el.textContent.replace(/\D/g,''))||1247832;
  n+=Math.floor(Math.random()*200)-90;
  el.textContent=n.toLocaleString('ru-RU');
}

/* === Закрытие модалок по клику на фон === */
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',e=>{
    if(e.target===m){
      if(m.id==='gameModal')closeGame();
      else m.classList.remove('open');
    }
  });
});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('gameModal').classList.contains('open'))closeGame();
    document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));
  }
});

/* === Init === */
document.getElementById('coinCount').textContent=STATE.coins;
renderGames();
renderShop();
renderFriends();
renderAvatar();
setInterval(tickOnline,2500);
