/* ===================== ads.js =====================
   Fills the AdSense units on the quiz page.

   The quiz page has two kinds of units:
     data-ad-zone="side"  -> the left/right rails, visible on wide screens only
     data-ad-zone="below" -> one ad under the quiz, visible on narrower screens only

   AdSense logs an error ("No slot size for availableWidth=0") if push() runs for a unit
   inside a hidden container, so we only request an ad for a unit that is actually visible,
   and only once. If the window is resized/rotated later, units that just became visible are filled. */
(function(){
  window.adsbygoogle = window.adsbygoogle || [];
  const filled = new WeakSet();

  /* Visible = has a width. (Don't require a height: a responsive unit is 0px tall until its ad loads.) */
  function isVisible(el){
    return el.getBoundingClientRect().width > 0;
  }

  function fillVisibleAds(){
    document.querySelectorAll('ins.adsbygoogle[data-ad-zone]').forEach(ins=>{
      if(filled.has(ins) || !isVisible(ins)) return;
      filled.add(ins);
      try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }
      catch(err){ console.warn('AdSense push failed:', err); }
    });
  }

  fillVisibleAds();
  let t;
  window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(fillVisibleAds, 250); });
})();
