(function(){
  const entriesKey = 'edu_people';
  const usersKey = 'edu_users';
  const form = document.getElementById('cadForm');
  const nome = document.getElementById('nome');
  const sobrenome = document.getElementById('sobrenome');
  const email = document.getElementById('email');
  const tipo = document.getElementById('tipo');
  const cpf = document.getElementById('cpf');
  const turma = document.getElementById('turma');
  const themeBtnHeader = document.getElementById('themeBtnHeader2');
  const tbody = document.querySelector('#listTable tbody');
  const filter = document.getElementById('filterInput');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');

  function getPeople() { return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function setPeople(arr) { localStorage.setItem(entriesKey, JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }
  function getUsers() { return JSON.parse(localStorage.getItem(usersKey) || '[]'); }
  function setUsers(arr) { localStorage.setItem(usersKey, JSON.stringify(arr)); }

  function render() {
    const q = (filter.value || '').toLowerCase();
    const arr = getPeople().filter(p => (p.nome || '').toLowerCase().includes(q) || (p.tipo || '').toLowerCase().includes(q));
    tbody.innerHTML = '';
    if (arr.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted small">Nenhum registro</td></tr>';
      return;
    }
    arr.forEach((p, i) => {
      const tr = document.createElement('tr');
      const id = p.createdAt || p.email || i;
      tr.innerHTML = `<td>${p.nome} ${p.sobrenome || ''}</td><td>${p.email}</td><td>${p.tipo}</td><td>${p.turma || ''}</td>
        <td><button data-id="${id}" class="btn ghost small removeBtn">Remover</button></td>`;
      tbody.appendChild(tr);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const arr = getPeople();
    const pessoa = { nome: nome.value.trim(), sobrenome: sobrenome ? sobrenome.value.trim() : '', email: email.value.trim(), tipo: tipo.value, turma: turma.value.trim(), cpf: (cpf ? cpf.value.trim() : ''), createdAt: Date.now() };
    arr.push(pessoa);
    try {
      const users = getUsers();
      const cpfDigits = (pessoa.cpf || '').replace(/\D/g, '');
      const generatedPassword = '#Ec' + cpfDigits;
      const existing = users.find(u => u.email === pessoa.email);
      if (existing) {
        existing.name = (pessoa.nome + (pessoa.sobrenome ? ' ' + pessoa.sobrenome : '')) || existing.name;
        if (cpfDigits) existing.password = generatedPassword;
      } else {
        const newUser = { name: (pessoa.nome + (pessoa.sobrenome ? ' ' + pessoa.sobrenome : '')), email: pessoa.email };
        if (cpfDigits) newUser.password = generatedPassword;
        users.push(newUser);
      }
      setUsers(users);
      if (cpfDigits) { setTimeout(() => { alert('Senha padrão para ' + pessoa.email + ': ' + generatedPassword + '\n(Recomenda-se alterar após primeiro login)'); }, 50); }
    } catch (err) { console.error('Erro ao criar usuário:', err); }
    setPeople(arr);
    form.reset();
    filter.value = '';
    render();
  });

  if (cpf) {
    cpf.addEventListener('input', (e) => {
      const v = cpf.value.replace(/\D/g, '').slice(0, 11);
      let out = '';
      if (v.length > 0) out = v.slice(0, 3);
      if (v.length > 3) out += '.' + v.slice(3, 6);
      if (v.length > 6) out += '.' + v.slice(6, 9);
      if (v.length > 9) out += '-' + v.slice(9, 11);
      cpf.value = out;
    });
  }

  if (themeBtnHeader) {
    themeBtnHeader.addEventListener('click', () => {
      const next = document.body.className === 'light' ? 'dark' : 'light';
      document.body.className = next;
      localStorage.setItem('edu_theme', next);
    });
  }

  const menuToggle2 = document.getElementById('menuToggle2');
  const overlay2 = document.getElementById('sidebarOverlay');
  function toggleSidebar2() { document.body.classList.toggle('sidebar-collapsed'); }
  if (menuToggle2) { menuToggle2.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar2(); }); }
  if (overlay2) { overlay2.addEventListener('click', () => { document.body.classList.add('sidebar-collapsed'); }); }
  document.addEventListener('click', (ev) => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 900 && sidebar && !document.body.classList.contains('sidebar-collapsed')) {
      const isInside = ev.target.closest && ev.target.closest('#sidebar');
      const isToggle = ev.target.closest && ev.target.closest('#menuToggle2');
      if (!isInside && !isToggle) { document.body.classList.add('sidebar-collapsed'); }
    }
  });

  filter.addEventListener('input', render);

  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeBtn')) {
      const id = e.target.dataset.id;
      const arr = getPeople();
      const idx = arr.findIndex(item => String(item.createdAt) === String(id) || item.email === id);
      if (idx !== -1) { arr.splice(idx, 1); setPeople(arr); render(); }
    }
  });

  exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(getPeople(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edu_people.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener('click', () => { if (confirm('Limpar todos os registros?')) { setPeople([]); render(); } });

  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const greet = document.getElementById('userGreeting2');
  if (!curr) { window.location.href = 'index.html'; } else { greet.textContent = 'Olá, ' + (curr.name || curr.email); }

  if (window.innerWidth <= 900) { document.body.classList.add('sidebar-collapsed'); }

  const logoutBtn2 = document.getElementById('logoutLink2');
  if (logoutBtn2) { logoutBtn2.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('edu_currentUser'); window.location.href = 'index.html'; }); }
  document.body.className = localStorage.getItem('edu_theme') || document.body.className || 'light';

  // render list on initial load and refresh when storage changes
  try { render(); } catch (err) { console.warn('Render failed on init:', err); }
  window.addEventListener('storage', () => { try { render(); } catch (e) { console.warn('Render failed on storage event:', e); } });

})();
