/* ===================== auth.js (Firebase Auth version) ===================== */
const fbAuth = firebase.auth();

async function signupUser({name,email,password}){
  const cred = await fbAuth.createUserWithEmailAndPassword(email.trim().toLowerCase(), password);
  await cred.user.updateProfile({ displayName: name.trim() });
  await DB.createUserProfile(cred.user.uid, {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    isAdmin: false,
    joined: new Date().toISOString()
  });
  return cred.user;
}

async function loginUser({email,password}){
  const cred = await fbAuth.signInWithEmailAndPassword(email.trim().toLowerCase(), password);
  return cred.user;
}

function logoutUser(){
  fbAuth.signOut().then(()=>{
    const depth = location.pathname.includes('/admin/') ? '../' : '';
    window.location.href = depth + 'index.html';
  });
}

/* Returns a Promise -> { userId, name, email, isAdmin } or null */
function getSession(){
  return new Promise((resolve)=>{
    const unsubscribe = fbAuth.onAuthStateChanged(async (user)=>{
      unsubscribe();
      if(!user){ resolve(null); return; }
      const profile = await DB.getUser(user.uid);
      resolve({
        userId: user.uid,
        name: profile?.name || user.displayName || 'User',
        email: user.email,
        isAdmin: !!profile?.isAdmin
      });
    });
  });
}

function renderHeaderAuth(rootSelector='#headerAuthArea', pathPrefix=''){
  const el = document.querySelector(rootSelector);
  if(!el) return;
  getSession().then(s=>{
    if(!s){
      el.innerHTML = `
        <a href="${pathPrefix}login.html" class="btn btn-outline btn-sm">Log In</a>
        <a href="${pathPrefix}login.html?mode=signup" class="btn btn-primary btn-sm">Sign Up</a>`;
      return;
    }
    const initial = s.name ? s.name.charAt(0).toUpperCase() : 'U';
    el.innerHTML = `
      <div class="user-chip"><div class="avatar">${initial}</div><span>${s.name}</span></div>
      ${s.isAdmin ? `<a href="${pathPrefix}admin/index.html" class="btn btn-outline btn-sm">Admin</a>` : ''}
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Log Out</button>`;
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
  }).catch(err=>{
    console.error('renderHeaderAuth failed:', err);
    el.innerHTML = `
      <a href="${pathPrefix}login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="${pathPrefix}login.html?mode=signup" class="btn btn-primary btn-sm">Sign Up</a>`;
  });
}
