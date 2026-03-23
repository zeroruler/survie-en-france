// ══════════════════════════════════════════════
//   grammar.js — 드래그 앤 드롭 문법 드릴
//   클릭/드래그로 단어 배열 → 정답 체크 + Firestore 진도 저장
// ══════════════════════════════════════════════

import { ICONS } from "./icons.js";

const GEMINI_MODEL    = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

let LS_KEY_GR    = "sf_grammar_lessons";
let LS_SCORE_GR  = "sf_grammar_score";
let API_KEY_LS   = "gemini_api_key";
const loadGrLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY_GR) || "{}"); } catch { return {}; } };
const saveGrLocal = (d) => { localStorage.setItem(LS_KEY_GR, JSON.stringify(d)); window.sfSave?.(); };
const getScore  = () => { try { return parseInt(localStorage.getItem(LS_SCORE_GR) || "0"); } catch { return 0; } };
const addScore  = (n) => { localStorage.setItem(LS_SCORE_GR, String(getScore() + n)); window.sfSave?.(); };

// ── 레슨 데이터 (15개) ────────────────────────
const GRAMMAR_LESSONS = [
  {
    id: "g001", category: "관사", emoji: "🔤",
    title: "정관사 le / la / les",
    rule: "남성 명사 → <b>le</b><br>여성 명사 → <b>la</b><br>복수 명사 → <b>les</b><br>모음 앞 → <b>l'</b>",
    mnemonic: "le = 남성, la = 여성, les = 복수",
    exercises: [
      { ko: "커피는 뜨거워요.", answer: ["Le","café","est","chaud","."], distractors: ["La","les","froid","une"] },
      { ko: "기차역은 어디예요?", answer: ["La","gare","est","où","?"], distractors: ["Le","les","café","ici"] },
      { ko: "표들은 어디 있어요?", answer: ["Où","sont","les","billets","?"], distractors: ["Le","La","est","billet"] },
      { ko: "남자는 어디 있어요?", answer: ["L'","homme","est","où","?"], distractors: ["Le","la","les","femme"] },
      { ko: "아이들은 공원에 있어요.", answer: ["Les","enfants","sont","au","parc","."], distractors: ["Le","La","à","dans"] },
    ]
  },
  {
    id: "g002", category: "관사", emoji: "🔤",
    title: "부정관사 un / une / des",
    rule: "남성 → <b>un</b><br>여성 → <b>une</b><br>복수 → <b>des</b>",
    mnemonic: "un = 남성 '하나', une = 여성 '하나'",
    exercises: [
      { ko: "커피 한 잔 주세요.", answer: ["Un","café","s'il","vous","plaît","."], distractors: ["Une","des","merci","le"] },
      { ko: "크루아상 하나 주세요.", answer: ["Un","croissant","s'il","vous","plaît","."], distractors: ["Une","des","café","merci"] },
      { ko: "예약이 있어요.", answer: ["J'ai","une","réservation","."], distractors: ["un","des","avez","pas"] },
      { ko: "책 한 권 있어요.", answer: ["J'ai","un","livre","."], distractors: ["une","des","avez","le"] },
      { ko: "질문이 있어요.", answer: ["J'ai","une","question","."], distractors: ["un","des","avez","le"] },
    ]
  },
  {
    id: "g003", category: "être", emoji: "⚡",
    title: "être 현재형",
    rule: "je <b>suis</b> · tu <b>es</b><br>il/elle <b>est</b> · vous <b>êtes</b><br>nous <b>sommes</b>",
    mnemonic: "C'est = 이것은 ~이다 (핵심 표현!)",
    exercises: [
      { ko: "저는 한국인이에요.", answer: ["Je","suis","coréen","."], distractors: ["êtes","est","sommes","français"] },
      { ko: "너무 비싸요.", answer: ["C'est","trop","cher","."], distractors: ["Ce","sont","suis","pas"] },
      { ko: "역은 저쪽이에요.", answer: ["La","gare","est","par","là","."], distractors: ["sont","suis","ici","Le"] },
      { ko: "우리는 파리에 있어요.", answer: ["Nous","sommes","à","Paris","."], distractors: ["êtes","suis","est","en"] },
      { ko: "당신은 피곤하신가요?", answer: ["Vous","êtes","fatigué","?"], distractors: ["suis","sont","est","très"] },
    ]
  },
  {
    id: "g004", category: "être", emoji: "⚡",
    title: "être 부정문 (n'est pas)",
    rule: "부정: 주어 + <b>ne</b> + 동사 + <b>pas</b><br>C'est → <b>Ce n'est pas</b><br>모음 앞: ne → <b>n'</b>",
    mnemonic: "ne ~ pas 사이에 동사!",
    exercises: [
      { ko: "저는 프랑스인이 아니에요.", answer: ["Je","ne","suis","pas","français","."], distractors: ["n'","est","êtes","coréen"] },
      { ko: "이건 제 것이 아니에요.", answer: ["Ce","n'est","pas","à","moi","."], distractors: ["C'est","est","pas","une"] },
      { ko: "역은 여기가 아니에요.", answer: ["La","gare","n'est","pas","ici","."], distractors: ["est","ne","là","Le"] },
      { ko: "이건 제 가방이 아니에요.", answer: ["Ce","n'est","pas","mon","sac","."], distractors: ["C'est","est","une","le"] },
      { ko: "지하철은 여기가 아니에요.", answer: ["Le","métro","n'est","pas","ici","."], distractors: ["est","ne","là","La"] },
    ]
  },
  {
    id: "g005", category: "avoir", emoji: "💼",
    title: "avoir 현재형 (가지다/있다)",
    rule: "j'<b>ai</b> · tu <b>as</b><br>il/elle <b>a</b> · vous <b>avez</b>",
    mnemonic: "j'ai = 나 있어,  Avez-vous ? = 있으세요?",
    exercises: [
      { ko: "예약이 있어요.", answer: ["J'ai","une","réservation","."], distractors: ["avez","avoir","des","le"] },
      { ko: "머리가 아파요.", answer: ["J'ai","mal","à","la","tête","."], distractors: ["ai","une","de","avoir"] },
      { ko: "열이 있으세요?", answer: ["Vous","avez","de","la","fièvre","?"], distractors: ["ai","une","pas","avoir"] },
      { ko: "가방이 있으세요?", answer: ["Vous","avez","un","sac","?"], distractors: ["ai","avoir","des","le"] },
      { ko: "목이 아파요.", answer: ["J'ai","mal","à","la","gorge","."], distractors: ["ai","une","de","avoir"] },
    ]
  },
  {
    id: "g006", category: "aller", emoji: "🚶",
    title: "aller 현재형 (가다)",
    rule: "je <b>vais</b> · tu <b>vas</b><br>il/elle <b>va</b> · vous <b>allez</b>",
    mnemonic: "vais=나, allez=당신, va=그/그녀",
    exercises: [
      { ko: "저는 파리에 가요.", answer: ["Je","vais","à","Paris","."], distractors: ["aller","allez","va","en"] },
      { ko: "직진하세요.", answer: ["Allez","tout","droit","."], distractors: ["Aller","Va","Allons","gauche"] },
      { ko: "어떻게 지내세요?", answer: ["Comment","allez-vous","?"], distractors: ["êtes-vous","aller","bien","vas"] },
      { ko: "호텔에 어떻게 가요?", answer: ["Comment","aller","à","l'hôtel","?"], distractors: ["allez","vais","va","en"] },
      { ko: "왼쪽으로 가세요.", answer: ["Allez","à","gauche","."], distractors: ["Aller","Va","Allons","droite"] },
    ]
  },
  {
    id: "g007", category: "faire", emoji: "🛠️",
    title: "faire 현재형 (하다/만들다)",
    rule: "je <b>fais</b> · tu <b>fais</b><br>il/elle <b>fait</b> · vous <b>faites</b>",
    mnemonic: "Il fait beau = 날씨가 좋아요",
    exercises: [
      { ko: "날씨가 좋아요.", answer: ["Il","fait","beau","."], distractors: ["fais","faites","bon","est"] },
      { ko: "저는 쇼핑을 해요.", answer: ["Je","fais","du","shopping","."], distractors: ["fait","faites","les","de"] },
      { ko: "어떻게 하면 되나요?", answer: ["Comment","faire","?"], distractors: ["fais","faites","fait","quoi"] },
      { ko: "무엇을 하고 계세요?", answer: ["Qu'est-ce","que","vous","faites","?"], distractors: ["fais","fait","aller","quoi"] },
      { ko: "저는 산책을 해요.", answer: ["Je","fais","une","promenade","."], distractors: ["fait","faites","les","de"] },
    ]
  },
  {
    id: "g008", category: "vouloir", emoji: "🙏",
    title: "Je voudrais (원합니다)",
    rule: "<b>Je voudrais</b> + 명사 = ~을 원합니다<br>공손한 요청 표현<br>= 영어 'I would like'",
    mnemonic: "주문할 때 필수! Je voudrais...",
    exercises: [
      { ko: "커피 한 잔 주세요.", answer: ["Je","voudrais","un","café","."], distractors: ["veux","voudrait","une","le"] },
      { ko: "파리행 표 한 장 주세요.", answer: ["Je","voudrais","un","billet","pour","Paris","."], distractors: ["veux","deux","à","voudrait"] },
      { ko: "방 하나를 원합니다.", answer: ["Je","voudrais","une","chambre","."], distractors: ["veux","un","des","voudrait"] },
      { ko: "지도 한 장 주세요.", answer: ["Je","voudrais","une","carte","."], distractors: ["veux","voudrait","un","le"] },
      { ko: "레드 와인 한 잔 주세요.", answer: ["Je","voudrais","un","verre","de","vin","rouge","."], distractors: ["veux","une","du","voudrait"] },
    ]
  },
  {
    id: "g009", category: "부정문", emoji: "🚫",
    title: "ne...pas 부정문",
    rule: "주어 + <b>ne</b> + 동사 + <b>pas</b><br>모음 앞: ne → <b>n'</b>",
    mnemonic: "동사를 ne ~ pas 사이에 끼워요",
    exercises: [
      { ko: "저는 이해 못 해요.", answer: ["Je","ne","comprends","pas","."], distractors: ["n'","suis","comprend","bien"] },
      { ko: "저는 프랑스어를 잘 못해요.", answer: ["Je","ne","parle","pas","bien","français","."], distractors: ["n'","suis","très","parles"] },
      { ko: "저는 모르겠어요.", answer: ["Je","ne","sais","pas","."], distractors: ["n'","suis","comprends","bien"] },
      { ko: "저는 담배 피우지 않아요.", answer: ["Je","ne","fume","pas","."], distractors: ["n'","suis","fumé","bien"] },
      { ko: "저는 차가 없어요.", answer: ["Je","n'ai","pas","de","voiture","."], distractors: ["ne","suis","une","avez"] },
    ]
  },
  {
    id: "g010", category: "의문문", emoji: "❓",
    title: "Où est... ? (어디에 있어요?)",
    rule: "<b>Où est</b> + 단수 명사 ?<br><b>Où sont</b> + 복수 명사 ?<br>Où = 어디",
    mnemonic: "est = 단수,  sont = 복수",
    exercises: [
      { ko: "화장실이 어디예요?", answer: ["Où","sont","les","toilettes","?"], distractors: ["est","suis","La","ici"] },
      { ko: "약국이 어디예요?", answer: ["Où","est","la","pharmacie","?"], distractors: ["sont","les","un","ici"] },
      { ko: "가장 가까운 역이 어디예요?", answer: ["Où","est","la","station","la","plus","proche","?"], distractors: ["sont","gare","le","un"] },
      { ko: "엘리베이터가 어디예요?", answer: ["Où","est","l'ascenseur","?"], distractors: ["sont","les","un","ici"] },
      { ko: "출구가 어디예요?", answer: ["Où","est","la","sortie","?"], distractors: ["sont","les","un","ici"] },
    ]
  },
  {
    id: "g011", category: "의문문", emoji: "❓",
    title: "C'est combien ? (얼마예요?)",
    rule: "<b>C'est combien ?</b> = 얼마예요?<br><b>Ça coûte combien ?</b> = 얼마예요?<br>combien = 얼마/몇",
    mnemonic: "combien = how much/how many",
    exercises: [
      { ko: "이거 얼마예요?", answer: ["C'est","combien","?"], distractors: ["Ça","coûte","est","quoi"] },
      { ko: "커피는 얼마예요?", answer: ["Le","café","c'est","combien","?"], distractors: ["Ça","un","est","coûte"] },
      { ko: "전부 얼마예요?", answer: ["C'est","combien","en","tout","?"], distractors: ["Ça","coûte","tout","le"] },
      { ko: "이 가방 얼마예요?", answer: ["C'est","combien","ce","sac","?"], distractors: ["Ça","coûte","est","quoi"] },
      { ko: "입장료가 얼마예요?", answer: ["L'entrée","c'est","combien","?"], distractors: ["Ça","coûte","tout","le"] },
    ]
  },
  {
    id: "g012", category: "표현", emoji: "💬",
    title: "S'il vous plaît / Merci",
    rule: "<b>S'il vous plaît</b> = 부탁합니다 (SVP)<br><b>Merci (beaucoup)</b> = 감사합니다<br><b>De rien</b> = 천만에요",
    mnemonic: "SVP = S'il vous plaît (약어)",
    exercises: [
      { ko: "물 한 잔 부탁합니다.", answer: ["De","l'eau","s'il","vous","plaît","."], distractors: ["un","merci","bien","une"] },
      { ko: "정말 감사합니다.", answer: ["Merci","beaucoup","!"], distractors: ["De","rien","merci","très"] },
      { ko: "계산서 주세요.", answer: ["L'addition","s'il","vous","plaît","."], distractors: ["La","facture","merci","un"] },
      { ko: "소금 좀 주세요.", answer: ["Du","sel","s'il","vous","plaît","."], distractors: ["un","merci","bien","une"] },
      { ko: "천만에요.", answer: ["De","rien","!"], distractors: ["Merci","beaucoup","vous","plait"] },
    ]
  },
  {
    id: "g013", category: "표현", emoji: "💬",
    title: "Excusez-moi / Pardon",
    rule: "<b>Excusez-moi</b> = 실례합니다<br><b>Pardon</b> = 죄송합니다 / 다시요?<br>길 물을 때 필수!",
    mnemonic: "대화 시작은 항상 Excusez-moi",
    exercises: [
      { ko: "실례합니다, 역이 어디예요?", answer: ["Excusez-moi","où","est","la","gare","?"], distractors: ["Pardon","suis","ici","un"] },
      { ko: "죄송합니다, 잘 못 들었어요.", answer: ["Pardon","je","n'ai","pas","entendu","."], distractors: ["ne","pas","bien","compris"] },
      { ko: "천천히 말씀해 주세요.", answer: ["Parlez","plus","lentement","s'il","vous","plaît","."], distractors: ["Parle","lent","doucement","merci"] },
      { ko: "잠깐만요.", answer: ["Un","moment","s'il","vous","plaît","."], distractors: ["Pardon","attendre","merci","de"] },
      { ko: "실례합니다, 사진 찍어도 될까요?", answer: ["Excusez-moi","je","peux","prendre","une","photo","?"], distractors: ["Pardon","puis-je","faire","une"] },
    ]
  },
  {
    id: "g014", category: "표현", emoji: "💬",
    title: "Je ne comprends pas (이해 못 해요)",
    rule: "<b>Je ne comprends pas</b> = 이해 못 해요<br><b>Je ne parle pas français</b> = 프랑스어 못해요<br>여행 필수 생존 표현!",
    mnemonic: "이 문장만 외우면 위기 탈출!",
    exercises: [
      { ko: "저는 이해 못 해요.", answer: ["Je","ne","comprends","pas","."], distractors: ["n'","suis","parle","bien"] },
      { ko: "저는 프랑스어를 못해요.", answer: ["Je","ne","parle","pas","français","."], distractors: ["n'","suis","compris","anglais"] },
      { ko: "영어 하실 줄 아세요?", answer: ["Vous","parlez","anglais","?"], distractors: ["Je","suis","français","parle"] },
      { ko: "다시 말씀해 주세요.", answer: ["Pouvez-vous","répéter","s'il","vous","plaît","?"], distractors: ["parler","dire","merci","bien"] },
      { ko: "한국어 하세요?", answer: ["Parlez-vous","coréen","?"], distractors: ["Je","suis","français","parle"] },
    ]
  },
  {
    id: "g015", category: "표현", emoji: "💬",
    title: "Il y a... (~이 있어요)",
    rule: "<b>Il y a</b> + 명사 = ~이 있어요<br><b>Il n'y a pas</b> = ~이 없어요<br>장소·존재 표현의 핵심!",
    mnemonic: "Il y a = There is / There are",
    exercises: [
      { ko: "근처에 약국이 있나요?", answer: ["Il","y","a","une","pharmacie","près","d'ici","?"], distractors: ["est","un","là","avoir"] },
      { ko: "버스 정류장이 없어요.", answer: ["Il","n'y","a","pas","d'arrêt","de","bus","."], distractors: ["ne","y","est","un"] },
      { ko: "오늘 자리가 있나요?", answer: ["Il","y","a","de","la","place","aujourd'hui","?"], distractors: ["est","une","avoir","des"] },
      { ko: "ATM이 어디 있나요?", answer: ["Il","y","a","un","distributeur","ici","?"], distractors: ["est","une","là","avoir"] },
      { ko: "시간이 없어요.", answer: ["Il","n'y","a","pas","de","temps","."], distractors: ["ne","y","est","un"] },
    ]
  },
];

