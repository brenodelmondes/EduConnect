// assets/js/notifications.js
(function(global){
  const notifsKey = 'edu_notifications';

  function getNotifs(){ return JSON.parse(localStorage.getItem(notifsKey) || '[]'); }
  function setNotifs(arr){ localStorage.setItem(notifsKey, JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }

  function renderNotifications(){
    const notifList = document.getElementById('notifList');
    const notifCount = document.getElementById('notifCount');
    if(!notifList || !notifCount) return;

    const arr = getNotifs().slice().sort((a,b)=>b.createdAt - a.createdAt);
    if(arr.length === 0){
      notifList.innerHTML = '<div class="muted small" style="padding: 8px 12px;">Sem notificações</div>';
      notifCount.textContent = '0';
      return;
    }

    notifList.innerHTML = '';
    let unread = 0;
    arr.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notif-item' + (n.read ? '' : ' unread');
      item.dataset.id = n.id;

      const top = document.createElement('div');
      top.style.display = 'flex';
      top.style.justifyContent = 'space-between';
      top.style.alignItems = 'center';

      const titleEl = document.createElement('strong');
      titleEl.className = 'notif-title';
      titleEl.textContent = n.title;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn small ghost notif-remove';
      removeBtn.textContent = '✖';
      removeBtn.dataset.id = n.id;
      removeBtn.title = 'Remover notificação';

      top.appendChild(titleEl);
      top.appendChild(removeBtn);

      const bodyEl = document.createElement('div');
      bodyEl.className = 'small muted notif-body';
      bodyEl.textContent = n.body;
      bodyEl.title = (n.title || '') + ' - ' + (n.body || '');

      item.appendChild(top);
      item.appendChild(bodyEl);

      // click on item marks as read
      item.addEventListener('click', ()=>{
        const arr2 = getNotifs();
        const idx = arr2.findIndex(x=>x.id===n.id);
        if(idx!==-1 && !arr2[idx].read){ arr2[idx].read = true; setNotifs(arr2); }
      });
      // remove button
      removeBtn.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        const id = ev.target.dataset.id;
        const arr2 = getNotifs();
        const idx = arr2.findIndex(x=>x.id===id);
        if(idx!==-1){ arr2.splice(idx,1); setNotifs(arr2); }
      });

      notifList.appendChild(item);
      if(!n.read) unread++;
    });
    notifCount.textContent = String(unread);
  }

  function markAllNotifsRead(){
    const arr = getNotifs();
    let changed=false;
    arr.forEach(n=>{ if(!n.read){ n.read = true; changed = true; }});
    if(changed) setNotifs(arr);
  }

  function clearAllNotifs(){
    if(!confirm('Limpar todas as notificações?')) return;
    setNotifs([]);
  }

  function createNotification(title, body, targetRole){
    const arr = getNotifs();
    const n = { id: 'n_' + Date.now(), title: title, body: body, targetRole: targetRole || 'all', read: false, createdAt: Date.now() };
    arr.push(n);
    setNotifs(arr);
  }

  // Expose functions to global scope
  global.EduConnect = global.EduConnect || {};
  global.EduConnect.notifications = {
    render: renderNotifications,
    markAllRead: markAllNotifsRead,
    clearAll: clearAllNotifs,
    create: createNotification
  };

  // Re-render on storage change
  window.addEventListener('storage', renderNotifications);
  // Initial render
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderNotifications);
  else renderNotifications();

})(window);
