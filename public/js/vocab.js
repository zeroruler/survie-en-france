// ══════════════════════════════════════════════
//   vocab.js — SRS 플래시카드 시스템
//   스와이프 제스처 + SM-2 알고리즘
// ══════════════════════════════════════════════

import { calculateNextReview, isDue } from "./srs.js";
import { ICONS } from "./icons.js";
import { HANDBOOK_WORDS, PHONETICS } from "./handbook.js";

let LS_KEY      = "sf_vocab_cards";
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } };
const saveLocal = (d) => { localStorage.setItem(LS_KEY, JSON.stringify(d)); window.sfSave?.(); };

// ── 단어장 DB에서 플래시카드 데이터 생성 ────────────
const VOCAB_CARDS = HANDBOOK_WORDS.map((w, i) => ({
  id:       `h${i}`,
  french:   w.fr,
  english:  w.ko,
  phonetic: PHONETICS[w.fr] || "",
  category: w.cat,
}));

// ── 상태 ────────────────────────────────────────
let allCards           = [];
let sessionCards       = [];
let currentIndex       = 0;
let isFlipped          = false;
let isReviewRound      = false;
let unknownThisSession = new Set();  // 이번 세션에서 모름 표시된 ID (복습 라운드용)
let startX             = 0;
let isDragging         = false;

// ── 진입점 ──────────────────────────────────────
export function initVocab(userKey = "default") {
  LS_KEY = `sf_vocab_${userKey}`;
  loadCards();
  renderVocabPage();
  updateCounters();
  renderCard();
}

// ── 카드 로드 (최대 10장) ────────────────────────
function loadCards() {
  const saved = loadLocal();
  allCards = VOCAB_CARDS.map(word => ({
    ...word,
    ...(saved[word.id] || { status:"new", easeFactor:2.5, interval:0, repetitions:0, nextReview:null }),
  }));

  const due  = allCards.filter(c => c.status === "new" || isDue(c));
  let daily  = due.slice(0, 10);
  if (daily.length < 10) {
    const rest = allCards.filter(c => !daily.includes(c));
    daily = [...daily, ...rest.slice(0, 10 - daily.length)];
  }
  sessionCards       = [...daily];
  currentIndex       = 0;
  isReviewRound      = false;
  unknownThisSession = new Set();
  updateCounters();
}