// ── 프랑스어-한국어 단어 사전 (타일 뜻 표시용) ────
const FR_KO_DICT = {
  // 관사·대명사
  "le":"(남성)", "la":"(여성)", "les":"(복수)", "l'":"(정관사)", "un":"하나(남)", "une":"하나(여)", "des":"(복수)",
  "je":"나", "j'":"나", "tu":"너", "il":"그", "elle":"그녀", "vous":"당신", "nous":"우리",
  "ce":"이것", "c'est":"이것은", "se":"스스로",
  // 동사
  "suis":"~이다(나)", "es":"~이다(너)", "est":"~이다", "êtes":"~이다(당신)", "sommes":"~이다(우리)",
  "ai":"있다(나)", "as":"있다(너)", "a":"있다(그)", "avez":"있으세요?",
  "vais":"가다(나)", "vas":"가다(너)", "va":"가다(그)", "allez":"가세요", "aller":"가다",
  "fais":"하다(나)", "faites":"하다(당신)", "faire":"하다",
  "veux":"원하다(나)", "voudrais":"원해요", "vouloir":"원하다",
  "peux":"할 수 있다(나)", "pouvez":"하실 수 있나요?", "pouvoir":"할 수 있다",
  "sais":"알다(나)", "savez":"아시나요?", "savoir":"알다",
  "parle":"말하다(나)", "parlez":"말하다(당신)", "compris":"이해됐다", "comprends":"이해하다",
  "cherche":"찾다(나)", "cherchez":"찾으세요?",
  "merci":"고마워요", "plait":"주세요", "plaît":"주세요",
  "n'est":"~이 아니다", "ne":"~않다", "pas":"~않다",
  "n'y":"없다",
  // 명사
  "café":"커피", "croissant":"크루아상", "baguette":"바게트", "pain":"빵",
  "gare":"기차역", "métro":"지하철", "bus":"버스", "taxi":"택시",
  "hôtel":"호텔", "chambre":"객실", "réservation":"예약", "clé":"열쇠",
  "pharmacie":"약국", "hôpital":"병원", "médecin":"의사",
  "restaurant":"식당", "menu":"메뉴", "l'addition":"계산서", "addition":"계산서",
  "billets":"표들", "billet":"표",
  "place":"자리", "arrêt":"정류장", "quai":"승강장",
  "tête":"머리", "fièvre":"열", "gorge":"목", "ventre":"배",
  "eau":"물", "vin":"와인", "jus":"주스",
  "nom":"이름", "passeport":"여권", "visa":"비자",
  "gauche":"왼쪽", "droite":"오른쪽", "droit":"직진",
  "ascenseur":"엘리베이터", "étage":"층", "prix":"가격",
  "pharmacien":"약사", "pastilles":"목캔디", "paracétamol":"해열제",
  "anglais":"영어", "français":"프랑스어", "coréen":"한국인",
  // 형용사·부사
  "chaud":"뜨겁다", "froid":"차갑다", "cher":"비싸다", "trop":"너무",
  "bien":"잘", "mal":"아프다", "vite":"빨리", "lentement":"천천히",
  "ici":"여기", "là":"거기", "près":"근처", "loin":"멀다",
  "tout":"모두", "beaucoup":"많이", "peu":"조금", "encore":"다시",
  "aujourd'hui":"오늘", "demain":"내일", "maintenant":"지금",
  // 전치사·접속사
  "à":"~에", "de":"~의", "en":"~에서", "par":"~쪽으로", "pour":"~위해",
  "avec":"~와 함께", "sans":"없이", "sur":"위에", "dans":"안에", "entre":"사이에",
  "et":"그리고", "ou":"또는", "mais":"그러나", "si":"만약",
  // 의문사·감탄사
  "où":"어디", "quoi":"무엇", "quand":"언제", "comment":"어떻게", "combien":"얼마나",
  "quel":"어떤(남)", "quelle":"어떤(여)",
  "oui":"네", "non":"아니요", "s'il":"(정중)", "pardon":"실례해요",
  "bonjour":"안녕하세요", "bonsoir":"안녕하세요(저녁)", "au revoir":"안녕히",
  // 기타
  "il":"그(남)", "y":"거기에", "d'ici":"여기서", "d'arrêt":"정류장의",
  "moi":"나", "toi":"너", "lui":"그", "nous":"우리",
  "place":"자리", "de":"~의", "la":"(여성)",
  "petit déjeuner":"아침식사", "déjeuner":"점심", "dîner":"저녁식사",
};

