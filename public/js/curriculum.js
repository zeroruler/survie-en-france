// ══════════════════════════════════════════════
//   curriculum.js  — 마스터리 기반 커리큘럼
// ══════════════════════════════════════════════

import { HANDBOOK_WORDS } from "./handbook.js";
import {
  UNITS,
  getUnitProgress,
  getUnlockedUnitIds,
  loadCurriculumState,
} from "./curriculum_data.js";

const EMOJIS = ["👋","🕐","🏠","🗺️","🍽️","🛍️","🏥","☁️","💬","💼","🔁","🏆"];
const MONTH_LABELS = ["","1개월차 — 기초","2개월차 — 실전","3개월차 — 완성"];

// ── 진행도 계산 ──────────────────────────────
function getProgress(userKey) {
  const { grammarProgress, memorizedArr } = loadCurriculumState(userKey);
  const unlockedIds = getUnlockedUnitIds(grammarProgress, memorizedArr, HANDBOOK_WORDS);

  return UNITS.map((u, i) => {
    const locked = !unlockedIds.has(u.id);
    if (locked) return { u, locked, mastered: false, grammarPct:0, vocabPct:0, gDone:0, gTotal:u.grammar.length, vDone:0, vTotal:0, grammarOk:false, vocabOk:false };
    const p = getUnitProgress(u, grammarProgress, memorizedArr, HANDBOOK_WORDS);
    return {
      u, locked: false,
      mastered: p.complete,
      grammarPct: p.grammarTotal === 0 ? 1 : p.grammarDone / p.grammarTotal,
      vocabPct: p.vocabPct,
      gDone: p.grammarDone, gTotal: p.grammarTotal,
      vDone: p.vocabMemorized, vTotal: p.vocabTotal,
      grammarOk: p.grammarTotal === 0 || p.grammarDone === p.grammarTotal,
      vocabOk: p.vocabPct >= u.vocabThreshold,
    };
  });
}

// ── 유닛 카드 HTML ───────────────────────────
function unitCard(p, idx, isActive) {
  const { u, grammarPct, vocabPct, gDone, gTotal, vDone, vTotal,
          grammarOk, vocabOk, mastered, locked } = p;

  const statusClass = locked ? "locked" : mastered ? "mastered" : isActive ? "active" : "available";
  const statusBadge = locked   ? `<span class="cu-badge cu-locked">🔒 잠금</span>`
                    : mastered  ? `<span class="cu-badge cu-done">✓ 완료</span>`
                    : isActive  ? `<span class="cu-badge cu-active">학습 중</span>`
                    :             `<span class="cu-badge cu-avail">도전 가능</span>`;

  const gBar = gTotal > 0 ? `
    <div class="cu-prog-row">
      <span class="cu-prog-label">문법 ${gDone}/${gTotal}</span>
      <div class="cu-bar"><div class="cu-bar-fill ${grammarOk?"ok":""}" style="width:${Math.round(grammarPct*100)}%"></div></div>
      <span class="cu-prog-pct">${Math.round(grammarPct*100)}%</span>
    </div>` : "";

  const vBar = `
    <div class="cu-prog-row">
      <span class="cu-prog-label">단어 ${vDone}/${vTotal}</span>
      <div class="cu-bar"><div class="cu-bar-fill ${vocabOk?"ok":""}" style="width:${vTotal > 0 ? Math.round(vocabPct*100) : 0}%"></div></div>
      <span class="cu-prog-pct">${vTotal > 0 ? Math.round(vocabPct*100) : 0}%</span>
    </div>`;

  const threshold = u.vocabThreshold === 0.8 ? "80%" : u.vocabThreshold === 0.75 ? "75%" : "70%";
  const reqNote = `<div class="cu-req">달성 기준: ${gTotal > 0 ? "문법 100% · " : ""}단어 ${threshold} 이상</div>`;

  const actionBtns = (!locked && !mastered) ? `
    <div class="cu-actions">
      ${gTotal > 0 ? `<button class="cu-btn" data-nav="grammar">문법 →</button>` : ""}
      <button class="cu-btn" data-nav="vocab">어휘 플래시카드 →</button>
      ${u.roleplay.length > 0 ? `<button class="cu-btn" data-nav="roleplay">롤플레이 →</button>` : ""}
    </div>` : "";

  return `
    <div class="cu-unit ${statusClass}" data-unit="${idx}">
      <div class="cu-top">
        <div class="cu-num">${u.id}</div>
        <div class="cu-emoji">${EMOJIS[idx] || "📚"}</div>
        <div class="cu-info">
          <div class="cu-title">${u.title}</div>
          <div class="cu-sub">${u.subtitle}</div>
        </div>
        ${statusBadge}
      </div>
      ${!locked ? `<div class="cu-body">${gBar}${vBar}${reqNote}${actionBtns}</div>` : ""}
    </div>`;
}

