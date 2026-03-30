// ══════════════════════════════════════════════
//   curriculum_data.js — 12주 커리큘럼 데이터
//   순수 데이터 모듈 (앱 모듈 의존성 없음)
// ══════════════════════════════════════════════

export const UNITS = [
  { id:1,  week:"1주차",  month:1, title:"첫 만남과 자기소개", subtitle:"Greetings & Identity",
    grammar:["g001","g002","g003"], vocab:["인사말","나라"], roleplay:[], vocabThreshold:0.7 },
  { id:2,  week:"2주차",  month:1, title:"일상과 시간", subtitle:"Numbers & Time",
    grammar:["g004","g005"], vocab:["시간","색깔"], roleplay:[], vocabThreshold:0.7 },
  { id:3,  week:"3주차",  month:1, title:"가족과 집", subtitle:"Family & Home",
    grammar:[], vocab:["가족","집"], roleplay:[], vocabThreshold:0.7 },
  { id:4,  week:"4주차",  month:1, title:"길 찾기와 도시", subtitle:"City & Transport",
    grammar:["g006","g010","g015"], vocab:["도시","교통"], roleplay:["metro"], vocabThreshold:0.7 },
  { id:5,  week:"5주차",  month:2, title:"음식과 식당", subtitle:"Food & Restaurant",
    grammar:["g008","g011"], vocab:["음식","식사"], roleplay:["cafe"], vocabThreshold:0.7 },
  { id:6,  week:"6주차",  month:2, title:"쇼핑과 옷", subtitle:"Shopping & Clothing",
    grammar:["g009"], vocab:["옷","소지품"], roleplay:[], vocabThreshold:0.7 },
  { id:7,  week:"7주차",  month:2, title:"몸과 건강", subtitle:"Body & Health",
    grammar:["g007"], vocab:["몸","외모"], roleplay:["pharmacy"], vocabThreshold:0.7 },
  { id:8,  week:"8주차",  month:2, title:"날씨와 취미", subtitle:"Weather & Hobbies",
    grammar:["g012","g013","g014"], vocab:["날씨","취미"], roleplay:["hotel"], vocabThreshold:0.7 },
  { id:9,  week:"9주차",  month:3, title:"감정과 성격", subtitle:"Emotions & Personality",
    grammar:[], vocab:["감정","성격"], roleplay:[], vocabThreshold:0.7 },
  { id:10, week:"10주차", month:3, title:"직업과 학교", subtitle:"Jobs & School",
    grammar:[], vocab:["직업","학교"], roleplay:[], vocabThreshold:0.7 },
  { id:11, week:"11주차", month:3, title:"종합 복습", subtitle:"Comprehensive Review",
    grammar:["g001","g002","g003","g004","g005","g006","g007","g008","g009","g010","g011","g012","g013","g014","g015"],
    vocab:["인사말","나라","시간","색깔","가족","집"], roleplay:[], vocabThreshold:0.75 },
  { id:12, week:"12주차", month:3, title:"최종 마스터", subtitle:"Final Mastery",
    grammar:[],
    vocab:["인사말","나라","시간","색깔","가족","집","도시","교통","음식","식사","옷","소지품","몸","외모","날씨","취미","감정","성격","직업","학교"],
    roleplay:[], vocabThreshold:0.8 },
];

// 특정 유닛의 진행도 계산
export function getUnitProgress(unit, grammarProgress, memorizedArr, handbookWords) {
  const memorized = memorizedArr instanceof Set ? memorizedArr : new Set(memorizedArr);
  const grammarDone = unit.grammar.filter(id => grammarProgress[id]?.completed).length;
  const unitWords   = handbookWords.filter(w => unit.vocab.includes(w.cat));
  const memCount    = unitWords.filter(w => memorized.has(w.fr)).length;
  const vocabPct    = unitWords.length === 0 ? 1 : memCount / unitWords.length;
  const complete    = (unit.grammar.length === 0 || grammarDone === unit.grammar.length)
                   && vocabPct >= unit.vocabThreshold;
  return { grammarDone, grammarTotal: unit.grammar.length, vocabMemorized: memCount, vocabTotal: unitWords.length, vocabPct, complete };
}

// 잠금 해제된 유닛 ID Set 반환 (순차 잠금)
export function getUnlockedUnitIds(grammarProgress, memorizedArr, handbookWords) {
  const unlocked = new Set([1]);
  for (let i = 0; i < UNITS.length - 1; i++) {
    const p = getUnitProgress(UNITS[i], grammarProgress, memorizedArr, handbookWords);
    if (p.complete) {
      unlocked.add(UNITS[i + 1].id);
    } else {
      break;
    }
  }
  return unlocked;
}

// 모듈별 사용 가능 목록
export function getAvailableVocabCategories(unlockedIds) {
  return [...new Set(UNITS.filter(u => unlockedIds.has(u.id)).flatMap(u => u.vocab))];
}
export function getAvailableGrammarIds(unlockedIds) {
  return [...new Set(UNITS.filter(u => unlockedIds.has(u.id)).flatMap(u => u.grammar))];
}
export function getAvailableRoleplayIds(unlockedIds) {
  return [...new Set(UNITS.filter(u => unlockedIds.has(u.id)).flatMap(u => u.roleplay))];
}

// 어떤 유닛에서 특정 롤플레이 시나리오가 해제되는지
export function getUnlockUnitForRoleplay(scenarioId) {
  return UNITS.find(u => u.roleplay.includes(scenarioId));
}

// 로컬스토리지 커리큘럼 상태 읽기
export function loadCurriculumState(userKey) {
  try {
    return {
      grammarProgress: JSON.parse(localStorage.getItem(`sf_grammar_${userKey}`) || "{}"),
      memorizedArr:    JSON.parse(localStorage.getItem(`sf_handbook_mem_${userKey}`) || "[]"),
    };
  } catch {
    return { grammarProgress: {}, memorizedArr: [] };
  }
}