// 타일 한국어 뜻 조회 (소문자 기준, 없으면 빈 문자열)
function getKo(word) {
  const key = word.toLowerCase().replace(/[.,!?]/g, "");
  return FR_KO_DICT[key] || FR_KO_DICT[word] || "";
}

// ── 상태 ────────────────────────────────────────
let completedLessons  = new Set();   // Set<lessonId>
let currentLessonIdx  = 0;
let currentExIdx      = 0;
let answerSlots       = [];          // 답 영역의 단어들
let bankWords         = [];          // 단어 은행 단어들 [{word, id}]
let isDragging        = false;
let dragSource        = null;        // {from: "bank"|"answer", idx}
let ruleShown         = false;

// ── 진입점 ──────────────────────────────────────
export function initGrammar(userKey = "default") {
  LS_KEY_GR   = `sf_grammar_${userKey}`;
  LS_SCORE_GR = `sf_grammar_score_${userKey}`;
  API_KEY_LS  = `sf_apikey_${userKey}`;
  const saved = loadGrLocal();
  completedLessons = new Set(Object.keys(saved).filter(k => saved[k].completed));
  renderGrammarPage();
}

// ── localStorage 진도 저장 ───────────────────────
function saveProgress(lessonId) {
  const saved = loadGrLocal();
  saved[lessonId] = { completed: true, completedAt: new Date().toISOString() };
  saveGrLocal(saved);
}

