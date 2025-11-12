const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const modal = document.getElementById("event-modal");
const addEventBtn = document.getElementById("add-event-btn");
const closeModalBtn = document.getElementById("close-modal");
const saveEventBtn = document.getElementById("save-event");
const eventDateInput = document.getElementById("event-date");
const eventTitleInput = document.getElementById("event-title");
const eventTypeSelect = document.getElementById("event-type");
const eventCourseSelect = document.getElementById("event-course");
const eventDescInput = document.getElementById("event-desc");
const eventRoleHint = document.getElementById("event-role-hint");
const upcomingEventsList = document.getElementById("upcoming-events");

let currentDate = new Date();

// role/capabilities
const curr = JSON.parse(localStorage.getItem('edu_currentUser')||'null');
const role = (curr && curr.role ? String(curr.role).toLowerCase() : '');
// Professores/Admins criam eventos públicos; Alunos podem criar eventos privados
const canEdit = !!curr; // qualquer usuário pode criar seu próprio evento (escopo aplicado ao salvar)

// professor assignments to populate course select
const ASSIGN_KEY='edu_professorAssignments';
function getAssignments(){ try{ const all=JSON.parse(localStorage.getItem(ASSIGN_KEY)||'{}'); return all[curr?.email] || { turmas: [] }; }catch(e){ return { turmas: [] }; } }

// format a Date to local timezone ISO (YYYY-MM-DD) without UTC shift
function localISO(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// support two possible localStorage keys (backward compatible)
function readEvents(){
  try{
    let arr = JSON.parse(localStorage.getItem('edu_events') || localStorage.getItem('educonnectEvents') || '[]');
    // migration: ensure ownerEmail & scope
    let changed=false;
    arr = arr.map(ev=>{
      if(!ev.ownerEmail){ ev.ownerEmail = ev.createdBy || curr?.email || 'desconhecido'; changed=true; }
      if(!ev.scope){
        // heuristic: if creator is professor-like and course present -> publico, else privado
        const creatorRole = (curr && curr.role ? String(curr.role).toLowerCase() : '');
        ev.scope = (creatorRole==='professor' || creatorRole==='admin' || creatorRole==='coordenador') ? 'publico' : 'privado';
        changed=true;
      }
      return ev;
    });
    if(changed){ writeEvents(arr); }
    return arr;
  }catch(e){ return []; }
}

function writeEvents(arr){
  try{
    localStorage.setItem('edu_events', JSON.stringify(arr));
    // manter compatibilidade
    localStorage.setItem('educonnectEvents', JSON.stringify(arr));
    window.dispatchEvent(new Event('storage'));
  }catch(e){}
}

function renderCalendar() {
  if(!calendar) return;
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  monthYear.textContent = `${firstDay.toLocaleString("pt-BR", { month: "long" })} ${year}`;

  // weekdays header
  const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  weekdays.forEach(w=>{ const el = document.createElement('div'); el.className='calendar-weekday'; el.textContent = w; calendar.appendChild(el); });

  const startGap = firstDay.getDay();
  for (let i = 0; i < startGap; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell");
    emptyCell.dataset.empty = 'true';
    calendar.appendChild(emptyCell);
  }

  const allEvents = readEvents();
  // access filter: show public or owned
  const events = allEvents.filter(ev=> ev.scope==='publico' || ev.ownerEmail===curr?.email);
  const daysInMonth = lastDay.getDate();
  const todayISO = localISO(new Date());
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");
    const dayNum = document.createElement('div'); dayNum.style.fontWeight='700'; dayNum.style.marginBottom='6px'; dayNum.textContent = day; cell.appendChild(dayNum);

    const iso = localISO(date);
    if(iso === todayISO) cell.classList.add('is-today');
    const dayEvents = events.filter(e => e.date === iso);
    if (dayEvents.length) cell.classList.add("has-event");
    dayEvents.slice(0,3).forEach(ev=>{ const row = document.createElement('div'); row.innerHTML = `<span class="event-dot"></span><span class="event-title">${ev.title}</span>`; cell.appendChild(row); });

  cell.addEventListener("click", ()=> openDay(iso));
    calendar.appendChild(cell);
  }

  // trailing cells to complete the grid
  const totalCells = calendar.children.length;
  const remainder = totalCells % 7;
  if(remainder !== 0){ const toAdd = 7 - remainder; for(let i=0;i<toAdd;i++){ const em = document.createElement('div'); em.className='calendar-cell'; em.dataset.empty='true'; calendar.appendChild(em); } }

  renderUpcomingSoon();
}

function renderUpcomingSoon(){
  const events = readEvents()
    .filter(ev=> ev.scope==='publico' || ev.ownerEmail===curr?.email)
    .slice()
    .sort((a,b)=> a.date.localeCompare(b.date));
  upcomingEventsList.innerHTML = '';
  const soon = events.slice(0,8);
  if(soon.length===0){ upcomingEventsList.innerHTML = '<li>Nenhum evento próximo.</li>'; return; }
  soon.forEach(ev=>{ 
    const li = document.createElement('li');
    const canRemove = (ev.ownerEmail===curr?.email) || ((role==='professor' || role==='admin' || role==='coordenador') && ev.scope==='publico');
    li.innerHTML = `<div><strong>${ev.title}</strong><div class="muted small">${ev.date} ${ev.desc? '· ' + ev.desc : ''}</div></div>` + (canRemove ? `<div><button class="btn ghost small del-event" data-id="${ev.id}">Remover</button></div>`:'');
    upcomingEventsList.appendChild(li);
  });
  upcomingEventsList.querySelectorAll('.del-event').forEach(btn=> btn.addEventListener('click',(e)=>{ const id = e.target.dataset.id; const arr = readEvents(); const ev = arr.find(x=>x.id===id); if(!ev) return; const canRemove = (ev.ownerEmail===curr?.email) || ((role==='professor' || role==='admin' || role==='coordenador') && ev.scope==='publico'); if(!canRemove) return; const idx = arr.findIndex(x=>x.id===id); if(idx!==-1){ arr.splice(idx,1); writeEvents(arr); renderCalendar(); } }));
}

