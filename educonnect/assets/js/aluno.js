(function(){
  const entriesKey = 'edu_people';
  const studentDataKey = 'edu_studentData'; // { [email]: { materias: [{nome, ac1, ac2, ac3, media, frequencia}] } }

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
      const restam = Math.max(0, limiteAulas - faltasFeitas);
      const texto = restam>0 ? `Você pode faltar mais ${restam} aula${restam>1?'s':''} em ${pior.nome}.` : `Atenção: você excedeu ou está no limite de faltas em ${pior.nome}.`;
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
