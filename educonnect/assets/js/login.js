(function(){
  const form = document.getElementById('loginForm');
  const toggleTheme = document.getElementById('toggleTheme');
  const emailIn = document.getElementById('email');
  const passIn = document.getElementById('password');

  const defaultUser = { name: 'Admin', email: 'admin@edu.com', password: '1234', role: 'Admin' };
  const usersKey = 'edu_users';
  const peopleKey = 'edu_people';

  function getUsers(){
    const raw = localStorage.getItem(usersKey);
    const arr = raw ? JSON.parse(raw) : [];

    if(!arr.find(u=>u.email===defaultUser.email)){
      arr.push(defaultUser);
      localStorage.setItem(usersKey, JSON.stringify(arr));
    }
    return arr;
  }

  function getPeople(){
    try{ return JSON.parse(localStorage.getItem(peopleKey) || '[]'); }catch(e){ return []; }
  }

  function applyTheme(t){
    document.body.className = t;
    localStorage.setItem('edu_theme', t);
  }
  const savedTheme = localStorage.getItem('edu_theme') || 'light';
  applyTheme(savedTheme);

  toggleTheme.addEventListener('click', ()=>{
    const next = document.body.className==='light' ? 'dark' : 'light';
    applyTheme(next);
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = emailIn.value.trim();
    const password = passIn.value.trim();
    const users = getUsers();
    const found = users.find(u=>u.email===email && (u.password===password || !u.password));
    if(found){
      // determine role from users or people registry
      let role = found.role;
      if(!role){
        const people = getPeople();
        const p = people.find(x=>x.email===found.email);
        role = p?.tipo || 'Admin';
      }
      const current = { name: found.name || found.email, email: found.email, role };
      localStorage.setItem('edu_currentUser', JSON.stringify(current));
      if(String(role).toLowerCase()==='aluno'){
        window.location.href = 'aluno.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      alert('Credenciais inválidas. Por favor, tente novamente.');
    }
  });

})();
