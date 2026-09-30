document.addEventListener("DOMContentLoaded", function() {
  // 1. Create a "honeypot" div with classes that ad blockers automatically target
  const testAd = document.createElement('div');
  testAd.innerHTML = '&nbsp;';
  testAd.className = 'adsbygoogle ad-banner doubleclick ad-slot';
  testAd.style.display = 'block';
  testAd.style.position = 'absolute';
  testAd.style.top = '-9999px';
  document.body.appendChild(testAd);

  // 2. Check after a short delay if the ad blocker removed or hid the element
  setTimeout(function() {
    if (testAd.offsetHeight === 0 || window.getComputedStyle(testAd).display === 'none') {
      showAdblockModal();
    }
    testAd.remove(); // Clean up the DOM
  }, 500);

  // 3. Generate the lock screen if an ad blocker is detected
  function showAdblockModal() {
    const overlay = document.createElement('div');
    // Styling the background overlay
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(5px);';
    
    const modal = document.createElement('div');
    // Styling the message box (matching your dark theme aesthetic)
    modal.style.cssText = 'background:#1a1a1a; color:#f0f0f0; padding:40px 30px; border-radius:12px; max-width:500px; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); border:1px solid #333; font-family:"Noto Serif KR", serif;';
    
    modal.innerHTML = `
      <h2 style="color:#ff4757; margin-top:0; font-family:\'Playfair Display\', serif; font-size:28px;">Ad Blocker Detected</h2>
      <p style="font-size:16px; line-height:1.6; margin-bottom:15px;">It looks like you're using an ad blocker. Our K-Drama trivia is 100% free to play, but we rely on ads to keep the servers running and build new quizzes.</p>
      <p style="font-size:16px; line-height:1.6; margin-bottom:30px; color:#aaa;"><strong>Please whitelist <span style="color:#fff;">newkdrama.com</span> to continue playing.</strong></p>
      <button onclick="location.reload()" style="background:#ff4757; color:#fff; border:none; padding:14px 28px; border-radius:6px; font-size:16px; font-weight:bold; cursor:pointer; width:100%; transition:background 0.2s;">I have disabled it, Refresh Page</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Disable background scrolling so they can't scroll past the lock
    document.body.style.overflow = 'hidden';
  }
});
