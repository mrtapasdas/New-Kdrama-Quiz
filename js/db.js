/* ===================== db.js (Firestore version) ===================== */
const firestore = firebase.firestore();
function uid(p='id'){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

const DB = {
  // ---------- USERS ----------
  async getUsers(){
    const snap = await firestore.collection('users').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getUser(userId){
    const doc = await firestore.collection('users').doc(userId).get();
    return doc.exists ? { id:doc.id, ...doc.data() } : null;
  },
  async createUserProfile(userId, data){
    await firestore.collection('users').doc(userId).set(data);
  },
  async updateUser(userId, data){
    await firestore.collection('users').doc(userId).update(data);
  },
  async deleteUserProfile(userId){
    await firestore.collection('users').doc(userId).delete();
  },

  // ---------- QUIZZES ----------
  async getQuizzes(){
    const snap = await firestore.collection('quizzes').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getQuiz(id){
    const doc = await firestore.collection('quizzes').doc(id).get();
    return doc.exists ? { id:doc.id, ...doc.data() } : null;
  },
  async saveQuiz(quiz){
    if(quiz.id){
      const { id, ...data } = quiz;
      await firestore.collection('quizzes').doc(id).set(data, { merge:true });
      return id;
    } else {
      const ref = await firestore.collection('quizzes').add(quiz);
      return ref.id;
    }
  },
  async deleteQuiz(id){
    await firestore.collection('quizzes').doc(id).delete();
  },

  // ---------- SCORES ----------
  async getScoresForQuiz(quizId){
    const snap = await firestore.collection('scores').where('quizId','==',quizId).get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async getAllScores(){
    const snap = await firestore.collection('scores').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
  },
  async addScore(score){
    await firestore.collection('scores').add({ ...score, date: new Date().toISOString() });
  }
};
