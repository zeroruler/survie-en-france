// ══════════════════════════════════════════════
//   settings.js — 설정 페이지
// ══════════════════════════════════════════════

const GEMINI_MODEL    = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

let API_KEY_LS = "gemini_api_key";
let _userKey   = "default";

export function initSettings(userKey = "default") {
  _userKey   = userKey;
  API_KEY_LS = `sf_apikey_${userKey}`;
  renderSettingsPage();
}

function renderSettingsPage() {
  const page    = document.getElementById("page-settings");
  const hasKey  = !!localStorage.getItem(API_KEY_LS);

  page.innerHTML = `
    <link rel="stylesheet" href="public/css/settings.css?v=1" />
    <div class="settings-page">
      <div class="settings-header">
        <div class="settings-title">설정</div>
      </div>

      <div class="settings-list">

        <!-- API 키 섹션 -->
        <div class="settings-section">
          <div class="settings-section-label">AI 롤플레이</div>

          <div class="settings-row api-key-row" id="api-key-row">
            <div class="settings-row-icon">🔑</div>
            <div class="settings-row-body">
              <div class="settings-row-title">Gemini API 키</div>
              <div class="settings-row-sub" id="api-key-status">${hasKey ? "연결됨" : "미설정 — 롤플레이 사용 불가"}</div>
            </div>
            <button class="settings-btn-small" id="api-key-toggle-btn">${hasKey ? "변경" : "입력"}</button>
          </div>

          <div class="api-key-form-area hidden" id="api-key-form-area">
            <div class="api-key-input-row">
              <input type="password" id="api-key-input" placeholder="AIza..." autocomplete="off" />
              <button class="settings-btn-primary" id="api-key-save-btn">저장</button>
            </div>
            <p class="api-key-error hidden" id="api-key-error"></p>
            <p class="api-key-hint">Google AI Studio에서 발급받은 키를 입력하세요. 키는 이 기기 브라우저에만 저장됩니다.</p>
          </div>
        </div>

        <!-- 계정 섹션 -->
        <div class="settings-section">
          <div class="settings-section-label">계정</div>

          <button class="settings-row settings-row-btn" id="btn-logout">
            <div class="settings-row-icon">🚪</div>
            <div class="settings-row-body">
              <div class="settings-row-title">로그아웃</div>
              <div class="settings-row-sub">다른 아이디로 전환</div>
            </div>
          </button>

          <button class="settings-row settings-row-btn danger" id="btn-reset">
            <div class="settings-row-icon">🗑️</div>
            <div class="settings-row-body">
              <div class="settings-row-title">진행도 초기화</div>
              <div class="settings-row-sub">모든 학습 기록을 삭제합니다</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  `;

  bindSettingsEvents();
}

function bindSettingsEvents() {
  // API 키 폼 토글
  document.getElementById("api-key-toggle-btn").addEventListener("click", () => {
    const area = document.getElementById("api-key-form-area");
    area.classList.toggle("hidden");
  });

  // API 키 저장
  document.getElementById("api-key-save-btn").addEventListener("click", () => {
    const key = document.getElementById("api-key-input").value.trim();
    if (key.length < 10) { showApiError("올바른 API 키를 입력해주세요."); return; }
    validateAndSaveApiKey(key);
  });
  document.getElementById("api-key-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const key = e.target.value.trim();
      if (key.length >= 10) validateAndSaveApiKey(key);
    }
  });

  // 로그아웃
  document.getElementById("btn-logout").addEventListener("click", () => {
    location.reload();
  });

  // 진행도 초기화
  document.getElementById("btn-reset").addEventListener("click", async () => {
    if (!confirm("이 아이디의 진행도가 모두 삭제됩니다. 정말 초기화하시겠습니까?")) return;
    const keys = Object.keys(localStorage).filter(k => k.includes(_userKey));
    keys.forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}

async function validateAndSaveApiKey(key) {
  const btn     = document.getElementById("api-key-save-btn");
  const errorEl = document.getElementById("api-key-error");
  btn.textContent = "검증 중...";
  btn.disabled    = true;
  errorEl.classList.add("hidden");

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "hi" }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    localStorage.setItem(API_KEY_LS, key);
    window.sfSave?.();

    // UI 업데이트
    document.getElementById("api-key-status").textContent = "연결됨";
    document.getElementById("api-key-toggle-btn").textContent = "변경";
    document.getElementById("api-key-form-area").classList.add("hidden");
    document.getElementById("api-key-input").value = "";
    showToast("API 키 저장 완료 ✓");
  } catch (err) {
    showApiError(`오류: ${err.message}`);
    btn.textContent = "저장";
    btn.disabled    = false;
  }
}

function showApiError(msg) {
  const el = document.getElementById("api-key-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function showToast(msg) {
  let toast = document.getElementById("settings-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "settings-toast";
    toast.className = "settings-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}
