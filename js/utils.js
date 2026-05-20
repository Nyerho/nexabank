function fmt(n) { return '$' + Number(n||0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtDate(ts) { if(!ts) return 'N/A'; try { return new Date(ts).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}); } catch { return 'Invalid Date'; } }
function uid() { return Math.random().toString(36).substr(2,9); }

function toast(msg, type='info') {
  const icons = {success:'check-circle-fill',error:'x-circle-fill',warning:'exclamation-triangle-fill',info:'info-circle-fill'};
  const colors = {success:'var(--nb-success)',error:'var(--nb-danger)',warning:'var(--nb-warning)',info:'var(--nb-accent)'};
  const el = document.createElement('div');
  el.className = 'toast-item ' + type;
  el.innerHTML = `<i class="bi bi-${icons[type]||'info-circle-fill'}" style="color:${colors[type]||colors.info};font-size:1.1rem;"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showModal(title, html, footer='') {
  closeModal();
  const el = document.createElement('div');
  el.id = 'active-modal';
  el.className = 'nb-modal-overlay';
  el.innerHTML = `<div class="nb-modal"><div class="nb-modal-header"><div class="nb-modal-title">${title}</div><button class="nb-modal-close" onclick="closeModal()"><i class="bi bi-x"></i></button></div><div id="modal-body">${html}</div>${footer?'<div class="mt-3">'+footer+'</div>':''}</div>`;
  el.addEventListener('click', e => { if(e.target===el) closeModal(); });
  document.body.appendChild(el);
}

function closeModal() { const m = document.getElementById('active-modal'); if(m) m.remove(); }

function toggleSidebar(force) {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  if (!s || !o) return;
  const open = force !== undefined ? force : !s.classList.contains('open');
  s.classList.toggle('open', open);
  o.classList.toggle('active', open);
}

function logAudit(action, entity, entityId, detail='') {
  if (!STATE.user) return;
  DB.auditLog.add({ id:'al'+uid(), adminId:STATE.user.id, action, entity, entityId, detail, ts:new Date().toISOString() });
}

function sanitizeTxnDesc(desc) {
  const s = String(desc || '').replace(/\s+/g, ' ').trim();
  return s.replace(/\bfrom\s+admin\b/ig, '').replace(/\s+/g, ' ').trim();
}

function toDatetimeLocalValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
