function fmt(n) { return '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fmtDate(ts) { return new Date(ts).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}); }
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
  document.getElementById('modal-container').appendChild(el);
}

function closeModal() { const m = document.getElementById('active-modal'); if(m) m.remove(); }

function logAudit(action, entity, entityId, detail='') {
  if (!STATE.user) return;
  DB.auditLog.add({ id:'al'+uid(), adminId:STATE.user.id, action, entity, entityId, detail, ts:new Date().toISOString() });
}

