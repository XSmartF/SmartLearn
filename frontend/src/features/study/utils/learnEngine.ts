/**
 * Learn Mode (rule-based) – TypeScript single-file implementation
 * Focus: Multiple Choice + Typed Recall (no ML models)
 *
 * Usage sketch (pseudo):
 *   const engine = new LearnEngine({ cards: initialCards });
 *   let q = engine.nextQuestion();
 *   // render q to UI; collect user input
 *   engine.submitAnswer(q.cardId, userAnswer);
 *   // loop until engine.isFinished()
 */

///////////////////////////////
// Domain Types
///////////////////////////////

export type Mode = "MULTIPLE_CHOICE" | "TYPED_RECALL";
export type Result = "Correct" | "CorrectMinor" | "Incorrect" | "Skip";

export interface Card {
  id: string;
  front: string; // prompt
  back: string;  // answer (canonical)
  domain?: string; // optional grouping for better distractors
  difficulty?: 'easy' | 'medium' | 'hard'; // optional per-card difficulty label
}

export interface CardState {
  id: string;
  mastery: number;         // 0..M
  streakCorrect: number;   // consecutive correct
  lastResult: Result | "New";
  nextDue: number;         // session-relative index; smaller = sooner
  seenCount: number;
  wrongCount: number;
}

export interface QuestionMC {
  mode: "MULTIPLE_CHOICE";
  cardId: string;
  prompt: string;
  options: string[]; // includes 1 correct (shuffled)
}

export interface QuestionTyped {
  mode: "TYPED_RECALL";
  cardId: string;
  prompt: string;
}

export type Question = QuestionMC | QuestionTyped;

// ===== Progress Types =====
export interface ProgressSummary {
  total: number;
  mastered: number;
  learning: number;
  fresh: number;
  percentMastered: number; // 0..100
  accuracyOverall: number; // 0..1
  accuracyRecent: number;  // 0..1 (last K)
  avgMsRecent: number | null;
}

export interface ProgressDetailed {
  total: number;
  percentMastered: number; // 0..100
  accuracyOverall: number; // 0..1
  accuracyRecent: number;  // 0..1 (last K)
  avgMsRecent: number | null;
  masteryLevels: {
    level0: { count: number; percent: number }; // New/Not started
    level1: { count: number; percent: number }; // Beginner
    level2: { count: number; percent: number }; // Intermediate
    level3: { count: number; percent: number }; // Advanced
    level4: { count: number; percent: number }; // Expert
    level5: { count: number; percent: number }; // Mastered
  };
}

export interface CardProgressRow {
  id: string;
  front: string;
  back: string;
  mastery: number;
  seenCount: number;
  wrongCount: number;
  nextDue: number;
}

/** Serialize learning state to persist across sessions */
export interface SerializedState { 
  params: LearnParams; 
  sessionIndex: number; 
  asked: number; 
  correct: number; 
  incorrect: number; 
  startedAt: number; 
  recentMs: number[]; 
  states: CardState[];
  modePrefs?: { mc: boolean; typed: boolean }; // optional for backward compatibility
}

///////////////////////////////
// Engine Configuration
///////////////////////////////

export interface LearnParams {
  M: number; // max mastery threshold
  modeThreshold: number; // mastery >= threshold ⇒ prefer typed recall
  mcOptions: number; // total options for MC
  earlyPenalty: number; // 0..1 multiplier on mastery when wrong
  promoteBonus: number; // mastery increment on correct
  lenientDistance: number; // allowed edit distance for typed answers
  overdueBias: number; // weight for overdue factor
  wrongBias: number;   // weight for last wrong
  lowMasteryBias: number; // weight for low mastery
  rarityBias: number;      // weight for low seenCount

  // scheduling buckets in items (intra-session). For real-time, you could convert to minutes/hours.
  scheduleBuckets: {
    low: [number, number];   // mastery 0-1 reappear after N items (min,max)
    mid: [number, number];   // mastery 2-3
    high: [number, number];  // mastery 4+ (or >= M-1)
  };
}

