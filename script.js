let X=[],Y=[],m=0,n=0,L=[],steps=[],idx=0,playing=false,timer=null,delay=450;
let matchHistory=[];

function init(){
  const xv=document.getElementById('inX').value.trim().toUpperCase();
  const yv=document.getElementById('inY').value.trim().toUpperCase();
  if(!xv||!yv){setInfo('Please enter both strings.');return}
  X=[...xv];Y=[...yv];m=X.length;n=Y.length;
  matchHistory=[];
  buildSteps();buildTable();
  document.getElementById('res').style.display='none';
  document.getElementById('mpCards').innerHTML='';
  document.getElementById('mpEmpty').style.display='block';
  setInfo('Press <b>Play</b> or <b>Step</b> to begin.');
  setCtr();
  document.getElementById('playBtn').textContent='\u25B6 Play';
  playing=false;clearTimeout(timer);idx=0;
}

function buildSteps(){
  steps=[];L=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)for(let j=0;j<=n;j++){
    if(i===0||j===0){L[i][j]=0;continue}
    const match=X[i-1]===Y[j-1];
    L[i][j]=match?L[i-1][j-1]+1:Math.max(L[i-1][j],L[i][j-1]);
    steps.push({i,j,match,val:L[i][j],diag:match?L[i-1][j-1]:-1,top:L[i-1][j],left:L[i][j-1],grid:L.map(r=>[...r])});
  }
}

function buildTable(){
  const t=document.getElementById('tbl');t.innerHTML='';
  const hr=document.createElement('tr');
  hr.appendChild(hc(''));hr.appendChild(hc('\u00D8'));
  Y.forEach(c=>hr.appendChild(hc(c)));t.appendChild(hr);
  for(let i=0;i<=m;i++){
    const tr=document.createElement('tr');
    tr.appendChild(hc(i===0?'\u00D8':X[i-1]));
    for(let j=0;j<=n;j++){
      const td=document.createElement('td');
      td.id=`c${i}_${j}`;td.className='zero';
      td.textContent=(i===0||j===0)?'0':'';
      tr.appendChild(td);
    }
    t.appendChild(tr);
  }
}

function hc(t){const td=document.createElement('td');td.className='hdr';td.textContent=t;return td}
function setInfo(h){document.getElementById('infoBox').innerHTML=h}
function setCtr(){document.getElementById('ctr').textContent=idx>0?`${Math.min(idx,steps.length)}/${steps.length}`:''}

function applyStep(si){
  if(si>=steps.length){finishBacktrack();return}
  const s=steps[si];

  for(let i=0;i<=m;i++)for(let j=0;j<=n;j++){
    const td=document.getElementById(`c${i}_${j}`);if(!td)continue;
    td.classList.remove('current','match','filled','backtrack','lcs-char','diag-src');
    if(i===0||j===0){td.className='zero';td.textContent='0'}
    else if(i<s.i||(i===s.i&&j<s.j)){
      const prev=steps.find(st=>st.i===i&&st.j===j);
      td.className=prev&&prev.match?'match':'filled';td.textContent=s.grid[i][j];
    }else if(i===s.i&&j===s.j){
      td.className=s.match?'current match':'current';td.textContent=s.val;
    }else{td.className='';td.textContent=''}
  }

  if(s.match){
    const diagTd=document.getElementById(`c${s.i-1}_${s.j-1}`);
    if(diagTd)diagTd.classList.add('diag-src');
    setInfo(`<b>${X[s.i-1]} = ${Y[s.j-1]}</b> · Match! L[${s.i}][${s.j}] = 1 + L[${s.i-1}][${s.j-1}] = 1 + <b style="color:#EF9F27">${s.diag}</b> = <b style="color:#9FE1CB">${s.val}</b>`);
    addMatchCard(s,si);
  }else{
    setInfo(`<b>${X[s.i-1]} \u2260 ${Y[s.j-1]}</b> · No match. L[${s.i}][${s.j}] = max(top <b>${s.top}</b>, left <b>${s.left}</b>) = <b>${s.val}</b>`);
  }
  setCtr();
}

function addMatchCard(s,si){
  const already=matchHistory.find(h=>h.si===si);
  if(already)return;
  matchHistory.push({si});
  document.getElementById('mpEmpty').style.display='none';
  const cards=document.getElementById('mpCards');
  const card=document.createElement('div');
  card.className='match-card';
  card.innerHTML=`
    <div class="mc-chars">
      <div class="mc-char x">${X[s.i-1]}</div>
      <span class="mc-eq">=</span>
      <div class="mc-char y">${Y[s.j-1]}</div>
    </div>
    <div class="mc-sep"></div>
    <div class="mc-formula">
      L[${s.i}][${s.j}] = 1 + L[${s.i-1}][${s.j-1}]<br>
      <span style="color:#6b6a62;font-size:10px">diagonal cell value</span><br>
      = 1 + <b>${s.diag}</b> = <span class="hi">${s.val}</span>
    </div>
  `;
  cards.appendChild(card);
  cards.scrollTop=cards.scrollHeight;
}

function finishBacktrack(){
  for(let i=0;i<=m;i++)for(let j=0;j<=n;j++){
    const td=document.getElementById(`c${i}_${j}`);if(!td)continue;
    if(i===0||j===0){td.className='zero';td.textContent='0';continue}
    const s=steps.find(st=>st.i===i&&st.j===j);
    if(s){td.className=s.match?'match':'filled';td.textContent=s.val}
  }
  const path=[];let i=m,j=n;
  while(i>0&&j>0){
    const s=steps.find(st=>st.i===i&&st.j===j);
    if(s&&s.match){path.push([i,j]);i--;j--}
    else{const top=L[i-1][j],left=L[i][j-1];if(top>=left)i--;else j--}
  }
  path.forEach(([r,c])=>{const td=document.getElementById(`c${r}_${c}`);if(td)td.className='lcs-char backtrack'});
  const lcs=path.reverse().map(([r])=>X[r-1]).join('');
  document.getElementById('lcsStr').textContent=`LCS: "${lcs}"`;
  document.getElementById('lcsLen').textContent=`Length: ${lcs.length}`;
  document.getElementById('res').style.display='flex';
  setInfo(`<b>Done!</b> LCS = "<b>${lcs}</b>" · Length = <b>${lcs.length}</b> · Backtrack path highlighted`);
  document.getElementById('playBtn').textContent='\u25B6 Play';
  playing=false;
}

function stepForward(){if(idx<=steps.length)applyStep(idx++)}

function togglePlay(){
  playing=!playing;
  document.getElementById('playBtn').textContent=playing?'\u23F8 Pause':'\u25B6 Play';
  if(playing)tick();else clearTimeout(timer);
}

function tick(){
  if(!playing)return;
  stepForward();
  if(idx>steps.length){playing=false;document.getElementById('playBtn').textContent='\u25B6 Play';return}
  timer=setTimeout(tick,delay);
}

function reset(){
  clearTimeout(timer);playing=false;idx=0;
  matchHistory=[];
  document.getElementById('playBtn').textContent='\u25B6 Play';
  document.getElementById('res').style.display='none';
  document.getElementById('mpCards').innerHTML='';
  document.getElementById('mpEmpty').style.display='block';
  buildTable();
  setInfo('Press <b>Play</b> or <b>Step</b> to begin.');
  setCtr();
}

init();