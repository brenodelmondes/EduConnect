(function(){
  const usersKey = 'edu_users';
  const entriesKey = 'edu_people';
  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function getUsers(){ return JSON.parse(localStorage.getItem(usersKey) || '[]'); }

  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const userGreeting = document.getElementById('userGreeting');
  // hydrate role if missing
  (function ensureRole(){
    if(!curr) return;
    if(curr.role) return;
    try{
      const users = JSON.parse(localStorage.getItem('edu_users')||'[]');
      const found = users.find(u=>u.email===curr.email);
      let role = found?.role;
      if(!role){
        const people = JSON.parse(localStorage.getItem('edu_people')||'[]');
        role = (people.find(p=>p.email===curr.email)?.tipo) || null;
      }
      if(role){ curr.role = role; localStorage.setItem('edu_currentUser', JSON.stringify(curr)); }
    }catch(e){ /* noop */ }
  })();
  if(!curr){ window.location.href = 'index.html'; return; }
  // Aluno não deve acessar esta página; redirecionar
  if(String(curr.role||'').toLowerCase()==='aluno'){ window.location.href = 'aluno.html'; return; }
  if(userGreeting){ userGreeting.textContent = 'Olá, ' + (curr.name || curr.email); document.title = 'EduConnect - ' + (curr.name || curr.email); }

  if(window.innerWidth <= 900){ document.body.classList.add('sidebar-collapsed'); }

  function refreshCounts(){
    const people = getPeople();
    const students = people.filter(p=>String(p.tipo||'').toLowerCase()==='aluno');
    const teachers = people.filter(p=>String(p.tipo||'').toLowerCase()==='professor');
    
    // KPIs existentes
    document.getElementById('countStudents').textContent = students.filter(s => s.status === 'Ativo').length;
    document.getElementById('countTeachers').textContent = teachers.length;
    const courses = new Set(students.map(s => s.curso).filter(Boolean));
    document.getElementById('countClasses').textContent = courses.size;

    // Novos KPIs (com lógica de placeholder)
    // Para uma implementação real, seria necessário ter dados de data de matrícula, status de pagamento, etc.
    const newEnrollments = students.filter(s => {
      // Lógica de placeholder: considera matrículas nos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return (s.createdAt || 0) > sixMonthsAgo.getTime();
    }).length;

    const dropoutStudents = students.filter(s => s.status === 'Trancado' || s.status === 'Inativo').length;
    const totalStudents = students.length;
    const dropoutRate = totalStudents > 0 ? ((dropoutStudents / totalStudents) * 100).toFixed(1) : 0;

    // Placeholder para inadimplência
    const paymentDefaultRate = "5.2"; 

    document.getElementById('newEnrollments').textContent = newEnrollments;
    document.getElementById('dropoutRate').textContent = `${dropoutRate}%`;
    document.getElementById('paymentDefaultRate').textContent = `${paymentDefaultRate}%`;
  }

  refreshCounts();

  // --- Helpers ---
  function monthKey(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
  function monthLabel(d){ return d.toLocaleDateString('pt-BR', { month:'short', year:'2-digit' }); }
  function cutoffFromMonths(m){ if(!m || m==='all') return null; const now=new Date(); now.setHours(0,0,0,0); const c=new Date(now); c.setMonth(now.getMonth()-Number(m)); return c.getTime(); }
  function getFilteredStudents(periodMonths, onlyActive){
    const people = getPeople();
    const students = people.filter(p=>String(p.tipo||'').toLowerCase()==='aluno');
    const cutoff = cutoffFromMonths(periodMonths);
    return students.filter(s=>{
      if(onlyActive && s.status !== 'Ativo') return false;
      if(cutoff==null) return true;
      const ts = s.createdAt || 0;
      return ts >= cutoff; // sem createdAt ficará fora quando há período
    });
  }

  // --- Gráfico de Distribuição (Curso/Status) ---
  let courseChart = null;
  function createOrUpdateCourseChart(){
    const canvas = document.getElementById('courseDistributionChart');
    if(!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');

    const period = (document.getElementById('chartPeriod')?.value) || '6';
    const onlyActive = !!(document.getElementById('onlyActive')?.checked);
    const groupBy = (document.getElementById('groupBy')?.value) || 'curso';

    const students = getFilteredStudents(period, onlyActive);
    const counts = students.reduce((acc, s)=>{
      const key = (groupBy === 'status') ? (s.status || 'Não especificado') : (s.curso || 'Não especificado');
      acc[key] = (acc[key]||0) + 1; return acc; }, {});
    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if(courseChart){ courseChart.destroy(); }

    const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    const cardBg = getComputedStyle(document.body).getPropertyValue('--card').trim() || '#fff';

    courseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Alunos',
          data,
          backgroundColor: ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6','#84cc16','#eab308','#06b6d4'],
          borderColor: cardBg,
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor } },
          tooltip: { callbacks: { label: (ctx)=> `${ctx.label}: ${ctx.parsed}` } }
        }
      }
    });
  }

  // --- Gráfico de linha: Matrículas por mês ---
  let trendChart = null;
  function createOrUpdateTrendChart(){
    const canvas = document.getElementById('enrollTrendChart');
    if(!canvas || typeof Chart==='undefined') return;
    const ctx = canvas.getContext('2d');
    const months = Number(document.getElementById('trendPeriod')?.value || '6');
    const onlyActive = !!(document.getElementById('trendOnlyActive')?.checked);

    const cutoffTs = cutoffFromMonths(months);
    const now = new Date(); now.setHours(0,0,0,0);
    // construir vetor de meses do mais antigo ao atual
    const buckets = [];
    const indexByKey = {};
    for(let i=months-1; i>=0; i--){
      const d = new Date(now); d.setMonth(now.getMonth()-i); d.setDate(1);
      const key = monthKey(d);
      buckets.push({ key, date: d, count: 0 });
      indexByKey[key] = buckets.length-1;
    }

    const people = getPeople();
    const students = people.filter(p=>String(p.tipo||'').toLowerCase()==='aluno');
    students.forEach(s=>{
      if(onlyActive && s.status !== 'Ativo') return;
      const ts = s.createdAt; if(!ts) return; // sem createdAt não entra no gráfico de mês
      if(cutoffTs && ts < cutoffTs) return;
      const d = new Date(ts); d.setDate(1);
      const key = monthKey(d);
      if(key in indexByKey){ buckets[indexByKey[key]].count += 1; }
    });

    const labels = buckets.map(b=> monthLabel(b.date));
    const data = buckets.map(b=> b.count);

    if(trendChart){ trendChart.destroy(); }
    const cssPrimary = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#2563eb';
    const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Novas matrículas', data, borderColor: cssPrimary, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3 }] },
      options: { plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor }, beginAtZero: true, precision:0 } } }
    });
  }

  function init(){ refreshCounts(); createOrUpdateCourseChart(); createOrUpdateTrendChart(); }
  init();

  window.addEventListener('storage', init);
  let resizeTimer; window.addEventListener('resize', ()=>{ clearTimeout(resizeTimer); resizeTimer = setTimeout(()=>{ createOrUpdateCourseChart(); createOrUpdateTrendChart(); }, 250); });
  const themeBtn = document.getElementById('themeBtnHeader');
  if(themeBtn){ themeBtn.addEventListener('click', ()=> setTimeout(()=>{ createOrUpdateCourseChart(); createOrUpdateTrendChart(); }, 60)); }

  // UI events
  ['chartPeriod','groupBy','onlyActive','trendPeriod','trendOnlyActive'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('change', init);
  });

  // --- Gráfico de barras: Professores por Departamento ---
  let deptChart = null;
  function createOrUpdateDeptChart(){
    const canvas = document.getElementById('deptTeachersChart');
    if(!canvas || typeof Chart==='undefined') return;
    const ctx = canvas.getContext('2d');
    const people = getPeople();
    const profs = people.filter(p=> String(p.tipo||'').toLowerCase()==='professor');
    const counts = profs.reduce((acc,p)=>{ const k = p.dept || 'Não informado'; acc[k]=(acc[k]||0)+1; return acc; },{});
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    if(deptChart) deptChart.destroy();
    const cssPrimary = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#2563eb';
    const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    deptChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Professores', data, backgroundColor: cssPrimary+'cc' }] },
      options: { plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor }, beginAtZero:true, precision:0 } } }
    });
  }

  // expand init to include department chart
  const _initOrig = init;
  function initAll(){ _initOrig(); createOrUpdateDeptChart(); }
  // Rebind events to new initAll
  window.removeEventListener && window.removeEventListener('storage', init);
  window.addEventListener('storage', initAll);
  // trigger once
  initAll();
  // update other listeners
  window.removeEventListener && window.removeEventListener('resize', ()=>{}); // noop safeguard
  window.addEventListener('resize', ()=>{ clearTimeout(resizeTimer); resizeTimer = setTimeout(()=>{ createOrUpdateCourseChart(); createOrUpdateTrendChart(); createOrUpdateDeptChart(); }, 250); });
  if(themeBtn){ themeBtn.addEventListener('click', ()=> setTimeout(()=>{ createOrUpdateCourseChart(); createOrUpdateTrendChart(); createOrUpdateDeptChart(); }, 60)); }

})();
