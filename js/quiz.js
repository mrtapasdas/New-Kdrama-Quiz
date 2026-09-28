/* ===================== quiz.js ===================== */
let CURRENT_QUIZ = null, CURRENT_INDEX = 0, SCORE = 0, TIME_TAKEN = 0, TIMER = null, TIME_LEFT = 0;

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ renderLayout(''); }catch(err){ console.error('Layout render failed:', err); }
  await seedDatabase();

  const params = new URLSearchParams(location.search);
  const quizId = params.get('id');
  const quizzes = DB.quizzes();
  CURRENT_QUIZ = quizzes.find(q=>q.id===quizId);

  if(!CURRENT_QUIZ){
    document.querySelector('.quiz-shell').innerHTML = `<div class="quiz-panel"><h1>Quiz not found</h1><p class="quiz-desc">This quiz may have been removed.</p><a href="index.html" class="btn btn-primary">Back to Home</a></div>`;
    return;
  }

  // Gate behind login — bounce to login page, then come straight back here after auth
  const session = getSession();
  if(!session){
    const redirectUrl = encodeURIComponent(`quiz.html?id=${quizId}`);
    window.location.href = `login.html?redirect=${redirectUrl}`;
    return;
  }

  document.getElementById('pageTitle').textContent = `${CURRENT_QUIZ.title} Quiz | NEW K-DRAMA`;
  document.getElementById('startCategory').textContent = CURRENT_QUIZ.category;
  document.getElementById('startTitle').textContent = CURRENT_QUIZ.title;
  document.getElementById('startDesc').textContent = CURRENT_QUIZ.description;
  document.getElementById('startQCount').textContent = CURRENT_QUIZ.questions.length;
  document.getElementById('startTime').textContent = CURRENT_QUIZ.timePerQuestion;
  document.getElementById('startDiff').textContent = CURRENT_QUIZ.difficulty;

  renderLeaderboard('startLeaderboard', CURRENT_QUIZ.id, session.userId);

  document.getElementById('startBtn').addEventListener('click', startQuiz);
  document.getElementById('retryBtn').addEventListener('click', ()=>location.reload());
});

function renderLeaderboard(containerId, quizId, currentUserId){
  const el = document.getElementById(containerId);
  const top10 = getTopScores(quizId, 10);
  if(!top10.length){ el.innerHTML = `<p class="lb-empty">No scores yet — be the first!</p>`; return; }
  el.innerHTML = top10.map((s,i)=>{
    const rankClass = i===0?'top1':i===1?'top2':i===2?'top3':'';
    const isMe = s.userId===currentUserId;
    return `<div class="lb-row ${isMe?'me':''}">
      <div class="lb-rank ${rankClass}">${i+1}</div>
      <div class="lb-name">${s.userName}${isMe?' (You)':''}</div>
      <div class="lb-score">${s.score} pts</div>
    </div>`;
  }).join('');
}

function startQuiz(){
  document.getElementById('startScreen').style.display='none';
  document.getElementById('startAd').style.display='none';
  document.getElementById('playScreen').style.display='block';
  document.getElementById('playAd').style.display='block';
  CURRENT_INDEX = 0; SCORE = 0; TIME_TAKEN = 0;
  loadQuestion();
}

function loadQuestion(){
  const q = CURRENT_QUIZ.questions[CURRENT_INDEX];
  const total = CURRENT_QUIZ.questions.length;
  document.getElementById('progressFill').style.width = `${(CURRENT_INDEX/total)*100}%`;
  document.getElementById('qCount').textContent = `Question ${CURRENT_INDEX+1} of ${total}`;
  document.getElementById('questionText').textContent = q.q;

  const grid = document.getElementById('optionsGrid');
  const letters = ['A','B','C','D'];
  grid.innerHTML = q.options.map((opt,i)=>
    `<button class="option-btn" data-index="${i}"><span class="letter">${letters[i]}</span>${opt}</button>`).join('');

  grid.querySelectorAll('.option-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>selectAnswer(parseInt(btn.dataset.index)));
  });

  startTimer(CURRENT_QUIZ.timePerQuestion);
}

function startTimer(seconds){
  clearInterval(TIMER);
  TIME_LEFT = seconds;
  document.getElementById('timerBadge').textContent = `⏱ ${TIME_LEFT}s`;
  TIMER = setInterval(()=>{
    TIME_LEFT--; TIME_TAKEN++;
    document.getElementById('timerBadge').textContent = `⏱ ${TIME_LEFT}s`;
    if(TIME_LEFT<=0){ clearInterval(TIMER); selectAnswer(-1); }
  },1000);
}

function selectAnswer(index){
  clearInterval(TIMER);
  const q = CURRENT_QUIZ.questions[CURRENT_INDEX];
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b=>b.classList.add('disabled'));

  if(index === q.answer){
    buttons[index].classList.add('correct');
    const speedBonus = Math.max(0, Math.floor(TIME_LEFT * 2));
    SCORE += 10 + speedBonus;
  } else {
    if(index>=0) buttons[index].classList.add('wrong');
    buttons[q.answer].classList.add('correct');
  }

  setTimeout(()=>{
    CURRENT_INDEX++;
    if(CURRENT_INDEX < CURRENT_QUIZ.questions.length){ loadQuestion(); }
    else { finishQuiz(); }
  }, 1200);
}

function finishQuiz(){
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('playScreen').style.display='none';
  document.getElementById('playAd').style.display='none';
  document.getElementById('resultScreen').style.display='block';
  document.getElementById('resultAd').style.display='block';

  const session = getSession();
  const maxScore = CURRENT_QUIZ.questions.length * 30;
  document.getElementById('resultScore').textContent = `${SCORE} pts`;
  document.getElementById('resultEmoji').textContent = SCORE >= maxScore*0.7 ? '🏆' : SCORE >= maxScore*0.4 ? '🎉' : '💪';
  document.getElementById('resultMsg').textContent =
    SCORE >= maxScore*0.7 ? "You're a true K-drama expert!" :
    SCORE >= maxScore*0.4 ? "Nice job! Keep watching and try again." :
    "Time to binge a few more episodes and retry!";

  const scores = DB.scores();
  const entry = {
    id: uid('s'), quizId: CURRENT_QUIZ.id, userId: session.userId, userName: session.name,
    score: SCORE, timeTaken: TIME_TAKEN, date: new Date().toISOString(), __isLatest:true
  };
  scores.forEach(s=>{ if(s.quizId===CURRENT_QUIZ.id && s.userId===session.userId) s.__isLatest=false; });
  scores.push(entry);
  DB.saveScores(scores);

  renderLeaderboard('resultLeaderboard', CURRENT_QUIZ.id, session.userId);

  const rank = getUserBestRank(CURRENT_QUIZ.id, session.userId);
  const banner = document.getElementById('yourRankBanner');
  if(rank && rank > 10){
    banner.style.display='block';
    banner.textContent = `Your Rank: #${rank} — climb the leaderboard next time!`;
  } else {
    banner.style.display='none';
  }
}
