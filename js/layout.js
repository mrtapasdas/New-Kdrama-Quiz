/* ===================== layout.js =====================
   Injects an IDENTICAL header and footer on every public page.
   Usage in HTML: <div id="site-header"></div> ... <div id="site-footer"></div>
   Then call renderLayout() once db.js + auth.js are loaded.
   pathPrefix: pass '../' if the page lives inside a subfolder (e.g. /admin/). */

function renderLayout(pathPrefix=''){
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');

  if(headerEl){
    headerEl.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a href="${pathPrefix}index.html" class="logo"><img src="${pathPrefix}images/logo.png" alt="NEW K-DRAMA logo"></a>
          <nav class="main-nav" id="mainNav">
            <a href="${pathPrefix}index.html" data-nav="index.html">Home</a>
            <a href="${pathPrefix}index.html#quizzes" data-nav="quizzes">Quizzes</a>
            <a href="${pathPrefix}index.html#instructions" data-nav="instructions">Instructions</a>
            <a href="${pathPrefix}index.html#footer" data-nav="contact">Contact</a>
          </nav>
          <div class="header-actions" id="headerAuthArea"></div>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>
        </div>
      </header>`;

    if(typeof renderHeaderAuth === 'function') renderHeaderAuth('#headerAuthArea', pathPrefix);

    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const closeNav = ()=>{ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); };
    toggle?.addEventListener('click', e=>{
      e.stopPropagation();
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      if(open) document.getElementById('userPopover')?.classList.remove('open');   // one menu at a time
    });
    nav?.addEventListener('click', e=>{ if(e.target.closest('a')) closeNav(); });   // close after choosing a link
    document.addEventListener('click', e=>{ if(nav && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeNav(); });

    const currentFile = (location.pathname.split('/').pop() || 'index.html');
    headerEl.querySelectorAll('.main-nav a').forEach(a=>{
      if(a.dataset.nav === currentFile || (currentFile==='' && a.dataset.nav==='index.html')){
        a.classList.add('active');
      }
    });
  }

  if(footerEl){
    footerEl.innerHTML = `
      <footer class="site-footer" id="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <div class="footer-logo"><img src="${pathPrefix}images/logo.png" alt="NEW K-DRAMA"></div>
              <p>Free K-drama trivia quizzes for fans, by fans. Play, compete, and celebrate your favorite dramas.</p>
            </div>
            <div class="footer-col">
              <h4>Explore</h4>
              <a href="${pathPrefix}index.html">Home</a>
              <a href="${pathPrefix}index.html#quizzes">Quizzes</a>
              <a href="${pathPrefix}index.html#instructions">Instructions</a>
            </div>
            <div class="footer-col">
              <h4>Account</h4>
              <a href="${pathPrefix}login.html">Log In</a>
              <a href="${pathPrefix}login.html?mode=signup">Sign Up</a>
            </div>
            <div class="footer-col">
              <h4>More</h4>
              <a href="https://newkdrama.com" target="_blank" rel="noopener">NewKDrama.com</a>
              <a href="${pathPrefix}admin/index.html" id="footerAdminLink" hidden>Admin</a>
            </div>
          </div>
          <div class="footer-bottom">© <span id="footerYear"></span> NEW K-DRAMA Quiz. All rights reserved.</div>
        </div>
      </footer>`;
    const yearEl = document.getElementById('footerYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    /* Only admins ever see the Admin link. Everyone else never gets a link to it. */
    if(typeof getSession === 'function'){
      getSession().then(sess=>{
        const link = document.getElementById('footerAdminLink');
        if(link && sess && sess.isAdmin) link.hidden = false;
      }).catch(()=>{ /* not signed in / lookup failed: keep the link hidden */ });
    }
  }
}
