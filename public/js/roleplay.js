// ══════════════════════════════════════════════
//   roleplay.js — Claude API AI 롤플레이
//   Parisian 시뮬레이션 채팅 인터페이스
// ══════════════════════════════════════════════

import { ICONS } from "./icons.js";

const GEMINI_MODEL    = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── 시나리오 정의 ─────────────────────────────────
const SCENARIOS = [
  {
    id: "cafe",
    icon: "coffee",
    title: "카페에서 주문",
    titleFr: "Au Café",
    difficulty: 1,
    persona: "Pierre, 파리 카페 웨이터",
    systemPrompt: `You are Pierre, a friendly and patient waiter at a classic Parisian café called "Café de Flore".
Your role:
- Respond ONLY in French, using simple A1-A2 level vocabulary
- Keep your sentences short (max 2 sentences per reply)
- If the user makes a grammar mistake, include a gentle correction in parentheses: e.g., (On dit: "Je voudrais" ✓)
- Stay fully in character as a warm Parisian waiter
- Guide the conversation naturally: take order, suggest items, give total, say goodbye
- Common items: un café (2€), un café au lait (3€), un croissant (1.5€), une baguette (1€), un jus d'orange (3.5€)`,
    openingLine: "Bonjour ! Bienvenue au Café de Flore. Vous désirez quelque chose ?",
    tips: ["Je voudrais... = ~주세요", "L'addition, s'il vous plaît = 계산서 주세요", "C'est combien ? = 얼마예요?"],
    targetPhrases: ["je voudrais", "s'il vous plaît", "l'addition", "merci", "combien"],
  },
  {
    id: "metro",
    icon: "metro",
    title: "지하철에서 길 묻기",
    titleFr: "Dans le Métro",
    difficulty: 1,
    persona: "Sophie, 파리 시민",
    systemPrompt: `You are Sophie, a helpful Parisian commuter at a metro station.
Your role:
- Respond ONLY in French, A1-A2 level
- Help the user navigate the Paris metro system
- Mention real Paris metro lines (Ligne 1, 4, etc.) and famous stations (Châtelet, République, Montmartre)
- Correct grammar mistakes gently in parentheses
- Keep responses to 1-2 sentences maximum`,
    openingLine: "Bonjour ! Vous avez besoin d'aide ?",
    tips: ["Où est... ? = ~가 어디예요?", "Je cherche... = ~를 찾고 있어요", "Quel quai ? = 몇 번 승강장?"],
    targetPhrases: ["où est", "je cherche", "merci", "excusez-moi", "le métro"],
  },
  {
    id: "pharmacy",
    icon: "pill",
    title: "약국에서 약 구하기",
    titleFr: "À la Pharmacie",
    difficulty: 2,
    persona: "Dr. Leblanc, 파리 약사",
    systemPrompt: `You are Dr. Leblanc, a kind pharmacist in Paris.
Your role:
- Respond ONLY in French, A1-A2 level
- Help the user describe symptoms and find medicine
- Ask simple questions: Qu'est-ce que vous avez ? (무슨 증상이 있나요?)
- Suggest common medicines: du paracétamol, des pastilles pour la gorge, etc.
- Correct grammar gently in parentheses`,
    openingLine: "Bonjour ! Je peux vous aider ?",
    tips: ["J'ai mal à... = ~가 아파요", "J'ai de la fièvre = 열이 나요", "Avez-vous... ? = ~있나요?"],
    targetPhrases: ["j'ai mal", "j'ai besoin", "merci", "s'il vous plaît"],
  },
  {
    id: "hotel",
    icon: "hotel",
    title: "호텔 체크인",
    titleFr: "À l'Hôtel",
    difficulty: 2,
    persona: "Amélie, 호텔 리셉션",
    systemPrompt: `You are Amélie, the receptionist at a charming 3-star Paris hotel.
Your role:
- Respond ONLY in French, A1-A2 level
- Handle check-in: ask for name, reservation number, give key
- Be warm and professional
- Mention hotel amenities simply: le petit déjeuner (아침식사), le WiFi, l'ascenseur (엘리베이터)
- Correct grammar gently in parentheses`,
    openingLine: "Bonsoir ! Bienvenue à l'Hôtel Lumière. Vous avez une réservation ?",
    tips: ["J'ai une réservation = 예약했어요", "La chambre numéro... = ~호 객실", "À quelle heure... ? = 몇 시에?"],
    targetPhrases: ["réservation", "chambre", "merci", "s'il vous plaît", "à quelle heure"],
  },
];

