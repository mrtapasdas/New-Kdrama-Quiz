/* ===================== auth.js (Firebase Auth version, defensive) ===================== */
function getFbAuth(){
  if(typeof firebase === 'undefined' || !firebase.apps.length){
    throw new Error('Firebase Auth is not available — Firebase was not initialized. Check firebase-config.js and script order.');
  }
  return firebase.auth();
}

function friendlyAuthError(err){
  const map = {
    'auth/invalid-credential': 'Incorrect email or password. Please try again or sign up if you don\'t have an account.',
    'auth/user-not-found': 'No account found with that email. Try signing up instead.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed': 'Network error — please check your internet connection and try again.'
  };
  return map[err.code] || err.message || 'Something went wrong. Please try again.';
}

async function signupUser({name,email,password}){
  if(typeof DB === 'undefined'){
    throw new Error('Internal error: DB module failed to load. Check that js/db.js loaded correctly.');
  }
  let cred;
  try{
    cred = await getFbAuth().createUserWithEmailAndPassword(email.trim().toLowerCase(), password);
  }catch(err){
    throw new Error(friendlyAuthError(err));
  }
  await cred.user.updateProfile({ displayName: name.trim() });
  try{
    await DB.createUserProfile(cred.user.uid, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isAdmin: false,
      joined: new Date().toISOString()
    });
  }catch(err){
    console.error('Profile creation failed after account was created:', err);
    throw new Error('Your account was created, but saving your profile failed. Please try logging in.');
  }
  return cred.user;
}

async function loginUser({email,password}){
  try{
    const cred = await getFbAuth().signInWithEmailAndPassword(email.trim().toLowerCase(), password);
    return cred.user;
  }catch(err){
    throw new Error(friendlyAuthError(err));
  }
}

function logoutUser(){
  getFbAuth().signOut().then(()=>{
    const depth = location.pathname.includes('/admin/') ? '../' : '';
    window.location.href = depth + 'index.html';
  });
}

function getSession(){
  return new Promise((resolve, reject)=>{
    let auth;
    try{ auth = getFbAuth(); }catch(err){ reject(err); return; }
    const unsubscribe = auth.onAuthStateChanged(async (user)=>{
      unsubscribe();
      if(!user){ resolve(null); return; }
      try{
        const profile = await DB.getUser(user.uid);
        resolve({
          userId: user.uid,
          name: profile?.name || user.displayName || 'User',
          email: user.email,
          isAdmin: !!profile?.isAdmin
        });
      }catch(err){ reject(err); }
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
