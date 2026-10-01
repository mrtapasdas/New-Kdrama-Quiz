/* ===================== ads.js ===================== */
(function(){
  window.adsbygoogle = window.adsbygoogle || [];
  let t;

  function fillVisibleAds(){
    // Select all AdSense units, including ones we temporarily hid
    let adUnits = document.querySelectorAll('ins.adsbygoogle, ins[data-ad-status="pending"]');
    
    adUnits.forEach(ins => {
      // Check if the ad is currently visible on the screen
      let isVisible = ins.getBoundingClientRect().width > 0;
      
      // Check if AdSense has already filled this specific ad
      let isAlreadyFilled = ins.hasAttribute('data-adsbygoogle-status');

      if (isVisible && !isAlreadyFilled) {
        // 1. If it's visible, make sure it has the proper class
        ins.classList.add('adsbygoogle');
        ins.removeAttribute('data-ad-status');
        
        // 2. Request the ad from Google
        try { 
          (window.adsbygoogle = window.adsbygoogle || []).push({}); 
        } catch(err) { 
          console.warn('AdSense push failed:', err); 
        }
        
      } else if (!isVisible && !isAlreadyFilled) {
        // 3. If it's hidden (like the mobile ad on desktop), hide it from Google's scanner 
        // so it doesn't steal the push() meant for the right-side ad.
        ins.classList.remove('adsbygoogle');
        ins.setAttribute('data-ad-status', 'pending');
      }
    });
  }

  // Run on first load
  fillVisibleAds();
  
  // Re-check if the user resizes or rotates their screen
  window.addEventListener('resize', () => { 
    clearTimeout(t); 
    t = setTimeout(fillVisibleAds, 250); 
  });
})();
