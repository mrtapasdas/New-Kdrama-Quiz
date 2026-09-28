/* ===================== db.js =====================
   Local "database" using localStorage.
   Swap this file's internals later for real API calls
   (Firebase/Supabase) without changing other JS files. */

const DB_KEYS = {
  USERS:'kd_users', SESSION:'kd_session',
  QUIZZES:'kd_quizzes', SCORES:'kd_scores', SEEDED:'kd_seeded_v2'
};

const DB = {
  read(key, fallback){ try{ const r=localStorage.getItem(key); return r?JSON.parse(r):fallback; }catch(e){ return fallback; } },
  write(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  users(){ return this.read(DB_KEYS.USERS, []); },
  saveUsers(u){ this.write(DB_KEYS.USERS, u); },
  quizzes(){ return this.read(DB_KEYS.QUIZZES, []); },
  saveQuizzes(q){ this.write(DB_KEYS.QUIZZES, q); },
  scores(){ return this.read(DB_KEYS.SCORES, []); },
  saveScores(s){ this.write(DB_KEYS.SCORES, s); },
  session(){ return this.read(DB_KEYS.SESSION, null); },
  saveSession(s){ this.write(DB_KEYS.SESSION, s); },
  clearSession(){ localStorage.removeItem(DB_KEYS.SESSION); }
};

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function uid(p='id'){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

async function seedDatabase(){
  if(localStorage.getItem(DB_KEYS.SEEDED)) return;

  const adminPass = await sha256('admin123');
  DB.saveUsers([{ id:uid('u'), name:'Admin', email:'admin@newkdrama.com', password:adminPass, isAdmin:true, joined:new Date().toISOString() }]);

  const quizzes = [
    { id:uid('q'), title:"Crash Landing on You — Ultimate Trivia", category:"Romance", difficulty:"Medium",
      thumbnail:"https://picsum.photos/seed/clly/400/250",
      description:"How well do you remember Yoon Se-ri and Captain Ri's border-crossing love story?",
      timePerQuestion:20,
      questions:[
        {q:"What is Yoon Se-ri's profession?",options:["Doctor","CEO of a cosmetics company","Teacher","Singer"],answer:1},
        {q:"Where does Se-ri accidentally paraglide into?",options:["China","South Korea","North Korea","Japan"],answer:2},
        {q:"What is Captain Ri's full name?",options:["Ri Jeong-hyeok","Ri Jeong-min","Kim Jeong-hyeok","Ri Sang-hyeok"],answer:0},
        {q:"Who is Captain Ri's second-in-command who suspects Se-ri?",options:["Pyo Chi-su","Geum Eun-dong","Man-bok","Seo-dan"],answer:0},
        {q:"What is Se-ri's family business?",options:["Steel","Cosmetics conglomerate","Airlines","Shipping"],answer:1}
      ]},
    { id:uid('q'), title:"Squid Game — Survive the Trivia", category:"Thriller", difficulty:"Hard",
      thumbnail:"https://picsum.photos/seed/squidgame/400/250",
      description:"456 players, one prize. Test your memory of the deadly games.",
      timePerQuestion:20,
      questions:[
        {q:"What is the main character's player number?",options:["001","456","067","218"],answer:1},
        {q:"What is the first game played?",options:["Tug of war","Red Light, Green Light","Marbles","Dalgona candy"],answer:1},
        {q:"What shape do VIPs wear masks resembling?",options:["Animals","Playing cards","Greek statues","Circus masks"],answer:2},
        {q:"What candy shape does Seong Gi-hun choose in the dalgona challenge?",options:["Star","Circle","Triangle","Umbrella"],answer:0},
        {q:"What is the prize money in the final game?",options:["45.6 billion won","10 billion won","100 million won","1 billion won"],answer:0}
      ]},
    { id:uid('q'), title:"Mr. Sunshine — Saeguk Trivia", category:"Historical", difficulty:"Hard",
      thumbnail:"https://picsum.photos/seed/mrsunshine/400/250",
      description:"A journey through the Joseon era's fight for independence.",
      timePerQuestion:25,
      questions:[
        {q:"What is the male lead Eugene Choi's origin?",options:["Born noble in Joseon","A former slave who fled to America","A Japanese officer","A Chinese merchant"],answer:1},
        {q:"What is Eugene's occupation in America?",options:["Doctor","US Marine Corps officer","Journalist","Diplomat"],answer:1},
        {q:"Who is the female lead of Mr. Sunshine?",options:["Go Ae-shin","Kim Hee-sun","Seo-yeon","Baek Yoo-jin"],answer:0},
        {q:"What secret role does Go Ae-shin have?",options:["Spy for Japan","Sniper for the Righteous Army","Royal guard","Merchant"],answer:1}
      ]},
    { id:uid('q'), title:"Goblin — Fantasy & Romance Quiz", category:"Fantasy", difficulty:"Easy",
      thumbnail:"https://picsum.photos/seed/goblin/400/250",
      description:"The immortal Goblin needs a human bride to end his cursed life — how much do you remember?",
      timePerQuestion:20,
      questions:[
        {q:"What is the Goblin's human name?",options:["Kim Shin","Wang Yeo","Deok-hwa","Sunny's boss"],answer:0},
        {q:"Who is the 'Goblin's Bride'?",options:["Ji Eun-tak","Sunny","Grim Reaper's love","Duk-hwa's sister"],answer:0},
        {q:"What must be pulled from the Goblin's chest to end his immortality?",options:["The sword","A ring","A flower","A locket"],answer:0},
        {q:"Who lives with the Goblin, unable to remember his past?",options:["The Grim Reaper","Sunny","Duk-hwa","A ghost"],answer:0}
      ]},
    { id:uid('q'), title:"Reply 1988 — Nostalgia Check", category:"Slice of Life", difficulty:"Easy",
      thumbnail:"https://picsum.photos/seed/reply1988/400/250",
      description:"A heartwarming look at friendship and family on Ssangmun-dong's alley.",
      timePerQuestion:20,
      questions:[
        {q:"In what year is most of the drama set?",options:["1978","1988","1998","2008"],answer:1},
        {q:"What is the name of the alley where the families live?",options:["Ssangmun-dong","Gangnam-gu","Hongdae","Itaewon"],answer:0},
        {q:"Who does Deok-sun end up marrying (revealed via flash-forwards)?",options:["Jung-hwan","Sun-woo","Taek","Dong-ryong"],answer:2},
        {q:"What game is Taek a professional at?",options:["Chess","Baduk (Go)","StarCraft","Badminton"],answer:1}
      ]},
    { id:uid('q'), title:"Hospital Playlist — Friendship Trivia", category:"Comedy", difficulty:"Medium",
      thumbnail:"https://picsum.photos/seed/hospitalplaylist/400/250",
      description:"Five doctors, one band, endless friendship — test your knowledge!",
      timePerQuestion:20,
      questions:[
        {q:"What is the name of the friend group's band?",options:["Midnight","Reckless Rockers","The Interns","99z Band"],answer:0},
        {q:"How long have the five main doctors been friends?",options:["Since college, 20 years","Since childhood","Since residency only","Since high school"],answer:0},
        {q:"What instrument does Lee Ik-jun play in the band?",options:["Drums","Bass","Guitar","Keyboard"],answer:1},
        {q:"Which specialty is Chae Song-hwa known for?",options:["Neurosurgery","Pediatric surgery","Obstetrics","Cardiology"],answer:0}
      ]}
  ];
  DB.saveQuizzes(quizzes);
  localStorage.setItem(DB_KEYS.SEEDED,'true');
}
