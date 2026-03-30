// ══════════════════════════════════════════════
//   Survie en France — app.js
// ══════════════════════════════════════════════

import { loadFromCloud, saveToCloud, setupBeforeUnload } from "./public/js/sync.js";

const AUTH_KEY      = "sf_auth";
let   userKey       = "default";
const V             = 11;

const pages         = document.querySelectorAll(".page");
const loadedModules = new Set();
// These pages always re-init on navigation (progress-sensitive)
const dynamicPages  = new Set(["curriculum", "vocab", "grammar", "handbook", "roleplay"]);

// 서브페이지(공부 화면): 하단 내비 숨기기
const SUB_PAGES = new Set(["grammar", "vocab"]);
let   loggedIn  = false;

// ── SHA-256 해시 ────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ── 하단바 토글 (튜토리얼 등에서 직접 호출) ────
window.hideBottomNav = () => {
  if (loggedIn) document.getElementById("bottom-nav").classList.add("hidden");
};
window.showBottomNav = () => {
  if (loggedIn) document.getElementById("bottom-nav").classList.remove("hidden");
};

// ── 페이지 라우터 ───────────────────────────────
function navigateTo(page) {
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${page}`)?.classList.add("active");

  // 하단 탭 active 업데이트 (서브페이지는 부모 탭 유지)
  const navPages  = ["curriculum", "handbook", "roleplay", "settings"];
  const parentTab = { vocab: "curriculum", grammar: "curriculum" };
  const activeTab = navPages.includes(page) ? page : (parentTab[page] || null);
  if (activeTab) {
    document.querySelectorAll(".bn-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.page === activeTab);
    });
  }

  // 서브페이지: 하단바 숨기기 / 메인페이지: 하단바 복원
  if (loggedIn) {
    const bnav = document.getElementById("bottom-nav");
    if (SUB_PAGES.has(page)) {
      bnav.classList.add("hidden");
    } else {
      bnav.classList.remove("hidden");
    }
  }

  // Dynamic pages always re-init; settings only inits once
  if (!dynamicPages.has(page) && loadedModules.has(page)) return;
  loadedModules.add(page);

  if (page === "vocab") {
    import(`./public/js/vocab.js?v=${V}`).then(m => m.initVocab(userKey)).catch(console.error);
  } else if (page === "grammar") {
    import(`./public/js/grammar.js?v=${V}`).then(m => m.initGrammar(userKey)).catch(console.error);
  } else if (page === "roleplay") {
    import(`./public/js/roleplay.js?v=${V}`).then(m => m.initRoleplay(userKey)).catch(console.error);
  } else if (page === "handbook") {
    import(`./public/js/handbook.js?v=${V}`).then(m => m.initHandbook(userKey)).catch(console.error);
  } else if (page === "curriculum") {
    import(`./public/js/curriculum.js?v=${V}`).then(m => m.initCurriculum(userKey)).catch(console.error);
  } else if (page === "settings") {
    import(`./public/js/settings.js?v=${V}`).then(m => m.initSettings(userKey)).catch(console.error);
  }
}

// 모듈에서 홈으로 돌아갈 수 있도록 전역 노출
window.navigateTo = navigateTo;

// ── 비밀번호 오버레이 ────────────────────────────
async function initAuth() {
  const overlay   = document.getElementById("pw-overlay");
  const input     = document.getElementById("pw-input");
  const errorEl   = document.getElementById("pw-error");
  const subEl     = document.getElementById("pw-sub");
  const submitBtn = document.getElementById("pw-submit");

  subEl.textContent     = "Log in or create a new account";
  submitBtn.textContent = "시작하기";

  const unlock = async () => {
    const pw = input.value.trim();
    if (!pw) { errorEl.textContent = "아이디를 입력하세요."; return; }

    submitBtn.disabled    = true;
    submitBtn.textContent = "불러오는 중…";

    const hash = await sha256(pw);
    userKey = hash;

    // 클라우드에서 진행도 불러오기 (없으면 새 계정으로 시작)
    await loadFromCloud(userKey);

    // 전역 저장 함수 등록
    window.sfSave = () => saveToCloud(userKey);

    setupBeforeUnload(userKey);

    submitBtn.disabled    = false;
    submitBtn.textContent = "시작하기";

    overlay.classList.add("hidden");

    // 하단 내비게이션 표시 및 커리큘럼으로 시작
    loggedIn = true;
    document.getElementById("bottom-nav").classList.remove("hidden");
    navigateTo("curriculum");
  };

  submitBtn.addEventListener("click", unlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });
}

// ── 하단 탭 클릭 바인딩 ──────────────────────────
document.querySelectorAll(".bn-tab").forEach(tab => {
  tab.addEventListener("click", () => navigateTo(tab.dataset.page));
});

// ── 시작 ────────────────────────────────────────
initAuth();