// ── 튜토리얼 뷰 ──────────────────────────────
function renderTutorialView(container, userKey) {
  // 튜토리얼은 curriculum 컨테이너 내 서브뷰 → 하단바 숨기기
  window.hideBottomNav?.();

  container.innerHTML = `
    <link rel="stylesheet" href="public/css/curriculum.css?v=5" />
    <div class="curr-page">
      <div class="curr-header">
        <button class="home-btn" id="tut-back-btn">‹</button>
        <div class="curr-header-info">
          <div class="curr-title">0단계 — 기초 지식</div>
          <div class="curr-complete">시작 전 꼭 읽어보세요</div>
        </div>
      </div>
      <div class="cu-tut-body">

        <!-- 1. 발음 표기 읽는 법 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">📖 앱 발음 표기 읽는 법</div>
          <p class="cu-tut-p">이 앱의 단어카드에는 각 단어 아래 <b>한국어 발음 근사값</b>이 표시돼요. 예: <code>bonjour → bon-ZHOOR</code></p>
          <div class="cu-tut-rule-box">
            <div class="cu-tut-rule"><span class="cu-tut-tag">대문자</span> 강세가 들어가는 음절이에요. <code>bon-ZHOOR</code>에서 ZHOOR을 강하게.</div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">ZH</span> 영어에 없는 프랑스어 'j' 소리 — 입술 옆으로 당기며 "쥐"의 받침 없는 느낌. <code>je → ZHuh</code></div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">NY</span> 스페인어 ñ과 같은 소리. "냐"처럼. <code>montagne → mon-TAN-yuh</code></div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">EU/UH</span> 입을 "오" 모양으로 하고 "으" 발음. <code>le → luh</code></div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">발음 근사값</span> 완벽한 발음이 아니라 한국인이 읽기 쉽게 변환한 값이에요. 실제 발음은 원어민 영상으로 보완하세요.</div>
          </div>
        </div>

        <!-- 2. 악센트 기호 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">✍️ 특수기호 (악센트) 읽는 법</div>
          <p class="cu-tut-p">프랑스어 알파벳에는 기호가 붙은 글자들이 있어요. 각각 발음이 달라집니다.</p>
          <table class="cu-tut-tbl">
            <thead><tr><th>기호</th><th>글자 예시</th><th>발음</th><th>예시 단어</th></tr></thead>
            <tbody>
              <tr><td><b>é</b> (에귀)</td><td>é</td><td>닫힌 "에" — 한국어 "에"와 거의 같음</td><td>café, étudiant, répéter</td></tr>
              <tr><td><b>è</b> (그라브)</td><td>è, ê</td><td>열린 "에" — 입을 더 벌린 "에"</td><td>père, mère, être, fête</td></tr>
              <tr><td><b>à</b> (그라브)</td><td>à, â</td><td>그냥 "아" — 발음보다 의미 구분용</td><td>à (에), là (거기), pâte</td></tr>
              <tr><td><b>ç</b> (세디유)</td><td>ç</td><td>항상 "ㅅ" 소리 — c가 a/o/u 앞에서 k 대신 s</td><td>ça, garçon, français</td></tr>
              <tr><td><b>ù</b></td><td>ù</td><td>그냥 "우" — 의미 구분용</td><td>où (어디)</td></tr>
              <tr><td><b>ï, ë</b></td><td>ï ë</td><td>앞 모음과 분리해서 읽음</td><td>Noël (노-엘), naïf (나-이프)</td></tr>
              <tr><td><b>œ</b></td><td>œ, oe</td><td>"외"와 "으" 중간 소리</td><td>cœur (퀴르), sœur (쇠르)</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 핵심 발음 규칙 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">🔊 꼭 알아야 할 발음 규칙</div>

          <div class="cu-tut-subsection">끝 자음은 대부분 묵음</div>
          <p class="cu-tut-p">프랑스어는 단어 끝 자음을 거의 발음하지 않아요. 이게 익숙해지면 듣기가 훨씬 편해져요.</p>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">vous</span><span class="ex-arrow">→</span><span class="ex-sound">부 (s 묵음)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">est</span><span class="ex-arrow">→</span><span class="ex-sound">에 (st 묵음)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">Paris</span><span class="ex-arrow">→</span><span class="ex-sound">파리 (s 묵음)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">et</span><span class="ex-arrow">→</span><span class="ex-sound">에 (t 묵음)</span></div>
          </div>
          <p class="cu-tut-hint">💡 예외: <b>C, R, F, L</b> 은 발음하는 경우가 많아요 (CaReFuL 암기법). <code>avec → 아벡</code>, <code>par → 파르</code></p>

          <div class="cu-tut-subsection">h는 항상 묵음</div>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">hôtel</span><span class="ex-arrow">→</span><span class="ex-sound">오-텔</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">homme</span><span class="ex-arrow">→</span><span class="ex-sound">옴므</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">heure</span><span class="ex-arrow">→</span><span class="ex-sound">외르</span></div>
          </div>

          <div class="cu-tut-subsection">비모음 (콧소리 모음)</div>
          <p class="cu-tut-p">모음 + n/m 조합은 콧소리로 변해요. 영어에 없는 소리라 처음엔 어렵지만 자주 나와요.</p>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">an / en</span><span class="ex-arrow">→</span><span class="ex-sound">"앙" (콧소리)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">in / ain / im</span><span class="ex-arrow">→</span><span class="ex-sound">"앙" 비슷한 소리</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">on</span><span class="ex-arrow">→</span><span class="ex-sound">"옹" (콧소리)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">un</span><span class="ex-arrow">→</span><span class="ex-sound">"앙" 비슷</span></div>
          </div>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">bonjour</span><span class="ex-arrow">→</span><span class="ex-sound">봉-ZHOOR (on = 옹)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">bien</span><span class="ex-arrow">→</span><span class="ex-sound">비앙 (ien = 이앙)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">merci</span><span class="ex-arrow">→</span><span class="ex-sound">메르-시 (i는 그냥 이)</span></div>
          </div>

          <div class="cu-tut-subsection">연음 (Liaison) — 단어를 이어서 읽기</div>
          <p class="cu-tut-p">자음으로 끝나는 단어 뒤에 모음으로 시작하는 단어가 오면, 끝 자음을 다음 단어와 연결해서 발음해요.</p>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">les amis</span><span class="ex-arrow">→</span><span class="ex-sound">레-자미 (s가 살아남)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">nous avons</span><span class="ex-arrow">→</span><span class="ex-sound">누-자봉</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">c'est important</span><span class="ex-arrow">→</span><span class="ex-sound">세-탱포르탕</span></div>
          </div>
        </div>

        <!-- 4. 핵심 모음 발음 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">👄 헷갈리는 모음 조합</div>
          <table class="cu-tut-tbl">
            <thead><tr><th>표기</th><th>발음</th><th>예시</th></tr></thead>
            <tbody>
              <tr><td><b>ou</b></td><td>"우"</td><td>vous → 부, bonjour → 봉-ZHOOR</td></tr>
              <tr><td><b>u</b></td><td>"뤼" (입술 내밀며 "이")</td><td>tu → 튀, salut → 살뤼</td></tr>
              <tr><td><b>eu / œu</b></td><td>"으"+"외" 중간</td><td>le → 르, feu → 프</td></tr>
              <tr><td><b>ai / ei</b></td><td>"에"</td><td>j'ai → 줴, c'est → 세</td></tr>
              <tr><td><b>au / eau</b></td><td>"오"</td><td>au → 오, beau → 보</td></tr>
              <tr><td><b>oi</b></td><td>"와"</td><td>moi → 무아, voilà → 브왈라</td></tr>
              <tr><td><b>ille</b></td><td>"이유" (이+유 빠르게)</td><td>famille → 파미유, fille → 피유</td></tr>
              <tr><td><b>gn</b></td><td>"뉴/냐" (NY 소리)</td><td>magnifique → 마-니-피크</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 5. 문장 구조 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">📐 프랑스어 문장 구조</div>

          <div class="cu-tut-subsection">기본 어순: 주어 + 동사 + 나머지</div>
          <p class="cu-tut-p">영어와 거의 같아요.</p>
          <div class="cu-tut-sent-box">
            <div class="cu-tut-sent">
              <span class="s-part subj">Je</span>
              <span class="s-part verb">suis</span>
              <span class="s-part rest">étudiant.</span>
              <span class="s-ko">나는 학생이에요.</span>
            </div>
            <div class="cu-tut-sent">
              <span class="s-part subj">Il</span>
              <span class="s-part verb">parle</span>
              <span class="s-part rest">français.</span>
              <span class="s-ko">그는 프랑스어를 해요.</span>
            </div>
          </div>

          <div class="cu-tut-subsection">부정문: ne + 동사 + pas</div>
          <p class="cu-tut-p">동사를 <b>ne</b>와 <b>pas</b>로 앞뒤에서 감싸요. 모음 앞에서는 ne → n'으로 줄어요.</p>
          <div class="cu-tut-sent-box">
            <div class="cu-tut-sent">
              <span class="s-part subj">Je</span>
              <span class="s-part neg">ne</span>
              <span class="s-part verb">suis</span>
              <span class="s-part neg">pas</span>
              <span class="s-part rest">français.</span>
              <span class="s-ko">나는 프랑스인이 아니에요.</span>
            </div>
            <div class="cu-tut-sent">
              <span class="s-part subj">Je</span>
              <span class="s-part neg">n'</span>
              <span class="s-part verb">ai</span>
              <span class="s-part neg">pas</span>
              <span class="s-part rest">faim.</span>
              <span class="s-ko">배고프지 않아요.</span>
            </div>
          </div>

          <div class="cu-tut-subsection">의문문 3가지 방법</div>
          <table class="cu-tut-tbl">
            <thead><tr><th>방법</th><th>예시</th><th>뉘앙스</th></tr></thead>
            <tbody>
              <tr><td>억양 올리기</td><td>Vous parlez français ?</td><td>구어체, 일상 대화</td></tr>
              <tr><td>Est-ce que + 문장</td><td>Est-ce que vous parlez français ?</td><td>중간, 가장 안전</td></tr>
              <tr><td>주어-동사 도치</td><td>Parlez-vous français ?</td><td>격식체, 서면</td></tr>
            </tbody>
          </table>

          <div class="cu-tut-subsection">형용사는 명사 뒤에</div>
          <p class="cu-tut-p">영어는 명사 앞에 형용사를 쓰지만, 프랑스어는 대부분 명사 뒤에 와요.</p>
          <div class="cu-tut-examples">
            <div class="cu-tut-ex"><span class="ex-fr">un café chaud</span><span class="ex-arrow">→</span><span class="ex-sound">뜨거운 커피 (chaud가 뒤에)</span></div>
            <div class="cu-tut-ex"><span class="ex-fr">une femme intelligente</span><span class="ex-arrow">→</span><span class="ex-sound">똑똑한 여자</span></div>
          </div>
          <p class="cu-tut-hint">💡 단, grand(큰), petit(작은), bon(좋은), beau(예쁜), jeune(젊은) 등 자주 쓰는 형용사는 앞에 와요.</p>
        </div>

        <!-- 6. 명사의 성 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">⚧ 명사의 성 (Genre)</div>
          <p class="cu-tut-p">프랑스어의 모든 명사에는 <b>남성(masculin)</b>과 <b>여성(féminin)</b>이 있어요. 실제 성별과 관계없는 문법적 성이라 외워야 해요.</p>
          <table class="cu-tut-tbl">
            <thead><tr><th>관사</th><th>언제</th><th>예시</th></tr></thead>
            <tbody>
              <tr><td><b>le</b></td><td>남성 단수</td><td>le café, le train, le livre</td></tr>
              <tr><td><b>la</b></td><td>여성 단수</td><td>la gare, la France, la clé</td></tr>
              <tr><td><b>l'</b></td><td>모음/h로 시작하는 단수</td><td>l'hôtel, l'eau, l'homme</td></tr>
              <tr><td><b>les</b></td><td>복수 (성별 무관)</td><td>les cafés, les gares</td></tr>
            </tbody>
          </table>
          <div class="cu-tut-rule-box" style="margin-top:12px">
            <div class="cu-tut-rule"><span class="cu-tut-tag">힌트</span> -tion, -sion, -té로 끝나면 보통 여성: <em>la station, la liberté</em></div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">힌트</span> -ment, -age, -isme으로 끝나면 보통 남성: <em>le moment, le garage</em></div>
            <div class="cu-tut-rule"><span class="cu-tut-tag">꿀팁</span> 단어를 외울 때 항상 관사와 같이 외우세요: "café"가 아니라 "<b>le</b> café"로.</div>
          </div>
        </div>

        <!-- 7. 동사 활용 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">🔄 동사 활용 (Conjugaison)</div>
          <p class="cu-tut-p">프랑스어 동사는 주어에 따라 형태가 바뀌어요. 영어는 3인칭 단수(s)만 변하지만, 프랑스어는 전부 달라요.</p>
          <table class="cu-tut-tbl">
            <thead><tr><th>주어</th><th>être (이다)</th><th>avoir (있다)</th><th>parler (말하다)</th></tr></thead>
            <tbody>
              <tr><td>je (나)</td><td>suis</td><td>ai</td><td>parle</td></tr>
              <tr><td>tu (너)</td><td>es</td><td>as</td><td>parles</td></tr>
              <tr><td>il/elle (그/그녀)</td><td>est</td><td>a</td><td>parle</td></tr>
              <tr><td>vous (당신/들)</td><td>êtes</td><td>avez</td><td>parlez</td></tr>
              <tr><td>nous (우리)</td><td>sommes</td><td>avons</td><td>parlons</td></tr>
            </tbody>
          </table>
          <p class="cu-tut-hint">💡 여행할 땐 <b>je</b>(나)와 <b>vous</b>(당신) 위주로 쓰면 충분해요.</p>
        </div>

        <!-- 8. 꼭 알아야 할 표현 -->
        <div class="cu-tut-section">
          <div class="cu-tut-section-title">🎯 여행 필수 표현 패턴</div>
          <table class="cu-tut-tbl">
            <thead><tr><th>패턴</th><th>사용법</th><th>예시</th></tr></thead>
            <tbody>
              <tr><td><b>Je voudrais...</b></td><td>~주세요 / ~하고 싶어요</td><td>Je voudrais un café.</td></tr>
              <tr><td><b>Où est... ?</b></td><td>~은 어디예요?</td><td>Où est la gare ?</td></tr>
              <tr><td><b>C'est combien ?</b></td><td>얼마예요?</td><td>C'est combien ce sac ?</td></tr>
              <tr><td><b>Je ne comprends pas.</b></td><td>이해 못했어요</td><td>—</td></tr>
              <tr><td><b>Parlez-vous anglais ?</b></td><td>영어 하세요?</td><td>—</td></tr>
              <tr><td><b>Pouvez-vous répéter ?</b></td><td>다시 말해 주세요</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>`;

  document.getElementById("tut-back-btn")?.addEventListener("click", () => window.navigateTo("curriculum"));
}

