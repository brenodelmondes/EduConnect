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
const eventDescInput = document.getElementById("event-desc");
const upcomingEventsList = document.getElementById("upcoming-events");

let currentDate = new Date();

// support two possible localStorage keys (backward compatible)
function readEvents(){
  try{
    return JSON.parse(localStorage.getItem('educonnectEvents') || localStorage.getItem('edu_events') || '[]');
  }catch(e){ return []; }
}

function writeEvents(arr){
  try{ localStorage.setItem('educonnectEvents', JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }catch(e){}
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

  const events = readEvents();
  const daysInMonth = lastDay.getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");
    const dayNum = document.createElement('div'); dayNum.style.fontWeight='700'; dayNum.style.marginBottom='6px'; dayNum.textContent = day; cell.appendChild(dayNum);

    const iso = date.toISOString().split('T')[0];
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
  const events = readEvents().slice().sort((a,b)=> a.date.localeCompare(b.date));
  upcomingEventsList.innerHTML = '';
  const soon = events.slice(0,8);
  if(soon.length===0){ upcomingEventsList.innerHTML = '<li>Nenhum evento próximo.</li>'; return; }
  soon.forEach(ev=>{ const li = document.createElement('li'); li.innerHTML = `<div><strong>${ev.title}</strong><div class="muted small">${ev.date} ${ev.desc? '· ' + ev.desc : ''}</div></div><div><button class="btn ghost small del-event" data-id="${ev.id}">Remover</button></div>`; upcomingEventsList.appendChild(li); });
  upcomingEventsList.querySelectorAll('.del-event').forEach(btn=> btn.addEventListener('click',(e)=>{ const id = e.target.dataset.id; const arr = readEvents(); const idx = arr.findIndex(x=>x.id===id); if(idx!==-1){ arr.splice(idx,1); writeEvents(arr); renderCalendar(); } }));
}

function openDay(iso){
  // show day's events in the upcoming panel (and open modal to add new)
  const events = readEvents().filter(e=> e.date === iso);
  upcomingEventsList.innerHTML = '';
  if(events.length===0){ upcomingEventsList.innerHTML = '<li>Nenhum evento para esta data.</li>'; }
  events.forEach(ev=>{ const li = document.createElement('li'); li.innerHTML = `<div><strong>${ev.title}</strong><div class="muted small">${ev.desc||''}</div></div><div><button class="btn ghost small del-event" data-id="${ev.id}">Remover</button></div>`; upcomingEventsList.appendChild(li); });
  upcomingEventsList.querySelectorAll('.del-event').forEach(btn=> btn.addEventListener('click',(e)=>{ const id = e.target.dataset.id; const arr = readEvents(); const idx = arr.findIndex(x=>x.id===id); if(idx!==-1){ arr.splice(idx,1); writeEvents(arr); renderCalendar(); openDay(iso); } }));
  // open modal prefilled to add a new event for this day
  if(modal){ modal.classList.add('show'); eventDateInput.value = iso; eventTitleInput.value = ''; eventDescInput.value = ''; }
}

// modal controls
if(addEventBtn) addEventBtn.addEventListener('click', ()=>{ if(modal) modal.classList.add('show'); const today = new Date(); eventDateInput.value = today.toISOString().slice(0,10); eventTitleInput.value=''; eventDescInput.value=''; });
if(closeModalBtn) closeModalBtn.addEventListener('click', ()=>{ if(modal) modal.classList.remove('show'); });
if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('show'); });

if(saveEventBtn) saveEventBtn.addEventListener('click', ()=>{
  const d = eventDateInput.value; const t = (eventTitleInput.value||'').trim(); const ds = (eventDescInput.value||'').trim(); if(!d || !t){ alert('Data e título são obrigatórios'); return; }
  const arr = readEvents(); arr.push({ id: 'ev_' + Date.now(), date: d, title: t, desc: ds }); writeEvents(arr); if(modal) modal.classList.remove('show'); renderCalendar(); });

if(prevMonthBtn) prevMonthBtn.addEventListener('click', ()=>{ currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1); renderCalendar(); });
if(nextMonthBtn) nextMonthBtn.addEventListener('click', ()=>{ currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1); renderCalendar(); });

// initial render
try{ renderCalendar(); }catch(e){ console.warn('calendar init failed', e); }
window.addEventListener('storage', ()=>{ try{ renderCalendar(); }catch(e){} });
