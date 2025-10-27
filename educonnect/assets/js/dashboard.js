(function(){
  const usersKey = 'edu_users';
  const entriesKey = 'edu_people';
  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function getUsers(){ return JSON.parse(localStorage.getItem(usersKey) || '[]'); }

  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const userGreeting = document.getElementById('userGreeting');
  if(!curr){ window.location.href = 'index.html'; } else { userGreeting.textContent = 'Olá, ' + (curr.name || curr.email); document.title = 'EduConnect - ' + (curr.name || curr.email); }

  if(window.innerWidth <= 900){ document.body.classList.add('sidebar-collapsed'); }

  function refreshCounts(){
    const people = getPeople();
    const students = people.filter(p=>String(p.tipo||'').toLowerCase()==='aluno');
    const teachers = people.filter(p=>String(p.tipo||'').toLowerCase()==='professor');
    document.getElementById('countStudents').textContent = students.length;
    document.getElementById('countTeachers').textContent = teachers.length;
    document.getElementById('countClasses').textContent = (new Set(people.map(p=>p.turma).filter(Boolean))).size || 0;
  }

  refreshCounts();

  const canvas = document.getElementById('barChart');
  const ctx = canvas.getContext('2d');
  function drawChart(){
    const people = getPeople();
    const students = people.filter(p=>String(p.tipo||'').toLowerCase()==='aluno').length;
    const teachers = people.filter(p=>String(p.tipo||'').toLowerCase()==='professor').length;
    const data = [students, teachers];
    const labels = ['Alunos', 'Professores'];
    const cssPrimary = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#2563eb';
    const cssAccent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#10b981';
    const cssText = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    const colors = [cssPrimary, cssAccent];

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.clientWidth || 320;
    const logicalHeight = canvas.clientHeight || 200;
    canvas.width = Math.round(logicalWidth * dpr);
    canvas.height = Math.round(logicalHeight * dpr);
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0,0,logicalWidth,logicalHeight);

    const margin = { top: 18, right: 24, bottom: 18, left: 110 };
    const chartW = logicalWidth - margin.left - margin.right;
    const chartH = logicalHeight - margin.top - margin.bottom;

    const rawMax = Math.max(...data);
    const ticks = 4;
    let niceStep, tickMax;
    if(rawMax <= ticks){
      niceStep = 1;
      tickMax = Math.max(1, Math.round(rawMax));
    } else {
      niceStep = Math.ceil(rawMax / ticks);
      tickMax = niceStep * ticks;
    }
    const xForValue = v => margin.left + (v / tickMax) * chartW;

    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for(let i=0;i<=ticks;i++){
      const val = i * niceStep;
      const x = margin.left + (val / tickMax) * chartW;
      ctx.beginPath();
      ctx.strokeStyle = (document.body.className==='dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartH);
      ctx.stroke();
      ctx.fillStyle = cssText;
      ctx.fillText(String(val), x, margin.top + chartH + 6);
    }

    const count = data.length;
    const gap = 12;
    const barH = (chartH - gap * (count - 1)) / count;
    for(let i=0;i<count;i++){
      const y = margin.top + i * (barH + gap);
      const val = data[i];
      const xEnd = xForValue(val);
      const w = Math.max(0, xEnd - margin.left);
      ctx.fillStyle = colors[i];
      ctx.fillRect(margin.left, y, w, barH);
      ctx.fillStyle = cssText;
      ctx.font = '13px system-ui';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], margin.left - 12, y + barH/2);
      ctx.font = '13px system-ui';
      const valueText = String(val);
      const valueWidth = ctx.measureText(valueText).width;
      const padding = 6;
      if(w > valueWidth + padding*2){
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(valueText, margin.left + w - padding, y + barH/2 + 1);
      } else {
        ctx.fillStyle = cssText;
        ctx.textAlign = 'left';
        ctx.fillText(valueText, margin.left + w + padding, y + barH/2 + 1);
      }
    }
  }

  drawChart();

  window.addEventListener('resize', drawChart);

  window.addEventListener('storage', ()=>{ refreshCounts(); drawChart(); });

  const sidebarThemeBtn = document.getElementById('themeBtn');
  if(sidebarThemeBtn){
    sidebarThemeBtn.addEventListener('click', ()=>{
      const next = document.body.className==='light' ? 'dark' : 'light';
      document.body.className = next;
      localStorage.setItem('edu_theme', next);
      drawChart();
    });
  }

  const themeHeaderBtn = document.getElementById('themeBtnHeader');
  if(themeHeaderBtn){
    themeHeaderBtn.addEventListener('click', ()=>{
      const next = document.body.className==='light' ? 'dark' : 'light';
      document.body.className = next;
      localStorage.setItem('edu_theme', next);
      drawChart();
    });
  }

  const menuToggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');
  function toggleSidebar(){
    const body = document.body;
    body.classList.toggle('sidebar-collapsed');
  }
  if(menuToggle){
    menuToggle.addEventListener('click', (e)=>{ e.stopPropagation(); toggleSidebar(); });
  }
  if(overlay){
    overlay.addEventListener('click', ()=>{ document.body.classList.add('sidebar-collapsed'); });
  }
  document.addEventListener('click', (ev)=>{
    const sidebar = document.getElementById('sidebar');
    if(window.innerWidth <= 900 && sidebar && !document.body.classList.contains('sidebar-collapsed')){
      const isInside = ev.target.closest && ev.target.closest('#sidebar');
      const isToggle = ev.target.closest && ev.target.closest('#menuToggle');
      if(!isInside && !isToggle){
        document.body.classList.add('sidebar-collapsed');
      }
    }
  });

  const logoutEl = document.getElementById('logoutLink');
  if(logoutEl){
    logoutEl.addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem('edu_currentUser');
      window.location.href = 'index.html';
    });
  }

  setInterval(()=>{ refreshCounts(); drawChart(); }, 1000);

})();
