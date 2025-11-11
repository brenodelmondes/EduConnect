(function(){
  const entriesKey = 'edu_people';
  const studentDataKey = 'edu_studentData'; // { [email]: { materias: [{nome, ac1, ac2, ac3, media, frequencia}] } }
  const eventsKey = 'edu_events'; // eventos criados por admin/professor

  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function getStudentData(){ return JSON.parse(localStorage.getItem(studentDataKey) || '{}'); }
  function setStudentData(d){ localStorage.setItem(studentDataKey, JSON.stringify(d)); }

  // Catálogo simples de matérias por curso (pode crescer depois)
  const SUBJECT_CATALOG = {
    'Ciência da Computação': [
      'Algoritmos e Programação I',
      'Cálculo I',
      'Arquitetura de Computadores',
      'Banco de Dados I'
    ],
    'Engenharia de Software': [
      'Requisitos de Software',
      'Modelagem e Projeto',
      'Teste de Software',
      'Banco de Dados I'
    ],
    'Administração': [
      'Fundamentos de Administração',
      'Economia I',
      'Contabilidade Introdutória',
      'Marketing I'
    ],
    'Direito': [
      'Teoria do Direito',
      'Direito Constitucional I',
      'Direito Civil I',
      'Direito Penal I'
    ],
    'default': [
      'Disciplina 1',
      'Disciplina 2'
    ]
  };

  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const userGreeting = document.getElementById('userGreeting');
  if(!curr){ window.location.href = 'index.html'; return; }
  if(userGreeting){ userGreeting.textContent = 'Olá, ' + (curr.name || curr.email); }
  const showTrendChk = document.getElementById('showTrend');
  const donutCanvas = document.getElementById('donutFaltas');
  const faltasPctLabel = document.getElementById('faltasPctLabel');
  const faltasMsg = document.getElementById('faltasMsg');

  function ensureSampleData(email){
    const all = getStudentData();
    if(all[email]) return all[email];
    // Inferir curso do aluno
    const people = getPeople();
    const aluno = people.find(p => p.email === email && String(p.tipo||'').toLowerCase()==='aluno');
    const curso = (aluno?.curso || '').trim();
    const catalog = SUBJECT_CATALOG[curso] || SUBJECT_CATALOG['default'];

    // Gerar notas/frequência simples por disciplina
    const materias = catalog.map((nome, idx)=>{
      const ac1 = Number((7 + (idx*0.5)).toFixed(1));
      const ac2 = Number((6.5 + (idx*0.4)).toFixed(1));
      const ac3 = Number((6 + (idx*0.3)).toFixed(1));
      const frequencia = 90 - (idx*3);
      const media = Number(((ac1+ac2+ac3)/3).toFixed(1));
      return { nome, ac1, ac2, ac3, media, frequencia };
    });

    const now = new Date();
    const rec = { curso: curso || 'Geral', ano: now.getFullYear(), semestre: (now.getMonth()<6?1:2), materias };
    all[email] = rec;
    setStudentData(all);
    return rec;
  }

  function computeKPIs(rec){
    const mats = rec.materias || [];
    const medias = mats.map(m => m.media || 0);
    const freqs = mats.map(m => m.frequencia || 0);
    const mGeral = medias.length ? (medias.reduce((a,b)=>a+b,0)/medias.length) : 0;
    const fGeral = freqs.length ? (freqs.reduce((a,b)=>a+b,0)/freqs.length) : 0;
    return { mediaGeral: mGeral.toFixed(1), freqGeral: Math.round(fGeral), materias: mats.length };
  }

  function trend(ac1,ac2,ac3){
    if(ac3>ac2 && ac2>=ac1) return '↑ subindo';
    if(ac3<ac2 && ac2<=ac1) return '↓ caindo';
    return '→ estável';
  }

  // ---- Eventos: leitura e renderização do card "Próximas Entregas" ----
  function getEvents(){
    try{
      const raw = localStorage.getItem(eventsKey) || localStorage.getItem('educonnectEvents') || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }

  function formatDateDistance(eventDate){
    const today = new Date();
    const date = new Date(eventDate + 'T12:00:00'); // evita problemas de fuso/UTC
    today.setHours(0,0,0,0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000*60*60*24));
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if(diffDays === 0) return { text: 'É Hoje!', days: 0, dateStr };
    if(diffDays === 1) return { text: 'Amanhã', days: 1, dateStr };
    if(diffDays > 1 && diffDays <= 14) return { text: `Daqui a ${diffDays} dias`, days: diffDays, dateStr };
    if(diffDays > 14) return { text: `Em ${diffDays} dias`, days: diffDays, dateStr };
    return { text: 'Atrasado', days: diffDays, dateStr };
  }

  function renderUpcomingEvents(studentData){
    const listEl = document.getElementById('upcoming-deliveries-list');
    const placeholderEl = document.getElementById('deliveries-placeholder');
    if(!listEl) return;

    const allEvents = getEvents();
    const studentSubjects = (studentData.materias||[]).map(m=>m.nome);

    const upcoming = allEvents
      .map(evt => ({ ...evt, distance: formatDateDistance(evt.date) }))
      .filter(evt => evt.distance.days >= 0 && (studentSubjects.includes(evt.course) || evt.course === studentData.curso))
      .sort((a,b)=> a.distance.days - b.distance.days);

    listEl.innerHTML = '';
    if(upcoming.length === 0){
      if(placeholderEl){ placeholderEl.textContent = 'Nenhuma entrega ou avaliação próxima. 🎉'; listEl.appendChild(placeholderEl); }
      return;
    }

    upcoming.slice(0,3).forEach(evt => {
      const li = document.createElement('li');
      li.className = 'delivery-item';
      li.innerHTML = `
        <div class="delivery-info">
          <strong>${evt.title}</strong>
          <span class="muted small">${evt.course} • ${evt.type || ''}</span>
        </div>
        <div class="delivery-date">
          <strong>${evt.distance.text}</strong>
          <span class="muted small">${evt.distance.dateStr}</span>
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  function render(){
    const email = curr.email;
    const rec = ensureSampleData(email);
    const kpis = computeKPIs(rec);
    const elM = document.getElementById('kpiMediaGeral'); if(elM) elM.textContent = kpis.mediaGeral;
    const elF = document.getElementById('kpiFreqGeral'); if(elF) elF.textContent = kpis.freqGeral + '%';
    const elC = document.getElementById('kpiMaterias'); if(elC) elC.textContent = String(kpis.materias);

    // Donut de faltas
    try{ createOrUpdateDonut(kpis, rec); } catch(e){ console.warn('donut failed', e); }

    const tbody = document.querySelector('#materiasTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    // destruir sparklines antigos
    destroyAllSparklines();
    rec.materias.forEach((m, idx)=>{
      const tr = document.createElement('tr');
      const evoTdId = `evo_${idx}`;
      tr.innerHTML = `<td>${m.nome}</td>
        <td>${m.ac1}</td>
        <td>${m.ac2}</td>
        <td>${m.ac3}</td>
        <td>${m.media}</td>
        <td>${m.frequencia}%</td>
        <td><canvas id="${evoTdId}" height="28" style="width:90px; height:28px;"></canvas></td>`;
      tbody.appendChild(tr);
      if(showTrendChk ? showTrendChk.checked : true){
        try{ createSparkline(evoTdId, [m.ac1, m.ac2, m.ac3, m.media]); } catch(e){ /* noop */ }
      } else {
        const td = tr.lastElementChild; if(td){ td.innerHTML = `<span class="muted small">${trend(m.ac1,m.ac2,m.ac3)}</span>`; }
      }
    });

    // Card de próximas entregas/avaliações
    try{ renderUpcomingEvents(rec); } catch(e){ console.warn('Falha ao renderizar eventos', e); }
  }

  // init
  let donutChart = null;
  const sparkCharts = [];
  function destroyAllSparklines(){ while(sparkCharts.length){ const c = sparkCharts.pop(); try{ c.destroy(); }catch(e){} } }

  function createSparkline(canvasId, values){
    const ctxEl = document.getElementById(canvasId);
    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    const t = trend(values[0], values[1], values[2]);
    const isUp = /subindo/i.test(t);
    const isDown = /caindo/i.test(t);
    const color = isUp ? '#29b59a' : (isDown ? '#ff5252' : '#ffc107');
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels: values.map((_,i)=>i+1), datasets:[{ data: values, borderColor: color, pointRadius: 0, tension: 0.35, fill: false, borderWidth: 2 }] },
      options: { responsive: false, plugins:{ legend:{display:false}, tooltip:{enabled:false} }, scales:{ x:{display:false}, y:{display:false, min:0, max:10 } }, elements:{ line:{borderJoinStyle:'round'} } }
    });
    sparkCharts.push(chart);
  }

  function createOrUpdateDonut(kpis, rec){
    if(!donutCanvas) return;
    const ctx = donutCanvas.getContext('2d');
    // usar matéria com pior frequência para o risco
    let pior = (rec.materias||[]).reduce((acc,m)=> (acc==null || m.frequencia < acc.frequencia)? m: acc, null);
    if(!pior && (rec.materias||[]).length) pior = rec.materias[0];
    const faltasPct = Math.max(0, 100 - (pior?.frequencia || 0));
    const presencaPct = 100 - faltasPct;
    if(faltasPctLabel) faltasPctLabel.textContent = `${faltasPct}% faltas`;

    // Regras de cores atualizadas (escalas de risco):
    // Frequência >= 80% e faltas <= 20% => verde
    // Frequência entre 75% e 79% ou faltas > 20% (até 25%) => amarelo (atenção)
    // Frequência < 75% ou faltas >= 25% => vermelho (perigo)
    let presencaColor = '#29b59a'; // seguro
    const freq = pior?.frequencia || 0;
    if((freq < 80 && freq >= 75) || (faltasPct > 20 && faltasPct < 25)){
      presencaColor = '#ffc107';
    }
    if(freq < 75 || faltasPct >= 25){
      presencaColor = '#ff5252';
    }

    const dataMain = {
      labels: ['Presença','Faltas'],
      datasets: [{ data: [presencaPct, faltasPct], backgroundColor: [presencaColor,'#ff7373'], borderWidth: 0, hoverOffset: 0, cutout: '72%' }]
    };

    const cfg = {
      type: 'doughnut',
      data: dataMain,
      options: { responsive:true, plugins:{ legend:{display:false}, tooltip:{enabled:false} } }
    };
    if(donutChart){ try{ donutChart.destroy(); }catch(e){} }
    donutChart = new Chart(ctx, cfg);

    // mensagem + título: usar matéria com pior frequência
    const TOTAL_AULAS_PADRAO = 60;
    const limitePct = 25; // 25% faltas
    if(faltasMsg && pior){
      const faltasFeitas = Math.round((100 - pior.frequencia)/100 * TOTAL_AULAS_PADRAO);
      const limiteAulas = Math.floor(limitePct/100 * TOTAL_AULAS_PADRAO);
      const restamRaw = limiteAulas - faltasFeitas;
      const restam = Math.max(0, restamRaw);
      const plural = restam === 1 ? 'falta' : 'faltas';
      let texto = '';
      const freq = pior.frequencia;
      if(freq < 75 || faltasPct >= 25){
        texto = 'Reprovado por Falta: Você excedeu o limite de faltas nesta matéria.';
      } else if((freq < 80 && freq >= 75) || (faltasPct > 20 && faltasPct < 25)){
        texto = `Perigo: Você está a ${restam} ${plural} do limite de reprovação.`;
      } else {
        texto = `Atenção: Você está a ${restam} ${plural} do limite de reprovação.`;
      }
      faltasMsg.textContent = texto;
    }
    const faltasTitle = document.getElementById('faltasTitle');
    if(faltasTitle && pior){
      let icon = '🟢';
      if((freq < 80 && freq >=75) || (faltasPct > 20 && faltasPct < 25)) icon = '🟡';
      if(freq < 75 || faltasPct >= 25) icon = '⚠️';
      faltasTitle.textContent = `${icon} Alerta de Faltas: ${pior.nome}`;
    }
  }

  render();
  window.addEventListener('storage', render);
  if(showTrendChk){ showTrendChk.addEventListener('change', render); }
})();
