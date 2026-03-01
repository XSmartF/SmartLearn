/**
 * LearnEngine – Adaptive flashcard study engine (mobile port).
 *
 * Simplified version of the web LearnEngine:
 *   - Multiple Choice + Typed Recall modes
 *   - Group-based learning (7 cards at a time)
 *   - SM-2 inspired ease factor & spaced scheduling
 *   - Fuzzy answer matching (no fuse.js dependency)
 */

/* ── Domain Types ─────────────────────────────────── */

export type Mode = 'MULTIPLE_CHOICE' | 'TYPED_RECALL';
export type Result = 'Correct' | 'CorrectMinor' | 'Incorrect' | 'Skip';
export type DifficultyChoice = 'veryHard' | 'hard' | 'again' | 'normal';

export interface Card {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CardState {
  id: string;
  mastery: number;          // 0..5
  streakCorrect: number;
  lastResult: Result | 'New';
  nextDue: number;           // session-relative index
  seenCount: number;
  wrongCount: number;
  easeFactor: number;        // SM-2, default 2.5
  lastInterval: number;
  wrongStreak: number;
  addedToGroupAt?: number;
}

export interface QuestionMC {
  mode: 'MULTIPLE_CHOICE';
  cardId: string;
  prompt: string;
  options: string[];          // 1 correct, shuffled
}

export interface QuestionTyped {
  mode: 'TYPED_RECALL';
  cardId: string;
  prompt: string;
  hint?: string;
  fullAnswer: string;
}

export type Question = QuestionMC | QuestionTyped;

export interface ProgressSummary {
  total: number;
  mastered: number;
  learning: number;
  fresh: number;
  percentMastered: number;   // 0..100
  accuracy: number;          // 0..1
  asked: number;
  correct: number;
}

/* ── Config ───────────────────────────────────────── */

interface Params {
  M: number;                 // max mastery
  modeThreshold: number;     // mastery >= → prefer typed
  mcOptions: number;
  earlyPenalty: number;
  promoteBonus: number;
  overdueBias: number;
  wrongBias: number;
  lowMasteryBias: number;
  rarityBias: number;
}

const DEFAULTS: Params = {
  M: 5,
  modeThreshold: 2,
  mcOptions: 4,
  earlyPenalty: 0.4,
  promoteBonus: 1,
  overdueBias: 1.0,
  wrongBias: 3.0,
  lowMasteryBias: 2.0,
  rarityBias: 0.5,
};

/* ── Utilities ────────────────────────────────────── */

function rngInt(min: number, max: number) {
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
    .normalize('NFC')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein edit distance */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function similarity(input: string, answer: string): number {
  const a = normalize(input);
  const b = normalize(answer);
  if (a === b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  return 1 - editDistance(a, b) / maxLen;
}

/* ── Engine ───────────────────────────────────────── */

export class LearnEngine {
  private cards: Card[];
  private state = new Map<string, CardState>();
  private params: Params;
  private sessionIndex = 0;
  private asked = 0;
  private correct = 0;
  private incorrect = 0;
  private answerSide: 'front' | 'back' = 'back';

  // Group-based learning
  private currentGroup: CardState[] = [];
  private nextCardIndex = 0;
  private readonly groupSize = 7;
  private reviewQueue: string[] = [];

  constructor(cards: Card[], params?: Partial<Params>) {
    this.cards = cards.slice();
    this.params = { ...DEFAULTS, ...params };
    for (const c of this.cards) {
      this.state.set(c.id, {
        id: c.id,
        mastery: 0,
        streakCorrect: 0,
        lastResult: 'New',
        nextDue: 0,
        seenCount: 0,
        wrongCount: 0,
        easeFactor: 2.5,
        lastInterval: 1,
        wrongStreak: 0,
        addedToGroupAt: 0,
      });
    }
    this.initializeGroup();
  }

  /* ── Public API ──────────────────────────────────── */

  isFinished(): boolean {
    for (const s of this.state.values()) {
      if (s.mastery < this.params.M) return false;
    }
    return this.currentGroup.length === 0;
  }

  nextQuestion(): Question | null {
    if (this.isFinished()) return null;

    let candidates = this.currentGroup.filter(s => s.mastery < this.params.M);
    if (candidates.length === 0) {
      this.addNextCard();
      candidates = this.currentGroup.filter(s => s.mastery < this.params.M);
      if (candidates.length === 0) return null;
    }

    // Check review queue first
    if (this.reviewQueue.length > 0) {
      const rId = this.reviewQueue.shift()!;
      const rs = candidates.find(s => s.id === rId);
      if (rs) return this.buildQuestion(rs);
    }

    // Pick best candidate
    const due = candidates.filter(s => s.nextDue <= this.sessionIndex);
    const pool = due.length > 0 ? due : candidates;
    const picked = this.selectNext(pool);
    return picked ? this.buildQuestion(picked) : null;
  }

  submitAnswer(cardId: string, rawAnswer: string | number | null): Result {
    const s = this.state.get(cardId);
    if (!s) throw new Error('Unknown card');
    const card = this.getCard(cardId);
    const correctAnswer = this.answerSide === 'back' ? card.back : card.front;

    let result: Result = 'Incorrect';
    let quality = 0;
    const mode = this.chooseMode(s);

    if (mode === 'MULTIPLE_CHOICE') {
      if (typeof rawAnswer === 'number') {
        result = rawAnswer === 0 ? 'Correct' : 'Incorrect';
        quality = rawAnswer === 0 ? 5 : 0;
      } else if (typeof rawAnswer === 'string') {
        const match = normalize(rawAnswer) === normalize(correctAnswer);
        result = match ? 'Correct' : 'Incorrect';
        quality = match ? 5 : 0;
      }
    } else {
      const sim = similarity(String(rawAnswer ?? ''), correctAnswer);
      if (sim >= 0.9) { result = 'Correct'; quality = 5; }
      else if (sim >= 0.7) { result = 'CorrectMinor'; quality = 4; }
      else { result = 'Incorrect'; quality = 0; }
    }

    // Update ease factor
    s.easeFactor = Math.max(1.3, s.easeFactor + (quality >= 3 ? 0.1 : -0.2));

    this.updateState(s, result);
    this.asked++;
    if (result === 'Correct' || result === 'CorrectMinor') this.correct++;
    else this.incorrect++;
    this.sessionIndex++;
    return result;
  }

  getProgress(): ProgressSummary {
    let mastered = 0, learning = 0, fresh = 0;
    for (const s of this.state.values()) {
      if (s.mastery >= this.params.M) mastered++;
      else if (s.seenCount > 0) learning++;
      else fresh++;
    }
    const total = this.state.size;
    return {
      total,
      mastered,
      learning,
      fresh,
      percentMastered: total ? Math.round((mastered / total) * 100) : 0,
      accuracy: this.asked ? this.correct / this.asked : 0,
      asked: this.asked,
      correct: this.correct,
    };
  }

  getCardState(cardId: string): CardState | undefined {
    return this.state.get(cardId);
  }

  /** Generate hint for current card */
  getHint(cardId: string): string {
    const card = this.getCard(cardId);
    const answer = this.answerSide === 'back' ? card.back : card.front;
    const words = answer.split(' ');
    if (words.length <= 2) return answer.substring(0, Math.ceil(answer.length / 2)) + '…';
    return words.slice(0, Math.floor(words.length / 2)).join(' ') + '…';
  }

  getCorrectAnswer(cardId: string): string {
    const card = this.getCard(cardId);
    return this.answerSide === 'back' ? card.back : card.front;
  }

  /* ── Internals ──────────────────────────────────── */

  private initializeGroup() {
    this.currentGroup = [];
    this.nextCardIndex = 0;
    for (let i = 0; i < this.groupSize && this.nextCardIndex < this.cards.length; i++) {
      const s = this.state.get(this.cards[this.nextCardIndex].id);
      if (s) { s.addedToGroupAt = this.sessionIndex; this.currentGroup.push(s); }
      this.nextCardIndex++;
    }
  }

  private addNextCard() {
    if (this.nextCardIndex >= this.cards.length) return;
    const s = this.state.get(this.cards[this.nextCardIndex].id);
    if (s && !this.currentGroup.find(g => g.id === s.id)) {
      s.addedToGroupAt = this.sessionIndex;
      this.currentGroup.push(s);
    }
    this.nextCardIndex++;
  }

  private removeMastered(cardId: string) {
    this.currentGroup = this.currentGroup.filter(s => s.id !== cardId);
    this.addNextCard();
  }

  private selectNext(pool: CardState[]): CardState | null {
    if (!pool.length) return null;
    let best: CardState | null = null;
    let bestScore = -Infinity;
    const now = this.sessionIndex;
    for (const c of pool) {
      const overdue = Math.max(0, now - c.nextDue);
      const groupAge = now - (c.addedToGroupAt ?? 0);
      const score =
        this.params.overdueBias * overdue +
        this.params.wrongBias * (c.lastResult === 'Incorrect' ? 1 : 0) +
        this.params.lowMasteryBias * (this.params.M - c.mastery) +
        this.params.rarityBias * (1 / (1 + c.seenCount)) +
        0.5 * groupAge;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  private chooseMode(s: CardState): Mode {
    if (s.mastery < this.params.modeThreshold) return 'MULTIPLE_CHOICE';
    return 'TYPED_RECALL';
  }

  private buildQuestion(s: CardState): Question {
    const card = this.getCard(s.id);
    const mode = this.chooseMode(s);
    const prompt = this.answerSide === 'back' ? card.front : card.back;

    if (mode === 'MULTIPLE_CHOICE') {
      const correct = this.answerSide === 'back' ? card.back : card.front;
      const others = this.cards
        .filter(c => c.id !== card.id)
        .map(c => (this.answerSide === 'back' ? c.back : c.front))
        .filter(t => normalize(t) !== normalize(correct));
      const distractors = shuffle(others).slice(0, Math.max(0, this.params.mcOptions - 1));
      return { mode, cardId: card.id, prompt, options: shuffle([correct, ...distractors]) };
    }

    const answer = this.answerSide === 'back' ? card.back : card.front;
    const hint = s.mastery < 2 && s.wrongCount > 0 ? this.getHint(card.id) : undefined;
    return { mode, cardId: card.id, prompt, hint, fullAnswer: answer };
  }

  private scheduleNext(s: CardState): number {
    let interval: number;
    if (s.lastInterval === 1) interval = 1;
    else if (s.lastInterval === 2) interval = 6;
    else interval = Math.round(s.lastInterval * s.easeFactor);
    s.lastInterval = interval;
    return this.sessionIndex + interval;
  }

  private updateState(s: CardState, result: Result) {
    s.seenCount++;
    if (result === 'Correct' || result === 'CorrectMinor') {
      s.streakCorrect++;
      s.wrongStreak = 0;
      const bonus = Math.floor(s.streakCorrect / 3);
      s.mastery = Math.min(this.params.M, s.mastery + this.params.promoteBonus + bonus);
      s.lastResult = 'Correct';
      s.nextDue = this.scheduleNext(s);
      if (s.mastery >= this.params.M) this.removeMastered(s.id);
    } else if (result === 'Incorrect') {
      const penalty = s.streakCorrect > 2 ? 0.8 : this.params.earlyPenalty;
      s.streakCorrect = 0;
      s.wrongCount++;
      s.wrongStreak++;
      s.mastery = Math.max(0, Math.floor(s.mastery * penalty));
      s.nextDue = this.sessionIndex + rngInt(1, 2);
      s.lastResult = 'Incorrect';
      if (!this.reviewQueue.includes(s.id)) this.reviewQueue.unshift(s.id);
    } else {
      s.nextDue = this.sessionIndex + 1;
      s.lastResult = 'Incorrect';
    }
  }

  private getCard(id: string): Card {
    const c = this.cards.find(x => x.id === id);
    if (!c) throw new Error('Unknown card');
    return c;
  }
}
