(function(){
  const entriesKey = 'edu_people';
  const usersKey = 'edu_users';
  const notifsKey = 'edu_notifications';

  // Forms and controls
  const formAluno = document.getElementById('cadFormAluno');
  const formProfessor = document.getElementById('cadFormProfessor');
  const tabAluno = document.getElementById('tabAluno');
  const tabProfessor = document.getElementById('tabProfessor');
  const clearAluno = document.getElementById('clearAluno');
  const clearProfessor = document.getElementById('clearProfessor');

  // aluno inputs
  const nomeAluno = document.getElementById('nome_a');
  const sobrenomeAluno = document.getElementById('sobrenome_a');
  const raAluno = document.getElementById('ra_a');
  const emailAluno = document.getElementById('email_a');
  const turmaAluno = document.getElementById('turma_a');
  const cpfAluno = document.getElementById('cpf_a');

  // professor inputs
  const nomeProfessor = document.getElementById('nome_p');
  const sobrenomeProfessor = document.getElementById('sobrenome_p');
  const emailProfessor = document.getElementById('email_p');
  const deptProfessor = document.getElementById('dept_p');
  const turmasProfessor = document.getElementById('turmas_p');
  const materiasProfessor = document.getElementById('materias_p');
  const cpfProfessor = document.getElementById('cpf_p');

  const themeBtnHeader = document.getElementById('themeBtnHeader');
  const tbody = document.querySelector('#listTable tbody');
  const filter = document.getElementById('filterInput');
  const roleFilter = (function(){
    // try to find existing select, else create a small in-memory control
    let el = document.getElementById('roleFilter');
    return el;
  })();
  const exportBtn = document.getElementById('exportBtn');

  const notifBtn = document.getElementById('notifBtn');
  const notifCount = document.getElementById('notifCount');
  const notifDropdown = document.getElementById('notifDropdown');
  const notifList = document.getElementById('notifList');
  // standardized header/menu IDs
  const menuToggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const userGreeting = document.getElementById('userGreeting');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const clearAllNotifsBtn = document.getElementById('clearAllNotifsBtn');

  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function setPeople(arr){ localStorage.setItem(entriesKey, JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }
  function getUsers(){ return JSON.parse(localStorage.getItem(usersKey) || '[]'); }
  function setUsers(arr){ localStorage.setItem(usersKey, JSON.stringify(arr)); }
  function getNotifs(){ return JSON.parse(localStorage.getItem(notifsKey) || '[]'); }
  function setNotifs(arr){ localStorage.setItem(notifsKey, JSON.stringify(arr)); }

  function niceCPF(v){ return (v||'').replace(/\D/g,'').slice(0,11); }

  // detect page role: if only aluno form exists on page, assume Aluno page; if only professor form exists, assume Professor page
  const pageRole = (function(){
    const hasAlunoForm = !!document.getElementById('cadFormAluno');
    const hasProfForm = !!document.getElementById('cadFormProfessor');
    if(hasAlunoForm && !hasProfForm) return 'Aluno';
    if(hasProfForm && !hasAlunoForm) return 'Professor';
    return null;
  })();

  function render(){
    if(!tbody) return;
    const q = (filter && filter.value ? filter.value.toLowerCase() : '');
    let arr = getPeople();
    if(pageRole) arr = arr.filter(p => (p.tipo||'').toLowerCase() === pageRole.toLowerCase());
    if(q) arr = arr.filter(p => (p.nome||'').toLowerCase().includes(q) || (p.sobrenome||'').toLowerCase().includes(q) || (p.email||'').toLowerCase().includes(q) || (p.ra||'').toLowerCase().includes(q));
    tbody.innerHTML = '';
    if(arr.length === 0){ tbody.innerHTML = '<tr><td colspan="5" class="muted small">Nenhum registro</td></tr>'; return; }
    arr.forEach((p)=>{
      const tr = document.createElement('tr');
      const id = p.createdAt || p.email;
      if(pageRole === 'Aluno'){
        tr.innerHTML = `<td>${p.nome} ${p.sobrenome||''}</td><td>${p.ra||''}</td><td>${p.email||''}</td><td>${p.turma||''}</td>
          <td><button data-id="${id}" class="btn ghost small editBtn">Editar</button><button data-id="${id}" class="btn ghost small removeBtn">Remover</button></td>`;
      } else if(pageRole === 'Professor'){
        const turmas = Array.isArray(p.turmas) ? p.turmas.join(', ') : (p.turmas || '');
        const materias = Array.isArray(p.materias) ? p.materias.join(', ') : (p.materias || '');
        tr.innerHTML = `<td>${p.nome} ${p.sobrenome||''}</td><td>${p.email||''}</td><td>${turmas}</td><td>${materias}</td>
          <td><button data-id="${id}" class="btn ghost small editBtn">Editar</button><button data-id="${id}" class="btn ghost small removeBtn">Remover</button></td>`;
      } else {
        tr.innerHTML = `<td>${p.nome} ${p.sobrenome||''}</td><td>${p.email||''}</td><td>${p.tipo||''}</td><td>${p.turma||p.dept||''}</td>
          <td><button data-id="${id}" class="btn ghost small removeBtn">Remover</button></td>`;
      }
      tbody.appendChild(tr);
    });
  }

  // Notifications handled by assets/js/notifications.js (EduConnect.notifications)

  // Modal for password (uses elements existing in page)
  const pwModal = document.getElementById('passwordModal');
  const pwText = document.getElementById('pwText');
  const pwUserEmail = document.getElementById('pwUserEmail');
  const pwCopyBtn = document.getElementById('pwCopyBtn');
  const pwCloseBtn = document.getElementById('pwCloseBtn');
  function showPasswordModal(userEmail, password){ if(!pwModal) throw new Error('Modal missing'); pwUserEmail.textContent = userEmail||''; pwText.textContent = password||''; pwModal.classList.remove('hidden'); pwModal.setAttribute('aria-hidden','false'); }
  function hidePasswordModal(){ if(!pwModal) return; pwModal.classList.add('hidden'); pwModal.setAttribute('aria-hidden','true'); }
  if(pwCopyBtn){ pwCopyBtn.addEventListener('click', async ()=>{ const text = pwText ? pwText.textContent : ''; try{ if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(text); } else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } pwCopyBtn.textContent = 'Copiado'; setTimeout(()=> pwCopyBtn.textContent='Copiar',1500); } catch(e){ console.warn('Copy failed',e); } }); }
  if(pwCloseBtn) pwCloseBtn.addEventListener('click', hidePasswordModal);
  if(pwModal) pwModal.addEventListener('click', (e)=>{ if(e.target === pwModal) hidePasswordModal(); });

  // Validations
  function isEmail(v){ return !!(v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)); }
  function isCPFvalid(v){ const d = (v||'').replace(/\D/g,''); return d.length === 11; }

  function clearErrors(prefix){ ['nome','email','turma','cpf'].forEach(k=>{ const el = document.getElementById('err_' + k + '_' + prefix); if(el) el.textContent = ''; }); }

  function showError(id, msg){ const el = document.getElementById(id); if(el) el.textContent = msg; }

  function validateAluno(){ let ok = true; if(!nomeAluno || !nomeAluno.value.trim()){ showError('err_nome_a','Nome é obrigatório'); ok = false; } else showError('err_nome_a',''); if(!emailAluno || !isEmail(emailAluno.value.trim())){ showError('err_email_a','Email inválido'); ok = false; } else showError('err_email_a',''); if(!turmaAluno || !turmaAluno.value.trim()){ showError('err_turma_a','Turma é obrigatória'); ok = false; } else showError('err_turma_a',''); if(!cpfAluno || !isCPFvalid(cpfAluno.value)){ showError('err_cpf_a','CPF deve ter 11 dígitos'); ok = false; } else showError('err_cpf_a',''); return ok; }
  
  // require RA for students
  function validateAluno(){ let ok = true; if(!nomeAluno || !nomeAluno.value.trim()){ showError('err_nome_a','Nome é obrigatório'); ok = false; } else showError('err_nome_a',''); if(!emailAluno || !isEmail(emailAluno.value.trim())){ showError('err_email_a','Email inválido'); ok = false; } else showError('err_email_a',''); if(!raAluno || !raAluno.value.trim()){ showError('err_ra_a','RA é obrigatório'); ok = false; } else showError('err_ra_a',''); if(!turmaAluno || !turmaAluno.value.trim()){ showError('err_turma_a','Turma é obrigatória'); ok = false; } else showError('err_turma_a',''); if(!cpfAluno || !isCPFvalid(cpfAluno.value)){ showError('err_cpf_a','CPF deve ter 11 dígitos'); ok = false; } else showError('err_cpf_a',''); return ok; }

  function validateProfessor(){ let ok = true; if(!nomeProfessor || !nomeProfessor.value.trim()){ showError('err_nome_p','Nome é obrigatório'); ok = false; } else showError('err_nome_p',''); if(!emailProfessor || !isEmail(emailProfessor.value.trim())){ showError('err_email_p','Email inválido'); ok = false; } else showError('err_email_p',''); if(cpfProfessor && cpfProfessor.value && !isCPFvalid(cpfProfessor.value)){ showError('err_cpf_p','CPF deve ter 11 dígitos'); ok = false; } else showError('err_cpf_p',''); return ok; }

  // Create person + user helper
  function persistPersonAndUser(pessoa){
    // normalize professor arrays if present
    if(pessoa.tipo === 'Professor'){
      if(pessoa.turmas && typeof pessoa.turmas === 'string'){
        pessoa.turmas = pessoa.turmas.split(',').map(s=>s.trim()).filter(Boolean);
      }
      if(pessoa.materias && typeof pessoa.materias === 'string'){
        pessoa.materias = pessoa.materias.split(',').map(s=>s.trim()).filter(Boolean);
      }
    }
    const arr = getPeople(); arr.push(pessoa); setPeople(arr);
    try{
      const users = getUsers();
      const cpfDigits = (pessoa.cpf||'').replace(/\D/g,'');
      const generatedPassword = '#Ec' + cpfDigits;
      const existing = users.find(u=>u.email === pessoa.email);
      if(existing){ existing.name = (pessoa.nome + (pessoa.sobrenome? ' ' + pessoa.sobrenome : '')) || existing.name; if(cpfDigits) existing.password = generatedPassword; } else { const newUser = { name: (pessoa.nome + (pessoa.sobrenome? ' ' + pessoa.sobrenome : '')), email: pessoa.email, role: pessoa.tipo }; if(cpfDigits) newUser.password = generatedPassword; users.push(newUser); }
      setUsers(users);
      if(cpfDigits){ try{ showPasswordModal(pessoa.email, '#Ec' + cpfDigits); } catch(e){ setTimeout(()=> alert('Senha padrão para ' + pessoa.email + ': ' + '#Ec' + cpfDigits),50); } }
      const notifAPI = window.EduConnect && window.EduConnect.notifications;
      if(notifAPI && typeof notifAPI.create === 'function'){
        notifAPI.create('Novo usuário', `Criado ${pessoa.tipo}: ${pessoa.nome} ${pessoa.sobrenome||''}`, pessoa.tipo);
      }
    } catch(e){ console.error('Erro ao persistir usuário', e); }
  }

  // Submissions
  if(formAluno){ formAluno.addEventListener('submit', (e)=>{ e.preventDefault(); if(!validateAluno()) return; const pessoa = { nome: nomeAluno.value.trim(), sobrenome: sobrenomeAluno? sobrenomeAluno.value.trim() : '', ra: raAluno.value.trim(), email: emailAluno.value.trim(), tipo: 'Aluno', turma: turmaAluno.value.trim(), cpf: cpfAluno? cpfAluno.value.trim() : '', createdAt: Date.now() }; persistPersonAndUser(pessoa); formAluno.reset(); render(); }); }
  if(formProfessor){ formProfessor.addEventListener('submit', (e)=>{ e.preventDefault(); if(!validateProfessor()) return; const pessoa = { nome: nomeProfessor.value.trim(), sobrenome: sobrenomeProfessor? sobrenomeProfessor.value.trim() : '', email: emailProfessor.value.trim(), tipo: 'Professor', dept: deptProfessor? deptProfessor.value.trim(): '', turmas: turmasProfessor? turmasProfessor.value.trim() : '', materias: materiasProfessor? materiasProfessor.value.trim() : '', cpf: cpfProfessor? cpfProfessor.value.trim() : '', createdAt: Date.now() }; persistPersonAndUser(pessoa); formProfessor.reset(); render(); }); }

  // Clears
  if(clearAluno) clearAluno.addEventListener('click', ()=>{ if(formAluno) formAluno.reset(); });
  if(clearProfessor) clearProfessor.addEventListener('click', ()=>{ if(formProfessor) formProfessor.reset(); });

  // CPF masks
  function attachCPFmask(el){ if(!el) return; el.addEventListener('input',(e)=>{ const v = (el.value||'').replace(/\D/g,'').slice(0,11); let out=''; if(v.length>0) out = v.slice(0,3); if(v.length>3) out += '.' + v.slice(3,6); if(v.length>6) out += '.' + v.slice(6,9); if(v.length>9) out += '-' + v.slice(9,11); el.value = out; }); }
  attachCPFmask(cpfAluno); attachCPFmask(cpfProfessor);

  // Tab switching
  if(tabAluno && tabProfessor){ tabAluno.addEventListener('click', ()=>{ tabAluno.classList.remove('ghost'); tabProfessor.classList.add('ghost'); if(formAluno) formAluno.classList.remove('hidden'); if(formProfessor) formProfessor.classList.add('hidden'); }); tabProfessor.addEventListener('click', ()=>{ tabProfessor.classList.remove('ghost'); tabAluno.classList.add('ghost'); if(formProfessor) formProfessor.classList.remove('hidden'); if(formAluno) formAluno.classList.add('hidden'); }); }

  // List handlers (remove/export/filter)
  if(filter) filter.addEventListener('input', render);
  if(exportBtn){ exportBtn.addEventListener('click', ()=>{ const data = JSON.stringify(getPeople(), null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'edu_people.json'; a.click(); URL.revokeObjectURL(url); }); }
  if(tbody){ tbody.addEventListener('click', (e)=>{
      if(e.target.classList.contains('removeBtn')){
        const id = e.target.dataset.id; const arr = getPeople(); const idx = arr.findIndex(item => String(item.createdAt) === String(id) || item.email === id); if(idx !== -1){ arr.splice(idx,1); setPeople(arr); render(); }
      }
      if(e.target.classList.contains('editBtn')){
        const id = e.target.dataset.id; const arr = getPeople(); const idx = arr.findIndex(item => String(item.createdAt) === String(id) || item.email === id); if(idx === -1) return; const p = arr[idx];
        if(p.tipo === 'Aluno'){
          const newRA = prompt('RA para ' + p.nome + ':', p.ra || '');
          if(newRA !== null){ p.ra = newRA.trim(); setPeople(arr); render(); }
        } else if(p.tipo === 'Professor'){
          const newTurmas = prompt('Turmas (separar por vírgula):', Array.isArray(p.turmas)? p.turmas.join(', ') : (p.turmas||''));
          if(newTurmas !== null){ p.turmas = newTurmas.split(',').map(s=>s.trim()).filter(Boolean); }
          const newMaterias = prompt('Matérias (separar por vírgula):', Array.isArray(p.materias)? p.materias.join(', ') : (p.materias||''));
          if(newMaterias !== null){ p.materias = newMaterias.split(',').map(s=>s.trim()).filter(Boolean); }
          setPeople(arr); render();
        } else {
          const newName = prompt('Nome:', p.nome || ''); if(newName !== null){ p.nome = newName.trim(); setPeople(arr); render(); }
        }
      }
    }); }

  // Notifications UI handled centrally in header-controls.js

  // header/menu/theme/logout handled centrally by assets/js/header-controls.js

  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  if(!curr){ /* no-op: allow access */ } else { if(userGreeting) userGreeting.textContent = 'Olá, ' + (curr.name || curr.email); }

  // initial render and notifs
  try{ render(); if(window.EduConnect?.notifications?.render) window.EduConnect.notifications.render(); } catch(e){ console.warn('Init render failed', e); }
  window.addEventListener('storage', ()=>{ try{ render(); if(window.EduConnect?.notifications?.render) window.EduConnect.notifications.render(); } catch(e){ console.warn('render on storage failed', e); } });

  // logout handled by header-controls.js
  
  // header controls are handled centrally by assets/js/header-controls.js
})();
