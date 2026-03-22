// ══════════════════════════════════════════════
//   Survie en France — app.js
// ══════════════════════════════════════════════

const AUTH_KEY      = "sf_auth";
let   userKey       = "default";
const V             = 9;

const pages         = document.querySelectorAll(".page");
const loadedModules = new Set();

// ── SHA-256 해시 ────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ── 페이지 라우터 ───────────────────────────────
function navigateTo(page) {
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${page}`)?.classList.add("active");

  if (loadedModules.has(page)) return;
  loadedModules.add(page);

  if (page === "vocab") {
    import(`./public/js/vocab.js?v=${V}`).then(m => m.initVocab(userKey)).catch(console.error);
  } else if (page === "grammar") {
    import(`./public/js/grammar.js?v=${V}`).then(m => m.initGrammar(userKey)).catch(console.error);
  } else if (page === "roleplay") {
    import(`./public/js/roleplay.js?v=${V}`).then(m => m.initRoleplay(userKey)).catch(console.error);
  } else if (page === "handbook") {
    import(`./public/js/handbook.js?v=${V}`).then(m => m.initHandbook()).catch(console.error);
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
    const hash = await sha256(pw);
    userKey = hash;
    overlay.classList.add("hidden");
    bindFooter();
  };

  submitBtn.addEventListener("click", unlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });
}

function bindFooter() {
  document.getElementById("footer-logout")?.addEventListener("click", () => {
    location.reload();
  });
  document.getElementById("footer-reset")?.addEventListener("click", () => {
    if (!confirm("이 아이디의 진행도가 모두 삭제됩니다. 정말 초기화하시겠습니까?")) return;
    localStorage.clear();
    location.reload();
  });
}

// ── 모듈 카드 클릭 ──────────────────────────────
document.querySelectorAll(".module-card").forEach(card =>
  card.addEventListener("click", () => navigateTo(card.dataset.page))
);

// ── 시작 ────────────────────────────────────────
initAuth();
