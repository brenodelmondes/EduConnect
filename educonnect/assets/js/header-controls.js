(function(){
  function qs(sel){ return document.querySelector(sel); }
  function onReady(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  onReady(()=>{
    const menuToggle = qs('#menuToggle');
    const themeBtns = Array.from(document.querySelectorAll('#themeBtnHeader, .theme-toggle'));
    const overlay = qs('#sidebarOverlay');
    const notifBtn = qs('#notifBtn');
    const notifDropdown = qs('#notifDropdown');
    const notifList = qs('#notifList');
    const markAllReadBtn = qs('#markAllReadBtn');
    const clearAllNotifsBtn = qs('#clearAllNotifsBtn');
    const logoutEl = qs('#logoutLink');
    const greetingEl = qs('#userGreeting');
    // role-based nav filtering
    try{
      const curr = JSON.parse(localStorage.getItem('edu_currentUser')||'null');
      const role = String(curr?.role||'').toLowerCase();
      const nav = qs('aside.sidebar nav');
      if(nav && role){
        // Hide/show links by role
        if(role === 'aluno'){
          // hide admin/professor dashboards
          Array.from(nav.querySelectorAll('a[href="dashboard.html"], a[href="professor-dashboard.html"], a[href*="cadastro"]'))
            .forEach(a=>{ a.style.display='none'; });
          // ensure Minha Área link exists (calendar page uses admin nav base)
          let myArea = nav.querySelector('a[href="aluno.html"]');
          if(!myArea){
            myArea = document.createElement('a');
            myArea.href='aluno.html';
            myArea.textContent='Minha Área';
            nav.insertBefore(myArea, nav.firstChild);
          } else {
            myArea.textContent = 'Minha Área';
          }
          myArea.style.display='';
        }
        if(role === 'professor' || role === 'coordenador'){
          // In professor context keep only professor dashboard, turmas, calendario, logout
          Array.from(nav.querySelectorAll('a')).forEach(a=>{
            const href = a.getAttribute('href')||'';
            if(['professor-dashboard.html','professor-turmas.html','calendario.html','#'].includes(href)){
              a.style.display='';
            } else {
              a.style.display='none';
            }
          });
          // If calendar page (original admin nav), inject professor links if missing
          if(!nav.querySelector('a[href="professor-dashboard.html"]')){
            const dash = document.createElement('a'); dash.href='professor-dashboard.html'; dash.textContent='Dashboard'; nav.insertBefore(dash, nav.firstChild);
            const turmas = document.createElement('a'); turmas.href='professor-turmas.html'; turmas.textContent='Minhas Turmas'; nav.insertBefore(turmas, dash.nextSibling);
          }
        }
        if(role === 'admin'){
          // Admin keeps original links; ensure Calendário label correct
          Array.from(nav.querySelectorAll('a')).forEach(a=>{ a.style.display=''; });
        }
        // Normalize calendar label
        const calLink = nav.querySelector('a[href="calendario.html"]');
        if(calLink) calLink.textContent = 'Calendário';
      }
      // Greeting hydration (centralized)
      if(greetingEl){
        let displayName = curr?.name || curr?.nome || '';
        if(!displayName && curr?.email){
          try{
            const people = JSON.parse(localStorage.getItem('edu_people')||'[]');
            const found = people.find(p=>p.email === curr.email);
            if(found) displayName = found.nome || found.name || '';
          }catch(e){ /* noop */ }
        }
        if(displayName){
          const first = displayName.split(' ')[0];
          greetingEl.textContent = 'Olá, ' + first;
        } else {
          greetingEl.textContent = 'Olá, Usuário';
        }
      }
    }catch(e){ /* noop */ }

    function setTheme(next){ document.body.classList.remove('light','dark'); document.body.classList.add(next); localStorage.setItem('edu_theme', next); window.dispatchEvent(new Event('storage')); }

    themeBtns.forEach(btn=>{
      if(btn && !btn._hdrAttached){ btn._hdrAttached = true; btn.addEventListener('click', ()=>{ const next = document.body.classList.contains('light') ? 'dark' : 'light'; setTheme(next); }); }
    });

    if(menuToggle && !menuToggle._hdrAttached){ menuToggle._hdrAttached = true; menuToggle.addEventListener('click', (e)=>{ e.stopPropagation(); document.body.classList.toggle('sidebar-collapsed'); }); }
    if(overlay && !overlay._hdrAttached){ overlay._hdrAttached = true; overlay.addEventListener('click', ()=>{ document.body.classList.add('sidebar-collapsed'); }); }

    document.addEventListener('click', (ev)=>{
      const sidebar = document.getElementById('sidebar');
      if(window.innerWidth <= 900 && sidebar && !document.body.classList.contains('sidebar-collapsed')){
        const isInside = ev.target.closest && ev.target.closest('#sidebar');
        const isToggle = ev.target.closest && ev.target.closest('#menuToggle');
        if(!isInside && !isToggle){ document.body.classList.add('sidebar-collapsed'); }
      }
    });

    if(notifBtn && notifDropdown){
      notifBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const open = !notifDropdown.classList.contains('hidden');
        if(open){
          notifDropdown.classList.add('hidden');
          notifDropdown.setAttribute('aria-hidden','true');
          notifBtn.setAttribute('aria-expanded','false');
        } else {
          notifDropdown.classList.remove('hidden');
          notifDropdown.setAttribute('aria-hidden','false');
          notifBtn.setAttribute('aria-expanded','true');
          const api = window.EduConnect && window.EduConnect.notifications;
          if(api && typeof api.render === 'function'){
            try{ api.render(); }catch(err){ /* noop */ }
          }
        }
      });
    }
    if(markAllReadBtn){
      markAllReadBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const api = window.EduConnect && window.EduConnect.notifications;
        if(api && typeof api.markAllRead === 'function') api.markAllRead();
      });
    }
    if(clearAllNotifsBtn){
      clearAllNotifsBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const api = window.EduConnect && window.EduConnect.notifications;
        if(api && typeof api.clearAll === 'function') api.clearAll();
      });
    }

    if(logoutEl && !logoutEl._hdrAttached){ logoutEl._hdrAttached = true; logoutEl.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('edu_currentUser'); window.location.href = 'index.html'; }); }
  });
})();
