// cadastro de pessoas (alunos/professores) com localStorage
(function(){
  const entriesKey = 'edu_people';
  const usersKey = 'edu_users';
  const form = document.getElementById('cadForm');
  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const tipo = document.getElementById('tipo');
  const turma = document.getElementById('turma');
  const tbody = document.querySelector('#listTable tbody');
  const filter = document.getElementById('filterInput');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');

  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function setPeople(arr){ localStorage.setItem(entriesKey, JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }

  function render(){
    const q = (filter.value || '').toLowerCase();
    const arr = getPeople().filter(p => (p.nome||'').toLowerCase().includes(q) || (p.tipo||'').toLowerCase().includes(q));
    tbody.innerHTML = '';
    if(arr.length===0){
      tbody.innerHTML = '<tr><td colspan="5" class="muted small">Nenhum registro</td></tr>';
      return;
    }
    arr.forEach((p, i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.nome}</td><td>${p.email}</td><td>${p.tipo}</td><td>${p.turma||''}</td>
        <td><button data-i="${i}" class="btn ghost small removeBtn">Remover</button></td>`;
      tbody.appendChild(tr);
    });
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const arr = getPeople();
    arr.push({ nome: nome.value.trim(), email: email.value.trim(), tipo: tipo.value, turma: turma.value.trim(), createdAt: Date.now() });
    setPeople(arr);
    form.reset();
    render();
  });

  filter.addEventListener('input', render);

  tbody.addEventListener('click', (e)=>{
    if(e.target.classList.contains('removeBtn')){
      const idx = Number(e.target.dataset.i);
      const arr = getPeople();
      arr.splice(idx,1);
      setPeople(arr);
      render();
    }
  });

  exportBtn.addEventListener('click', ()=>{
    const data = JSON.stringify(getPeople(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edu_people.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener('click', ()=>{
    if(confirm('Limpar todos os registros?')){ setPeople([]); render(); }
  });

  // greeting and auth
  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const greet = document.getElementById('userGreeting2');
  if(!curr){ window.location.href = 'index.html'; } else { greet.textContent = 'Olá, ' + (curr.name || curr.email); }

  // theme buttons
  document.getElementById('themeBtn2').addEventListener('click', ()=>{
    const next = document.body.className==='light' ? 'dark' : 'light';
    document.body.className = next;
    localStorage.setItem('edu_theme', next);
  });
  // menu toggle for small screens
  document.getElementById('menuToggle2').addEventListener('click', ()=>{ document.getElementById('sidebar').classList.toggle('hidden'); });

  // inicial render e aplica tema salvo
  document.body.className = localStorage.getItem('edu_theme') || 'light';
  render();

})();
