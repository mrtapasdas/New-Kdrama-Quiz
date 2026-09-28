/* ===================== db.js (Firestore version, defensive) ===================== */
function uid(p='id'){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

function getFirestore(){
  if(typeof firebase === 'undefined' || !firebase.apps.length){
    throw new Error('Firestore is not available — Firebase was not initialized. Check firebase-config.js and script order.');
  }
  return firebase.firestore();
}

/* Firestore document -> plain object.
   The REAL document ID must always win. Older versions of saveQuiz() stored `id: null`
   inside the document, and `{ id: d.id, ...d.data() }` let that null overwrite the real ID —
   which produced quiz.html?id=null (can't play) and an Edit button that matched nothing. */
function docToObj(d){ return { ...d.data(), id: d.id }; }

/* Make sure a quiz always has the shape the UI expects, even if it was
   created by hand in the Firebase console. */
function normalizeQuiz(q){
  const questions = Array.isArray(q.questions) ? q.questions : [];
  const time = Number(q.timePerQuestion);
  return {
    ...q,
    title: q.title || 'Untitled Quiz',
    category: q.category || 'General',
    difficulty: q.difficulty || 'Medium',
    description: q.description || '',
    thumbnail: q.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(q.id)}/400/250`,
    timePerQuestion: time > 0 ? time : 20,
    questions: questions.map(x=>({
      q: String(x?.q ?? ''),
      options: Array.isArray(x?.options) ? x.options.map(o=>String(o ?? '')) : [],
      answer: Number(x?.answer)
    }))
  };
}

const DB = {
  async getUsers(){
    const snap = await getFirestore().collection('users').get();
    return snap.docs.map(docToObj);
  },
  async getUser(userId){
    const doc = await getFirestore().collection('users').doc(userId).get();
    return doc.exists ? docToObj(doc) : null;
  },
  async createUserProfile(userId, data){
    await getFirestore().collection('users').doc(userId).set(data);
  },
  async updateUser(userId, data){
    await getFirestore().collection('users').doc(userId).update(data);
  },
  async deleteUserProfile(userId){
    await getFirestore().collection('users').doc(userId).delete();
  },
  async getQuizzes(){
    const snap = await getFirestore().collection('quizzes').get();
    return snap.docs.map(d=>normalizeQuiz(docToObj(d)));
  },
  async getQuiz(id){
    if(!id) return null;
    const doc = await getFirestore().collection('quizzes').doc(id).get();
    return doc.exists ? normalizeQuiz(docToObj(doc)) : null;
  },
  async saveQuiz(quiz){
    // Never store the id INSIDE the document — the document ID is the id.
    const { id, ...data } = quiz;
    const col = getFirestore().collection('quizzes');
    if(id){
      // FieldValue.delete() also cleans out the stray `id: null` field that older saves left behind.
      await col.doc(id).set({ ...data, id: firebase.firestore.FieldValue.delete() }, { merge:true });
      return id;
    }
    const ref = await col.add(data);
    return ref.id;
  },
  async deleteQuiz(id){
    await getFirestore().collection('quizzes').doc(id).delete();
  },
  async getScoresForQuiz(quizId){
    const snap = await getFirestore().collection('scores').where('quizId','==',quizId).get();
    return snap.docs.map(docToObj);
  },
  async getAllScores(){
    const snap = await getFirestore().collection('scores').get();
    return snap.docs.map(docToObj);
  },
  async addScore(score){
    await getFirestore().collection('scores').add({ ...score, date: new Date().toISOString() });
  }
};
