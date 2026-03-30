// ══════════════════════════════════════════════
//   grammar.js — 드래그 앤 드롭 문법 드릴
//   클릭/드래그로 단어 배열 → 정답 체크 + Firestore 진도 저장
// ══════════════════════════════════════════════

import { ICONS } from "./icons.js";
import { HANDBOOK_WORDS } from "./handbook.js";
import { loadCurriculumState, getUnlockedUnitIds, getAvailableGrammarIds } from "./curriculum_data.js";

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
      { ko: "그 남자는 프랑스인이에요.", answer: ["L'","homme","est","français","."], distractors: ["Le","La","les","coréen"] },
      { ko: "이름이 뭐예요?", answer: ["Le","prénom","c'est","quoi","?"], distractors: ["La","les","l'","un"] },
      { ko: "그 여자는 한국인이에요.", answer: ["La","femme","est","coréenne","."], distractors: ["Le","les","l'","française"] },
      { ko: "그 학생들은 영어를 해요.", answer: ["Les","étudiants","parlent","anglais","."], distractors: ["Le","La","l'","français"] },
      { ko: "그 언어가 어려워요.", answer: ["La","langue","est","difficile","."], distractors: ["Le","les","l'","facile"] },
    ]
  },
  {
    id: "g002", category: "관사", emoji: "🔤",
    title: "부정관사 un / une / des",
    rule: "남성 → <b>un</b><br>여성 → <b>une</b><br>복수 → <b>des</b>",
    mnemonic: "un = 남성 '하나', une = 여성 '하나'",
    exercises: [
      { ko: "커피 한 잔 주세요.", answer: ["Un","café","s'il","vous","plaît","."], distractors: ["Une","des","merci","le"] },
      { ko: "저는 학생이에요.", answer: ["Je","suis","un","étudiant","."], distractors: ["une","des","êtes","le"] },
      { ko: "질문이 있어요.", answer: ["J'ai","une","question","."], distractors: ["un","des","avez","le"] },
      { ko: "한국인 친구가 있어요.", answer: ["J'ai","un","ami","coréen","."], distractors: ["une","des","avez","le"] },
      { ko: "예약이 있어요.", answer: ["J'ai","une","réservation","."], distractors: ["un","des","avez","pas"] },
    ]
  },
  {
    id: "g003", category: "être", emoji: "⚡",
    title: "être 현재형",
    rule: "je <b>suis</b> · tu <b>es</b><br>il/elle <b>est</b> · vous <b>êtes</b><br>nous <b>sommes</b>",
    mnemonic: "C'est = 이것은 ~이다 (핵심 표현!)",
    exercises: [
      { ko: "저는 한국인이에요.", answer: ["Je","suis","coréen","."], distractors: ["êtes","est","sommes","français"] },
      { ko: "저는 학생이에요.", answer: ["Je","suis","étudiant","."], distractors: ["êtes","est","sommes","professeur"] },
      { ko: "당신은 프랑스인이세요?", answer: ["Vous","êtes","français","?"], distractors: ["suis","est","sommes","coréen"] },
      { ko: "그녀는 선생님이에요.", answer: ["Elle","est","professeure","."], distractors: ["suis","êtes","sommes","médecin"] },
      { ko: "우리는 파리에 있어요.", answer: ["Nous","sommes","à","Paris","."], distractors: ["êtes","suis","est","en"] },
    ]
  },
  {
    id: "g004", category: "être", emoji: "⚡",
    title: "être 부정문 (n'est pas)",
    rule: "부정: 주어 + <b>ne</b> + 동사 + <b>pas</b><br>C'est → <b>Ce n'est pas</b><br>모음 앞: ne → <b>n'</b>",
    mnemonic: "ne ~ pas 사이에 동사!",
    exercises: [
      { ko: "저는 늦지 않았어요.", answer: ["Je","ne","suis","pas","en","retard","."], distractors: ["n'","est","êtes","tôt"] },
      { ko: "지금이 좋은 시간이 아니에요.", answer: ["Ce","n'est","pas","le","bon","moment","."], distractors: ["C'est","est","ne","une"] },
      { ko: "오늘이 월요일이 아니에요.", answer: ["Aujourd'hui","n'est","pas","lundi","."], distractors: ["est","ne","mardi","Ce"] },
      { ko: "피곤하지 않아요.", answer: ["Je","ne","suis","pas","fatigué","."], distractors: ["n'","est","êtes","très"] },
      { ko: "그는 준비가 안 됐어요.", answer: ["Il","n'est","pas","prêt","."], distractors: ["est","ne","pas","elle"] },
    ]
  },
  {
    id: "g005", category: "avoir", emoji: "💼",
    title: "avoir 현재형 (가지다/있다)",
    rule: "j'<b>ai</b> · tu <b>as</b><br>il/elle <b>a</b> · vous <b>avez</b>",
    mnemonic: "j'ai = 나 있어,  Avez-vous ? = 있으세요?",
    exercises: [
      { ko: "시간이 있어요?", answer: ["Vous","avez","le","temps","?"], distractors: ["ai","une","pas","avoir"] },
      { ko: "약속이 있어요.", answer: ["J'ai","un","rendez-vous","."], distractors: ["avez","avoir","des","le"] },
      { ko: "오늘 수업이 있어요.", answer: ["J'ai","un","cours","aujourd'hui","."], distractors: ["ai","une","de","avoir"] },
      { ko: "배고파요.", answer: ["J'ai","faim","."], distractors: ["suis","ai","froid","avoir"] },
      { ko: "몇 살이에요?", answer: ["Vous","avez","quel","âge","?"], distractors: ["ai","une","pas","avoir"] },
    ]
  },
  {
    id: "g006", category: "aller", emoji: "🚶",
    title: "aller 현재형 (가다)",
    rule: "je <b>vais</b> · tu <b>vas</b><br>il/elle <b>va</b> · vous <b>allez</b>",
    mnemonic: "vais=나, allez=당신, va=그/그녀",
    exercises: [
      { ko: "직진하세요.", answer: ["Allez","tout","droit","."], distractors: ["Aller","Va","Allons","gauche"] },
      { ko: "왼쪽으로 가세요.", answer: ["Allez","à","gauche","."], distractors: ["Aller","Va","Allons","droite"] },
      { ko: "역에 어떻게 가요?", answer: ["Comment","aller","à","la","gare","?"], distractors: ["allez","vais","va","en"] },
      { ko: "저는 지하철로 가요.", answer: ["Je","vais","en","métro","."], distractors: ["aller","allez","va","à"] },
      { ko: "공항에 가요.", answer: ["Je","vais","à","l'aéroport","."], distractors: ["aller","allez","va","en"] },
    ]
  },
  {
    id: "g007", category: "faire", emoji: "🛠️",
    title: "faire 현재형 (하다/만들다)",
    rule: "je <b>fais</b> · tu <b>fais</b><br>il/elle <b>fait</b> · vous <b>faites</b>",
    mnemonic: "Il fait beau = 날씨가 좋아요",
    exercises: [
      { ko: "저는 운동을 해요.", answer: ["Je","fais","du","sport","."], distractors: ["fait","faites","les","de"] },
      { ko: "그녀는 수영을 해요.", answer: ["Elle","fait","de","la","natation","."], distractors: ["fais","faites","le","du"] },
      { ko: "날씨가 추워요.", answer: ["Il","fait","froid","."], distractors: ["fais","faites","chaud","est"] },
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
      { ko: "오늘의 요리를 주세요.", answer: ["Je","voudrais","le","plat","du","jour","."], distractors: ["veux","deux","une","voudrait"] },
      { ko: "테이블을 예약하고 싶어요.", answer: ["Je","voudrais","réserver","une","table","."], distractors: ["veux","un","des","voudrait"] },
      { ko: "물 한 잔 주세요.", answer: ["Je","voudrais","un","verre","d'eau","."], distractors: ["veux","voudrait","une","le"] },
      { ko: "메뉴 주세요.", answer: ["Je","voudrais","la","carte","s'il","vous","plaît","."], distractors: ["veux","une","le","voudrait"] },
    ]
  },
  {
    id: "g009", category: "부정문", emoji: "🚫",
    title: "ne...pas 부정문",
    rule: "주어 + <b>ne</b> + 동사 + <b>pas</b><br>모음 앞: ne → <b>n'</b>",
    mnemonic: "동사를 ne ~ pas 사이에 끼워요",
    exercises: [
      { ko: "저는 이 사이즈가 없어요.", answer: ["Je","ne","trouve","pas","ma","taille","."], distractors: ["n'","suis","trouver","bien"] },
      { ko: "이 색깔이 마음에 안 들어요.", answer: ["Je","n'aime","pas","cette","couleur","."], distractors: ["ne","suis","aimer","bien"] },
      { ko: "너무 비싸지 않아요?", answer: ["Ce","n'est","pas","trop","cher","?"], distractors: ["C'est","est","ne","pas"] },
      { ko: "저는 신용카드가 없어요.", answer: ["Je","n'ai","pas","de","carte","de","crédit","."], distractors: ["ne","suis","une","avez"] },
      { ko: "이 스타일이 아니에요.", answer: ["Ce","n'est","pas","mon","style","."], distractors: ["C'est","est","une","le"] },
    ]
  },
  {
    id: "g010", category: "의문문", emoji: "❓",
    title: "Où est... ? (어디에 있어요?)",
    rule: "<b>Où est</b> + 단수 명사 ?<br><b>Où sont</b> + 복수 명사 ?<br>Où = 어디",
    mnemonic: "est = 단수,  sont = 복수",
    exercises: [
      { ko: "화장실이 어디예요?", answer: ["Où","sont","les","toilettes","?"], distractors: ["est","suis","La","ici"] },
      { ko: "지하철역이 어디예요?", answer: ["Où","est","la","station","de","métro","?"], distractors: ["sont","les","un","ici"] },
      { ko: "약국이 어디예요?", answer: ["Où","est","la","pharmacie","?"], distractors: ["sont","les","un","ici"] },
      { ko: "출구가 어디예요?", answer: ["Où","est","la","sortie","?"], distractors: ["sont","les","un","ici"] },
      { ko: "버스 정류장이 어디예요?", answer: ["Où","est","l'arrêt","de","bus","?"], distractors: ["sont","les","un","ici"] },
    ]
  },
  {
    id: "g011", category: "의문문", emoji: "❓",
    title: "C'est combien ? (얼마예요?)",
    rule: "<b>C'est combien ?</b> = 얼마예요?<br><b>Ça coûte combien ?</b> = 얼마예요?<br>combien = 얼마/몇",
    mnemonic: "combien = how much/how many",
    exercises: [
      { ko: "이거 얼마예요?", answer: ["C'est","combien","?"], distractors: ["Ça","coûte","est","quoi"] },
      { ko: "오늘의 요리가 얼마예요?", answer: ["Le","plat","du","jour","c'est","combien","?"], distractors: ["Ça","un","est","coûte"] },
      { ko: "전부 얼마예요?", answer: ["C'est","combien","en","tout","?"], distractors: ["Ça","coûte","tout","le"] },
      { ko: "와인 한 잔 얼마예요?", answer: ["Un","verre","de","vin","c'est","combien","?"], distractors: ["Ça","coûte","est","quoi"] },
      { ko: "메뉴가 얼마예요?", answer: ["Le","menu","c'est","combien","?"], distractors: ["Ça","coûte","tout","la"] },
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
      { ko: "지도 주세요.", answer: ["Une","carte","s'il","vous","plaît","."], distractors: ["un","merci","bien","de"] },
      { ko: "천만에요.", answer: ["De","rien","!"], distractors: ["Merci","beaucoup","vous","plait"] },
      { ko: "우산 주세요.", answer: ["Un","parapluie","s'il","vous","plaît","."], distractors: ["une","merci","bien","de"] },
    ]
  },
  {
    id: "g013", category: "표현", emoji: "💬",
    title: "Excusez-moi / Pardon",
    rule: "<b>Excusez-moi</b> = 실례합니다<br><b>Pardon</b> = 죄송합니다 / 다시요?<br>길 물을 때 필수!",
    mnemonic: "대화 시작은 항상 Excusez-moi",
    exercises: [
      { ko: "실례합니다, 근처에 공원이 있나요?", answer: ["Excusez-moi","il","y","a","un","parc","ici","?"], distractors: ["Pardon","suis","est","une"] },
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
      { ko: "이 근처에 지하철역이 있나요?", answer: ["Il","y","a","une","station","de","métro","ici","?"], distractors: ["est","un","là","avoir"] },
      { ko: "버스 정류장이 없어요.", answer: ["Il","n'y","a","pas","d'arrêt","de","bus","."], distractors: ["ne","y","est","un"] },
      { ko: "오늘 자리가 있나요?", answer: ["Il","y","a","de","la","place","aujourd'hui","?"], distractors: ["est","une","avoir","des"] },
      { ko: "근처에 약국이 있나요?", answer: ["Il","y","a","une","pharmacie","près","d'ici","?"], distractors: ["est","un","là","avoir"] },
      { ko: "출구가 없어요.", answer: ["Il","n'y","a","pas","de","sortie","."], distractors: ["ne","y","est","un"] },
    ]
  },
];

