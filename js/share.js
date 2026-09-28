// share.js

document.addEventListener('DOMContentLoaded', () => {
  const shareStartBtn = document.getElementById('shareStartBtn');
  const shareResultBtn = document.getElementById('shareResultBtn');

  // Core share function handling both native share and clipboard fallback
  async function handleShare(customText) {
    const shareData = {
      title: document.title,
      text: customText,
      url: window.location.href.split('?')[0] + '?id=' + (CURRENT_QUIZ ? CURRENT_QUIZ.id : new URLSearchParams(location.search).get('id')) 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('User canceled the share or it failed.', err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API (e.g., some desktop browsers)
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        
        // Check if you have a toast function in utils.js, otherwise use alert
        if (typeof showToast === 'function') {
          showToast('Link copied to clipboard!');
        } else {
          alert('Link copied to clipboard! Share it with your friends.');
        }
      } catch (err) {
        alert('Failed to copy link. You can manually copy the page URL from the address bar.');
      }
    }
  }

  // Event Listener for the Start Screen share button
  if (shareStartBtn) {
    shareStartBtn.addEventListener('click', () => {
      const quizTitle = CURRENT_QUIZ ? CURRENT_QUIZ.title : 'this K-Drama';
      const text = `I'm challenging you to the ${quizTitle} quiz! Think you can beat me? Play now:`;
      handleShare(text);
    });
  }

  // Event Listener for the Result Screen share button
  if (shareResultBtn) {
    shareResultBtn.addEventListener('click', () => {
      const quizTitle = CURRENT_QUIZ ? CURRENT_QUIZ.title : 'this K-Drama';
      const text = `I just scored ${SCORE} pts on the ${quizTitle} quiz! Can you beat my score? Play here:`;
      handleShare(text);
    });
  }
});
