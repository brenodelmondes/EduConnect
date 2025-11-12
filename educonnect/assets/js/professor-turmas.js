(function(){
  const curr = JSON.parse(localStorage.getItem('edu_currentUser')||'null');
  if(!curr){ window.location.href='index.html'; return; }
  const role = (curr.role||'').toLowerCase();
  if(!(role==='professor' || role==='admin' || role==='coordenador')){
    window.location.href='aluno.html';
    return;
  }
  const userGreeting = document.getElementById('userGreeting');
  if(userGreeting){ userGreeting.textContent = 'Olá, ' + (curr.name||curr.email); }

  const ASSIGN_KEY='edu_professorAssignments';
  const STUDENT_DATA_KEY='edu_studentData';
  const PEOPLE_KEY='edu_people';

  function getAssignments(){
    const all = JSON.parse(localStorage.getItem(ASSIGN_KEY)||'{}');
    return all[curr.email] || { turmas: [] };
  }
  function getStudentData(){ return JSON.parse(localStorage.getItem(STUDENT_DATA_KEY)||'{}'); }
  function setStudentData(d){ localStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(d)); }
  function getPeople(){ return JSON.parse(localStorage.getItem(PEOPLE_KEY)||'[]'); }

  const turmasContainer = document.getElementById('lista-turmas');
  const tabela = document.getElementById('tabela-diario');
  const tbody = tabela ? tabela.querySelector('tbody') : null;
  const tituloDiario = document.getElementById('titulo-diario');
  const btnReload = document.getElementById('btnReloadTurma');

  let turmaSelecionada = null; // {id,disciplina,turma}

  function renderTurmas(){
    const assignments = getAssignments();
    if(!turmasContainer) return;
    turmasContainer.innerHTML='';
    if(!assignments.turmas || assignments.turmas.length===0){
      const p=document.createElement('p'); p.className='muted'; p.textContent='Nenhuma turma atribuída ainda.'; turmasContainer.appendChild(p); return;
    }
    // Default select first if none
    if(!turmaSelecionada) turmaSelecionada = assignments.turmas[0];
    assignments.turmas.forEach(t=>{
      const tab=document.createElement('div');
      tab.className='turma-tab' + (turmaSelecionada && turmaSelecionada.id===t.id ? ' active' : '');
      tab.innerHTML = `<strong>${t.disciplina}</strong> <span class="muted small">(${t.turma})</span>`;
      tab.addEventListener('click', ()=>{
        turmaSelecionada=t; 
        // refresh active state
        Array.from(turmasContainer.children).forEach(ch=> ch.classList.toggle('active', ch===tab));
        renderDiario();
      });
      turmasContainer.appendChild(tab);
    });
  }

  function renderDiario(){
    if(!tbody) return;
    tbody.innerHTML='';
    if(!turmaSelecionada){ if(tituloDiario) tituloDiario.textContent='Diário de Notas'; return; }
    if(tituloDiario) tituloDiario.textContent = `Diário de Notas — ${turmaSelecionada.disciplina} (${turmaSelecionada.turma})`;
    const stuData = getStudentData();
    const peopleAlunos = getPeople().filter(p=> String(p.tipo||'').toLowerCase()==='aluno');
    const rows=[];
    peopleAlunos.forEach(a=>{
      const rec = stuData[a.email]; if(!rec||!rec.materias) return;
      const m = rec.materias.find(mm=> mm.nome===turmaSelecionada.disciplina);
      if(m){ rows.push({ aluno:a, rec, m }); }
    });
    rows.forEach(({aluno,rec,m})=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `
        <td>${aluno.name || aluno.email}</td>
        <td>${aluno.ra || aluno.id || ''}</td>
        <td><input type="number" step="0.1" min="0" max="10" value="${m.ac1}" class="inp-ac1" style="width:70px"></td>
        <td><input type="number" step="0.1" min="0" max="10" value="${m.ac2}" class="inp-ac2" style="width:70px"></td>
        <td><input type="number" step="0.1" min="0" max="10" value="${m.ac3}" class="inp-ac3" style="width:70px"></td>
        <td class="cell-media">${m.media.toFixed ? m.media.toFixed(1) : Number(m.media).toFixed(1)}</td>
        <td><input type="number" step="1" min="0" max="100" value="${m.frequencia}" class="inp-freq" style="width:70px">%</td>
        <td><button class="btn small btn-salvar">Salvar</button></td>`;
      const btn=tr.querySelector('.btn-salvar');
      btn.addEventListener('click', ()=>{
        const ac1=Number(tr.querySelector('.inp-ac1').value)||0;
        const ac2=Number(tr.querySelector('.inp-ac2').value)||0;
        const ac3=Number(tr.querySelector('.inp-ac3').value)||0;
        const freq=Math.max(0, Math.min(100, Number(tr.querySelector('.inp-freq').value)||0));
        const media= Number(((ac1+ac2+ac3)/3).toFixed(1));
        // Atualiza na estrutura
        const stuAll = getStudentData();
        const recMut = stuAll[aluno.email];
        if(recMut && recMut.materias){
          const mm = recMut.materias.find(x=> x.nome===turmaSelecionada.disciplina);
          if(mm){ mm.ac1=ac1; mm.ac2=ac2; mm.ac3=ac3; mm.media=media; mm.frequencia=freq; }
          stuAll[aluno.email]=recMut;
          setStudentData(stuAll);
          // Atualiza UI
          tr.querySelector('.cell-media').textContent = media.toFixed(1);
          // Feedback visual do botão
          const originalText = btn.textContent;
          btn.textContent = 'Salvo! ✓';
          btn.classList.add('btn-success');
          btn.disabled = true;
          setTimeout(()=>{ btn.textContent = originalText; btn.classList.remove('btn-success'); btn.disabled=false; }, 2000);
          // Notificação de atualização de nota para o aluno
          try{
            const notifAPI = window.EduConnect && window.EduConnect.notifications;
            if(notifAPI && typeof notifAPI.create === 'function'){
              const title = 'Nota atualizada';
              const body = `${turmaSelecionada.disciplina}: média ${media.toFixed(1)}, frequência ${freq}%`;
              // Target only that student by email
              notifAPI.create(title, body, aluno.email, null);
            }
          }catch(e){ /* noop */ }
        }
      });
      tbody.appendChild(tr);
    });
  }

  if(btnReload){ btnReload.addEventListener('click', renderDiario); }

  renderTurmas();
  renderDiario();
})();