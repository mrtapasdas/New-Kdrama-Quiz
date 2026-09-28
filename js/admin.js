async function requireAdmin(){
  const gateLoading = document.getElementById('adminGateLoading');
  const shell = document.getElementById('adminShell');
  const session = await getSession();

  if(!session){
    window.location.replace('../login.html?redirect=' + encodeURIComponent('admin/index.html'));
    return null;
  }
  if(!session.isAdmin){
    window.location.replace('../index.html');
    return null;
  }

  // Access confirmed — reveal the dashboard now
  if(gateLoading) gateLoading.style.display = 'none';
  if(shell) shell.classList.add('ready');
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