// ── 페이지 렌더 ──────────────────────────────
function renderCurriculumPage(userKey) {
  const container = document.getElementById("page-curriculum");

  const progress  = getProgress(userKey);
  const totalDone = progress.filter(p => p.mastered).length;
  const activeIdx = progress.findIndex(p => !p.mastered && !p.locked);

  // 월별 그룹 렌더링
  const months = [1, 2, 3];
  const monthSections = months.map(month => {
    const monthUnits = UNITS.filter(u => u.month === month);
    const monthCards = monthUnits.map(u => {
      const i = UNITS.indexOf(u);
      return unitCard(progress[i], i, i === activeIdx);
    }).join("");
    return `<div class="cu-month-section"><div class="cu-month-label">${MONTH_LABELS[month]}</div>${monthCards}</div>`;
  }).join("");

  container.innerHTML = `
    <link rel="stylesheet" href="public/css/curriculum.css?v=5" />
    <div class="curr-page">
      <div class="curr-header">
        <div class="curr-header-info">
          <div class="curr-title">홈</div>
          <div class="curr-complete">${totalDone} / 12 완료</div>
        </div>
      </div>
      <div class="curr-list">
        <!-- 0단계 카드 -->
        <div class="cu-month-section">
          <div class="cu-month-label">시작 전</div>
          <div class="cu-unit cu-unit-zero cu-open" id="cu-unit-zero">
            <div class="cu-top">
              <div class="cu-num">0</div>
              <div class="cu-emoji">🏫</div>
              <div class="cu-info">
                <div class="cu-title">프랑스어 기초 지식</div>
                <div class="cu-sub">발음 · 악센트 · 문장 구조 · 관사</div>
              </div>
              <span class="cu-badge cu-avail">읽어보기 →</span>
            </div>
            <div class="cu-body">
              <div class="cu-zero-desc">발음 표기 읽는 법, 특수기호, 묵음 규칙, 명사의 성, 동사 활용 — 본격 학습 전에 알아두면 훨씬 수월해요.</div>
            </div>
          </div>
        </div>
        ${monthSections}
      </div>
    </div>`;

  // ── 아코디언 ──────────────────────────────
  // 현재 활성 단계 기본 오픈
  const activeCard = container.querySelector(".cu-unit.active");
  if (activeCard) activeCard.classList.add("cu-open");
  else {
    // 활성 단계 없으면 첫 번째 available 유닛 오픈
    const firstAvail = container.querySelector(".cu-unit.available:not(#cu-unit-zero)");
    if (firstAvail) firstAvail.classList.add("cu-open");
  }

  // 잠기지 않은 일반 유닛 (0단계 제외) 클릭 토글
  const accordionUnits = container.querySelectorAll(".cu-unit:not(.locked):not(#cu-unit-zero)");
  accordionUnits.forEach(card => {
    card.querySelector(".cu-top")?.addEventListener("click", () => {
      const isOpen = card.classList.contains("cu-open");
      accordionUnits.forEach(c => c.classList.remove("cu-open"));
      if (!isOpen) card.classList.add("cu-open");
    });
  });

  // data-nav 버튼 (아코디언 이벤트 버블링 차단)
  container.querySelectorAll("[data-nav]").forEach(btn =>
    btn.addEventListener("click", e => {
      e.stopPropagation();
      window.navigateTo(btn.dataset.nav);
    })
  );

  // 0단계 클릭 → 튜토리얼
  document.getElementById("cu-unit-zero")?.addEventListener("click", () => renderTutorialView(container, userKey));
}

// ── 초기화 ───────────────────────────────────
export function initCurriculum(userKey) {
  renderCurriculumPage(userKey);
}
