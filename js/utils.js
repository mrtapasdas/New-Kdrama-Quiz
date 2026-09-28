/* ===================== utils.js =====================
   Small shared helpers. Load this BEFORE main.js / quiz.js / auth.js users. */

/* Escapes text for safe use inside innerHTML *and* inside HTML attribute values
   (including value="..."), so quotes in questions/titles can't break the markup. */
function escapeHtml(str){
  return String(str ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function getTopScores(scoresArray, limit=10){
  return [...scoresArray].sort((a,b)=> b.score-a.score || a.timeTaken-b.timeTaken).slice(0, limit);
}

function getUserBestRank(scoresArray, userId){
  const all = [...scoresArray].sort((a,b)=> b.score-a.score || a.timeTaken-b.timeTaken);
  const idx = all.findIndex(s=>s.userId===userId);
  return idx===-1 ? null : idx+1;
}