export const DefaultParams: LearnParams = {
  M: 5,
  modeThreshold: 2,
  mcOptions: 4,
  earlyPenalty: 0.4,
  promoteBonus: 1,
  lenientDistance: 1,
  overdueBias: 1.0,
  wrongBias: 3.0,
  lowMasteryBias: 2.0,
  rarityBias: 0.5,
  scheduleBuckets: {
    low: [1, 3],
    mid: [5, 12],
    high: [20, 40],
  },
};

///////////////////////////////
// Utilities
///////////////////////////////

function rngInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]/gu, " ") // remove punctuation/symbols
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  // classic DP O(|a|*|b|)
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

///////////////////////////////
// Engine
///////////////////////////////

export interface LearnInit {
  cards: Card[];
  params?: Partial<LearnParams>;
}

export class LearnEngine {
  private cards: Card[] = [];
  private state: Map<string, CardState> = new Map();
  private params: LearnParams;
  private sessionIndex = 0; // counts how many questions have been asked

  // progress/session metrics
  private asked = 0;
  private correct = 0;
  private incorrect = 0;
  private startedAt = Date.now();
  private recentMs: number[] = []; // sliding window of response times

  // User mode preferences (both enabled by default)
  private modePrefs: { mc: boolean; typed: boolean } = { mc: true, typed: true };

  constructor(init: LearnInit) {
    this.cards = init.cards.slice();
    this.params = { ...DefaultParams, ...(init.params || {}) };
    for (const c of this.cards) {
      this.state.set(c.id, {
        id: c.id,
        mastery: 0,
        streakCorrect: 0,
        lastResult: "New",
        nextDue: 0,
        seenCount: 0,
        wrongCount: 0,
      });
    }
  }

  /** Set which modes are allowed (at least one must remain true) */
  public setModePreferences(prefs: { mc: boolean; typed: boolean }) {
    // Ensure at least one mode remains enabled
    if (!prefs.mc && !prefs.typed) return; // ignore invalid
    this.modePrefs = { ...prefs };
  }

  public getModePreferences() {
    return { ...this.modePrefs };
  }

  isFinished(): boolean {
    for (const s of this.state.values()) {
      if (s.mastery < this.params.M) return false;
    }
    return true;
  }

  nextQuestion(): Question | null {
    if (this.isFinished()) return null;

    // pick candidates due now; if none, pick closest-to-due
    const due: CardState[] = [];
    let minNextDue = Infinity;
    for (const s of this.state.values()) {
      if (s.mastery >= this.params.M) continue;
      if (s.nextDue <= this.sessionIndex) {
        due.push(s);
      }
      minNextDue = Math.min(minNextDue, s.nextDue);
    }

    const pool = due.length > 0 ? due : [...this.state.values()].filter(s => s.mastery < this.params.M && s.nextDue === minNextDue);
    const picked = this.selectNext(pool);
    if (!picked) return null;

    const card = this.getCard(picked.id);
    const mode = this.chooseMode(picked);

    if (mode === "MULTIPLE_CHOICE") {
      const options = this.generateMCOptions(card, this.params.mcOptions);
      return { mode, cardId: card.id, prompt: card.front, options };
    } else {
      return { mode, cardId: card.id, prompt: card.front };
    }
  }

