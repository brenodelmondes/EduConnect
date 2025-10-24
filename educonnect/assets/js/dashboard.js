// dashboard behavior: counts, chart simples, logout, theme toggle
(function(){
  const usersKey = 'edu_users';
  const entriesKey = 'edu_people';
  function getPeople(){ return JSON.parse(localStorage.getItem(entriesKey) || '[]'); }
  function getUsers(){ return JSON.parse(localStorage.getItem(usersKey) || '[]'); }

  // user greeting
  const curr = JSON.parse(localStorage.getItem('edu_currentUser') || 'null');
  const userGreeting = document.getElementById('userGreeting');
  if(!curr){ window.location.href = 'index.html'; } else { userGreeting.textContent = 'Olá, ' + (curr.name || curr.email); document.title = 'EduConnect - ' + (curr.name || curr.email); }

  // counts
  function refreshCounts(){
    const people = getPeople();
    const students = people.filter(p=>p.tipo==='aluno');
    const teachers = people.filter(p=>p.tipo==='professor');
    document.getElementById('countStudents').textContent = students.length;
    document.getElementById('countTeachers').textContent = teachers.length;
    document.getElementById('countClasses').textContent = (new Set(people.map(p=>p.turma).filter(Boolean))).size || 0;
  }

  refreshCounts();

  // simple chart (canvas)
  const canvas = document.getElementById('simpleChart');
  const ctx = canvas.getContext('2d');
  function drawChart(){
    const people = getPeople();
    const students = people.filter(p=>p.tipo==='aluno').length;
    const teachers = people.filter(p=>p.tipo==='professor').length;
    const total = Math.max(1, students + teachers);
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // bars
    const w = 80;
    const startX = 40;
    // students
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#2563eb';
    ctx.fillRect(startX, canvas.height - (students/total)*120 - 30, w, (students/total)*120 + 30);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#10b981';
    ctx.fillRect(startX + 140, canvas.height - (teachers/total)*120 - 30, w, (teachers/total)*120 + 30);
    // labels
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111';
    ctx.font = '16px system-ui';
    ctx.fillText('Alunos', startX, canvas.height - 6);
    ctx.fillText('Professores', startX + 140, canvas.height - 6);
  }

  drawChart();

  // redraw when storage changes (other tab) or counts update
  window.addEventListener('storage', ()=>{ refreshCounts(); drawChart(); });

  // Theme toggles and menu
  document.getElementById('themeBtn').addEventListener('click', ()=>{
    const next = document.body.className==='light' ? 'dark' : 'light';
    document.body.className = next;
    localStorage.setItem('edu_theme', next);
    drawChart();
  });

  document.getElementById('menuToggle').addEventListener('click', ()=>{
    document.getElementById('sidebar').classList.toggle('hidden');
  });

  // logout
  document.getElementById('logoutLink').addEventListener('click', (e)=>{
    e.preventDefault();
    localStorage.removeItem('edu_currentUser');
    window.location.href = 'index.html';
  });

  // refresh counts periodically
  setInterval(()=>{ refreshCounts(); drawChart(); }, 1000);

})();