// ══════════════════════════════════════════════
//   렌더링: 레슨 목록 화면
// ══════════════════════════════════════════════
function renderGrammarPage() {
  const page = document.getElementById("page-grammar");

  const categories = [...new Set(GRAMMAR_LESSONS.map(l => l.category))];

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=11" />

    <div class="gr-header">
      <button class="home-btn" onclick="window.navigateTo('dashboard')">← 홈</button>
      <h2 class="gr-title">문법 드릴</h2>
      <p class="gr-sub">규칙을 먼저 읽고, 드래그 앤 드롭으로 문장을 조립해보세요</p>
      <div class="gr-summary">
        <span class="gr-badge">${completedLessons.size} / ${GRAMMAR_LESSONS.length} 완료</span>
        <div class="gr-overall-bar">
          <div class="gr-overall-fill" style="width:${Math.round(completedLessons.size/GRAMMAR_LESSONS.length*100)}%"></div>
        </div>
      </div>
    </div>

    <!-- 카테고리 탭 -->
    <div class="gr-cat-tabs" id="gr-cat-tabs">
      <button class="gr-cat-btn active" data-cat="all">전체</button>
      ${categories.map(c => `<button class="gr-cat-btn" data-cat="${c}">${c}</button>`).join("")}
    </div>

    <!-- 레슨 목록 -->
    <div class="gr-lesson-list" id="gr-lesson-list">
      ${GRAMMAR_LESSONS.map((l, i) => renderLessonCard(l, i)).join("")}
    </div>
  `;

  // 카테고리 필터
  document.querySelectorAll(".gr-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gr-cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      document.querySelectorAll(".gr-lesson-item").forEach(el => {
        const show = cat === "all" || el.dataset.cat === cat;
        el.style.display = show ? "" : "none";
      });
    });
  });

  // 레슨 클릭
  document.querySelectorAll(".gr-lesson-item").forEach(el => {
    el.addEventListener("click", () => {
      currentLessonIdx = parseInt(el.dataset.idx);
      currentExIdx = 0;
      ruleShown = false;
      renderRuleCard();
    });
  });
}

function renderLessonCard(lesson, idx) {
  const done = completedLessons.has(lesson.id);
  return `
    <div class="gr-lesson-item ${done ? "done" : ""}" data-idx="${idx}" data-cat="${lesson.category}">
      <div class="gr-lesson-left">
        <div>
          <div class="gr-lesson-title">${lesson.title}</div>
          <div class="gr-lesson-cat">${lesson.category} · 연습 ${lesson.exercises.length}개</div>
        </div>
      </div>
      <div class="gr-lesson-right">
        ${done
          ? `<span class="gr-check" style="color:#16a34a;font-size:0.85rem;font-weight:700;">완료</span>`
          : `<span class="gr-arrow">›</span>`
        }
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════
//   렌더링: 규칙 카드 (플립)
// ══════════════════════════════════════════════
function renderRuleCard() {
  const lesson = GRAMMAR_LESSONS[currentLessonIdx];
  const page   = document.getElementById("page-grammar");

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=11" />

    <div class="gr-ex-header">
      <button class="gr-back-btn" id="gr-back-btn">← 목록</button>
      <span class="gr-progress-txt">${currentLessonIdx + 1} / ${GRAMMAR_LESSONS.length}</span>
    </div>

    <div class="gr-rule-panel">
      <div class="gr-rule-panel-top">
        <div>
          <div class="gr-rule-cat">${lesson.category}</div>
          <h3 class="gr-rule-title">${lesson.title}</h3>
        </div>
      </div>
      <div class="gr-rule-body">
        <div class="gr-rule-text">${lesson.rule}</div>
      </div>
      <div class="gr-mnemonic">${lesson.mnemonic}</div>
    </div>

    <button class="gr-start-btn" id="gr-start-btn">
      연습 시작 →
    </button>
  `;

  document.getElementById("gr-back-btn").addEventListener("click", renderGrammarPage);

  document.getElementById("gr-start-btn").addEventListener("click", () => {
    currentExIdx = 0;
    renderExercise();
  });
}

// ══════════════════════════════════════════════
//   렌더링: 드래그 앤 드롭 연습 화면
// ══════════════════════════════════════════════
function renderExercise() {
  const lesson   = GRAMMAR_LESSONS[currentLessonIdx];
  const exercise = lesson.exercises[currentExIdx];
  const page     = document.getElementById("page-grammar");

  // 단어 은행 = 정답 + 방해 단어, 무작위 섞기
  const allWords = shuffle([...exercise.answer, ...exercise.distractors]);
  bankWords  = allWords.map((w, i) => ({ word: w, id: `bank-${i}`, used: false }));
  answerSlots = [];

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=11" />

    <div class="gr-ex-header">
      <button class="gr-back-btn" id="gr-back-btn2">← 목록</button>
      <span class="gr-progress-txt">문제 ${currentExIdx + 1} / ${lesson.exercises.length}</span>
      <button class="gr-rule-peek" id="gr-rule-peek" title="규칙 보기">${ICONS.book}</button>
    </div>

    <!-- 진행 바 -->
    <div class="gr-ex-bar">
      <div class="gr-ex-bar-fill" style="width:${Math.round(currentExIdx / lesson.exercises.length * 100)}%"></div>
    </div>

    <!-- 한국어 힌트 -->
    <div class="gr-ko-hint">
      <span class="gr-ko-flag">🇰🇷</span>
      <span id="gr-ko-text">${exercise.ko}</span>
      ${exercise.aiGenerated ? `<span class="gr-ai-badge">AI 생성</span>` : ""}
    </div>

    <!-- 답 영역 -->
    <div class="gr-answer-zone" id="gr-answer-zone">
      <div class="gr-answer-placeholder" id="gr-answer-placeholder">
        단어를 탭하거나 끌어서 여기에 놓으세요
      </div>
    </div>

    <!-- 피드백 -->
    <div class="gr-feedback hidden" id="gr-feedback"></div>

    <!-- 단어 은행 -->
    <div class="gr-word-bank" id="gr-word-bank"></div>

    <!-- 버튼 -->
    <div class="gr-btn-row">
      <button class="gr-clear-btn" id="gr-clear-btn">↺ 초기화</button>
      <button class="gr-check-btn" id="gr-check-btn">확인 ✓</button>
    </div>

    <!-- 규칙 툴팁 (숨김) -->
    <div class="gr-rule-tooltip hidden" id="gr-rule-tooltip">
      <div class="gr-rule-text">${lesson.rule}</div>
      <div class="gr-mnemonic">${lesson.mnemonic}</div>
    </div>
  `;

  renderWordBank();
  renderAnswerZone();
  bindExerciseEvents();
}

// ── 단어 은행 렌더 ────────────────────────────
function renderWordBank() {
  const container = document.getElementById("gr-word-bank");
  if (!container) return;
  const isPunct = w => /^[.,?!;:]+$/.test(w.word);
  container.innerHTML = bankWords
    .filter(w => !isPunct(w))
    .map(w => {
      const ko = getKo(w.word);
      return `<div class="gr-word-tile bank-tile${w.used ? " tile-used" : ""}" data-id="${w.id}" draggable="${!w.used}"><span class="tile-fr">${w.word}</span>${ko ? `<span class="tile-ko">${ko}</span>` : ""}</div>`;
    }).join("");

  container.querySelectorAll(".gr-word-tile:not(.tile-used)").forEach(tile => {
    tile.addEventListener("click",  () => moveTileToAnswer(tile.dataset.id));
    tile.addEventListener("dragstart", handleDragStart);
  });
}

// ── 답 영역 렌더 ─────────────────────────────
function renderAnswerZone() {
  const zone        = document.getElementById("gr-answer-zone");
  const placeholder = document.getElementById("gr-answer-placeholder");
  if (!zone) return;

  // 기존 tile 제거 (placeholder 제외)
  zone.querySelectorAll(".gr-word-tile").forEach(t => t.remove());

  if (answerSlots.length === 0) {
    if (placeholder) placeholder.style.display = "";
  } else {
    if (placeholder) placeholder.style.display = "none";
    answerSlots.forEach((item, idx) => {
      const tile = document.createElement("div");
      tile.className = "gr-word-tile answer-tile";
      tile.dataset.answerIdx = idx;
      tile.textContent = item.word;
      tile.draggable = true;
      tile.addEventListener("click",     () => moveTileToBank(idx));
      tile.addEventListener("dragstart", handleDragStartAnswer);
      zone.appendChild(tile);
    });
  }
}

// ── 이동: 은행 → 답 영역 ────────────────────
function moveTileToAnswer(bankId) {
  const wordObj = bankWords.find(w => w.id === bankId);
  if (!wordObj || wordObj.used) return;
  wordObj.used = true;
  answerSlots.push({ word: wordObj.word, bankId });
  renderWordBank();
  renderAnswerZone();
  clearFeedback();
}

// ── 이동: 답 영역 → 은행 ────────────────────
function moveTileToBank(answerIdx) {
  const item = answerSlots.splice(answerIdx, 1)[0];
  if (!item) return;
  const wordObj = bankWords.find(w => w.id === item.bankId);
  if (wordObj) wordObj.used = false;
  renderWordBank();
  renderAnswerZone();
  clearFeedback();
}

// ── 드래그 앤 드롭 (데스크탑) ─────────────────
function handleDragStart(e) {
  dragSource = { from: "bank", id: e.currentTarget.dataset.id };
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragStartAnswer(e) {
  dragSource = { from: "answer", idx: parseInt(e.currentTarget.dataset.answerIdx) };
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

// ── 이벤트 바인딩 ─────────────────────────────
function bindExerciseEvents() {
  const zone = document.getElementById("gr-answer-zone");

  // 드롭 존 (답 영역)
  zone?.addEventListener("dragover",  (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone?.addEventListener("dragleave", ()  => zone.classList.remove("drag-over"));
  zone?.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    if (!dragSource) return;
    if (dragSource.from === "bank") {
      moveTileToAnswer(dragSource.id);
    }
    dragSource = null;
  });

  // 드롭 존 (단어 은행 — answer tile 돌려보내기)
  const bank = document.getElementById("gr-word-bank");
  bank?.addEventListener("dragover",  (e) => { e.preventDefault(); bank.classList.add("drag-over-bank"); });
  bank?.addEventListener("dragleave", ()  => bank.classList.remove("drag-over-bank"));
  bank?.addEventListener("drop", (e) => {
    e.preventDefault();
    bank.classList.remove("drag-over-bank");
    if (!dragSource) return;
    if (dragSource.from === "answer") {
      moveTileToBank(dragSource.idx);
    }
    dragSource = null;
  });

  // 뒤로
  document.getElementById("gr-back-btn2")?.addEventListener("click", renderGrammarPage);

  // 규칙 peek → Gemini 힌트
  const peekBtn   = document.getElementById("gr-rule-peek");
  const tooltipEl = document.getElementById("gr-rule-tooltip");
  const bankEl    = document.getElementById("gr-word-bank");
  peekBtn?.addEventListener("click", async () => {
    const nowHidden = tooltipEl.classList.toggle("hidden");
    if (bankEl) bankEl.classList.toggle("dict-visible");
    if (nowHidden) return; // closing — nothing to do

    // Already loaded for this exercise
    const cacheKey = `${currentLessonIdx}-${currentExIdx}`;
    if (tooltipEl.dataset.hint === cacheKey) return;
    tooltipEl.dataset.hint = cacheKey;

    const lesson   = GRAMMAR_LESSONS[currentLessonIdx];
    const exercise = lesson.exercises[currentExIdx];
    const apiKey   = localStorage.getItem(API_KEY_LS);

    if (!apiKey) {
      // Fallback: show grammar rule
      tooltipEl.innerHTML = `<div class="gr-rule-text">${lesson.rule}</div><div class="gr-mnemonic">${lesson.mnemonic}</div>`;
      return;
    }

    tooltipEl.innerHTML = `<div class="gr-hint-loading">힌트 생성 중...</div>`;
    try {
      const hint = await generateExerciseHint(lesson, exercise);
      tooltipEl.innerHTML = hint
        ? `<div class="gr-hint-text">${hint}</div>`
        : `<div class="gr-rule-text">${lesson.rule}</div><div class="gr-mnemonic">${lesson.mnemonic}</div>`;
    } catch {
      tooltipEl.innerHTML = `<div class="gr-rule-text">${lesson.rule}</div><div class="gr-mnemonic">${lesson.mnemonic}</div>`;
    }
  });

  // 초기화
  document.getElementById("gr-clear-btn")?.addEventListener("click", () => {
    answerSlots.forEach(item => {
      const w = bankWords.find(w => w.id === item.bankId);
      if (w) w.used = false;
    });
    answerSlots = [];
    renderWordBank();
    renderAnswerZone();
    clearFeedback();
  });

  // 확인
  document.getElementById("gr-check-btn")?.addEventListener("click", checkAnswer);
}

// ── 정답 체크 ─────────────────────────────────
const isPunctWord = w => /^[.,?!;:]+$/.test(w);

function checkAnswer() {
  const lesson   = GRAMMAR_LESSONS[currentLessonIdx];
  const exercise = lesson.exercises[currentExIdx];
  const userAnswer = answerSlots.map(s => s.word);
  const correct    = exercise.answer;

  // 문장부호는 비교에서 제외 (타일에서도 제외됐으므로)
  const userFiltered    = userAnswer.filter(w => !isPunctWord(w));
  const correctFiltered = correct.filter(w => !isPunctWord(w));
  const isCorrect = JSON.stringify(userFiltered) === JSON.stringify(correctFiltered);
  const feedback  = document.getElementById("gr-feedback");
  const checkBtn  = document.getElementById("gr-check-btn");

  if (answerSlots.length === 0) {
    showFeedback("단어를 먼저 배치해주세요!", "warn");
    return;
  }

  // 답 영역 타일 색상 표시
  document.querySelectorAll(".answer-tile").forEach((tile, i) => {
    if (isCorrect) {
      tile.classList.add("tile-correct");
    } else {
      tile.classList.add(userFiltered[i] === correctFiltered[i] ? "tile-correct" : "tile-wrong");
    }
  });

  if (isCorrect) {
    addScore(1);
    showFeedback("정답입니다! ✓", "correct");
    checkBtn.textContent = "다음 →";
    checkBtn.removeEventListener("click", checkAnswer);
    checkBtn.addEventListener("click", goNext, { once: true });
  } else {
    showFeedback("오답입니다.", "wrong");
    checkBtn.textContent = "다음 →";
    checkBtn.removeEventListener("click", checkAnswer);
    checkBtn.addEventListener("click", goNext, { once: true });
    // Gemini 해설
    explainWrongAnswer(lesson, exercise, userAnswer, correct);
  }
}

// ── Gemini 힌트 생성 (책 버튼) ────────────────
async function generateExerciseHint(lesson, exercise) {
  const apiKey = localStorage.getItem(API_KEY_LS);
  if (!apiKey) return null;
  const prompt = `프랑스어 문법 문제 힌트를 한국어로 1-2문장으로 주세요. 정답을 직접 알려주지 말고, 어떤 규칙을 써야 하는지 힌트만 주세요.

문법 규칙: ${lesson.title}
한국어 문장: ${exercise.ko}

힌트 (마크다운 없이 평문):`;
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error();
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

// ── Gemini 오답 설명 ──────────────────────────
async function explainWrongAnswer(lesson, exercise, userAnswer, correct) {
  const apiKey = localStorage.getItem(API_KEY_LS);
  if (!apiKey) return;

  const feedback = document.getElementById("gr-feedback");
  if (!feedback) return;

  // 로딩 표시 추가
  const explanationEl = document.createElement("div");
  explanationEl.className = "gr-gemini-explanation loading";
  explanationEl.textContent = "해설 생성 중...";
  feedback.appendChild(explanationEl);

  const userStr = userAnswer.join(" ");
  const prompt  = `프랑스어 문법 해설을 한국어로 2-3문장으로 써주세요.

문법 규칙: ${lesson.title}
한국어 문장: ${exercise.ko}
오답: ${userStr}

"학생의" 같은 표현 없이 오류를 직접 지적해 주세요. 예: "동사 위치가 틀렸어요. ne ~ pas 사이에 동사가 와야 해요." 마크다운 없이 평문으로만 써주세요.`;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) {
      explanationEl.className = "gr-gemini-explanation";
      explanationEl.innerHTML = `<span class="gr-gemini-label">${ICONS.tip} 해설</span><span class="gr-gemini-text">${text}</span>`;
    } else {
      explanationEl.remove();
    }
  } catch {
    explanationEl.remove();
  }
}

// ── Gemini AI 문제 생성 ───────────────────────
async function generateAIExercise(lesson) {
  const apiKey = localStorage.getItem(API_KEY_LS);
  if (!apiKey) return null;

  const score = getScore();
  const difficulty = score < 5
    ? "simple (basic vocabulary, short 3-5 word sentences)"
    : score < 15
    ? "intermediate (natural phrasing, 5-7 words)"
    : "advanced (complex, longer sentences)";

  const rulePlain = lesson.rule.replace(/<[^>]+>/g, "");
  const prompt = `You are a French language teaching assistant. Generate ONE new sentence-building exercise for practicing "${lesson.title}" (category: ${lesson.category}).
Grammar rule: ${rulePlain}
Difficulty level: ${difficulty}
The sentence must use the same grammar pattern as this lesson (${lesson.category}).
The sentence should be practical for a tourist in France.

Return ONLY a valid JSON object:
{
  "ko": "Korean translation of the sentence",
  "answer": ["French", "words", "in", "correct", "order", "."],
  "distractors": ["four", "wrong", "or", "extra"]
}

Rules:
- answer: array of individual French word tokens (include "." or "?" as separate tokens)
- distractors: exactly 4 plausible but wrong words for this sentence`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7,
      },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  // strip markdown if present
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // fallback: extract JSON object
  if (!text.startsWith("{")) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) text = m[0];
  }
  const parsed = JSON.parse(text);
  if (!parsed.ko || !Array.isArray(parsed.answer) || !Array.isArray(parsed.distractors)) {
    throw new Error("Invalid response format");
  }
  return { ...parsed, aiGenerated: true };
}

