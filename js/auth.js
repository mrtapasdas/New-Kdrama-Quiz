/* ===================== auth.js ===================== */

async function signupUser({name,email,password}){
  email = email.trim().toLowerCase();
  const users = DB.users();
  if(users.some(u=>u.email===email)) throw new Error('An account with this email already exists.');
  const hashed = await sha256(password);
  const user = { id:uid('u'), name:name.trim(), email, password:hashed, isAdmin:false, joined:new Date().toISOString() };
  users.push(user); DB.saveUsers(users);
  DB.saveSession({ userId:user.id, name:user.name, email:user.email, isAdmin:false });
  return user;
}

async function loginUser({email,password}){
  email = email.trim().toLowerCase();
  const users = DB.users();
  const hashed = await sha256(password);
  const user = users.find(u=>u.email===email && u.password===hashed);
  if(!user) throw new Error('Invalid email or password.');
  DB.saveSession({ userId:user.id, name:user.name, email:user.email, isAdmin:!!user.isAdmin });
  return user;
}

function logoutUser(){ DB.clearSession(); window.location.href='index.html'; }

function getSession(){ return DB.session(); }

function getCurrentUser(){
  const s = DB.session(); if(!s) return null;
  return DB.users().find(u=>u.id===s.userId) || null;
}

/* Renders header auth area on public pages. Call on DOMContentLoaded. */
function renderHeaderAuth(rootSelector='#headerAuthArea', pathPrefix=''){
  const el = document.querySelector(rootSelector);
  if(!el) return;
  const s = getSession();
  if(!s){
    el.innerHTML = `
      <a href="${pathPrefix}login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="${pathPrefix}login.html?mode=signup" class="btn btn-primary btn-sm">Sign Up</a>`;
    return;
  }
  const initial = s.name ? s.name.charAt(0).toUpperCase() : 'U';
  el.innerHTML = `
    <div class="user-chip">
      <div class="avatar">${initial}</div>
      <span>${s.name}</span>
    </div>
    ${s.isAdmin ? `<a href="${pathPrefix}admin/index.html" class="btn btn-outline btn-sm">Admin</a>` : ''}
    <button class="btn btn-ghost btn-sm" id="logoutBtn">Log Out</button>`;
  document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
}
