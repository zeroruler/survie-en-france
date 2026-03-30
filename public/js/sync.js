// ══════════════════════════════════════════════
//   sync.js — Firebase Firestore 클라우드 동기화
//   로그인 시 로드, 저장 시 업로드 (아이디별 독립 계정)
// ══════════════════════════════════════════════

import { initializeApp }            from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBtrpQhjbIuzANM8y7b6oQUoxnLg1Tb61g",
  authDomain:        "french-76b80.firebaseapp.com",
  projectId:         "french-76b80",
  storageBucket:     "french-76b80.firebasestorage.app",
  messagingSenderId: "900224249858",
  appId:             "1:900224249858:web:19129e298bd676ed2ef71b",
};

const app = initializeApp(FIREBASE_CONFIG);
const db  = getFirestore(app);

// ── localStorage 키 ↔ Firestore 필드 매핑 ──────
function keyMap(uk) {
  return [
    { local: `sf_vocab_${uk}`,          cloud: "vocab",         type: "json"   },
    { local: `sf_grammar_${uk}`,        cloud: "grammar",       type: "json"   },
    { local: `sf_grammar_score_${uk}`,  cloud: "grammar_score", type: "number" },
    { local: `sf_apikey_${uk}`,         cloud: "api_key",       type: "string" },
    { local: `sf_handbook_mem_${uk}`,   cloud: "memorized",     type: "json"   },
  ];
}

// ── 클라우드 → localStorage ─────────────────────
export async function loadFromCloud(userKey) {
  try {
    const snap = await getDoc(doc(db, "users", userKey));
    if (!snap.exists()) return; // 새 계정
    const data = snap.data();
    for (const { local, cloud, type } of keyMap(userKey)) {
      if (data[cloud] === undefined || data[cloud] === null) continue;
      if (type === "string")      localStorage.setItem(local, data[cloud]);
      else if (type === "number") localStorage.setItem(local, String(data[cloud]));
      else                        localStorage.setItem(local, JSON.stringify(data[cloud]));
    }
  } catch (e) {
    console.warn("[sync] Firestore 로드 실패:", e);
  }
}

// ── localStorage → 클라우드 (debounce 포함) ──────
let _saveTimer = null;

export function saveToCloud(userKey) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      const data = {};
      for (const { local, cloud, type } of keyMap(userKey)) {
        const raw = localStorage.getItem(local);
        if (raw === null) continue;
        if (type === "string")      data[cloud] = raw;
        else if (type === "number") data[cloud] = parseInt(raw) || 0;
        else {
          try { data[cloud] = JSON.parse(raw); } catch { data[cloud] = raw; }
        }
      }
      if (Object.keys(data).length === 0) return;
      await setDoc(doc(db, "users", userKey), data, { merge: true });
    } catch (e) {
      console.warn("[sync] Firestore 저장 실패:", e);
    }
  }, 1500);
}

// ── 페이지 종료 시 즉시 저장 ────────────────────
export function setupBeforeUnload(userKey) {
  window.addEventListener("beforeunload", () => {
    // navigator.sendBeacon은 Firestore SDK와 호환 안 됨 → 그냥 try
    saveToCloud(userKey);
  });
  // 30초마다 자동 저장
  setInterval(() => saveToCloud(userKey), 30_000);
}
