(function(){
  const curr = JSON.parse(localStorage.getItem('edu_currentUser')||'null');
  if(!curr){ window.location.href='index.html'; return; }
  // Guard: apenas professor ou admin
  const role = (curr.role||'').toLowerCase();
  if(!(role==='professor' || role==='admin' || role==='coordenador')){
    window.location.href='aluno.html';
    return;
  }

  const userGreeting = document.getElementById('userGreeting');
  if(userGreeting){ userGreeting.textContent = 'Olá, ' + (curr.name||curr.email); }

  // Config keys
  const ASSIGN_KEY = 'edu_professorAssignments';
  const STUDENT_DATA_KEY = 'edu_studentData';
  const PEOPLE_KEY = 'edu_people';
  const EVENTS_KEY = 'edu_events';

  function getAssignments(){
    const all = JSON.parse(localStorage.getItem(ASSIGN_KEY) || '{}');
    return all[curr.email] || seedDefaultAssignments();
  }
  function setAssignments(obj){
    const all = JSON.parse(localStorage.getItem(ASSIGN_KEY) || '{}');
    all[curr.email] = obj;
    localStorage.setItem(ASSIGN_KEY, JSON.stringify(all));
  }
  function seedDefaultAssignments(){
    // Seed com 3 turmas
    const seeded = {
      turmas: [
        { id:'t_calc_a', disciplina:'Cálculo I', turma:'A' },
        { id:'t_bd1', disciplina:'Banco de Dados I', turma:'Única' },
        { id:'t_cloud', disciplina:'Arquitetura em Nuvem', turma:'Única' }
      ]
    };
    setAssignments(seeded);
    return seeded;
  }

  function getStudentData(){ return JSON.parse(localStorage.getItem(STUDENT_DATA_KEY)||'{}'); }
  function setStudentData(d){ localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(d)); }
  function getPeople(){ return JSON.parse(localStorage.getItem(PEOPLE_KEY)||'[]'); }
  function getEvents(){
    try{ return JSON.parse(localStorage.getItem(EVENTS_KEY)|| localStorage.getItem('educonnectEvents') || '[]'); }
    catch(e){ return []; }
  }

  // Helpers para agregação
  function computeKPIs(assignments, stuData){
    // Minhas Matérias = número de turmas (distinct disciplina)
    const disciplinas = new Set(assignments.turmas.map(t=>t.disciplina));
    const minhasMaterias = disciplinas.size;

    // Total de alunos = contar alunos no edu_people de tipo aluno que tenham materias em alguma disciplina ministrada
    const people = getPeople();
    const discs = Array.from(disciplinas);
    const alunos = people.filter(p=> String(p.tipo||'').toLowerCase()==='aluno');
    let totalAlunos = 0;
    alunos.forEach(a=>{
      const rec = stuData[a.email];
      if(rec && rec.materias && rec.materias.some(m => discs.includes(m.nome))){ totalAlunos++; }
    });

    // Média de aprovação (Semestre) = % de alunos com media >= 6.0 nas disciplinas ministradas
    let aprovados=0, considerados=0;
    alunos.forEach(a=>{
      const rec = stuData[a.email];
      if(!rec || !rec.materias) return;
      rec.materias.forEach(m=>{
        if(discs.includes(m.nome)){
          considerados++;
          if((m.media||0) >= 6.0) aprovados++;
        }
      });
    });
    const mediaAprov = considerados>0 ? Math.round((aprovados/considerados)*100) : 0;

    return { minhasMaterias, totalAlunos, mediaAprov };
  }

  function renderKPIs(k){
    const el1=document.getElementById('kpiMinhasMaterias'); if(el1) el1.textContent=String(k.minhasMaterias);
    const el2=document.getElementById('kpiTotalAlunos'); if(el2) el2.textContent=String(k.totalAlunos);
    const el3=document.getElementById('kpiMediaAprov'); if(el3) el3.textContent=k.mediaAprov+'%';
  }

  // Register optional plugins if available
  try{ if(window.ChartDataLabels){ Chart.register(window.ChartDataLabels); } }catch(e){}
  const centerTextPlugin = {
    id:'centerText',
    afterDraw(chart, args, opts){
      if(!opts || !opts.display) return;
      const {ctx, chartArea} = chart; if(!chartArea) return;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.fillStyle = opts.color || '#666';
      ctx.font = (opts.fontSize||18) + 'px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.text||'', x, y);
      ctx.restore();
    }
  };
  try{ Chart.register(centerTextPlugin); }catch(e){}

  // Gráfico barras: média por turma (agrupa por disciplina+turma com média agregada dos alunos)
  let chartTurmas=null, chartFaixas=null;
  function buildTurmasChart(assignments, stuData){
    const ctx = document.getElementById('chartTurmas'); if(!ctx) return;
    const labels=[]; const values=[];
    const people = getPeople().filter(p=> String(p.tipo||'').toLowerCase()==='aluno');
    assignments.turmas.forEach(t=>{
      let soma=0, count=0;
      people.forEach(a=>{
        const rec = stuData[a.email];
        if(!rec||!rec.materias) return;
        const m = rec.materias.find(mm=> mm.nome===t.disciplina);
        if(m){ soma += (m.media||0); count++; }
      });
      if(count>0){
        labels.push(`${t.disciplina} (${t.turma})`);
        values.push(Number((soma/count).toFixed(1)));
      }
    });
    if(chartTurmas){ try{ chartTurmas.destroy(); }catch(e){} }
    chartTurmas = new Chart(ctx.getContext('2d'), {
      type:'bar',
      data:{ labels, datasets:[{ label:'Média', data:values, backgroundColor:'#4f8cff' }]},
      options:{ plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, max:10, title:{display:true, text:'Média da Turma'} }, x:{ ticks:{ autoSkip:false } } }}
    });
  }

  // Donut: distribuição por faixas
  function buildFaixasChart(assignments, stuData){
    const ctx = document.getElementById('chartFaixas'); if(!ctx) return;
    const discs = new Set(assignments.turmas.map(t=>t.disciplina));
    const people = getPeople().filter(p=> String(p.tipo||'').toLowerCase()==='aluno');
    let green=0, yellow=0, red=0, total=0;
    people.forEach(a=>{
      const rec = stuData[a.email]; if(!rec||!rec.materias) return;
      rec.materias.forEach(m=>{
        if(discs.has(m.nome)){
          total++;
          const md=m.media||0;
          // Faixas: Perigo (<5.0) | Atenção (5.0–6.9) | OK (≥7.0)
          if(md < 5.0) red++;
          else if(md < 7.0) yellow++;
          else green++;
        }
      });
    });
    if(total===0){ green=0; yellow=0; red=0; }
    const riskPct = total>0 ? Math.round((red/total)*100) : 0;
    if(chartFaixas){ try{ chartFaixas.destroy(); }catch(e){} }
    chartFaixas = new Chart(ctx.getContext('2d'), {
      type:'doughnut',
      data:{
        labels:['Perigo (< 5.0)','Atenção (5.0–6.9)','OK (≥ 7.0)'],
        datasets:[{ data:[red,yellow,green], backgroundColor:['#ef4444','#f59e0b','#10b981'], borderWidth:0, cutout:'60%' }]
      },
      options:{
        plugins:{
          legend:{ position:'bottom' },
          datalabels:{
            color:'#fff',
            font:{ weight:'700' },
            formatter:(val, ctx)=>{
              const data = ctx.chart.data.datasets[0].data;
              const sum = data.reduce((a,b)=>a+b,0);
              if(!sum) return null;
              const pct = Math.round((val/sum)*100);
              return pct>0 ? pct+'%' : null;
            }
          },
          centerText:{ display:true, text: riskPct + '%', color: getComputedStyle(document.body).getPropertyValue('--text') || '#1f2937', fontSize: 20 }
        }
      }
    });
  }

  // Próximos eventos (filtra por disciplinas do professor)
  function renderUpcoming(assignments){
    const listEl = document.getElementById('prof-upcoming-events'); if(!listEl) return;
    const placeholder = document.getElementById('prof-events-placeholder');
    const events = getEvents();
    const discs = new Set(assignments.turmas.map(t=>t.disciplina));
    function fmtDist(d){
      const today=new Date(); today.setHours(0,0,0,0);
      const date=new Date(d+'T12:00:00');
      const diffDays=Math.ceil((date.getTime()-today.getTime())/(1000*60*60*24));
      const dateStr=date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
      if(diffDays===0) return {text:'É Hoje!', days:0, dateStr};
      if(diffDays===1) return {text:'Amanhã', days:1, dateStr};
      if(diffDays>1 && diffDays<=14) return {text:`Daqui a ${diffDays} dias`, days:diffDays, dateStr};
      if(diffDays>14) return {text:`Em ${diffDays} dias`, days:diffDays, dateStr};
      return {text:'Atrasado', days:diffDays, dateStr};
    }
    const upcoming = events
      .filter(e=> discs.has(e.course))
      .map(e=> ({...e, distance: fmtDist(e.date)}))
      .filter(e=> e.distance.days>=0)
      .sort((a,b)=> a.distance.days-b.distance.days);

    listEl.innerHTML='';
    if(upcoming.length===0){ if(placeholder){ placeholder.textContent='Nada por enquanto.'; listEl.appendChild(placeholder);} return; }
    upcoming.slice(0,5).forEach(evt=>{
      const li=document.createElement('li');
      li.className='delivery-item';
      li.innerHTML=`
        <div class="delivery-info">
          <strong>${evt.title}</strong>
          <span class="muted small">${evt.course} • ${evt.type||''}</span>
        </div>
        <div class="delivery-date">
          <strong>${evt.distance.text}</strong>
          <span class="muted small">${evt.distance.dateStr}</span>
        </div>`;
      listEl.appendChild(li);
    });
  }

  // Alunos em risco (top 5 piores médias ou menor frequência)
  function renderRiskStudents(assignments, stuData){
    const ul=document.getElementById('risk-students'); if(!ul) return;
    const placeholder=document.getElementById('risk-placeholder');
    const discs=new Set(assignments.turmas.map(t=>t.disciplina));
    const people = getPeople().filter(p=> String(p.tipo||'').toLowerCase()==='aluno');
    const items=[];
    people.forEach(a=>{
      const rec=stuData[a.email]; if(!rec||!rec.materias) return;
      rec.materias.forEach(m=>{
        if(discs.has(m.nome)){
          items.push({ aluno:a, materia:m.nome, media:m.media||0, freq:m.frequencia||0 });
        }
      });
    });
    // score: prioriza menor média e baixa frequência
    items.sort((x,y)=>{
      const sx = x.media + (x.freq/100)*2; // simples: média + fração de freq
      const sy = y.media + (y.freq/100)*2;
      return sx - sy;
    });
    ul.innerHTML='';
    if(items.length===0){ if(placeholder){ placeholder.textContent='Nenhum aluno em risco.'; ul.appendChild(placeholder);} return; }
    items.slice(0,5).forEach(it=>{
      const li=document.createElement('li');
      li.className='delivery-item';
      li.innerHTML = `<div class="delivery-info">
        <strong>${it.aluno.name || it.aluno.email}</strong>
        <span class="muted small">${it.materia}</span>
      </div>
      <div class="delivery-date">
        <strong>${it.media.toFixed(1)}</strong>
        <span class="muted small">${it.freq}%</span>
      </div>`;
      ul.appendChild(li);
    });
  }

  function renderAll(){
    const assignments = getAssignments();
    const stuData = getStudentData();
    renderKPIs(computeKPIs(assignments, stuData));
    buildTurmasChart(assignments, stuData);
    buildFaixasChart(assignments, stuData);
    renderUpcoming(assignments);
    renderRiskStudents(assignments, stuData);
  }

  renderAll();
  window.addEventListener('storage', renderAll);
})();