  submitAnswer(cardId: string, rawAnswer: string | number | null, meta?: { ms?: number }): Result {
    const s = this.state.get(cardId);
    if (!s) throw new Error("Unknown card state");
    const card = this.getCard(cardId);

    let result: Result = "Incorrect";

    const qMode = this.chooseMode(s); // infer mode again (or track externally)

    if (qMode === "MULTIPLE_CHOICE") {
      // rawAnswer should be an index into options OR the exact string chosen by UI
      // In UI, you should keep the shuffled options and pass index back here.
      // For engine-only, we assume caller already validated equality and passes index 0..n-1 with 0 = correct.
      // To keep it engine-agnostic, we accept either number index 0 (correct) or compare strings.
      if (typeof rawAnswer === "number") {
        result = rawAnswer === 0 ? "Correct" : "Incorrect";
      } else if (typeof rawAnswer === "string") {
        result = normalize(rawAnswer) === normalize(card.back) ? "Correct" : "Incorrect";
      } else {
        result = "Incorrect";
      }
    } else {
      // typed recall
      const u = normalize(String(rawAnswer ?? ""));
      const g = normalize(card.back);
      if (u === g) result = "Correct";
      else if (levenshtein(u, g) <= this.params.lenientDistance) result = "CorrectMinor";
      else result = "Incorrect";
    }

    this.updateState(s, result);
    // progress metrics
    this.asked++;
    if (result === "Correct" || result === "CorrectMinor") this.correct++; else this.incorrect++;
    if (meta?.ms != null) {
      this.recentMs.push(meta.ms);
      if (this.recentMs.length > 50) this.recentMs.shift();
    }
    this.sessionIndex++;
    return result;
  }

  ///////////////////////////////
  // Progress APIs
  ///////////////////////////////

  /** Overall progress summary */
  public getProgress(): ProgressSummary {
    let mastered = 0, learning = 0, fresh = 0;
    for (const s of this.state.values()) {
      if (s.mastery >= this.params.M) mastered++; else if (s.seenCount > 0) learning++; else fresh++;
    }
    const total = this.state.size;
    const percentMastered = total ? (mastered / total) * 100 : 0;
    const accuracyOverall = this.asked ? this.correct / this.asked : 0;
    // recent accuracy approximated via last N answers; for simplicity, use asked/correct counters as rolling
    const accRecent = accuracyOverall; // replace with ring buffer if you need true recent
    const avgMsRecent = this.recentMs.length ? Math.round(this.recentMs.reduce((a,b)=>a+b,0)/this.recentMs.length) : null;
    return {
      total, mastered, learning, fresh,
      percentMastered: Math.round(percentMastered * 10) / 10,
      accuracyOverall,
      accuracyRecent: accRecent,
      avgMsRecent,
    };
  }

  /** Detailed progress with mastery level breakdown */
  public getProgressDetailed(): ProgressDetailed {
    const total = this.state.size;
    const masteryCount = [0, 0, 0, 0, 0, 0]; // counts for mastery levels 0-5
    
    for (const s of this.state.values()) {
      const level = Math.min(5, Math.max(0, s.mastery));
      masteryCount[level]++;
    }

    const percentMastered = total ? (masteryCount[5] / total) * 100 : 0;
    const accuracyOverall = this.asked ? this.correct / this.asked : 0;
    const accRecent = accuracyOverall; // replace with ring buffer if you need true recent
    const avgMsRecent = this.recentMs.length ? Math.round(this.recentMs.reduce((a,b)=>a+b,0)/this.recentMs.length) : null;

    return {
      total,
      percentMastered: Math.round(percentMastered * 10) / 10,
      accuracyOverall,
      accuracyRecent: accRecent,
      avgMsRecent,
      masteryLevels: {
        level0: { count: masteryCount[0], percent: total ? Math.round((masteryCount[0] / total) * 1000) / 10 : 0 },
        level1: { count: masteryCount[1], percent: total ? Math.round((masteryCount[1] / total) * 1000) / 10 : 0 },
        level2: { count: masteryCount[2], percent: total ? Math.round((masteryCount[2] / total) * 1000) / 10 : 0 },
        level3: { count: masteryCount[3], percent: total ? Math.round((masteryCount[3] / total) * 1000) / 10 : 0 },
        level4: { count: masteryCount[4], percent: total ? Math.round((masteryCount[4] / total) * 1000) / 10 : 0 },
        level5: { count: masteryCount[5], percent: total ? Math.round((masteryCount[5] / total) * 1000) / 10 : 0 },
      }
    };
  }

  /** Table of per-card progress for dashboards */
  public getCardProgress(): CardProgressRow[] {
    const rows: CardProgressRow[] = [];
    for (const c of this.cards) {
      const s = this.state.get(c.id)!;
      rows.push({ id: c.id, front: c.front, back: c.back, mastery: s.mastery, seenCount: s.seenCount, wrongCount: s.wrongCount, nextDue: s.nextDue });
    }
    return rows;
  }

