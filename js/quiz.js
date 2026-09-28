let CURRENT_QUIZ=null, CURRENT_INDEX=0, SCORE=0, TIME_TAKEN=0, TIMER=null, TIME_LEFT=0, SESSION=null;

function showQuizMessage(title, message, showHome=true){
  const shell = document.querySelector('.quiz-shell');
  shell.innerHTML = `<section class="quiz-panel"><h1>${escapeHtml(title)}</h1>
    <p class="quiz-desc">${escapeHtml(message)}</p>
    ${showHome ? '<a href="index.html" class="btn btn-primary">Back to Home</a>' : ''}</section>`;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ renderLayout(''); }catch(err){ console.error('Layout render failed:', err); }

  const quizId = new URLSearchParams(location.search).get('id');
  if(!quizId){
    showQuizMessage('Quiz not found', 'This quiz link is missing its ID. Pick a quiz from the home page.');
    return;
  }

  try{
    SESSION = await getSession();
    if(!SESSION){
      window.location.href = `login.html?redirect=${encodeURIComponent(`quiz.html?id=${quizId}`)}`;
      return;
    }
    CURRENT_QUIZ = await DB.getQuiz(quizId);
  }catch(err){
    console.error('Quiz load failed:', err);
    showQuizMessage('Could not load quiz', `Something went wrong while loading this quiz (${err.code || err.message}). Please try again.`);
    return;
  }

  if(!CURRENT_QUIZ){
    showQuizMessage('Quiz not found', 'This quiz may have been removed.');
    return;
  }
  if(!CURRENT_QUIZ.questions.length){
    showQuizMessage('No questions yet', 'This quiz does not have any questions yet. Please check back soon.');
    return;
  }

  document.getElementById('pageTitle').textContent = `${CURRENT_QUIZ.title} Quiz | NEW K-DRAMA`;
  document.getElementById('startCategory').textContent = CURRENT_QUIZ.category;
  document.getElementById('startTitle').textContent = CURRENT_QUIZ.title;
  document.getElementById('startDesc').textContent = CURRENT_QUIZ.description;
  document.getElementById('startQCount').textContent = CURRENT_QUIZ.questions.length;
  document.getElementById('startTime').textContent = CURRENT_QUIZ.timePerQuestion;
  document.getElementById('startDiff').textContent = CURRENT_QUIZ.difficulty;

  // Wire up the buttons BEFORE loading the leaderboard, so a leaderboard problem can never block playing.
  document.getElementById('startBtn').addEventListener('click', startQuiz);
  document.getElementById('retryBtn').addEventListener('click', ()=>location.reload());

  try{
    const scores = await DB.getScoresForQuiz(CURRENT_QUIZ.id);
    renderLeaderboard('startLeaderboard', scores, SESSION.userId);
  }catch(err){
    console.error('Leaderboard load failed:', err);
    document.getElementById('startLeaderboard').innerHTML = `<p class="lb-empty">Leaderboard unavailable right now.</p>`;
  }
});

function renderLeaderboard(containerId, scores, currentUserId){
  const el = document.getElementById(containerId);
  const top10 = getTopScores(scores, 10);
  if(!top10.length){ el.innerHTML = `<p class="lb-empty">No scores yet — be the first!</p>`; return; }
  el.innerHTML = top10.map((s,i)=>{
    const rankClass = i===0?'top1':i===1?'top2':i===2?'top3':'';
    const isMe = s.userId===currentUserId;
    return `<div class="lb-row ${isMe?'me':''}">
      <div class="lb-rank ${rankClass}">${i+1}</div>
      <div class="lb-name">${escapeHtml(s.userName)}${isMe?' (You)':''}</div>
      <div class="lb-score">${Number(s.score)||0} pts</div></div>`;
  }).join('');
}

function startQuiz(){
  document.getElementById('startScreen').style.display='none';
  document.getElementById('playScreen').style.display='block';
  CURRENT_INDEX=0; SCORE=0; TIME_TAKEN=0;
  loadQuestion();
}

function loadQuestion(){
  const q = CURRENT_QUIZ.questions[CURRENT_INDEX];
  const total = CURRENT_QUIZ.questions.length;
  document.getElementById('progressFill').style.width = `${(CURRENT_INDEX/total)*100}%`;
  document.getElementById('qCount').textContent = `Question ${CURRENT_INDEX+1} of ${total}`;
  document.getElementById('questionText').textContent = q.q;
  const grid = document.getElementById('optionsGrid');
  const letters = ['A','B','C','D','E','F'];
  grid.innerHTML = q.options.map((opt,i)=>`<button class="option-btn" data-index="${i}"><span class="letter">${letters[i]||i+1}</span>${escapeHtml(opt)}</button>`).join('');
  grid.querySelectorAll('.option-btn').forEach(btn=>btn.addEventListener('click', ()=>selectAnswer(parseInt(btn.dataset.index, 10))));
  startTimer(CURRENT_QUIZ.timePerQuestion);
}

function startTimer(seconds){
  clearInterval(TIMER); TIME_LEFT=seconds;
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
    SCORE += 10 + Math.max(0, Math.floor(TIME_LEFT*2));
  } else {
    if(index>=0 && buttons[index]) buttons[index].classList.add('wrong');
    if(buttons[q.answer]) buttons[q.answer].classList.add('correct');
  }
  setTimeout(()=>{
    CURRENT_INDEX++;
    if(CURRENT_INDEX < CURRENT_QUIZ.questions.length){ loadQuestion(); } else { finishQuiz(); }
  }, 1200);
}

async function finishQuiz(){
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('playScreen').style.display='none';
  document.getElementById('resultScreen').style.display='block';

  // Best possible score per question is 10 + 2 points for each second left on the clock.
  const maxScore = CURRENT_QUIZ.questions.length * (10 + CURRENT_QUIZ.timePerQuestion*2);
  document.getElementById('resultScore').textContent = `${SCORE} pts`;
  document.getElementById('resultEmoji').textContent = SCORE>=maxScore*0.7?'🏆':SCORE>=maxScore*0.4?'🎉':'💪';
  document.getElementById('resultMsg').textContent = SCORE>=maxScore*0.7?"You're a true K-drama expert!":SCORE>=maxScore*0.4?"Nice job! Keep watching and try again.":"Time to binge a few more episodes and retry!";

  const banner = document.getElementById('yourRankBanner');
  banner.style.display='none';

  let saved = true;
  try{
    await DB.addScore({ quizId:CURRENT_QUIZ.id, userId:SESSION.userId, userName:SESSION.name, score:SCORE, timeTaken:TIME_TAKEN });
  }catch(err){
    saved = false;
    console.error('Saving score failed:', err);
  }

  let scores = [];
  try{ scores = await DB.getScoresForQuiz(CURRENT_QUIZ.id); }
  catch(err){ console.error('Leaderboard load failed:', err); }
  renderLeaderboard('resultLeaderboard', scores, SESSION.userId);

  if(!saved){
    banner.style.display='block';
    banner.textContent = "We couldn't save your score to the leaderboard this time.";
    return;
  }
  const rank = getUserBestRank(scores, SESSION.userId);
  if(rank && rank > 10){ banner.style.display='block'; banner.textContent = `Your Rank: #${rank} — climb the leaderboard next time!`; }
}