function openDay(iso){
  // show day's events in the upcoming panel (and open modal to add new)
  const events = readEvents().filter(e=> e.date === iso && (e.scope==='publico' || e.ownerEmail===curr?.email));
  upcomingEventsList.innerHTML = '';
  if(events.length===0){ upcomingEventsList.innerHTML = '<li>Nenhum evento para esta data.</li>'; }
  events.forEach(ev=>{ const canRemove = (ev.ownerEmail===curr?.email) || ((role==='professor' || role==='admin' || role==='coordenador') && ev.scope==='publico'); const li = document.createElement('li'); li.innerHTML = `<div><strong>${ev.title}</strong><div class="muted small">${ev.desc||''}</div></div>` + (canRemove? `<div><button class="btn ghost small del-event" data-id="${ev.id}">Remover</button></div>`:''); upcomingEventsList.appendChild(li); });
  // remover só se pode editar
  upcomingEventsList.querySelectorAll('.del-event').forEach(btn=> btn.addEventListener('click',(e)=>{
    const id = e.target.dataset.id; const arr = readEvents(); const ev = arr.find(x=>x.id===id); if(!ev) return; const canRemove = (ev.ownerEmail===curr?.email) || ((role==='professor' || role==='admin' || role==='coordenador') && ev.scope==='publico'); if(!canRemove) return; const idx = arr.findIndex(x=>x.id===id); if(idx!==-1){ arr.splice(idx,1); writeEvents(arr); renderCalendar(); openDay(iso); }
  }));
  // open modal prefilled to add a new event for this day (apenas professor/admin)
  if(canEdit && modal){ modal.classList.add('show'); eventDateInput.value = iso; eventTitleInput.value = ''; eventDescInput.value = ''; populateCourseSelect(); }
}

// modal controls
if(addEventBtn) addEventBtn.addEventListener('click', ()=>{ if(!canEdit) return; if(modal) modal.classList.add('show'); const today = new Date(); eventDateInput.value = localISO(today); eventTitleInput.value=''; eventDescInput.value=''; populateCourseSelect(); });
if(closeModalBtn) closeModalBtn.addEventListener('click', ()=>{ if(modal) modal.classList.remove('show'); });
if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('show'); });

if(saveEventBtn) saveEventBtn.addEventListener('click', ()=>{
  if(!canEdit){ return; }
  const d = eventDateInput.value; const t = (eventTitleInput.value||'').trim(); const ds = (eventDescInput.value||'').trim();
  const ty = (eventTypeSelect && eventTypeSelect.value) || 'Avaliação';
  const course = (eventCourseSelect && eventCourseSelect.value) || '';
  if(!d || !t){ alert('Data e título são obrigatórios'); return; }
  if(!course){ alert('Selecione a disciplina/turma'); return; }
  const scope = (role==='professor' || role==='admin' || role==='coordenador') ? 'publico' : 'privado';
  const ownerEmail = curr?.email || 'desconhecido';
  const arr = readEvents(); arr.push({ id: 'ev_' + Date.now(), date: d, title: t, desc: ds, type: ty, course, scope, ownerEmail }); writeEvents(arr); if(modal) modal.classList.remove('show'); renderCalendar(); });
  // Criar notificação para alunos da disciplina (genérica, filtragem futura pode ser refinada)
  try{
    const notifAPI = window.EduConnect && window.EduConnect.notifications;
    if(notifAPI && typeof notifAPI.create === 'function'){
      const dateObj = new Date(d + 'T12:00:00');
      const dateStr = dateObj.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
      const titleNotif = `Novo Evento: ${ty}`;
      const bodyNotif = `${t} · ${course} · ${dateStr}` + (ds? ` · ${ds}` : '');
      // targetAudience só se público
      if(scope==='publico') notifAPI.create(titleNotif, bodyNotif, null, course);
      else notifAPI.create(titleNotif, bodyNotif, ownerEmail, null);
    }
  }catch(e){ /* noop */ }

if(prevMonthBtn) prevMonthBtn.addEventListener('click', ()=>{ currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1); renderCalendar(); });
if(nextMonthBtn) nextMonthBtn.addEventListener('click', ()=>{ currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1); renderCalendar(); });

// initial render
// init role-based UI
if(addEventBtn){ addEventBtn.style.display=''; }
if(eventRoleHint){
  if(role==='professor' || role==='admin' || role==='coordenador') eventRoleHint.textContent = 'Você está criando um evento público para suas turmas.';
  else eventRoleHint.textContent = 'Você está criando um evento privado (visível só para você).';
}

function populateCourseSelect(){
  if(!eventCourseSelect) return;
  const asg = getAssignments();
  // Para alunos sem turmas atribuídas, permitir opção genérica "Pessoal"
  let opts = (asg.turmas||[]).map(t=>({ value: t.disciplina, label: `${t.disciplina} (${t.turma})` }));
  if(!opts.length){ opts = [{ value: 'Pessoal', label: 'Pessoal' }]; }
  eventCourseSelect.innerHTML = '';
  opts.forEach(o=>{ const el=document.createElement('option'); el.value=o.value; el.textContent=o.label; eventCourseSelect.appendChild(el); });
}

try{ renderCalendar(); }catch(e){ console.warn('calendar init failed', e); }
window.addEventListener('storage', ()=>{ try{ renderCalendar(); }catch(e){} });
