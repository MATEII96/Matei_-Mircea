'use strict';
const $=id=>document.getElementById(id), M=TidalModel;
const defaults={vmax:4,count:5,eff:32,enabled:true};
let config={...defaults},time=M.PERIOD/4,playing=false,chartMode='power',angle=0,flowOffset=0,lastFrame=0,lastUi=0,rotors=[],flowLines=[],dayEnergy=0,toastTimer;
const fmt=(n,d=0)=>new Intl.NumberFormat('ro-RO',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(n)<1e-9?0:n);
const clock=t=>{const m=Math.round(t*60);return `${String(Math.floor(m/60)).padStart(2,'0')} h ${String(m%60).padStart(2,'0')} min`;};
function fillRange(el){el.style.setProperty('--fill',`${100*(Number(el.value)-Number(el.min))/(Number(el.max)-Number(el.min))}%`);}
function showToast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,6500);}
function setPlaying(value){playing=value;$('play').textContent=value?'Ⅱ':'▶';$('play').setAttribute('aria-label',value?'Pune animația pe pauză':'Pornește animația');$('play').setAttribute('aria-pressed',String(value));lastFrame=0;}
function buildScene(){
 const spacing=700/config.count, radius=Math.min(52,spacing*.39);
 $('turbines').innerHTML=Array.from({length:config.count},(_,i)=>{
 const x=150+spacing*(i+.5),y=319-(x-150)*.026;
 return `<g transform="translate(${x},${y})"><circle r="${radius*1.75}" fill="url(#aura)"/><path d="M-5 6L-8 99L8 99L5 6" fill="#3e6979"/><path d="M0 5V99" stroke="#7597a1" stroke-width="3"/><ellipse rx="${radius}" ry="${radius}" fill="#0a3946" fill-opacity=".4" stroke="#87dacb" stroke-opacity=".28" stroke-dasharray="3 5"/><g class="rotor" data-phase="${i*38}"><path d="M-5 -3C-17 -13 -12 -${radius*.72} -4 -${radius}L6 -${radius*.94}L9 -10L5 3C17 13 12 ${radius*.72} 4 ${radius}L-6 ${radius*.94}L-9 10Z" fill="url(#blade)" stroke="#a4d7d7" stroke-width=".7"/></g><circle r="9" fill="#c1e9e4"/><circle r="4" fill="#557f8e"/><text y="${radius+20}" fill="#83b7bf" font-size="8" font-family="monospace" text-anchor="middle">T${String(i+1).padStart(2,'0')}</text></g>`;
 }).join('');rotors=[...document.querySelectorAll('.rotor')];
 $('currents').innerHTML=Array.from({length:28},(_,i)=>`<path data-x="${(i*137)%1080}" data-y="${268+(i%6)*26}" d="M0 0H31M25 -3L31 0L25 3" fill="none" stroke="#86e1de" stroke-width="1.2" opacity="${.12+(i%3)*.08}"/>`).join('');flowLines=[...$('currents').children];
 $('arrayLabel').textContent=`${config.count} ${config.count===1?'TURBINĂ':'TURBINE'} · ROTOR Ø 5,5 M`;
}
const graph={left:54,right:1080,top:16,bottom:185};
function chartY(value){
 const max=chartMode==='power'?config.count*M.RATED:Math.max(1,config.vmax);
 return chartMode==='power'?graph.bottom-value/max*(graph.bottom-graph.top):((graph.top+graph.bottom)/2)-value/max*(graph.bottom-graph.top)/2;
}
function chartX(t){return graph.left+t/24*(graph.right-graph.left);}
function drawChart(){
 const max=chartMode==='power'?config.count*M.RATED:Math.max(1,config.vmax), isPower=chartMode==='power';
 const points=Array.from({length:721},(_,i)=>{const t=i/30,s=M.sample(t,config);return [chartX(t),chartY(isPower?s.power:s.velocity)];});
 const path=points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' '),zero=chartY(0);
 let grid='';
 for(let i=0;i<=4;i++){const value=isPower?max*i/4:-max+max*i/2,y=chartY(value);grid+=`<line x1="54" x2="1080" y1="${y}" y2="${y}" stroke="#294650" stroke-width=".8" stroke-dasharray="3 5"/><text x="43" y="${y+4}" text-anchor="end" fill="#8ba8b4" font-family="monospace" font-size="10">${fmt(value,isPower?0:1)}</text>`;}
 for(let h=0;h<=24;h+=3)grid+=`<text x="${chartX(h)}" y="211" text-anchor="middle" fill="#8ba8b4" font-family="monospace" font-size="10">${h} h</text>`;
 $('chart').innerHTML=`<defs><linearGradient id="chartFill" x2="0" y2="1"><stop stop-color="#76eec4" stop-opacity=".23"/><stop offset="1" stop-color="#76eec4" stop-opacity=".015"/></linearGradient></defs>${grid}<path d="${path} L1080 ${zero} L54 ${zero}Z" fill="url(#chartFill)"/><path d="${path}" fill="none" stroke="#7aefc6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line id="cursorLine" y1="12" y2="185" stroke="#b4d7d5" stroke-width="1" stroke-dasharray="4 4"/><circle id="cursorDot" r="5" fill="#7aefc6" stroke="#0c2631" stroke-width="2"/>`;
 $('chartLegend').textContent=isPower?'Putere electrică (kW)':'Viteza curentului (m/s) · + flux / − reflux';
 $('chart').setAttribute('aria-label',isPower?'Puterea electrică modelată pe 24 de ore, în kilowați':'Viteza curentului modelată pe 24 de ore, în metri pe secundă; valori negative la reflux');
}
function updateNow(){
 const s=M.sample(time,config),abs=Math.abs(s.velocity),slack=abs<0.01,positive=s.velocity>=0;
 $('time').value=time;fillRange($('time'));$('timeText').textContent=clock(time);
 $('power').textContent=fmt(s.power);$('velocity').textContent=fmt(abs,2);$('powerPct').textContent=fmt(s.power/(config.count*M.RATED)*100,1)+'%';$('powerMeter').style.width=`${s.power/(config.count*M.RATED)*100}%`;
 $('flowLabel').textContent=slack?'Curent aproape nul':positive?'Curent de flux':'Curent de reflux';
 $('directionLabel').textContent=slack?'Momentul inversării sensului':positive?'Marea Nordului → Oosterschelde':'Oosterschelde → Marea Nordului';
 $('flowFoot').textContent=slack?'Stagnare · schimbarea sensului':positive?'Flux · spre estuar':'Reflux · spre mare';
 $('plantStatus').textContent=!config.enabled?'Turbine oprite manual':abs<M.CUT_IN?'Sub pragul de pornire':s.limited?'Putere limitată la nominal':'Turbine active';
 $('statusDot').style.background=s.power>0?'#7aefc6':'#edc88b';
 document.querySelector('.mini-flow').textContent=slack?'—   —   —   —':positive?'⟶   ⟶   ⟶   ⟶   ⟶':'⟵   ⟵   ⟵   ⟵   ⟵';
 const x=chartX(time),y=chartY(chartMode==='power'?s.power:s.velocity);
 $('cursorLine').setAttribute('x1',x);$('cursorLine').setAttribute('x2',x);$('cursorDot').setAttribute('cx',x);$('cursorDot').setAttribute('cy',y);
 $('chartNow').textContent=`${clock(time)} · ${fmt(chartMode==='power'?s.power:s.velocity,chartMode==='power'?0:2)} ${chartMode==='power'?'kW':'m/s'}`;
 $('insightText').textContent=!config.enabled?'Turbinele sunt oprite, dar apa continuă să curgă. Proiecția de 24 h presupune că rămân oprite pe întreaga perioadă.':abs<M.CUT_IN?'Sub 0,4 m/s, turbinele nu produc în acest model. O maree previzibilă nu înseamnă o producție constantă.':s.limited?'Generatorul a atins limita de 250 kW pe turbină. Un curent și mai rapid nu crește puterea electrică peste această limită.':!positive?'Curentul și-a schimbat sensul, iar turbinele continuă să producă. Puterea rămâne pozitivă și la reflux.':'Viteza contează la cub: de două ori mai rapid înseamnă de opt ori mai multă putere, până la plafonul generatorului.';
}
function updateConfig(){
 for(const id of ['vmax','count','eff']){$(id).value=config[id];fillRange($(id));}
 $('vmaxOut').innerHTML=`${fmt(config.vmax,1)} <small>m/s</small>`;$('countOut').textContent=config.count;$('effOut').innerHTML=`${config.eff} <small>%</small>`;
 dayEnergy=M.energy(24,config);$('energy').textContent=fmt(dayEnergy,2);$('capacity').textContent=fmt(dayEnergy*1000/(config.count*M.RATED*24)*100,1);$('rated').textContent=`CAPACITATE INSTALATĂ: ${fmt(config.count*M.RATED/1000,2)} MW`;
 $('togglePlant').innerHTML=config.enabled?'<span>◉</span> Oprește turbinele':'<span>▶</span> Pornește turbinele';$('togglePlant').setAttribute('aria-pressed',String(!config.enabled));
 $('configNote').textContent=config.count===5&&config.eff===32&&config.vmax===4?'Referință didactică: 5 × 250 kW. Parametrii nu sunt măsurători ale instalației.':'Configurație experimentală. Numărul, curentul și eficiența sunt ipoteze de simulare.';
 document.querySelectorAll('[data-preset]').forEach(btn=>{const match=config.enabled&&config.count===5&&config.eff===32&&config.vmax===({weak:1.5,reference:4,strong:5}[btn.dataset.preset]);btn.classList.toggle('selected',match);btn.setAttribute('aria-pressed',String(match));});
 buildScene();drawChart();updateNow();
}
for(const id of ['vmax','count','eff'])$(id).addEventListener('input',()=>{config[id]=Number($(id).value);updateConfig();});
$('time').addEventListener('input',()=>{time=Number($('time').value);setPlaying(false);updateNow();});
$('play').addEventListener('click',()=>{if(time>=24)time=0;setPlaying(!playing);updateNow();});
$('reset').addEventListener('click',()=>{config={...defaults};time=M.PERIOD/4;angle=0;flowOffset=0;setPlaying(false);updateConfig();showToast('Setările de referință au fost restabilite.');});
$('togglePlant').addEventListener('click',()=>{config.enabled=!config.enabled;updateConfig();});
for(const btn of document.querySelectorAll('[data-preset]'))btn.addEventListener('click',()=>{config={...defaults,vmax:({weak:1.5,reference:4,strong:5}[btn.dataset.preset])};updateConfig();});
for(const btn of document.querySelectorAll('[data-chart]'))btn.addEventListener('click',()=>{chartMode=btn.dataset.chart;document.querySelectorAll('[data-chart]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',String(b===btn));});drawChart();updateNow();});
// Convert pointer coordinates through the SVG transform, including responsive letterboxing.
$('chart').addEventListener('pointerdown',e=>{const point=$('chart').createSVGPoint();point.x=e.clientX;point.y=e.clientY;const local=point.matrixTransform($('chart').getScreenCTM().inverse());time=Math.max(0,Math.min(24,(local.x-graph.left)/(graph.right-graph.left)*24));setPlaying(false);updateNow();});
$('export').addEventListener('click',()=>{
 const lines=['MAREE LAB - simulare didactica;Nu reprezinta masuratori reale',`Viteza maxima (m/s);${config.vmax}`,`Turbine;${config.count}`,`Eficienta totala (%);${config.eff}`,`Turbine active;${config.enabled?'Da':'Nu'}`,'Timp (h);Viteza semnata (m/s);Putere (kW);Energie cumulata (MWh)'];
 let previous=M.sample(0,config).power,cumulative=0;
 for(let i=0;i<=1440;i++){const t=i/60,s=M.sample(t,config);if(i)cumulative+=(previous+s.power)/2/60/1000;previous=s.power;lines.push([t,s.velocity,s.power,cumulative].map(n=>n.toFixed(5).replace('.',',')).join(';'));}
 const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='MAREE_LAB_simulare_24h.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast('Datele pentru 24 de ore au fost pregătite pentru descărcare.');
});
for(const btn of document.querySelectorAll('[data-experiment]'))btn.addEventListener('click',()=>{
 setPlaying(false);config={...defaults};let text='';
 if(btn.dataset.experiment==='speed'){config.vmax=1.5;time=M.PERIOD/4;const p1=M.sample(time,config).power,p2=M.sample(time,{...config,vmax:3}).power;text=`La 1,5 m/s: ${fmt(p1)} kW. La 3 m/s: ${fmt(p2)} kW — de 8 ori mai mult! Am setat prima situație; mută viteza maximă la 3 m/s pentru comparație.`;}
 if(btn.dataset.experiment==='reverse'){time=3*M.PERIOD/4;text='Acum este reflux: apa curge spre mare. Puterea este aceeași ca la flux pentru aceeași viteză în modul, în acest model simetric.';}
 if(btn.dataset.experiment==='slack'){time=M.PERIOD/2;text='La aproximativ 6 h 13 min, curentul își schimbă sensul. Viteza și puterea ajung la zero. Apasă ▶ pentru a urmări reluarea producției.';}
 updateConfig();$('experimentResult').hidden=false;$('experimentResult').textContent=text;$('simulator').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});showToast(text);
});
function frame(now){
 const dt=lastFrame?Math.min((now-lastFrame)/1000,.1):0;lastFrame=now;
 if(playing){time+=dt*Number($('speed').value);if(time>=24){time=24;setPlaying(false);}if(now-lastUi>60){updateNow();lastUi=now;}}
 const s=M.sample(time,config);
 if(playing){flowOffset+=s.velocity*dt*17;if(s.power>0)angle+=dt*Math.abs(s.velocity)*65;}
 for(const rotor of rotors)rotor.setAttribute('transform',`rotate(${angle+Number(rotor.dataset.phase)})`);
 for(const line of flowLines){const x=((Number(line.dataset.x)+flowOffset)%1080+1080)%1080-60;line.setAttribute('transform',`translate(${x} ${line.dataset.y}) scale(${s.velocity>=0?1:-1} 1)`);line.style.opacity=Math.abs(s.velocity)<.01?'0':'';}
 requestAnimationFrame(frame);
}
updateConfig();setPlaying(false);requestAnimationFrame(frame);
