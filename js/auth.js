// ============================================================
// AUTH & SESSION
// ============================================================

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

async function sha256Hex(input) {
  const enc = new TextEncoder();
  const data = enc.encode(String(input));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function cloudSignInOrBootstrap(email, password) {
  if (!window.NB_FIREBASE?.signIn) {
    return { ok: false, msg: 'Cloud auth not available' };
  }
  const normEmail = normalizeEmail(email);
  try {
    const cred = await window.NB_FIREBASE.signIn(normEmail, password);
    return { ok: true, firebaseUser: cred.user };
  } catch (e) {
    const code = e?.code || '';
    if (code === 'auth/user-not-found') return { ok: false, msg: 'User not found. Please register or ask admin to create your account.' };
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return { ok: false, msg: 'Invalid password' };
    return { ok: false, msg: 'Unable to sign in' };
  }
}

async function cloudGetOrCreateProfile(firebaseUser) {
  const email = normalizeEmail(firebaseUser?.email);
  const uid = firebaseUser?.uid;
  if (!uid || !email) return null;
  if (!window.NB_FIREBASE?.getById || !window.NB_FIREBASE?.existsDoc || !window.NB_FIREBASE?.upsert) return null;
  const [isAdminUser, existing] = await Promise.all([
    window.NB_FIREBASE.existsDoc('admins', uid),
    window.NB_FIREBASE.getById('users', uid)
  ]);
  const role = isAdminUser ? (existing?.role || 'admin') : (existing?.role || 'customer');
  const base = existing || {
    id: uid,
    name: 'User',
    email,
    role,
    status: 'active',
    failedLogins: 0,
    joined: new Date().toISOString().slice(0, 10)
  };
  const profile = { ...base, id: uid, email, role };
  await window.NB_FIREBASE.upsert('users', uid, profile);
  return profile;
}

function verifyCredentials(email, password) {
  const normEmail = normalizeEmail(email);
  try { DB.seed(); } catch (_) {}
  const user = DB.users.getByEmail(normEmail) || DB.users.getAll().find(u => normalizeEmail(u.email) === normEmail);
  if (!user) return { ok: false, msg: 'User not found' };
  if (user.status === 'frozen') return { ok: false, msg: 'Account is frozen. Contact support.' };
  if (user.failedLogins >= 5 && user.password !== password) return { ok: false, msg: 'Account locked. Too many failed attempts.' };
  if (user.password !== password) {
    DB.users.update(user.id, { failedLogins: (user.failedLogins||0)+1 });
    return { ok: false, msg: 'Invalid password' };
  }
  DB.users.update(user.id, { failedLogins: 0 });
  return { ok: true, user };
}

function finalizeLogin(user) {
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

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestLoginOtp(user) {
  const code = generateOtpCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const payload = { userId: user.id, email: normalizeEmail(user.email), expiresAt, attempts: 0 };
  sessionStorage.setItem('nb_login_otp', JSON.stringify(payload));
  try {
    if (!window.NB_FIREBASE?.queueEmail || !window.NB_FIREBASE?.saveLoginOtp) throw new Error('Firebase not ready');
    if (!crypto?.subtle) throw new Error('Secure context required');
    const hash = await sha256Hex(`${user.id}:${code}`);
    await window.NB_FIREBASE.saveLoginOtp(user.id, normalizeEmail(user.email), hash, expiresAt);
    await window.NB_FIREBASE.queueEmail(
      normalizeEmail(user.email),
      'Your NexaBank one-time login code',
      `Your one-time login code is ${code}. It expires in 10 minutes.`,
      `<p>Your one-time login code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`
    );
    toast('One-time login code sent to your email.', 'success');
  } catch (_) {
    const fallback = { ...payload, code };
    sessionStorage.setItem('nb_login_otp', JSON.stringify(fallback));
    toast('Email OTP is not configured. Showing a fallback code for testing.', 'warning');
    const showCode = (localStorage.getItem('nb_show_login_otp') || '1') === '1';
    if (showCode) toast(`Login code: ${code}`, 'info');
  }
}

function getPendingLoginOtp() {
  try { return JSON.parse(sessionStorage.getItem('nb_login_otp') || 'null'); } catch { return null; }
}

function clearPendingLoginOtp() {
  sessionStorage.removeItem('nb_login_otp');
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
      <button class="btn-nb btn-nb-primary w-100 justify-content-center" style="padding:.75rem;" onclick="doLoginStart()"><i class="bi bi-box-arrow-in-right"></i> Continue</button>
      <div class="text-center mt-3" style="font-size:.82rem;color:var(--nb-muted);">No account? <a href="#" style="color:var(--nb-accent);" onclick="renderAuthForm('register')">Create one</a></div>
    `;
    // Removed demo accounts hint for "real" bank feel
  } else if (type === 'login-otp') {
    const pending = getPendingLoginOtp();
    const masked = pending?.email ? pending.email.replace(/^(.{2}).+(@.+)$/, (_, a, b) => `${a}••••${b}`) : '';
    c.innerHTML = `
      <div class="form-group"><label>Email Address</label><input class="nb-input" id="lo-email" type="email" value="${pending?.email || ''}" disabled/></div>
      <div class="form-group"><label>One-Time Login Code</label><input class="nb-input" id="lo-otp" inputmode="numeric" maxlength="6" placeholder="6-digit code" style="letter-spacing:4px;text-align:center;font-size:1.1rem;"/></div>
      <div class="d-flex justify-content-between align-items-center mb-3" style="font-size:.82rem;">
        <span style="color:var(--nb-muted);">Sent to ${masked || 'your email'}</span>
        <a href="#" style="color:var(--nb-accent);" onclick="resendLoginOtp()">Resend</a>
      </div>
      <button class="btn-nb btn-nb-primary w-100 justify-content-center" style="padding:.75rem;" onclick="doLoginVerify()"><i class="bi bi-shield-check"></i> Verify & Sign In</button>
      <div class="text-center mt-3" style="font-size:.82rem;color:var(--nb-muted);"><a href="#" style="color:var(--nb-accent);" onclick="clearPendingLoginOtp();renderAuthForm('login')">Back</a></div>
    `;
  } else {
    c.innerHTML = `
      <div class="row g-2">
        <div class="col-6 form-group"><label>First Name</label><input class="nb-input" id="r-fname" placeholder="John"></div>
        <div class="col-6 form-group"><label>Last Name</label><input class="nb-input" id="r-lname" placeholder="Doe"></div>
      </div>
      <div class="form-group"><label>Email</label><input class="nb-input" id="r-email" type="email" placeholder="you@email.com"></div>
      <div class="form-group"><label>SSN</label><input class="nb-input" id="r-ssn" placeholder="123-45-6789" inputmode="numeric"></div>
      <div class="form-group"><label>Date of Birth</label><input class="nb-input" id="r-dob" type="date"></div>
      <div class="form-group"><label>Phone</label><input class="nb-input" id="r-phone" placeholder="+1-555-0100"></div>
      <div class="form-group"><label>Address</label><input class="nb-input" id="r-address" placeholder="Street address"></div>
      <div class="row g-2">
        <div class="col-6 form-group"><label>City</label><input class="nb-input" id="r-city" placeholder="City"></div>
        <div class="col-6 form-group"><label>State/Region</label><input class="nb-input" id="r-state" placeholder="State"></div>
      </div>
      <div class="row g-2">
        <div class="col-6 form-group"><label>Postal Code</label><input class="nb-input" id="r-zip" placeholder="ZIP"></div>
        <div class="col-6 form-group"><label>Country</label><input class="nb-input" id="r-country" placeholder="Country"></div>
      </div>
      <div class="form-group"><label>Account Type</label>
        <select class="nb-input" id="r-acc-type">
          <option value="Checking">Checking Account</option>
          <option value="Savings">Savings Account</option>
        </select>
      </div>
      <div class="form-group"><label>Password</label><input class="nb-input" id="r-pass" type="password" placeholder="min 8 chars"></div>
      <div class="form-group"><label>Confirm Password</label><input class="nb-input" id="r-pass2" type="password" placeholder="repeat password"></div>
      <button class="btn-nb btn-nb-primary w-100 justify-content-center" style="padding:.75rem;" onclick="doRegister()"><i class="bi bi-person-plus"></i> Create Account</button>
      <div class="text-center mt-3" style="font-size:.82rem;color:var(--nb-muted);">Have an account? <a href="#" style="color:var(--nb-accent);" onclick="renderAuthForm('login')">Sign in</a></div>`;
  }
}

async function doLoginStart() {
  const email = normalizeEmail(document.getElementById('a-email').value);
  const pass = document.getElementById('a-pass').value;
  if (window.NB_FIREBASE?.auth) {
    const cloud = await cloudSignInOrBootstrap(email, pass);
    if (!cloud.ok) return toast(cloud.msg, 'error');
    const profile = await cloudGetOrCreateProfile(cloud.firebaseUser);
    if (!profile) return toast('Unable to load profile', 'error');
    DB.users.update(profile.id, profile);
    finalizeLogin(profile);
    try { await DB.cloud.syncDown(); } catch (_) {}
    await requestLoginOtp(profile);
    return renderAuthForm('login-otp');
  }
  const result = verifyCredentials(email, pass);
  if (!result.ok) return toast(result.msg, 'error');
  await requestLoginOtp(result.user);
  renderAuthForm('login-otp');
}

async function resendLoginOtp() {
  const pending = getPendingLoginOtp();
  if (!pending?.userId) return toast('Please sign in again.', 'warning');
  const user = DB.users.getById(pending.userId);
  if (!user) { clearPendingLoginOtp(); return toast('Please sign in again.', 'warning'); }
  await requestLoginOtp(user);
  renderAuthForm('login-otp');
}

async function doLoginVerify() {
  const pending = getPendingLoginOtp();
  if (!pending?.userId) return toast('Please sign in again.', 'warning');
  if (Date.now() > pending.expiresAt) { clearPendingLoginOtp(); renderAuthForm('login'); return toast('Login code expired. Please sign in again.', 'error'); }
  const otp = String(document.getElementById('lo-otp').value || '').trim();
  const nextAttempts = (pending.attempts || 0) + 1;
  sessionStorage.setItem('nb_login_otp', JSON.stringify({ ...pending, attempts: nextAttempts }));
  if (nextAttempts > 6) { clearPendingLoginOtp(); renderAuthForm('login'); return toast('Too many attempts. Please sign in again.', 'error'); }
  if (pending.code) {
    if (otp !== pending.code) return toast('Invalid login code.', 'error');
  } else {
    try {
      if (!window.NB_FIREBASE?.getLoginOtp || !window.NB_FIREBASE?.deleteLoginOtp) throw new Error('Firebase not ready');
      if (!crypto?.subtle) throw new Error('Secure context required');
      const rec = await window.NB_FIREBASE.getLoginOtp(pending.userId);
      if (!rec?.hash || !rec?.expiresAt || Date.now() > rec.expiresAt) return toast('Login code expired. Please sign in again.', 'error');
      const hash = await sha256Hex(`${pending.userId}:${otp}`);
      if (hash !== rec.hash) return toast('Invalid login code.', 'error');
      await window.NB_FIREBASE.deleteLoginOtp(pending.userId);
    } catch (_) {
      return toast('Unable to verify code. Please try again.', 'error');
    }
  }
  const user = DB.users.getById(pending.userId);
  if (!user) { clearPendingLoginOtp(); renderAuthForm('login'); return toast('Please sign in again.', 'warning'); }
  clearPendingLoginOtp();
  finalizeLogin(user);
  try { await DB.cloud.syncDown(); } catch (_) {}
  if (isAdmin()) window.location.href = 'admin.html';
  else bootApp();
}

function doRegister() {
  const fname = document.getElementById('r-fname').value.trim();
  const lname = document.getElementById('r-lname').value.trim();
  const email = normalizeEmail(document.getElementById('r-email').value);
  const ssnRaw = document.getElementById('r-ssn').value.trim();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;
  const dob = document.getElementById('r-dob').value;
  const phone = document.getElementById('r-phone').value.trim();
  const address = document.getElementById('r-address').value.trim();
  const city = document.getElementById('r-city').value.trim();
  const state = document.getElementById('r-state').value.trim();
  const zip = document.getElementById('r-zip').value.trim();
  const country = document.getElementById('r-country').value.trim();
  const ssnDigits = ssnRaw.replace(/[^\d]/g, '');
  if (!fname||!lname||!email) return toast('Please fill all required fields', 'error');
  if (ssnDigits.length !== 9) return toast('Please enter a valid SSN', 'error');
  if (!dob) return toast('Date of birth is required', 'error');
  if (!phone) return toast('Phone is required', 'error');
  if (!address || !city || !state || !zip || !country) return toast('Address details are required', 'error');
  if (pass !== pass2) return toast('Passwords do not match', 'error');
  if (pass.length < 6) return toast('Password must be 6+ characters', 'error');
  if (DB.users.getByEmail(email)) return toast('Email already registered', 'error');
  const accType = document.getElementById('r-acc-type').value;
  if (window.NB_FIREBASE?.auth && window.NB_FIREBASE?.signUp && window.NB_FIREBASE?.upsert) {
    (async () => {
      try {
        const cred = await window.NB_FIREBASE.signUp(email, pass);
        const id = cred.user.uid;
        const user = { id, name:`${fname} ${lname}`, email, role:'customer', status:'active', phone, dob, ssn:ssnDigits, address, city, state, zip, country, joined:new Date().toISOString().slice(0,10), failedLogins:0 };
        DB.users.create(user);
        DB.accounts.create({ id:'a'+uid(), userId:id, type:accType, balance:0, iban:Math.floor(1000000000 + Math.random() * 9000000000).toString(), swift:'NXBKGB21', status:'active', limit:5000, createdAt:new Date().toISOString().slice(0,10) });
        await window.NB_FIREBASE.upsert('users', id, user);
        try { await DB.cloud.syncDown(); } catch (_) {}
        await requestLoginOtp(user);
        renderAuthForm('login-otp');
        toast('Registration successful. Please verify your login code.', 'success');
      } catch (_) {
        toast('Unable to register. Please try again.', 'error');
      }
    })();
    return;
  }
  const id = 'u' + uid();
  const user = { id, name:`${fname} ${lname}`, email, password:pass, role:'customer', status:'active', phone, dob, ssn:ssnDigits, address, city, state, zip, country, joined:new Date().toISOString().slice(0,10), failedLogins:0 };
  DB.users.create(user);
  DB.accounts.create({ id:'a'+uid(), userId:id, type:accType, balance:0, iban:Math.floor(1000000000 + Math.random() * 9000000000).toString(), swift:'NXBKGB21', status:'active', limit:5000, createdAt:new Date().toISOString().slice(0,10) });
  const res = verifyCredentials(email, pass);
  if (!res.ok) { toast('Registration successful. Please sign in.', 'success'); return renderAuthForm('login'); }
  requestLoginOtp(res.user);
  renderAuthForm('login-otp');
  toast('Registration successful. Please verify your login code.', 'success');
}