// ── 상세 튜토리얼 ────────────────────────────────
const TUTORIALS = {

g001: `
<p>프랑스어의 모든 명사는 <strong>남성(masculin)</strong> 또는 <strong>여성(féminin)</strong>으로 구분돼요. 이건 문법적 성별이라 실제 남녀와 무관하고 그냥 외워야 합니다.</p>
<h4>정관사 4가지</h4>
<ul>
  <li><strong>le</strong> — 남성 단수: <em>le café</em>, <em>le train</em>, <em>le livre</em></li>
  <li><strong>la</strong> — 여성 단수: <em>la gare</em>, <em>la France</em>, <em>la clé</em></li>
  <li><strong>l'</strong> — 모음/묵음 h 앞: <em>l'hôtel</em>, <em>l'eau</em> (물), <em>l'homme</em></li>
  <li><strong>les</strong> — 모든 복수: <em>les enfants</em>, <em>les billets</em></li>
</ul>
<h4>성별 패턴 힌트</h4>
<ul>
  <li>-tion, -sion으로 끝나면 보통 <strong>여성</strong>: <em>la nation</em>, <em>la décision</em></li>
  <li>-ment, -age로 끝나면 보통 <strong>남성</strong>: <em>le moment</em>, <em>le garage</em></li>
  <li>나라 이름: -e로 끝나면 여성(la France, la Corée), 그 외 남성(le Japon)</li>
</ul>
<h4>영어와의 차이</h4>
<p>영어 "the"는 하나지만 프랑스어는 명사의 성·수에 따라 4가지로 바뀝니다. 처음엔 번거롭지만 외우다 보면 자연스럽게 느껴져요.</p>`,

g002: `
<p>부정관사(indéfini)는 영어 <strong>a / an / some</strong>에 해당해요. 처음 언급하거나 특정하지 않은 것을 말할 때 씁니다.</p>
<h4>부정관사 3가지</h4>
<ul>
  <li><strong>un</strong> — 남성 단수: <em>un café</em>, <em>un billet</em>, <em>un problème</em></li>
  <li><strong>une</strong> — 여성 단수: <em>une chambre</em>, <em>une question</em>, <em>une idée</em></li>
  <li><strong>des</strong> — 복수 (남녀 무관): <em>des amis</em>, <em>des croissants</em></li>
</ul>
<h4>정관사 vs 부정관사 비교</h4>
<ul>
  <li><em>Le café est chaud.</em> → 그 커피는 뜨겁다 (특정 커피)</li>
  <li><em>Je voudrais un café.</em> → 커피 한 잔이요 (어떤 커피든)</li>
</ul>
<h4>⚠️ 부정문에서는 de로 바뀐다!</h4>
<p>un/une/des는 부정문에서 <strong>de (d')</strong>로 변해요:</p>
<ul>
  <li><em>J'ai un café.</em> → <em>Je n'ai pas <strong>de</strong> café.</em></li>
  <li><em>J'ai des amis.</em> → <em>Je n'ai pas <strong>d'</strong>amis.</em></li>
  <li>단, 정관사(le/la/les)는 부정문에서도 변하지 않아요: <em>Je n'aime pas le café.</em></li>
</ul>`,

g003: `
<p><strong>être</strong>(= to be)는 프랑스어에서 가장 기본이자 가장 불규칙한 동사예요. 모든 활용형을 통째로 외우는 게 핵심입니다.</p>
<h4>현재형 활용표</h4>
<table class="gr-tbl">
  <tr><td>je <strong>suis</strong></td><td>나는 ~이다</td><td>nous <strong>sommes</strong></td><td>우리는 ~이다</td></tr>
  <tr><td>tu <strong>es</strong></td><td>너는 ~이다</td><td>vous <strong>êtes</strong></td><td>당신(들)은 ~이다</td></tr>
  <tr><td>il/elle <strong>est</strong></td><td>그/그녀는 ~이다</td><td>ils/elles <strong>sont</strong></td><td>그들은 ~이다</td></tr>
</table>
<h4>주요 용도</h4>
<ul>
  <li>국적·신원: <em>Je suis coréen(ne).</em> (저는 한국인이에요)</li>
  <li>직업: <em>Elle est médecin.</em> (그녀는 의사예요) ← 직업 앞에 관사 없음!</li>
  <li>위치: <em>La gare est par là.</em> (역은 저쪽이에요)</li>
  <li>C'est = 영어 "It is": <em>C'est trop cher.</em> (너무 비싸요)</li>
</ul>
<h4>직업 표현 시 관사 없음</h4>
<p><em>Je suis étudiant.</em> ✓ &nbsp;|&nbsp; <em>Je suis un étudiant.</em> △ (덜 자연스러움)</p>`,

g004: `
<p>프랑스어 부정문의 기본 구조: <strong>주어 + ne + 동사 + pas</strong><br>
동사를 ne와 pas로 앞뒤에서 감싸는 방식이에요.</p>
<h4>être 부정형 예시</h4>
<table class="gr-tbl">
  <tr><td>Je <strong>ne suis pas</strong> français.</td><td>저는 프랑스인이 아니에요</td></tr>
  <tr><td>Ce <strong>n'est pas</strong> à moi.</td><td>이건 제 것이 아니에요</td></tr>
  <tr><td>Nous <strong>ne sommes pas</strong> fatigués.</td><td>우리는 피곤하지 않아요</td></tr>
</table>
<h4>모음 앞에서 ne → n'</h4>
<ul>
  <li><em>Ce <strong>n'est</strong> pas…</em> — est는 모음(e)으로 시작</li>
  <li><em>Il <strong>n'est</strong> pas là.</em></li>
  <li><em>Je <strong>n'ai</strong> pas faim.</em></li>
</ul>
<h4>구어체 vs 문어체</h4>
<p>일상 대화에서는 <em>ne</em>를 생략하기도 해요:</p>
<ul>
  <li>문어: <em>Je ne suis pas fatigué.</em></li>
  <li>구어: <em>Je suis pas fatigué.</em> (비공식적 — 공식 상황에선 피할 것)</li>
</ul>`,

g005: `
<p><strong>avoir</strong>(= to have)는 être와 함께 프랑스어에서 가장 중요한 동사예요. "가지다"뿐 아니라 신체 증상·나이·감각도 avoir로 표현해요.</p>
<h4>현재형 활용표</h4>
<table class="gr-tbl">
  <tr><td>j'<strong>ai</strong></td><td>나는 가지다</td><td>nous <strong>avons</strong></td><td>우리는 가지다</td></tr>
  <tr><td>tu <strong>as</strong></td><td>너는 가지다</td><td>vous <strong>avez</strong></td><td>당신(들)은 가지다</td></tr>
  <tr><td>il/elle <strong>a</strong></td><td>그/그녀는 가지다</td><td>ils/elles <strong>ont</strong></td><td>그들은 가지다</td></tr>
</table>
<h4>영어와 다른 avoir 특별 용법</h4>
<ul>
  <li>나이: <em>J'ai 30 ans.</em> (저는 30살이에요) — 영어 "I am 30"과 다르게 avoir!</li>
  <li>신체 증상: <em>J'ai mal à la tête.</em> (머리가 아파요)</li>
  <li>열: <em>J'ai de la fièvre.</em> (열이 나요)</li>
  <li>배고픔: <em>J'ai faim.</em> (배가 고파요)</li>
  <li>더위/추위: <em>J'ai chaud / froid.</em> (더워요 / 추워요)</li>
</ul>
<h4>avoir 관용 표현 패턴</h4>
<p><strong>avoir mal à + 신체 부위</strong> = ~가 아프다</p>
<ul>
  <li><em>J'ai mal à la gorge.</em> (목이 아파요)</li>
  <li><em>J'ai mal au ventre.</em> (배가 아파요) — à + le = au</li>
  <li><em>J'ai mal aux dents.</em> (이가 아파요) — à + les = aux</li>
</ul>`,

g006: `
<p><strong>aller</strong>(= to go)는 이동뿐 아니라 안부 인사, 그리고 가까운 미래를 나타낼 때도 사용해요. 매우 불규칙한 동사라 활용형을 통째로 외워야 합니다.</p>
<h4>현재형 활용표</h4>
<table class="gr-tbl">
  <tr><td>je <strong>vais</strong></td><td>나는 가다</td><td>nous <strong>allons</strong></td><td>우리는 가다</td></tr>
  <tr><td>tu <strong>vas</strong></td><td>너는 가다</td><td>vous <strong>allez</strong></td><td>당신(들)은 가다</td></tr>
  <tr><td>il/elle <strong>va</strong></td><td>그/그녀는 가다</td><td>ils/elles <strong>vont</strong></td><td>그들은 가다</td></tr>
</table>
<h4>용도 1 — 이동 방향 (+ à)</h4>
<ul>
  <li><em>Je vais à Paris.</em> (파리에 가요) — à + 도시</li>
  <li><em>Allez tout droit.</em> (직진하세요) — 명령형으로 길 안내</li>
  <li><em>Je vais à l'hôtel.</em> (호텔에 가요)</li>
</ul>
<h4>용도 2 — 안부 인사</h4>
<ul>
  <li><em>Comment allez-vous ?</em> (어떻게 지내세요?) — 격식체</li>
  <li><em>Ça va ?</em> (잘 지내요?) — 친근한 표현</li>
  <li><em>Je vais bien, merci.</em> (잘 지내요, 감사해요)</li>
</ul>
<h4>용도 3 — 근접 미래 (futur proche)</h4>
<p><strong>aller + 동사원형</strong> = ~할 거예요 (영어 "going to")</p>
<ul>
  <li><em>Je vais manger.</em> (먹을 거예요)</li>
  <li><em>Il va pleuvoir.</em> (비가 올 거예요)</li>
  <li><em>Nous allons partir.</em> (우리는 떠날 거예요)</li>
</ul>`,

g007: `
<p><strong>faire</strong>(= to do/make)는 날씨, 스포츠, 활동 등 정말 다양한 상황에서 쓰이는 핵심 동사예요.</p>
<h4>현재형 활용표</h4>
<table class="gr-tbl">
  <tr><td>je <strong>fais</strong></td><td>나는 하다</td><td>nous <strong>faisons</strong></td><td>우리는 하다</td></tr>
  <tr><td>tu <strong>fais</strong></td><td>너는 하다</td><td>vous <strong>faites</strong></td><td>당신(들)은 하다</td></tr>
  <tr><td>il/elle <strong>fait</strong></td><td>그/그녀는 하다</td><td>ils/elles <strong>font</strong></td><td>그들은 하다</td></tr>
</table>
<h4>날씨 표현 — Il fait... 패턴</h4>
<ul>
  <li><em>Il fait beau.</em> (날씨가 좋아요)</li>
  <li><em>Il fait chaud / froid.</em> (더워요 / 추워요)</li>
  <li><em>Il fait mauvais.</em> (날씨가 나빠요)</li>
  <li><em>Il fait quel temps ?</em> (날씨가 어때요?)</li>
</ul>
<h4>활동 표현 — faire du / de la / de l'</h4>
<p>스포츠나 취미 활동은 <strong>faire + du/de la/de l'</strong>로 표현해요:</p>
<ul>
  <li><em>Je fais du sport.</em> (운동해요) — sport는 남성</li>
  <li><em>Elle fait de la musique.</em> (음악해요) — musique는 여성</li>
  <li><em>Il fait de l'escalade.</em> (암벽등반 해요) — 모음 앞 de l'</li>
  <li><em>Je fais du shopping.</em> (쇼핑해요)</li>
</ul>
<h4>일반 "하다" 표현</h4>
<ul>
  <li><em>Qu'est-ce que vous faites ?</em> (무엇을 하고 계세요?)</li>
  <li><em>Je fais une promenade.</em> (산책해요)</li>
</ul>`,

g008: `
<p><strong>Je voudrais</strong>는 vouloir(원하다)의 <em>조건법(conditionnel)</em> 형태예요. 영어의 "I would like"처럼 정중하게 요청할 때 씁니다.</p>
<h4>Je veux vs Je voudrais — 어감 차이</h4>
<table class="gr-tbl">
  <tr><td><em>Je <strong>veux</strong> un café.</em></td><td>커피 원해. (직접적, 약간 무뚝뚝)</td></tr>
  <tr><td><em>Je <strong>voudrais</strong> un café.</em></td><td>커피 주세요. (공손함 ✓)</td></tr>
</table>
<h4>패턴: Je voudrais + 명사 또는 동사원형</h4>
<ul>
  <li><em>Je voudrais un café, s'il vous plaît.</em> (커피 한 잔 주세요)</li>
  <li><em>Je voudrais réserver une table.</em> (테이블 예약하고 싶어요)</li>
  <li><em>Je voudrais aller à la gare.</em> (역에 가고 싶어요)</li>
  <li><em>Je voudrais une chambre pour deux nuits.</em> (2박 방 하나 원해요)</li>
</ul>
<h4>비슷한 정중한 표현들</h4>
<ul>
  <li><em>J'aimerais...</em> = I would love... (더 부드러운 표현)</li>
  <li><em>Pourriez-vous... ?</em> = Could you...? (도움 요청)</li>
  <li><em>Est-ce que je peux... ?</em> = Can I...? (허락 요청)</li>
</ul>
<p>🇫🇷 <strong>문화 팁</strong>: 카페나 레스토랑에서 "Je voudrais..."로 시작하면 예의 바른 손님으로 보여요!</p>`,

g009: `
<p>프랑스어 부정문의 기본 구조: <strong>주어 + ne + 동사 + pas</strong><br>
영어는 "don't/doesn't"를 추가하지만, 프랑스어는 동사를 ne와 pas로 <em>앞뒤에서 감싼다</em>는 게 핵심이에요.</p>
<h4>기본 패턴</h4>
<table class="gr-tbl">
  <tr><td><em>Je parle français.</em></td><td>→</td><td><em>Je <strong>ne parle pas</strong> français.</em></td></tr>
  <tr><td><em>J'ai une voiture.</em></td><td>→</td><td><em>Je <strong>n'ai pas</strong> de voiture.</em></td></tr>
  <tr><td><em>Je sais.</em></td><td>→</td><td><em>Je <strong>ne sais pas</strong>.</em></td></tr>
</table>
<h4>모음 앞에서 ne → n'</h4>
<ul>
  <li><em>Je <strong>n'aime pas</strong> le café.</em> — aimer는 모음으로 시작</li>
  <li><em>Je <strong>n'ai pas</strong> faim.</em></li>
  <li><em>Il <strong>n'est pas</strong> là.</em></li>
</ul>
<h4>부정문에서 관사 변화!</h4>
<ul>
  <li>un/une/des → <strong>de (d')</strong>: <em>Je n'ai pas <strong>de</strong> café.</em></li>
  <li>정관사(le/la/les)는 그대로: <em>Je n'aime pas <strong>le</strong> café.</em></li>
</ul>
<h4>다양한 부정 표현</h4>
<ul>
  <li><em>ne...jamais</em> = never: <em>Je ne fume jamais.</em></li>
  <li><em>ne...rien</em> = nothing: <em>Je ne comprends rien.</em></li>
  <li><em>ne...plus</em> = no more: <em>Je ne fume plus.</em></li>
</ul>`,

g010: `
<p><strong>Où</strong> = 어디(where). 장소를 물을 때 être 동사와 함께 씁니다.</p>
<h4>Où est vs Où sont</h4>
<ul>
  <li><em>Où <strong>est</strong></em> + 단수: <em>Où est la gare ?</em> (역이 어디예요?)</li>
  <li><em>Où <strong>sont</strong></em> + 복수: <em>Où sont les toilettes ?</em> (화장실이 어디예요?)</li>
</ul>
<h4>길 찾기 필수 표현 모음</h4>
<ul>
  <li><em>C'est loin ?</em> (멀어요?) / <em>C'est près d'ici ?</em> (가까워요?)</li>
  <li><em>À gauche</em> (왼쪽) / <em>À droite</em> (오른쪽) / <em>Tout droit</em> (직진)</li>
  <li><em>Tournez à gauche.</em> (왼쪽으로 도세요)</li>
  <li><em>C'est à 5 minutes à pied.</em> (걸어서 5분이에요)</li>
  <li><em>Prenez la ligne 1.</em> (1호선을 타세요)</li>
</ul>
<h4>의문문 만드는 3가지 방법</h4>
<ul>
  <li>억양 (구어): <em>La gare est où ?</em></li>
  <li>Est-ce que: <em>Où est-ce que se trouve la gare ?</em></li>
  <li>도치 (formal, 가장 자연스러움): <em>Où est la gare ?</em> ✓</li>
</ul>`,

g011: `
<p><strong>combien</strong> = how much / how many. 가격이나 수량을 물을 때 필수 표현이에요.</p>
<h4>주요 패턴</h4>
<ul>
  <li><em><strong>C'est combien ?</strong></em> — 얼마예요? (가장 간단, 구어체)</li>
  <li><em><strong>Ça coûte combien ?</strong></em> — 얼마예요? (coûter = 가격이 ~이다)</li>
  <li><em>C'est combien en tout ?</em> — 전부 얼마예요?</li>
  <li><em>C'est combien ce sac ?</em> — 이 가방 얼마예요?</li>
</ul>
<h4>가격 말하기</h4>
<ul>
  <li><em>C'est deux euros.</em> (2유로예요)</li>
  <li><em>Ça coûte cinq euros cinquante.</em> (5유로 50이에요)</li>
  <li><em>C'est gratuit.</em> (무료예요)</li>
  <li><em>C'est trop cher !</em> (너무 비싸요!)</li>
</ul>
<h4>combien의 다른 활용</h4>
<ul>
  <li><em>Combien de temps ?</em> (얼마나 걸려요?)</li>
  <li><em>Combien de personnes ?</em> (몇 명이에요?)</li>
  <li><em>C'est pour combien de nuits ?</em> (몇 박이에요?)</li>
</ul>
<p>💡 가격을 못 들었을 때: <em>Pouvez-vous répéter ?</em> 또는 <em>Vous pouvez écrire ?</em> (써주실 수 있어요?)</p>`,

g012: `
<p>프랑스에서 예의 바르게 말하는 핵심 표현들이에요. 이 두 표현만 자연스럽게 쓸 줄 알아도 현지인에게 좋은 인상을 줄 수 있어요.</p>
<h4>S'il vous plaît (SVP) = please</h4>
<ul>
  <li>주문/요청 뒤에: <em>Un café, s'il vous plaît.</em> (커피 한 잔 주세요)</li>
  <li>주의를 끌 때: <em>S'il vous plaît !</em> (저기요!)</li>
  <li>친구에게 (tu): <em>S'il te plaît</em> (비공식 버전)</li>
</ul>
<h4>Merci = thank you</h4>
<ul>
  <li><em>Merci.</em> (감사해요)</li>
  <li><em>Merci beaucoup.</em> (정말 감사해요)</li>
  <li><em>Merci bien.</em> (고맙습니다)</li>
</ul>
<h4>Merci에 대한 답변 — De rien 외에도</h4>
<ul>
  <li><em>De rien.</em> — 천만에요 (가장 일반적)</li>
  <li><em>Je vous en prie.</em> — 천만에요 (격식체)</li>
  <li><em>Avec plaisir.</em> — 기꺼이요</li>
  <li><em>C'est normal.</em> — 당연한 거예요</li>
</ul>
<p>🇫🇷 <strong>문화 팁</strong>: 상점에서 나갈 때 <em>Merci, au revoir !</em>라고 인사하는 게 프랑스 문화예요. 안 하면 무례하게 보일 수 있어요.</p>`,

g013: `
<p>낯선 사람에게 말을 걸거나 사과할 때, 그리고 못 알아들었을 때 꼭 필요한 표현들이에요.</p>
<h4>Excusez-moi vs Pardon — 뉘앙스 차이</h4>
<table class="gr-tbl">
  <tr><th>Excusez-moi</th><th>Pardon</th></tr>
  <tr><td>대화를 시작할 때 주의를 끌 때</td><td>부딪혔거나 가볍게 사과할 때</td></tr>
  <tr><td>공식적·예의 바른 상황</td><td>일상적 상황, 더 자주 씀</td></tr>
  <tr><td><em>Excusez-moi, où est la gare ?</em></td><td><em>Pardon !</em> (실수 후 사과)</td></tr>
</table>
<h4>Pardon? = 다시요?</h4>
<p>못 들었을 때 <em>Pardon ?</em>이라고 올려서 발음하면 "뭐라고요?"라는 뜻이 돼요.</p>
<h4>추가 생존 표현</h4>
<ul>
  <li><em>Parlez plus lentement, s'il vous plaît.</em> (천천히 말씀해 주세요)</li>
  <li><em>Pouvez-vous répéter ?</em> (다시 말씀해 주시겠어요?)</li>
  <li><em>Un moment, s'il vous plaît.</em> (잠깐만요)</li>
  <li><em>Je peux prendre une photo ?</em> (사진 찍어도 될까요?)</li>
</ul>`,

g014: `
<p>프랑스어를 배우는 여행자의 가장 중요한 생존 표현들이에요. 솔직하게 말하면 현지인도 이해해줘요.</p>
<h4>핵심 생존 표현 3가지</h4>
<ul>
  <li><em>Je <strong>ne comprends pas</strong>.</em> — 이해 못 해요</li>
  <li><em>Je <strong>ne parle pas</strong> (bien) français.</em> — 프랑스어를 (잘) 못해요</li>
  <li><em>Je parle <strong>un peu</strong> français.</em> — 프랑스어를 조금 해요</li>
</ul>
<h4>도움 요청 표현</h4>
<ul>
  <li><em>Parlez plus lentement, s'il vous plaît.</em> (천천히 말씀해 주세요)</li>
  <li><em>Pouvez-vous répéter ?</em> (다시 말씀해 주시겠어요?)</li>
  <li><em>Pouvez-vous écrire ça ?</em> (써주실 수 있어요?)</li>
  <li><em>Vous parlez anglais / coréen ?</em> (영어 / 한국어 하세요?)</li>
</ul>
<h4>comprendre vs parler vs entendre</h4>
<ul>
  <li><em>parler</em> = 말하다: <em>Je parle français.</em></li>
  <li><em>comprendre</em> = 이해하다: <em>Je comprends.</em> (이해해요)</li>
  <li><em>entendre</em> = 듣다: <em>Je n'entends pas bien.</em> (잘 안 들려요)</li>
</ul>
<p>💡 <strong>실전 팁</strong>: 프랑스어로 말하려고 노력하는 외국인을 프랑스인들은 좋아해요. 틀려도 괜찮으니 용기 내세요!</p>`,

g015: `
<p><strong>Il y a</strong>는 영어 "there is / there are"에 해당해요. 장소에 무언가가 있다/없다를 표현하는 핵심 구조입니다.</p>
<h4>기본 구조</h4>
<ul>
  <li><em><strong>Il y a</strong> + 명사</em> = ~이 있어요 (단수·복수 모두 가능)</li>
  <li><em><strong>Il n'y a pas de</strong> + 명사</em> = ~이 없어요</li>
  <li><em>Il y a... ?</em> = ~이 있나요? (의문형)</li>
</ul>
<h4>예문</h4>
<ul>
  <li><em>Il y a un café près d'ici ?</em> (근처에 카페가 있나요?)</li>
  <li><em>Il n'y a pas de place.</em> (자리가 없어요)</li>
  <li><em>Il y a combien de personnes ?</em> (몇 명이나 있어요?)</li>
</ul>
<h4>시간 표현으로도 사용!</h4>
<p><strong>Il y a + 시간</strong> = ~전 (영어 "ago")</p>
<ul>
  <li><em>Il y a 5 minutes.</em> (5분 전)</li>
  <li><em>Il y a deux jours.</em> (이틀 전)</li>
  <li><em>Il y a longtemps.</em> (오래 전)</li>
</ul>
<h4>Il y a vs C'est 차이</h4>
<ul>
  <li><em>Il y a</em> = 존재 여부: <em>Il y a un problème.</em> (문제가 있어요)</li>
  <li><em>C'est</em> = 정체·설명: <em>C'est un problème.</em> (그건 문제예요)</li>
</ul>`,

};

