/* ===================== db.js (Firestore version, defensive) ===================== */
function uid(p='id'){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

function getFirestore(){
  if(typeof firebase === 'undefined' || !firebase.apps.length){
    throw new Error('Firestore is not available — Firebase was not initialized. Check firebase-config.js and script order.');
  }
  return firebase.firestore();
}

const DB = {
  async getUsers(){
    const snap = await getFirestore().collection('users').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getUser(userId){
    const doc = await getFirestore().collection('users').doc(userId).get();
    return doc.exists ? { id:doc.id, ...doc.data() } : null;
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
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getQuiz(id){
    const doc = await getFirestore().collection('quizzes').doc(id).get();
    return doc.exists ? { id:doc.id, ...doc.data() } : null;
  },
  async saveQuiz(quiz){
    if(quiz.id){
      const { id, ...data } = quiz;
      await getFirestore().collection('quizzes').doc(id).set(data, { merge:true });
      return id;
    } else {
      const ref = await getFirestore().collection('quizzes').add(quiz);
      return ref.id;
    }
  },
  async deleteQuiz(id){
    await getFirestore().collection('quizzes').doc(id).delete();
  },
  async getScoresForQuiz(quizId){
    const snap = await getFirestore().collection('scores').where('quizId','==',quizId).get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getAllScores(){
    const snap = await getFirestore().collection('scores').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async addScore(score){
    await getFirestore().collection('scores').add({ ...score, date: new Date().toISOString() });
  }
};