// ── 상태 ─────────────────────────────────────────
let currentScenario  = null;
let conversationHistory = [];
let isLoading        = false;
let totalTokensUsed  = 0;
let API_KEY_LS       = "gemini_api_key";

// ── 진입점 ───────────────────────────────────────
export function initRoleplay(userKey = "default") {
  API_KEY_LS = `sf_apikey_${userKey}`;
  renderRoleplayPage();
}

// ── 페이지 렌더링 ─────────────────────────────────
function renderRoleplayPage() {
  const page = document.getElementById("page-roleplay");
  page.innerHTML = `
    <link rel="stylesheet" href="public/css/roleplay.css?v=10" />

    <!-- 시나리오 선택 화면 -->
    <div id="scenario-select">
      <div class="rp-header">
        <button class="home-btn" onclick="window.navigateTo('dashboard')">← 홈</button>
        <h2 class="rp-title">AI 롤플레이</h2>
        <p class="rp-sub">파리지앵과 실전 대화를 연습하세요. Gemini AI가 실제 현지인처럼 대화합니다.</p>
      </div>

      <div class="api-key-section" id="api-key-section">
        <!-- 미입력 상태 -->
        <div id="api-key-form">
          <div class="api-key-inner">
            <span class="api-key-icon">${ICONS.key}</span>
            <div>
              <strong>Gemini API 키 입력</strong>
              <p>Google AI Studio에서 발급받은 키를 입력하세요</p>
            </div>
          </div>
          <div class="api-key-input-row">
            <input type="password" id="api-key-input" placeholder="AIza..." />
            <button id="api-key-save-btn">저장</button>
          </div>
          <p class="api-key-error hidden" id="api-key-error"></p>
          <p class="api-key-hint">키는 이 기기 브라우저에만 저장되며, 저장 시 실제로 동작하는지 검증합니다</p>
        </div>
        <!-- 인증 완료 상태 -->
        <div id="api-key-verified" class="hidden">
          <div class="api-key-inner">
            <span class="api-key-icon">${ICONS.check}</span>
            <div>
              <strong>API 키 연결됨</strong>
              <p>Gemini 2.5 Flash가 정상적으로 연결되었습니다</p>
            </div>
          </div>
          <button class="api-key-change-btn" id="api-key-change-btn">변경</button>
        </div>
      </div>

      <div class="scenario-grid" id="scenario-grid">
        ${SCENARIOS.map(s => `
          <div class="scenario-card" data-id="${s.id}">
            <div class="sc-icon">${ICONS[s.icon]}</div>
            <div class="sc-info">
              <strong>${s.title}</strong>
              <span class="sc-fr">${s.titleFr}</span>
              <span class="sc-persona">${ICONS.user} ${s.persona}</span>
            </div>
            <div class="sc-diff">${s.difficulty === 1 ? "초급" : "중급"}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 채팅 화면 -->
    <div id="chat-view" class="hidden">
      <div class="chat-top-bar">
        <button id="chat-back-btn" class="chat-back">← 목록</button>
        <div class="chat-persona" id="chat-persona-info">
          <span id="chat-persona-emoji"></span>
          <div>
            <strong id="chat-persona-name"></strong>
            <span id="chat-persona-role"></span>
          </div>
        </div>
        <button id="chat-reset-btn" class="chat-reset-btn">↺</button>
      </div>

      <!-- 팁 바 -->
      <div class="tip-bar" id="tip-bar">
        <span class="tip-label">${ICONS.tip} 팁</span>
        <div class="tip-chips" id="tip-chips"></div>
      </div>

      <!-- 메시지 영역 -->
      <div class="chat-messages" id="chat-messages"></div>

      <!-- 입력창 -->
      <div class="chat-input-bar">
        <div class="chat-quick-phrases" id="quick-phrases"></div>
        <div class="chat-input-row">
          <input
            type="text"
            id="chat-input"
            placeholder="프랑스어로 입력하세요... (한국어도 OK)"
            autocomplete="off"
          />
          <button id="chat-send-btn" class="chat-send-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
        <div class="chat-token-info" id="chat-token-info">토큰 사용: 0</div>
      </div>
    </div>
  `;

  bindRoleplayEvents();
  loadSavedApiKey();
}

// ── 이벤트 바인딩 ────────────────────────────────
function bindRoleplayEvents() {
  // API 키 저장 — 버튼 클릭 시 실제 검증 후 저장
  const apiInput = document.getElementById("api-key-input");
  document.getElementById("api-key-save-btn")?.addEventListener("click", () => {
    const key = apiInput.value.trim();
    if (key.length < 10) {
      showApiError("올바른 API 키를 입력해주세요");
      return;
    }
    validateAndSaveApiKey(key);
  });
  apiInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const key = apiInput.value.trim();
      if (key.length >= 10) validateAndSaveApiKey(key);
    }
  });
  document.getElementById("api-key-change-btn")?.addEventListener("click", showInputState);

  // 시나리오 선택
  document.getElementById("scenario-grid")?.addEventListener("click", (e) => {
    const card = e.target.closest(".scenario-card");
    if (!card) return;
    const scenario = SCENARIOS.find(s => s.id === card.dataset.id);
    if (scenario) startScenario(scenario);
  });

  // 뒤로가기
  document.getElementById("chat-back-btn")?.addEventListener("click", () => {
    document.getElementById("chat-view").classList.add("hidden");
    document.getElementById("scenario-select").classList.remove("hidden");
    currentScenario = null;
    conversationHistory = [];
  });

  // 리셋
  document.getElementById("chat-reset-btn")?.addEventListener("click", () => {
    if (currentScenario) startScenario(currentScenario);
  });

  // 전송
  document.getElementById("chat-send-btn")?.addEventListener("click", sendMessage);
  document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

function loadSavedApiKey() {
  const saved = localStorage.getItem(API_KEY_LS);
  if (saved) {
    document.getElementById("api-key-input").value = saved;
    showVerifiedState();
  }
}

// ── API 키 검증 & 저장 ───────────────────────────
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
    showVerifiedState();
    showToast("API 키 검증 완료 ✓");
  } catch (err) {
    showApiError(`오류: ${err.message}`);
    btn.textContent = "저장";
    btn.disabled    = false;
  }
}

function showVerifiedState() {
  document.getElementById("api-key-form").classList.add("hidden");
  document.getElementById("api-key-verified").classList.remove("hidden");
  document.getElementById("api-key-section").classList.add("api-key-saved");
}

function showInputState() {
  document.getElementById("api-key-form").classList.remove("hidden");
  document.getElementById("api-key-verified").classList.add("hidden");
  document.getElementById("api-key-section").classList.remove("api-key-saved");
  document.getElementById("api-key-save-btn").textContent = "저장";
  document.getElementById("api-key-save-btn").disabled    = false;
}

function showApiError(msg) {
  const el = document.getElementById("api-key-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ── 시나리오 시작 ────────────────────────────────
function startScenario(scenario) {
  currentScenario     = scenario;
  conversationHistory = [];
  totalTokensUsed     = 0;

  document.getElementById("scenario-select").classList.add("hidden");
  document.getElementById("chat-view").classList.remove("hidden");

  // 페르소나 설정
  document.getElementById("chat-persona-emoji").innerHTML = ICONS[scenario.icon];
  document.getElementById("chat-persona-name").textContent  = scenario.persona.split(",")[0];
  document.getElementById("chat-persona-role").textContent  = scenario.titleFr;

  // 팁 렌더
  const tipsEl = document.getElementById("tip-chips");
  tipsEl.innerHTML = scenario.tips.map(t =>
    `<span class="tip-chip">${t}</span>`
  ).join("");

  // 퀵 구문
  const quickEl = document.getElementById("quick-phrases");
  const quickPhrases = ["Bonjour !", "Merci beaucoup.", "S'il vous plaît.", "Je voudrais...", "C'est combien ?", "Je ne comprends pas."];
  quickEl.innerHTML = quickPhrases.map(p =>
    `<button class="quick-chip" data-phrase="${p}">${p}</button>`
  ).join("");
  quickEl.querySelectorAll(".quick-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("chat-input").value = btn.dataset.phrase;
      document.getElementById("chat-input").focus();
    });
  });

  // 메시지 초기화
  const messagesEl = document.getElementById("chat-messages");
  messagesEl.innerHTML = "";

  // AI 오프닝 메시지
  appendMessage("ai", scenario.openingLine);
  conversationHistory.push({ role: "assistant", content: scenario.openingLine });
}

// ── 메시지 전송 ──────────────────────────────────
async function sendMessage() {
  if (isLoading) return;
  const input = document.getElementById("chat-input");
  const text  = input.value.trim();
  if (!text) return;

  const apiKey = localStorage.getItem(API_KEY_LS);
  if (!apiKey) {
    showToast("API 키를 먼저 입력해주세요!");
    document.getElementById("chat-back-btn").click();
    return;
  }

  input.value = "";
  appendMessage("user", text);
  conversationHistory.push({ role: "user", content: text });

  isLoading = true;
  const loadingId = appendLoadingBubble();
  document.getElementById("chat-send-btn").disabled = true;

  try {
    // Gemini 형식: role은 "user" / "model"
    const contents = conversationHistory.map(m => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: currentScenario.systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data   = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    totalTokensUsed += (data.usageMetadata?.totalTokenCount || 0);

    removeLoadingBubble(loadingId);
    appendMessage("ai", aiText);
    conversationHistory.push({ role: "assistant", content: aiText });

    // 토큰 카운터 업데이트
    document.getElementById("chat-token-info").textContent = `토큰 사용: ${totalTokensUsed}`;

    // 목표 표현 체크
    checkTargetPhrases(text);

  } catch (err) {
    removeLoadingBubble(loadingId);
    appendMessage("system", `오류: ${err.message}. API 키를 확인해주세요.`);
    console.error("Claude API 오류:", err);
  } finally {
    isLoading = false;
    document.getElementById("chat-send-btn").disabled = false;
    document.getElementById("chat-input").focus();
  }
}

// ── 메시지 버블 추가 ─────────────────────────────
function appendMessage(role, text) {
  const container = document.getElementById("chat-messages");
  const id        = `msg-${Date.now()}`;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.id = id;

  if (role === "ai") {
    bubble.innerHTML = `
      <div class="bubble-avatar">${currentScenario ? ICONS[currentScenario.icon] : ICONS.user}</div>
      <div class="bubble-content">
        <div class="bubble-text">${formatAiText(text)}</div>
        <div class="bubble-actions">
          <button class="bubble-translate-btn" data-text="${encodeURIComponent(text)}">해석</button>
        </div>
        <div class="bubble-translation hidden"></div>
      </div>
    `;
  } else if (role === "user") {
    bubble.innerHTML = `
      <div class="bubble-content user-content">
        <div class="bubble-text">${escapeHtml(text)}</div>
      </div>
    `;
  } else {
    bubble.innerHTML = `<div class="system-msg">${text}</div>`;
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  // 해석 버튼
  bubble.querySelector(".bubble-translate-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const transEl = btn.parentElement.nextElementSibling;
    if (!transEl.classList.contains("hidden")) {
      transEl.classList.add("hidden");
      btn.textContent = "해석";
      return;
    }
    btn.textContent = "번역 중...";
    btn.disabled = true;
    const translated = await translateToKorean(decodeURIComponent(btn.dataset.text));
    transEl.textContent = translated;
    transEl.classList.remove("hidden");
    btn.textContent = "해석";
    btn.disabled = false;
  });

  return id;
}

function appendLoadingBubble() {
  const container = document.getElementById("chat-messages");
  const id = `loading-${Date.now()}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble ai loading-bubble";
  bubble.id = id;
  bubble.innerHTML = `
    <div class="bubble-avatar">${currentScenario ? ICONS[currentScenario.icon] : ICONS.user}</div>
    <div class="bubble-content">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeLoadingBubble(id) {
  document.getElementById(id)?.remove();
}

// ── AI 텍스트 포맷 (교정 강조) ──────────────────
function formatAiText(text) {
  // (On dit: "xxx" ✓) 형태의 교정을 강조 표시
  return escapeHtml(text).replace(
    /\(([^)]+)\)/g,
    '<span class="correction">($1)</span>'
  );
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── 번역 (한국어) ────────────────────────────────
async function translateToKorean(text) {
  const apiKey = localStorage.getItem(API_KEY_LS);
  if (!apiKey) return "(API 키 필요)";
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a French-to-Korean translator. Translate the given French text into natural Korean. Output ONLY the Korean translation — no explanation, no quotes, no extra text." }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.2 },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "(번역 결과 없음)";
  } catch (e) {
    console.error("번역 오류:", e);
    return `(번역 실패: ${e.message})`;
  }
}

// ── 목표 표현 달성 체크 ──────────────────────────
function checkTargetPhrases(userText) {
  if (!currentScenario?.targetPhrases) return;
  const lower = userText.toLowerCase();
  const hit = currentScenario.targetPhrases.some(p => lower.includes(p));
  if (hit) showToast("목표 표현 사용! +10 XP");
}

// ── 토스트 알림 ──────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("rp-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "rp-toast";
    toast.className = "rp-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}