// ── 프랑스어-한국어 단어 사전 (타일 뜻 표시용) ────
const FR_KO_DICT = {
  // 관사·대명사
  "le":"(남성)", "la":"(여성)", "les":"(복수)", "l'":"(정관사)", "un":"하나(남)", "une":"하나(여)", "des":"(복수)",
  "je":"나", "j'":"나", "tu":"너", "il":"그", "elle":"그녀", "vous":"당신", "nous":"우리",
  "ce":"이것", "c'est":"이것은", "se":"스스로",
  // 동사
  "suis":"~이다(나)", "es":"~이다(너)", "est":"~이다", "êtes":"~이다(당신)", "sommes":"~이다(우리)", "sont":"~이다(그들)",
  "ai":"있다(나)", "as":"있다(너)", "a":"있다(그)", "avez":"있으세요?",
  "j'ai":"나는 있다", "n'ai":"없다(나)", "n'aime":"좋아하지 않다",
  "vais":"가다(나)", "vas":"가다(너)", "va":"가다(그)", "allez":"가세요", "allons":"가요(우리)", "aller":"가다",
  "fais":"하다(나)", "fait":"한다(그/그녀)", "faites":"하다(당신)", "faire":"하다",
  "veux":"원하다(나)", "voudrais":"원해요", "voudrait":"원하다(그/그녀)", "vouloir":"원하다",
  "peux":"할 수 있다(나)", "puis-je":"해도 될까요?", "pouvez":"하실 수 있나요?", "pouvoir":"할 수 있다",
  "sais":"알다(나)", "savez":"아시나요?", "savoir":"알다",
  "parle":"말하다(나)", "parlent":"말한다(그들)", "parlez":"말하다(당신)", "parler":"말하다",
  "parlez-vous":"말하세요?",
  "compris":"이해됐다", "comprends":"이해하다",
  "cherche":"찾다(나)", "cherchez":"찾으세요?", "trouver":"찾다", "trouve":"찾다(나)",
  "aimer":"좋아하다", "attendre":"기다리다", "dire":"말하다", "prendre":"타다/가지다",
  "réserver":"예약하다", "répéter":"반복하다",
  "coûte":"~이에요(가격)", "excusez-moi":"실례합니다",
  "merci":"고마워요", "plait":"주세요", "plaît":"주세요",
  "n'":"(부정)", "n'est":"~이 아니다", "ne":"~않다", "pas":"~않다",
  "n'y":"없다",
  // 명사
  "café":"커피", "croissant":"크루아상", "baguette":"바게트", "pain":"빵",
  "gare":"기차역", "métro":"지하철", "bus":"버스", "taxi":"택시",
  "hôtel":"호텔", "chambre":"객실", "réservation":"예약", "clé":"열쇠",
  "pharmacie":"약국", "hôpital":"병원", "médecin":"의사",
  "restaurant":"식당", "menu":"메뉴", "l'addition":"계산서", "addition":"계산서",
  "billets":"표들", "billet":"표",
  "place":"자리", "arrêt":"정류장", "l'arrêt":"정류장", "quai":"승강장",
  "tête":"머리", "fièvre":"열", "gorge":"목", "ventre":"배",
  "eau":"물", "l'eau":"물", "d'eau":"물의", "vin":"와인", "jus":"주스", "verre":"잔",
  "nom":"이름(성)", "prénom":"이름(名)", "passeport":"여권", "visa":"비자",
  "gauche":"왼쪽", "droite":"오른쪽", "droit":"직진",
  "ascenseur":"엘리베이터", "étage":"층", "prix":"가격",
  "pharmacien":"약사", "pastilles":"목캔디", "paracétamol":"해열제",
  "anglais":"영어", "français":"프랑스어", "coréen":"한국인",
  "homme":"남자", "femme":"여자", "ami":"친구", "étudiant":"학생(남)", "étudiants":"학생들",
  "professeur":"선생님(남)", "professeure":"선생님(여)",
  "langue":"언어", "question":"질문", "cours":"수업", "table":"테이블",
  "rendez-vous":"약속", "moment":"순간", "temps":"시간", "jour":"날",
  "lundi":"월요일", "mardi":"화요일",
  "station":"역", "sortie":"출구", "l'aéroport":"공항", "parc":"공원",
  "toilettes":"화장실", "carte":"카드/지도", "crédit":"신용",
  "sport":"스포츠", "natation":"수영", "promenade":"산책",
  "parapluie":"우산", "photo":"사진", "style":"스타일",
  "taille":"사이즈", "couleur":"색깔",
  "faim":"배고픔", "retard":"늦음", "âge":"나이",
  "plat":"요리", "coréenne":"한국인(여)", "française":"프랑스인(여)",
  // 형용사·부사
  "chaud":"뜨겁다", "froid":"차갑다", "cher":"비싸다", "trop":"너무",
  "bien":"잘", "mal":"아프다", "vite":"빨리", "lentement":"천천히", "doucement":"천천히",
  "ici":"여기", "là":"거기", "près":"근처", "loin":"멀다",
  "tout":"모두", "beaucoup":"많이", "peu":"조금", "encore":"다시", "plus":"더",
  "aujourd'hui":"오늘", "demain":"내일", "maintenant":"지금",
  "difficile":"어렵다", "facile":"쉽다", "fatigué":"피곤하다", "prêt":"준비된",
  "bon":"좋은", "tôt":"일찍", "lent":"느린", "très":"매우",
  "rien":"아무것도 없다",
  // 소유형용사
  "mon":"내(남)", "ma":"내(여)",
  // 전치사·접속사
  "à":"~에", "de":"~의", "du":"~의(남)", "en":"~에서", "par":"~쪽으로", "pour":"~위해",
  "avec":"~와 함께", "sans":"없이", "sur":"위에", "dans":"안에", "entre":"사이에",
  "et":"그리고", "ou":"또는", "mais":"그러나", "si":"만약", "que":"~것을",
  // 의문사·감탄사
  "où":"어디", "quoi":"무엇", "quand":"언제", "comment":"어떻게", "combien":"얼마나",
  "qu'est-ce":"무엇이", "quel":"어떤(남)", "quelle":"어떤(여)",
  "oui":"네", "non":"아니요", "s'il":"(정중)", "pardon":"실례해요",
  "bonjour":"안녕하세요", "bonsoir":"안녕하세요(저녁)", "au revoir":"안녕히",
  "ça":"그것", "paris":"파리",
  // 기타
  "il":"그(남)", "y":"거기에", "d'ici":"여기서", "d'arrêt":"정류장의",
  "moi":"나", "toi":"너", "lui":"그", "nous":"우리",
  "deux":"둘", "avoir":"가지다/있다", "entendu":"알겠습니다",
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
let currentExercises  = [];          // 현재 패스의 문제 배열 (복습 라운드 포함)
let mistakesThisPass  = [];          // 이번 패스에서 틀린 문제들
let isReviewRound     = false;       // 복습 라운드 여부
let answerSlots       = [];          // 답 영역의 단어들
let bankWords         = [];          // 단어 은행 단어들 [{word, id}]
let isDragging        = false;
let dragSource        = null;        // {from: "bank"|"answer", idx}
let ruleShown         = false;
let visibleLessons    = GRAMMAR_LESSONS; // 커리큘럼 필터링된 레슨 목록

// ── 진입점 ──────────────────────────────────────
export function initGrammar(userKey = "default") {
  LS_KEY_GR   = `sf_grammar_${userKey}`;
  LS_SCORE_GR = `sf_grammar_score_${userKey}`;
  API_KEY_LS  = `sf_apikey_${userKey}`;
  const saved = loadGrLocal();
  completedLessons = new Set(Object.keys(saved).filter(k => saved[k].completed));

  // 커리큘럼 진도에 따라 사용 가능한 레슨만 필터링
  const { memorizedArr } = loadCurriculumState(userKey);
  const unlocked    = getUnlockedUnitIds(saved, memorizedArr, HANDBOOK_WORDS);
  const availIds    = getAvailableGrammarIds(unlocked);
  visibleLessons    = GRAMMAR_LESSONS.filter(l => availIds.includes(l.id));

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

  const categories = [...new Set(visibleLessons.map(l => l.category))];

  const doneCnt = [...completedLessons].filter(id => visibleLessons.some(l => l.id === id)).length;

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=14" />

    <div class="page-header">
      <button class="page-back-btn" id="gr-home-btn">‹</button>
      <div class="page-header-info">
        <div class="page-header-title">문법</div>
        <div class="page-header-sub">${doneCnt} / ${visibleLessons.length} 완료</div>
      </div>
      <div class="gr-overall-bar" style="width:64px">
        <div class="gr-overall-fill" style="width:${visibleLessons.length > 0 ? Math.round(doneCnt/visibleLessons.length*100) : 0}%"></div>
      </div>
    </div>

    <div class="sub-page-content">
      <!-- 카테고리 탭 -->
      <div class="gr-cat-tabs" id="gr-cat-tabs">
        <button class="gr-cat-btn active" data-cat="all">전체</button>
        ${categories.map(c => `<button class="gr-cat-btn" data-cat="${c}">${c}</button>`).join("")}
      </div>

      <!-- 레슨 목록 -->
      <div class="gr-lesson-list" id="gr-lesson-list">
        ${visibleLessons.map(l => renderLessonCard(l, GRAMMAR_LESSONS.indexOf(l))).join("")}
      </div>
    </div>
  `;

  document.getElementById("gr-home-btn")?.addEventListener("click", () => window.navigateTo("curriculum"));

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

  const tutorial = TUTORIALS[lesson.id] || "";

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=14" />

    <div class="page-header">
      <button class="page-back-btn" id="gr-back-btn">‹</button>
      <div class="page-header-info">
        <div class="page-header-title">${lesson.emoji} ${lesson.title}</div>
        <div class="page-header-sub">${lesson.category} · ${currentLessonIdx + 1} / ${GRAMMAR_LESSONS.length}</div>
      </div>
    </div>

    <div class="sub-page-content">
      <div class="gr-rule-panel">
        <div class="gr-rule-panel-top">
          <div>
            <div class="gr-rule-cat">${lesson.category}</div>
            <h3 class="gr-rule-title">${lesson.emoji} ${lesson.title}</h3>
          </div>
        </div>
        <div class="gr-tutorial">${tutorial}</div>
        <div class="gr-rule-summary">
          <div class="gr-rule-summary-label">📌 핵심 요약</div>
          <div class="gr-rule-text">${lesson.rule}</div>
          <div class="gr-mnemonic">${lesson.mnemonic}</div>
        </div>
      </div>

      <button class="gr-start-btn" id="gr-start-btn">
        연습 시작 →
      </button>
    </div>
  `;

  document.getElementById("gr-back-btn").addEventListener("click", renderGrammarPage);

  document.getElementById("gr-start-btn").addEventListener("click", () => {
    currentExIdx      = 0;
    currentExercises  = [...GRAMMAR_LESSONS[currentLessonIdx].exercises];
    mistakesThisPass  = [];
    isReviewRound     = false;
    renderExercise();
  });
}

// ══════════════════════════════════════════════
//   렌더링: 드래그 앤 드롭 연습 화면
// ══════════════════════════════════════════════
function renderExercise() {
  const lesson   = GRAMMAR_LESSONS[currentLessonIdx];
  const exercise = currentExercises[currentExIdx];
  const page     = document.getElementById("page-grammar");

  // 단어 은행 = 정답 + 방해 단어, 무작위 섞기
  const allWords = shuffle([...exercise.answer, ...exercise.distractors]);
  bankWords  = allWords.map((w, i) => ({ word: w, id: `bank-${i}`, used: false }));
  answerSlots = [];

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/grammar.css?v=14" />

    <div class="page-header">
      <button class="page-back-btn" id="gr-back-btn2">‹</button>
      <div class="page-header-info">
        <div class="page-header-title">${lesson.emoji} ${lesson.title}</div>
        <div class="page-header-sub">${isReviewRound ? "복습 " : ""}${currentExIdx + 1} / ${currentExercises.length}</div>
      </div>
      <button class="gr-rule-peek" id="gr-rule-peek" title="규칙 보기">${ICONS.book}</button>
    </div>

    <div class="sub-page-content">
      <!-- 진행 바 -->
      <div class="gr-ex-bar">
        <div class="gr-ex-bar-fill" style="width:${Math.round(currentExIdx / currentExercises.length * 100)}%"></div>
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
  const exercise = currentExercises[currentExIdx];
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
    mistakesThisPass.push(exercise);
    const correctStr = correct.filter(w => !isPunctWord(w)).join(" ");
    showFeedback(
      `오답이에요.<div class="gr-correct-answer">정답: <strong>${correctStr}</strong></div>`,
      "wrong"
    );
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
  currentExIdx++;
  if (currentExIdx < currentExercises.length) {
    renderExercise();
    return;
  }
  // 현재 패스 종료 — 틀린 문제가 있으면 복습 라운드
  if (mistakesThisPass.length > 0) {
    currentExercises = [...mistakesThisPass];
    mistakesThisPass = [];
    currentExIdx     = 0;
    isReviewRound    = true;
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
    <link rel="stylesheet" href="public/css/grammar.css?v=14" />

    <div class="sub-page-content">
      <div class="gr-complete">
        <div class="gr-complete-emoji">🏆</div>
        <h2>레슨 완료!</h2>
        <p class="gr-complete-title">${lesson.title}</p>
        <p class="gr-complete-sub">${[...completedLessons].filter(id => visibleLessons.some(l => l.id === id)).length} / ${visibleLessons.length} 레슨 완료</p>

        <div class="gr-complete-btns">
          ${(()=>{ const nextVis = visibleLessons.find(l => GRAMMAR_LESSONS.indexOf(l) > currentLessonIdx); return nextVis ? `<button class="gr-next-lesson-btn" id="gr-next-lesson-btn">다음 레슨 →</button>` : `<button class="gr-next-lesson-btn" id="gr-all-done-btn">🎊 완료!</button>`; })()}
          ${hasApiKey
            ? `<button class="gr-ai-exercise-btn" id="gr-ai-exercise-btn">${ICONS.tip} Gemini 추가 문제</button>`
            : ""
          }
          <button class="gr-back-list-btn" id="gr-back-list-btn">목록으로</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("gr-next-lesson-btn")?.addEventListener("click", () => {
    const nextVis = visibleLessons.find(l => GRAMMAR_LESSONS.indexOf(l) > currentLessonIdx);
    if (nextVis) currentLessonIdx = GRAMMAR_LESSONS.indexOf(nextVis);
    currentExIdx     = 0;
    mistakesThisPass = [];
    isReviewRound    = false;
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
      currentExercises = [exercise];
      mistakesThisPass = [];
      isReviewRound    = false;
      currentExIdx     = 0;
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
