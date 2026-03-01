// ============================================================
// DATABASE (localStorage simulation)
// ============================================================
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem('nb_' + key)) || null; } catch { return null; } },
  set(key, val) { localStorage.setItem('nb_' + key, JSON.stringify(val)); },
  
  // Seed function removed to avoid placeholder data
  seed() {
    // Ensure at least one admin exists for system access
    if (!DB.users.getByEmail('admin@nexabank.com')) {
      const id = 'u' + Math.random().toString(36).substr(2,9);
      DB.users.create({
        id,
        name: 'System Admin',
        email: 'admin@nexabank.com',
        password: 'admin',
        role: 'admin',
        status: 'active',
        joined: new Date().toISOString()
      });
      console.log('Admin user created: admin@nexabank.com / admin');
    }
  },

  clearAll() {
    ['users', 'accounts', 'transactions', 'cards', 'loans', 'notifications', 'payees', 'auditLog', 'seeded'].forEach(k => localStorage.removeItem('nb_' + k));
    this.seed();
    location.reload();
  },

  users: {
    getAll() { return DB.get('users') || []; },
    getById(id) { return DB.users.getAll().find(u => u.id === id); },
    getByEmail(email) { return DB.users.getAll().find(u => u.email === email); },
    create(user) { const all = DB.users.getAll(); all.push(user); DB.set('users', all); },
    update(id, data) { const all = DB.users.getAll(); const i = all.findIndex(u => u.id === id); if (i > -1) { all[i] = {...all[i], ...data}; DB.set('users', all); } },
    delete(id) { DB.set('users', DB.users.getAll().filter(u => u.id !== id)); },
  },
  accounts: {
    getAll() { return DB.get('accounts') || []; },
    getByUser(uid) { return DB.accounts.getAll().filter(a => a.userId === uid); },
    getById(id) { return DB.accounts.getAll().find(a => a.id === id); },
    create(a) { const all = DB.accounts.getAll(); all.push(a); DB.set('accounts', all); },
    update(id, data) { const all = DB.accounts.getAll(); const i = all.findIndex(a => a.id === id); if (i > -1) { all[i] = {...all[i], ...data}; DB.set('accounts', all); } },
    delete(id) { DB.set('accounts', DB.accounts.getAll().filter(a => a.id !== id)); },
  },
  transactions: {
    getAll() { return DB.get('transactions') || []; },
    getByAccount(aid) { return DB.transactions.getAll().filter(t => t.fromId === aid || t.toId === aid).sort((a,b) => new Date(b.ts) - new Date(a.ts)); },
    getByUser(uid) { const accs = DB.accounts.getByUser(uid).map(a=>a.id); return DB.transactions.getAll().filter(t => accs.includes(t.fromId)||accs.includes(t.toId)).sort((a,b) => new Date(b.ts) - new Date(a.ts)); },
    create(t) { const all = DB.transactions.getAll(); all.push(t); DB.set('transactions', all); },
    update(id, data) { const all = DB.transactions.getAll(); const i = all.findIndex(t => t.id === id); if (i > -1) { all[i] = {...all[i], ...data}; DB.set('transactions', all); } },
    delete(id) { DB.set('transactions', DB.transactions.getAll().filter(t => t.id !== id)); },
  },
  cards: {
    getAll() { return DB.get('cards') || []; },
    getByUser(uid) { return DB.cards.getAll().filter(c => c.userId === uid); },
    getById(id) { return DB.cards.getAll().find(c => c.id === id); },
    create(c) { const all = DB.cards.getAll(); all.push(c); DB.set('cards', all); },
    update(id, data) { const all = DB.cards.getAll(); const i = all.findIndex(c => c.id === id); if (i > -1) { all[i] = {...all[i], ...data}; DB.set('cards', all); } },
    delete(id) { DB.set('cards', DB.cards.getAll().filter(c => c.id !== id)); },
  },
  loans: {
    getAll() { return DB.get('loans') || []; },
    getByUser(uid) { return DB.loans.getAll().filter(l => l.userId === uid); },
    getById(id) { return DB.loans.getAll().find(l => l.id === id); },
    create(l) { const all = DB.loans.getAll(); all.push(l); DB.set('loans', all); },
    update(id, data) { const all = DB.loans.getAll(); const i = all.findIndex(l => l.id === id); if (i > -1) { all[i] = {...all[i], ...data}; DB.set('loans', all); } },
    delete(id) { DB.set('loans', DB.loans.getAll().filter(l => l.id !== id)); },
  },
  notifications: {
    getByUser(uid) { return DB.get('notifications')?.filter(n=>n.userId===uid)||[]; },
    add(n) { const all = DB.get('notifications')||[]; all.push(n); DB.set('notifications', all); },
    markRead(id) { const all = DB.get('notifications')||[]; const i = all.findIndex(n=>n.id===id); if(i>-1){all[i].read=true;} DB.set('notifications',all); },
    markAllRead(uid) { const all = DB.get('notifications')||[]; all.forEach(n=>{if(n.userId===uid)n.read=true;}); DB.set('notifications',all); },
  },
  payees: {
    getByUser(uid) { return DB.get('payees')?.filter(p=>p.userId===uid)||[]; },
    create(p) { const all = DB.get('payees')||[]; all.push(p); DB.set('payees', all); },
    delete(id) { DB.set('payees', (DB.get('payees')||[]).filter(p=>p.id!==id)); },
  },
  auditLog: {
    getAll() { return DB.get('auditLog')||[]; },
    add(entry) { const all = DB.auditLog.getAll(); all.push(entry); DB.set('auditLog', all); },
  }
};

// Initialize DB and ensure Admin exists
DB.seed();
