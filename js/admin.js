async function requireAdmin(){
  // The admin UI starts hidden (see #adminBody in each admin page) and is only revealed
  // after we've confirmed the signed-in user is an admin.
  let session = null;
  try{ session = await getSession(); }
  catch(err){ console.error('Admin session check failed:', err); }

  if(!session){
    window.location.replace('../login.html?redirect=' + encodeURIComponent('admin/index.html'));
    return null;
  }
  if(!session.isAdmin){
    window.location.replace('../index.html');
    return null;
  }

  const body = document.getElementById('adminBody');
  if(body) body.style.display = '';
  return session;
}

function initAdminChrome(session){
  const welcome = document.getElementById('adminWelcome');
  if(welcome && session) welcome.textContent = `Welcome, ${session.name}`;
  document.getElementById('adminLogout')?.addEventListener('click', e=>{ e.preventDefault(); logoutUser(); });
  document.getElementById('sidebarToggle')?.addEventListener('click', ()=>document.getElementById('adminSidebar').classList.toggle('open'));
}
function showToast(msg){
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000);
}
