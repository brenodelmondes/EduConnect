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