  /** Generate a fresh question object for a specific card WITHOUT advancing scheduling or stats */
  public generateQuestionForCard(cardId: string): Question {
    const s = this.state.get(cardId);
    if (!s) throw new Error("Unknown card state");
    const card = this.getCard(cardId);
    const mode = this.chooseMode(s);
    if (mode === "MULTIPLE_CHOICE") {
      const options = this.generateMCOptions(card, this.params.mcOptions);
      return { mode, cardId: card.id, prompt: card.front, options };
    }
    return { mode, cardId: card.id, prompt: card.front };
  }

  /** Serialize learning state to persist across sessions */
  public serialize(): SerializedState {
    return {
      params: this.params,
      sessionIndex: this.sessionIndex,
      asked: this.asked,
      correct: this.correct,
      incorrect: this.incorrect,
      startedAt: this.startedAt,
      recentMs: [...this.recentMs],
  states: [...this.state.values()].map(s => ({...s})),
  modePrefs: { ...this.modePrefs }
    };
  }

  /** Restore from a previous snapshot */
  public restore(snapshot: SerializedState) {
    this.params = snapshot.params;
    this.sessionIndex = snapshot.sessionIndex;
    this.asked = snapshot.asked;
    this.correct = snapshot.correct;
    this.incorrect = snapshot.incorrect;
    this.startedAt = snapshot.startedAt;
    this.recentMs = [...snapshot.recentMs];
    this.state.clear();
    // Chỉ khôi phục những thẻ vẫn còn tồn tại trong bộ cards hiện tại
    // (tránh giữ state cho thẻ đã bị xóa)
    const existingIds = new Set(this.cards.map(c => c.id));
    for (const s of snapshot.states) {
      if (existingIds.has(s.id)) {
        this.state.set(s.id, { ...s });
      }
    }
    // Thêm state mặc định cho các thẻ mới được thêm sau lần lưu trước
    for (const c of this.cards) {
      if (!this.state.has(c.id)) {
        this.state.set(c.id, {
          id: c.id,
          mastery: 0,
          streakCorrect: 0,
          lastResult: "New",
          nextDue: this.sessionIndex, // cho phép xuất hiện ngay
          seenCount: 0,
          wrongCount: 0,
        });
      }
    }
    if (snapshot.modePrefs) {
      this.modePrefs = { ...snapshot.modePrefs };
    }
  }

  // Get current session stats
  getStats() {
    const states = Array.from(this.state.values());
    const totalCards = states.length;
    const masteredCards = states.filter(s => s.mastery >= this.params.M).length;
    const wrongCards = states.filter(s => s.wrongCount > 0).length;
    const averageMastery = states.reduce((sum, s) => sum + s.mastery, 0) / totalCards;
    
    return {
      totalCards,
      masteredCards,
      wrongCards,
      averageMastery,
      progress: totalCards > 0 ? masteredCards / totalCards : 0,
      sessionIndex: this.sessionIndex
    };
  }

  // Get card state for debugging
  getCardState(cardId: string): CardState | undefined {
    return this.state.get(cardId);
  }

  // Get all card states
  getAllCardStates(): CardState[] {
    return Array.from(this.state.values());
  }

  ///////////////////////////////
  // Internals
  ///////////////////////////////

  ///////////////////////////////
  // Internals
  ///////////////////////////////

  private getCard(id: string): Card {
    const c = this.cards.find(x => x.id === id);
    if (!c) throw new Error("Unknown card");
    return c;
  }

