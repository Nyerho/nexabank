// ============================================================
// AUTH & SESSION
// ============================================================

function login(email, password) {
  const user = DB.users.getByEmail(email);
  if (!user) return { ok: false, msg: 'User not found' };
  if (user.status === 'frozen') return { ok: false, msg: 'Account is frozen. Contact support.' };
  if (user.failedLogins >= 5) return { ok: false, msg: 'Account locked. Too many failed attempts.' };
  if (user.password !== password) {
    DB.users.update(user.id, { failedLogins: (user.failedLogins||0)+1 });
    return { ok: false, msg: 'Invalid password' };
  }
  DB.users.update(user.id, { failedLogins: 0 });
  STATE.user = user;
  sessionStorage.setItem('nb_session', user.id);
  return { ok: true };
}

function logout() {
  STATE.user = null;
  sessionStorage.removeItem('nb_session');
  location.href = 'app.html'; // Redirect to login
}

function isAdmin() { return STATE.user && ['admin','superadmin','teller'].includes(STATE.user.role); }
function isSuperAdmin() { return STATE.user && STATE.user.role === 'superadmin'; }

function restoreSession() {
  const uid = sessionStorage.getItem('nb_session');
  if (uid) { STATE.user = DB.users.getById(uid); return !!STATE.user; }
  return false;
}

// ============================================================
// AUTH FORMS
// ============================================================
function renderAuthForm(type='login') {
  const c = document.getElementById('auth-form-container');
  if (!c) return; // Guard if container doesn't exist (e.g. in admin page if structure differs)
  
  if (type === 'login') {
    c.innerHTML = `
      <div class="form-group"><label>Email Address</label><input class="nb-input" id="a-email" type="email" placeholder="you@example.com"/></div>
      <div class="form-group"><label>Password</label><input class="nb-input" id="a-pass" type="password" placeholder="••••••••"/></div>
      <div class="d-flex justify-content-between align-items-center mb-3" style="font-size:.82rem;">
        <label style="display:inline-flex;align-items:center;gap:.3rem;cursor:pointer;color:var(--nb-text);"><input type="checkbox"> Remember me</label>
        <a href="#" style="color:var(--nb-accent);">Forgot password?</a>
      </div>
      <button class="btn-nb btn-nb-primary w-100 justify-content-center" style="padding:.75rem;" onclick="doLogin()"><i class="bi bi-box-arrow-in-right"></i> Sign In</button>
      <div class="text-center mt-3" style="font-size:.82rem;color:var(--nb-muted);">No account? <a href="#" style="color:var(--nb-accent);" onclick="renderAuthForm('register')">Create one</a></div>
    `;
    // Removed demo accounts hint for "real" bank feel
  } else {
    c.innerHTML = `
      <div class="row g-2">
        <div class="col-6 form-group"><label>First Name</label><input class="nb-input" id="r-fname" placeholder="John"></div>
        <div class="col-6 form-group"><label>Last Name</label><input class="nb-input" id="r-lname" placeholder="Doe"></div>
      </div>
      <div class="form-group"><label>Email</label><input class="nb-input" id="r-email" type="email" placeholder="you@email.com"></div>
      <div class="form-group"><label>Date of Birth</label><input class="nb-input" id="r-dob" type="date"></div>
      <div class="form-group"><label>Phone</label><input class="nb-input" id="r-phone" placeholder="+1-555-0100"></div>
      <div class="form-group"><label>Password</label><input class="nb-input" id="r-pass" type="password" placeholder="min 8 chars"></div>
      <div class="form-group"><label>Confirm Password</label><input class="nb-input" id="r-pass2" type="password" placeholder="repeat password"></div>
      <button class="btn-nb btn-nb-primary w-100 justify-content-center" style="padding:.75rem;" onclick="doRegister()"><i class="bi bi-person-plus"></i> Create Account</button>
      <div class="text-center mt-3" style="font-size:.82rem;color:var(--nb-muted);">Have an account? <a href="#" style="color:var(--nb-accent);" onclick="renderAuthForm('login')">Sign in</a></div>`;
  }
}

function doLogin() {
  const email = document.getElementById('a-email').value.trim();
  const pass = document.getElementById('a-pass').value;
  const result = login(email, pass);
  if (result.ok) { 
      // Check if admin and redirect if needed
      if (isAdmin()) {
          window.location.href = 'admin.html';
      } else {
          bootApp(); 
      }
  }
  else { toast(result.msg, 'error'); }
}

function doRegister() {
  const fname = document.getElementById('r-fname').value.trim();
  const lname = document.getElementById('r-lname').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;
  if (!fname||!lname||!email) return toast('Please fill all fields', 'error');
  if (pass !== pass2) return toast('Passwords do not match', 'error');
  if (pass.length < 6) return toast('Password must be 6+ characters', 'error');
  if (DB.users.getByEmail(email)) return toast('Email already registered', 'error');
  const id = 'u' + uid();
  const user = { id, name:`${fname} ${lname}`, email, password:pass, role:'customer', status:'active', phone:document.getElementById('r-phone').value, dob:document.getElementById('r-dob').value, address:'', joined:new Date().toISOString().slice(0,10), failedLogins:0 };
  DB.users.create(user);
  DB.accounts.create({ id:'a'+uid(), userId:id, type:'Checking', balance:0, iban:'GB29NWBK'+Math.floor(Math.random()*1e14), swift:'NXBKGB21', status:'active', limit:5000, createdAt:new Date().toISOString().slice(0,10) });
  const res = login(email, pass);
  if (res.ok) {
    bootApp();
    toast('Welcome to NexaBank!', 'success');
  } else {
    toast('Registration successful but login failed. Please sign in.', 'warning');
    renderAuthForm('login');
  }
}