function goNext() {
  const lesson = GRAMMAR_LESSONS[currentLessonIdx];
  if (currentExIdx + 1 < lesson.exercises.length) {
    currentExIdx++;
    renderExercise();
  } else {
    showLessonComplete();
  }
}

// ── 레슨 완료 화면 ────────────────────────────
async function showLessonComplete() {
  const lesson = GRAMMAR_LESSONS[currentLessonIdx];
  completedLessons.add(lesson.id);
  saveProgress(lesson.id);
  addScore(5);

  const hasApiKey = !!localStorage.getItem(API_KEY_LS);
  const page = document.getElementById("page-grammar");
  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=11" />

    <div class="gr-complete">
      <div class="gr-complete-emoji">🏆</div>
      <h2>레슨 완료!</h2>
      <p class="gr-complete-title">${lesson.title}</p>
      <p class="gr-complete-sub">${completedLessons.size} / ${GRAMMAR_LESSONS.length} 레슨 완료</p>

      <div class="gr-complete-btns">
        ${currentLessonIdx + 1 < GRAMMAR_LESSONS.length
          ? `<button class="gr-next-lesson-btn" id="gr-next-lesson-btn">다음 레슨 →</button>`
          : `<button class="gr-next-lesson-btn" id="gr-all-done-btn">🎊 전체 완료!</button>`
        }
        ${hasApiKey
          ? `<button class="gr-ai-exercise-btn" id="gr-ai-exercise-btn">${ICONS.tip} Gemini 추가 문제</button>`
          : ""
        }
        <button class="gr-back-list-btn" id="gr-back-list-btn">목록으로</button>
      </div>
    </div>
  `;

  document.getElementById("gr-next-lesson-btn")?.addEventListener("click", () => {
    currentLessonIdx++;
    currentExIdx = 0;
    ruleShown = false;
    renderRuleCard();
  });
  document.getElementById("gr-all-done-btn")?.addEventListener("click", renderGrammarPage);
  document.getElementById("gr-back-list-btn")?.addEventListener("click", renderGrammarPage);

  document.getElementById("gr-ai-exercise-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("gr-ai-exercise-btn");
    btn.disabled = true;
    btn.textContent = "Gemini가 문제 생성 중...";
    try {
      const exercise = await generateAIExercise(lesson);
      if (!exercise) { btn.disabled = false; btn.innerHTML = `${ICONS.tip} Gemini 추가 문제`; return; }
      lesson.exercises.push(exercise);
      currentExIdx = lesson.exercises.length - 1;
      renderExercise();
    } catch (e) {
      console.error("AI exercise generation failed:", e);
      btn.disabled = false;
      btn.innerHTML = `${ICONS.tip} Gemini 추가 문제`;
      btn.insertAdjacentHTML("afterend", `<div class="gr-ai-error">문제 생성 실패: ${e.message}</div>`);
    }
  });
}

// ── 피드백 ────────────────────────────────────
function showFeedback(msg, type) {
  const el = document.getElementById("gr-feedback");
  if (!el) return;
  el.innerHTML = msg;
  el.className = `gr-feedback gr-feedback-${type}`;
}

function clearFeedback() {
  const el = document.getElementById("gr-feedback");
  if (!el) return;
  el.textContent = "";
  el.className = "gr-feedback hidden";
  // 타일 색상 초기화
  document.querySelectorAll(".answer-tile").forEach(t => {
    t.classList.remove("tile-correct","tile-wrong");
  });
  // 확인 버튼 복구
  const checkBtn = document.getElementById("gr-check-btn");
  if (checkBtn) {
    checkBtn.textContent = "확인 ✓";
    const newBtn = checkBtn.cloneNode(true);
    checkBtn.parentNode.replaceChild(newBtn, checkBtn);
    newBtn.addEventListener("click", checkAnswer);
  }
}

// ── 유틸 ─────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
