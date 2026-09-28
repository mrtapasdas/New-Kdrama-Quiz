document.addEventListener('DOMContentLoaded', () => {
  try{ renderLayout(''); }catch(err){ console.error('Layout render failed:', err); }
  initHomeQuizzes().catch(err=>{
    console.error('Quiz loading failed:', err);
    const grid = document.getElementById('quizGrid');
    if(grid) grid.innerHTML = `<p class="empty-state">Couldn't load quizzes. Check console for details.</p>`;
  });
});

async function initHomeQuizzes(){
  const quizzes = await DB.getQuizzes();
  const allScores = await DB.getAllScores();

  const categories = ['All', ...new Set(quizzes.map(q=>q.category))];
  const bar = document.getElementById('categoryBar');
  bar.innerHTML = categories.map((c,i)=>
    `<button class="category-chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`).join('');

  function renderGrid(filter='All'){
    const grid = document.getElementById('quizGrid');
    const list = filter==='All' ? quizzes : quizzes.filter(q=>q.category===filter);
    if(!list.length){ grid.innerHTML = `<p class="empty-state">No quizzes in this category yet.</p>`; return; }
    grid.innerHTML = list.map(q=>`
      <article class="quiz-card">
        <div class="quiz-thumb"><span class="tag">${q.category}</span><img src="${q.thumbnail}" alt="${q.title} quiz thumbnail" loading="lazy"></div>
        <div class="quiz-body">
          <h3>${q.title}</h3><p>${q.description}</p>
          <div class="quiz-meta">
            <span>📝 ${q.questions.length} Qs</span><span>⏱ ${q.timePerQuestion}s/Q</span><span>🎯 ${q.difficulty}</span>
          </div>
          <a href="quiz.html?id=${q.id}" class="btn btn-primary btn-block">Play Quiz</a>
        </div>
      </article>`).join('');
  }

  bar.addEventListener('click', e=>{
    const btn = e.target.closest('.category-chip'); if(!btn) return;
    bar.querySelectorAll('.category-chip').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.cat);
  });

  renderGrid();
  document.getElementById('statQuizzes').textContent = quizzes.length;
  document.getElementById('statPlayers').textContent = new Set(allScores.map(s=>s.userId)).size;
  document.getElementById('statCategories').textContent = new Set(quizzes.map(q=>q.category)).size;
}

function getTopScores(scoresArray, limit=10){
  return [...scoresArray].sort((a,b)=> b.score-a.score || a.timeTaken-b.timeTaken).slice(0, limit);
}
function getUserBestRank(scoresArray, userId){
  const all = [...scoresArray].sort((a,b)=> b.score-a.score || a.timeTaken-b.timeTaken);
  const idx = all.findIndex(s=>s.userId===userId);
  return idx===-1 ? null : idx+1;
}