// ── 페이지 렌더링 ────────────────────────────────
function renderVocabPage() {
  const page = document.getElementById("page-vocab");

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/vocab.css?v=16" />

    <!-- 오늘 카드 뷰 -->
    <div id="vocab-today-view">
      <div class="vocab-header">
        <button class="home-btn" onclick="window.navigateTo('dashboard')">← 홈</button>
        <div class="vocab-progress-row">
          <span class="vp-label" id="vp-label">오늘 카드</span>
          <span class="vp-counts"><span id="vp-done">0</span> / <span id="vp-total">0</span></span>
        </div>
        <div class="vocab-progress-bar">
          <div class="vocab-progress-fill" id="vp-bar"></div>
        </div>
      </div>

      <div class="flashcard-arena" id="flashcard-arena">
        <div class="flashcard-wrapper" id="fc-wrapper">
          <div class="flashcard" id="flashcard">
            <div class="fc-front" id="fc-front"><div class="fc-skeleton"></div></div>
            <div class="fc-back"  id="fc-back"></div>
          </div>
        </div>
      </div>

      <div class="rating-buttons" id="rating-buttons">
        <button class="rating-btn bad"  id="btn-bad">${ICONS.x}<span>모름</span></button>
        <button class="rating-btn meh"  id="btn-meh">${ICONS.meh}<span>스킵</span></button>
        <button class="rating-btn good" id="btn-good">${ICONS.check}<span>완벽</span></button>
      </div>

      <div class="vocab-done hidden" id="vocab-done">
        <div class="vd-emoji">${ICONS.done}</div>
        <h2 id="vd-title">오늘 학습 완료!</h2>
        <p id="vd-msg">수고했어요.</p>
        <button class="btn-primary" id="vd-restart">처음부터 다시</button>
      </div>
    </div>

  `;

  bindVocabEvents();
}

// ── 카드 렌더링 ──────────────────────────────────
function renderCard() {
  if (currentIndex >= sessionCards.length) {
    // 현재 패스 완료
    if (!isReviewRound && unknownThisSession.size > 0) {
      // 모름 카드로 복습 라운드 시작
      isReviewRound  = true;
      sessionCards   = allCards.filter(c => unknownThisSession.has(c.id));
      currentIndex   = 0;
      unknownThisSession = new Set();
      const lbl = document.getElementById("vp-label");
      if (lbl) lbl.textContent = "복습 중";
      updateCounters();
      renderCard();
      return;
    }
    showDoneScreen();
    return;
  }

  const card   = sessionCards[currentIndex];
  isFlipped    = false;

  const fc      = document.getElementById("flashcard");
  const front   = document.getElementById("fc-front");
  const back    = document.getElementById("fc-back");
  const wrapper = document.getElementById("fc-wrapper");

  // Disable flip transition before removing .flipped to prevent visual flip-back animation
  fc.style.transition = "none";
  fc.classList.remove("flipped", "swipe-left", "swipe-right");
  void fc.offsetWidth; // force reflow so transition:none takes effect
  wrapper.style.transform  = "";
  wrapper.style.opacity    = "";
  wrapper.style.transition = "";

  const statusLabel = {
    new:      '<span class="fc-badge new">새 카드</span>',
    learning: '<span class="fc-badge learning">학습 중</span>',
    review:   '<span class="fc-badge review">복습</span>',
    mastered: '<span class="fc-badge mastered">완료</span>',
  }[card.status] || "";

  front.innerHTML = `
    <div class="fc-category">${statusLabel}</div>
    <div class="fc-french">${card.french}</div>
    <div class="fc-phonetic">${card.phonetic}</div>
    <div class="fc-tap-hint">탭하여 뒤집기</div>
  `;

  back.innerHTML = `
    <div class="fc-category">${card.category || ""}</div>
    <div class="fc-english">${card.english}</div>
    <div class="fc-tap-hint">평가 버튼을 눌러주세요</div>
  `;
}

// ── 카드 뒤집기 ─────────────────────────────────
function flipCard() {
  const fc = document.getElementById("flashcard");
  fc.style.transition = ""; // restore CSS transition for the flip animation
  isFlipped = !isFlipped;
  fc.classList.toggle("flipped", isFlipped);
}

// ── 평가 (SRS 업데이트) ──────────────────────────
function rateCard(quality) {

  const card   = sessionCards[currentIndex];
  const result = calculateNextReview(card, quality);

  const saved = loadLocal();
  saved[card.id] = {
    status:      result.status,
    easeFactor:  result.easeFactor,
    interval:    result.interval,
    repetitions: result.repetitions,
    nextReview:  result.nextReview?.toISOString?.() ?? result.nextReview,
    lastReview:  new Date().toISOString(),
  };
  saveLocal(saved);

  if (quality === 1) {
    unknownThisSession.add(card.id);
  }

  const dir = quality >= 3 ? "swipe-right" : "swipe-left";
  animateSwipe(dir, () => {
    currentIndex++;
    updateCounters();
    renderCard();
  });
}

// ── 스킵 (SRS 업데이트 없이 다음 카드) ────────────
function skipCard() {
  animateSwipe("swipe-right", () => {
    currentIndex++;
    updateCounters();
    renderCard();
  });
}

function animateSwipe(dirClass, cb) {
  const wrapper = document.getElementById("fc-wrapper");
  const x       = dirClass === "swipe-right" ? 150 : -150;
  wrapper.style.transition = "transform .35s ease, opacity .35s ease";
  wrapper.style.transform  = `translateX(${x}px) rotate(${x > 0 ? 12 : -12}deg)`;
  wrapper.style.opacity    = "0";
  setTimeout(cb, 360);
}

// ── 진행 카운터 ─────────────────────────────────
function updateCounters() {
  const done  = currentIndex;
  const total = sessionCards.length;
  const pct   = total > 0 ? (done / total) * 100 : 0;
  const el    = (id) => document.getElementById(id);
  if (el("vp-done"))  el("vp-done").textContent  = done;
  if (el("vp-total")) el("vp-total").textContent  = total;
  if (el("vp-bar"))   el("vp-bar").style.width    = `${pct}%`;

  const dashEl = document.getElementById("vocab-due-count");
  if (dashEl) dashEl.innerHTML = `오늘 복습할 카드: <b>${Math.max(0, total - done)}</b>장`;
}

// ── 완료 화면 ────────────────────────────────────
function showDoneScreen() {
  document.getElementById("flashcard-arena").classList.add("hidden");
  document.getElementById("rating-buttons").classList.add("hidden");
  document.getElementById("vocab-done").classList.remove("hidden");
  const mastered = allCards.filter(c => c.status === "mastered").length;
  const titleEl  = document.getElementById("vd-title");
  const msgEl    = document.getElementById("vd-msg");
  if (titleEl) titleEl.textContent = isReviewRound ? "복습 완료!" : "오늘 학습 완료!";
  if (msgEl)   msgEl.textContent   = `마스터한 단어: ${mastered}개 / 전체 ${allCards.length}개`;
}

// ── 이벤트 바인딩 ────────────────────────────────
function bindVocabEvents() {
  const arena    = document.getElementById("flashcard-arena");

  document.getElementById("flashcard")?.addEventListener("click", flipCard);
  document.getElementById("btn-bad")?.addEventListener("click",  () => rateCard(1));
  document.getElementById("btn-meh")?.addEventListener("click",  () => skipCard());
  document.getElementById("btn-good")?.addEventListener("click", () => rateCard(5));

  document.getElementById("vd-restart")?.addEventListener("click", () => {
    loadCards();
    const lbl = document.getElementById("vp-label");
    if (lbl) lbl.textContent = "오늘 카드";
    document.getElementById("flashcard-arena").classList.remove("hidden");
    document.getElementById("rating-buttons").classList.remove("hidden");
    document.getElementById("vocab-done").classList.add("hidden");
    renderCard();
  });

  // 터치 스와이프
  arena?.addEventListener("touchstart", (e) => {
    startX     = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  arena?.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const dx      = e.touches[0].clientX - startX;
    const wrapper = document.getElementById("fc-wrapper");
    if (wrapper) {
      wrapper.style.transition = "none";
      wrapper.style.transform  = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
    }
  }, { passive: true });

  arena?.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    isDragging  = false;
    const dx    = e.changedTouches[0].clientX - startX;
    if (dx > 80)       rateCard(5);
    else if (dx < -80) rateCard(1);
    else {
      const wrapper = document.getElementById("fc-wrapper");
      if (wrapper) {
        wrapper.style.transition = "transform .3s ease";
        wrapper.style.transform  = "";
      }
    }
  });
}