  private selectNext(candidates: CardState[]): CardState | null {
    if (candidates.length === 0) return null;

    // scoring: higher score ⇒ higher priority
    const now = this.sessionIndex;
    let best: CardState | null = null;
    let bestScore = -Infinity;

    for (const c of candidates) {
      const overdue = Math.max(0, now - c.nextDue);
      const score =
        this.params.overdueBias * overdue +
        this.params.wrongBias * (c.lastResult === "Incorrect" ? 1 : 0) +
        this.params.lowMasteryBias * (this.params.M - c.mastery) +
        this.params.rarityBias * (1 / (1 + c.seenCount));
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }

  private chooseMode(s: CardState): Mode {
  const allowMC = this.modePrefs.mc;
  const allowTyped = this.modePrefs.typed;

  // If only one enabled, force it
  if (allowMC && !allowTyped) return "MULTIPLE_CHOICE";
  if (!allowMC && allowTyped) return "TYPED_RECALL";

  // Both enabled: original logic
  if (s.mastery < this.params.modeThreshold) return "MULTIPLE_CHOICE";
  if (s.lastResult === "Incorrect") return "TYPED_RECALL";
  return "TYPED_RECALL";
  }

  private generateMCOptions(card: Card, total: number): string[] {
    const correct = card.back;
    const others = this.cards.filter(c => c.id !== card.id);

    // Prefer same domain distractors; else fallback to all
    const sameDomain = card.domain ? others.filter(o => o.domain === card.domain) : [];
    const pool = (sameDomain.length >= total - 1 ? sameDomain : others).map(x => x.back);

    // Optional: bias by similarity (here, crude length difference)
    const sorted = pool
      .filter((x) => normalize(x) !== normalize(correct))
      .sort((a, b) => Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length));

    const distractors = sorted.slice(0, Math.max(0, total - 1));
    const options = shuffle([correct, ...shuffle(distractors).slice(0, total - 1)]);

    // NOTE: for submitAnswer with index semantics, the caller should map index 0 to the correct option.
    // To keep a consistent convention, we can place the correct answer at index 0 and then shuffle an index map at UI layer.
    // But for simplicity here, we return a shuffled array and let UI handle correctness mapping.
    return options;
  }

  private scheduleNext(s: CardState): number {
    const m = s.mastery;
    const buckets = this.params.scheduleBuckets;
    let range: [number, number];
    if (m <= 1) range = buckets.low;
    else if (m <= 3) range = buckets.mid;
    else range = buckets.high;
    const gap = rngInt(range[0], range[1]);
    return this.sessionIndex + gap;
  }

  private updateState(s: CardState, result: Result): void {
    s.seenCount += 1;
    if (result === "Correct" || result === "CorrectMinor") {
      s.streakCorrect += 1;
      s.mastery = Math.min(this.params.M, s.mastery + this.params.promoteBonus);
      s.lastResult = "Correct";
      s.nextDue = this.scheduleNext(s);
    } else if (result === "Incorrect") {
      s.streakCorrect = 0;
      s.wrongCount += 1;
      s.mastery = Math.max(0, Math.floor(s.mastery * this.params.earlyPenalty));
      // reinsert soon (1-2 items later)
      s.nextDue = this.sessionIndex + rngInt(1, 2);
      s.lastResult = "Incorrect";
    } else { // Skip or other
      s.nextDue = this.sessionIndex + 1;
      s.lastResult = "Incorrect"; // treat as not learned
    }
  }
}

///////////////////////////////
// Example (commented)
///////////////////////////////
/**
const deck: Card[] = [
  { id: "1", front: "photosynthesis", back: "quang hợp", domain: "bio" },
  { id: "2", front: "mitochondrion", back: "ti thể", domain: "bio" },
  { id: "3", front: "gravity", back: "trọng lực", domain: "physics" },
  { id: "4", front: "electron", back: "điện tử", domain: "physics" },
];

const engine = new LearnEngine({ cards: deck });

while (!engine.isFinished()) {
  const q = engine.nextQuestion();
  if (!q) break;
  if (q.mode === "MULTIPLE_CHOICE") {
    console.log("Q:", q.prompt, q.options);
    // suppose user picks index i:
    const res = engine.submitAnswer(q.cardId, 0); // pretend index 0 is correct in UI mapping
    console.log("result:", res);
  } else {
    console.log("Q:", q.prompt, "[typed]");
    const res = engine.submitAnswer(q.cardId, "some user input");
    console.log("result:", res);
  }
}
*/
