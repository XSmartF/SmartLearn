import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn, SlideInRight } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { MobileCard } from '@/shared/models/app';
import { mobileDataService } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ResultStat } from '@/components/ui/ResultStat';
import { ProgressBar } from '@/components/ui/ProgressBar';

import { LearnEngine, type Question, type Result, type ProgressSummary } from '@/shared/study/learnEngine';

type Phase = 'loading' | 'question' | 'answered' | 'finished';

export default function StudySessionScreen() {
  const { locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const { libraryId } = useLocalSearchParams<{ libraryId: string }>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [question, setQuestion] = useState<Question | null>(null);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [libraryTitle, setLibraryTitle] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const engineRef = useRef<LearnEngine | null>(null);

  /* ── Load library cards & init engine ── */
  useEffect(() => {
    if (!libraryId) return;
    mobileDataService.getLibraryDetail(libraryId).then((detail) => {
      if (!detail || detail.cards.length === 0) {
        setPhase('finished');
        return;
      }
      setLibraryTitle(detail.library.title);
      const cards = detail.cards.map((c: MobileCard) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        difficulty: c.difficulty,
      }));
      const engine = new LearnEngine(cards);
      engineRef.current = engine;
      advanceQuestion(engine);
    });
  }, [libraryId]);

  const advanceQuestion = (engine: LearnEngine) => {
    const q = engine.nextQuestion();
    if (!q) {
      setPhase('finished');
    } else {
      setQuestion(q);
      setPhase('question');
      setLastResult(null);
      setUserAnswer('');
      setSelectedOption(null);
      setShowHint(false);
      setCorrectAnswer('');
    }
    setProgress(engine.getProgress());
  };

  /* ── Submit answer ── */
  const handleSubmitMC = (optionIndex: number) => {
    const engine = engineRef.current;
    if (!engine || !question || phase !== 'question') return;
    setSelectedOption(optionIndex);

    const q = question as Extract<Question, { mode: 'MULTIPLE_CHOICE' }>;
    const result = engine.submitAnswer(q.cardId, q.options[optionIndex]);
    setLastResult(result);
    setCorrectAnswer(engine.getCorrectAnswer(q.cardId));
    setProgress(engine.getProgress());
    setPhase('answered');
  };

  const handleSubmitTyped = () => {
    const engine = engineRef.current;
    if (!engine || !question || phase !== 'question') return;
    if (!userAnswer.trim()) return;

    const result = engine.submitAnswer(question.cardId, userAnswer.trim());
    setLastResult(result);
    setCorrectAnswer(engine.getCorrectAnswer(question.cardId));
    setProgress(engine.getProgress());
    setPhase('answered');
  };

  const handleDontKnow = () => {
    const engine = engineRef.current;
    if (!engine || !question) return;
    const result = engine.submitAnswer(question.cardId, null);
    setLastResult(result);
    setCorrectAnswer(engine.getCorrectAnswer(question.cardId));
    setProgress(engine.getProgress());
    setPhase('answered');
  };

  const handleNext = () => {
    const engine = engineRef.current;
    if (!engine) return;
    advanceQuestion(engine);
  };

  const handleRestart = () => {
    if (!libraryId) return;
    setPhase('loading');
    mobileDataService.getLibraryDetail(libraryId).then((detail) => {
      if (!detail || detail.cards.length === 0) {
        setPhase('finished');
        return;
      }
      const cards = detail.cards.map((c: MobileCard) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        difficulty: c.difficulty,
      }));
      const engine = new LearnEngine(cards);
      engineRef.current = engine;
      advanceQuestion(engine);
    });
  };

  const handleShowHint = () => {
    if (!question || !engineRef.current) return;
    setShowHint(true);
  };

  const vi = locale === 'vi';
  const pct = progress?.percentMastered ?? 0;

  /* ── LOADING ── */
  if (phase === 'loading') {
    return (
      <Screen>
        <Animated.View entering={FadeIn.duration(400)}>
          <GlassCard>
            <View style={styles.loadingRow}>
              <MaterialIcons name="hourglass-top" size={28} color={Brand.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {vi ? 'Đang chuẩn bị phiên học…' : 'Preparing study session…'}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </Screen>
    );
  }

  /* ── FINISHED ── */
  if (phase === 'finished') {
    const accuracy = progress ? Math.round(progress.accuracy * 100) : 0;
    const emoji = accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👍' : '💪';
    const badgeVariant = accuracy >= 80 ? 'success' : accuracy >= 50 ? 'warning' : 'destructive';
    return (
      <Screen>
        <Animated.View entering={ZoomIn.duration(500).springify()}>
          <DarkCard>
            <View style={styles.resultHero}>
              <CircularProgress value={pct} size={120} strokeWidth={12} color={Brand.chart3} />
              <Text style={styles.resultEmoji}>{emoji}</Text>
              <Text style={styles.resultTitle}>
                {vi ? 'Hoàn thành phiên học!' : 'Session Complete!'}
              </Text>
              {progress && progress.asked > 0 && (
                <Badge variant={badgeVariant as any}>
                  {vi ? `Chính xác: ${accuracy}%` : `Accuracy: ${accuracy}%`}
                </Badge>
              )}
            </View>
          </DarkCard>
        </Animated.View>

        {progress && progress.asked > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
            <GlassCard>
              <View style={styles.resultStats}>
                <ResultStat icon="school" color={Brand.primary} label={vi ? 'Đã hỏi' : 'Asked'} value={progress.asked.toString()} />
                <ResultStat icon="check-circle" color={Brand.chart3} label={vi ? 'Đúng' : 'Correct'} value={progress.correct.toString()} />
                <ResultStat icon="star" color={Brand.chart4} label={vi ? 'Thành thạo' : 'Mastered'} value={`${progress.mastered}/${progress.total}`} />
              </View>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
          <View style={styles.resultActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.resultBtn, styles.resultBtnOutline, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back" size={18} color={Brand.primary} />
              <Text style={[styles.resultBtnText, { color: Brand.primary }]}>
                {vi ? 'Quay lại' : 'Go Back'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleRestart}
              style={({ pressed }) => [styles.resultBtn, styles.resultBtnPrimary, pressed && styles.pressed]}
            >
              <MaterialIcons name="replay" size={18} color="#fff" />
              <Text style={[styles.resultBtnText, { color: '#fff' }]}>
                {vi ? 'Học lại' : 'Study Again'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Screen>
    );
  }

  /* ── QUESTION / ANSWERED ── */
  const isAnswered = phase === 'answered';
  const isCorrect = lastResult === 'Correct' || lastResult === 'CorrectMinor';
  const isMC = question?.mode === 'MULTIPLE_CHOICE';

  return (
    <Screen>
      {/* ── Header with progress ── */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <DarkCard>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{libraryTitle}</Text>
              <Text style={styles.headerSub}>
                {vi ? 'Chế độ học' : 'Study mode'}
                {progress ? ` · ${progress.mastered}/${progress.total}` : ''}
              </Text>
            </View>
            <Badge variant="default">{pct}%</Badge>
          </View>
          <ProgressBar value={pct} color={Brand.chart3} height={4} />
        </DarkCard>
      </Animated.View>

      {/* ── Question Card ── */}
      <Animated.View key={question?.cardId} entering={SlideInRight.duration(350).springify()}>
        <SectionCard>
          {/* Mode badge */}
          <View style={styles.modeBadgeRow}>
            <Badge variant={isMC ? 'default' : 'secondary'}>
              {isMC
                ? (vi ? 'Trắc nghiệm' : 'Multiple Choice')
                : (vi ? 'Gõ câu trả lời' : 'Type Answer')}
            </Badge>
            {progress && (
              <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
                {vi ? `Đã hỏi: ${progress.asked}` : `Asked: ${progress.asked}`}
              </Text>
            )}
          </View>

          {/* Prompt */}
          <View style={[styles.promptBox, { backgroundColor: isDark ? Brand.darkSurface : `${Brand.primary}08` }]}>
            <Text style={[styles.promptText, { color: colors.text }]}>{question?.prompt}</Text>
          </View>

          {/* Hint */}
          {question?.mode === 'TYPED_RECALL' && !isAnswered && (
            <View style={styles.hintRow}>
              {showHint && question.hint ? (
                <Text style={[styles.hintText, { color: Brand.chart4 }]}>💡 {question.hint}</Text>
              ) : (
                <Pressable onPress={handleShowHint} style={styles.hintBtn}>
                  <MaterialIcons name="lightbulb-outline" size={16} color={Brand.chart4} />
                  <Text style={{ color: Brand.chart4, fontSize: 13, fontWeight: '600' }}>
                    {vi ? 'Gợi ý' : 'Hint'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ── MC Options ── */}
          {isMC && question && (
            <View style={styles.optionsGrid}>
              {(question as Extract<Question, { mode: 'MULTIPLE_CHOICE' }>).options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOpt = isAnswered && opt.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                const isWrongSelected = isAnswered && isSelected && !isCorrectOpt;

                let optBg: string = isDark ? Brand.darkSurface : Brand.gray100;
                let optBorder: string = isDark ? Brand.darkBorder : Brand.lightBorder;
                let optTextColor: string = colors.text;

                if (isAnswered) {
                  if (isCorrectOpt) {
                    optBg = `${Brand.success}18`;
                    optBorder = Brand.success;
                    optTextColor = Brand.success;
                  } else if (isWrongSelected) {
                    optBg = `${Brand.error}18`;
                    optBorder = Brand.error;
                    optTextColor = Brand.error;
                  }
                } else if (isSelected) {
                  optBg = `${Brand.primary}18`;
                  optBorder = Brand.primary;
                }

                return (
                  <Pressable
                    key={idx}
                    disabled={isAnswered}
                    onPress={() => handleSubmitMC(idx)}
                    style={[styles.optionBtn, { backgroundColor: optBg, borderColor: optBorder }]}
                  >
                    <View style={[styles.optionLetter, {
                      backgroundColor: isAnswered
                        ? (isCorrectOpt ? Brand.success : isWrongSelected ? Brand.error : `${Brand.primary}20`)
                        : `${Brand.primary}20`,
                    }]}>
                      <Text style={{
                        color: isAnswered ? (isCorrectOpt || isWrongSelected ? '#fff' : Brand.primary) : Brand.primary,
                        fontWeight: '800',
                        fontSize: 13,
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, { color: optTextColor }]} numberOfLines={3}>{opt}</Text>
                    {isAnswered && isCorrectOpt && <MaterialIcons name="check-circle" size={18} color={Brand.success} />}
                    {isAnswered && isWrongSelected && <MaterialIcons name="cancel" size={18} color={Brand.error} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ── Typed Recall Input ── */}
          {!isMC && !isAnswered && (
            <View style={styles.typedArea}>
              <TextInput
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder={vi ? 'Nhập câu trả lời…' : 'Type your answer…'}
                placeholderTextColor={Brand.gray400}
                style={[styles.typedInput, {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }]}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmitTyped}
              />
              <View style={styles.typedActions}>
                <Pressable onPress={handleDontKnow} style={[styles.dontKnowBtn]}>
                  <MaterialIcons name="visibility" size={16} color={Brand.chart4} />
                  <Text style={{ color: Brand.chart4, fontWeight: '700', fontSize: 13 }}>
                    {vi ? 'Không biết' : "Don't know"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmitTyped}
                  style={({ pressed }) => [styles.checkBtn, pressed && styles.pressed]}
                >
                  <MaterialIcons name="check" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                    {vi ? 'Kiểm tra' : 'Check'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Answer Feedback ── */}
          {isAnswered && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={[
                styles.feedbackBox,
                { backgroundColor: isCorrect ? `${Brand.success}12` : `${Brand.error}12` },
              ]}>
                <View style={styles.feedbackHeader}>
                  <MaterialIcons
                    name={isCorrect ? 'check-circle' : 'cancel'}
                    size={22}
                    color={isCorrect ? Brand.success : Brand.error}
                  />
                  <Text style={[styles.feedbackTitle, { color: isCorrect ? Brand.success : Brand.error }]}>
                    {isCorrect
                      ? (lastResult === 'CorrectMinor'
                        ? (vi ? 'Gần đúng!' : 'Close enough!')
                        : (vi ? 'Chính xác!' : 'Correct!'))
                      : (vi ? 'Chưa đúng' : 'Incorrect')}
                  </Text>
                </View>
                {!isCorrect && (
                  <Text style={[styles.feedbackAnswer, { color: colors.text }]}>
                    {vi ? 'Đáp án: ' : 'Answer: '}
                    <Text style={{ fontWeight: '800', color: Brand.success }}>{correctAnswer}</Text>
                  </Text>
                )}
              </View>

              {/* Next button */}
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
              >
                <Text style={styles.nextBtnText}>{vi ? 'Tiếp theo' : 'Next'}</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </Animated.View>
          )}
        </SectionCard>
      </Animated.View>

      {/* ── Progress Summary ── */}
      {progress && progress.asked > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlassCard>
            <View style={styles.miniStats}>
              <MiniStat label={vi ? 'Đúng' : 'Correct'} value={progress.correct} color={Brand.success} />
              <MiniStat label={vi ? 'Sai' : 'Wrong'} value={progress.asked - progress.correct} color={Brand.error} />
              <MiniStat label={vi ? 'Thành thạo' : 'Mastered'} value={progress.mastered} color={Brand.chart3} />
              <MiniStat label={vi ? 'Còn lại' : 'Remaining'} value={progress.learning + progress.fresh} color={Brand.primary} />
            </View>
          </GlassCard>
        </Animated.View>
      )}
    </Screen>
  );
}

/* ── Small components ── */

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniStatItem}>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  loadingText: { fontSize: 16, fontWeight: '700' },

  /* Header */
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${Brand.primary}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  headerSub: { color: Brand.gray400, fontSize: 12, fontWeight: '600', marginTop: 1 },

  /* Question */
  modeBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  questionCounter: { fontSize: 12, fontWeight: '600' },
  promptBox: { borderRadius: Radius.lg, padding: 20, marginBottom: 12, minHeight: 80, justifyContent: 'center' },
  promptText: { fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 28 },

  /* Hint */
  hintRow: { marginBottom: 8 },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  hintText: { fontSize: 14, fontWeight: '600', fontStyle: 'italic' },

  /* MC Options */
  optionsGrid: { gap: 8 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: Radius.md, padding: 12,
  },
  optionLetter: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600' },

  /* Typed */
  typedArea: { gap: 10 },
  typedInput: {
    borderRadius: Radius.md, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 16, fontWeight: '600',
  },
  typedActions: { flexDirection: 'row', gap: 10 },
  dontKnowBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Brand.chart4,
    paddingVertical: 12,
  },
  checkBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: Radius.md, backgroundColor: Brand.primary,
    paddingVertical: 12, ...NeuShadow.sm,
  },

  /* Feedback */
  feedbackBox: { borderRadius: Radius.md, padding: 14, marginTop: 10, gap: 6 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackTitle: { fontSize: 16, fontWeight: '800' },
  feedbackAnswer: { fontSize: 14, fontWeight: '600', paddingLeft: 30 },

  /* Next */
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.md, backgroundColor: Brand.primary,
    paddingVertical: 14, marginTop: 12, ...NeuShadow.sm,
  },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.82 },

  /* Result */
  resultHero: { alignItems: 'center', gap: 10, paddingVertical: 10 },
  resultEmoji: { fontSize: 40 },
  resultTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  resultStats: { flexDirection: 'row', justifyContent: 'space-around' },
  resultActions: { flexDirection: 'row', gap: 10 },
  resultBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.md, paddingVertical: 14,
  },
  resultBtnOutline: { borderWidth: 1.5, borderColor: Brand.primary },
  resultBtnPrimary: { backgroundColor: Brand.primary, ...NeuShadow.sm },
  resultBtnText: { fontWeight: '800', fontSize: 15 },

  /* Mini stats */
  miniStats: { flexDirection: 'row', justifyContent: 'space-around' },
  miniStatItem: { alignItems: 'center', gap: 2 },
  miniStatValue: { fontSize: 18, fontWeight: '800' },
  miniStatLabel: { fontSize: 11, color: Brand.gray400, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', flex: 1 },
});
