async function requireAdmin(){
  const gate = document.getElementById('adminGate');
  const session = await getSession();

  if(!session){
    window.location.replace('../login.html?redirect=' + encodeURIComponent('admin/index.html'));
    return null;
  }
  if(!session.isAdmin){
    window.location.replace('../index.html');
    return null;
  }

  if(gate) gate.classList.add('hidden');
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
