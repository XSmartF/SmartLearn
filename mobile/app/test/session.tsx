import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn, SlideInRight, ZoomIn } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { MobileTestQuestion } from '@/shared/models/app';
import { testRepository } from '@/shared/services';
import { useI18n } from '@/shared/i18n';
import { Brand, Colors, NeuShadow, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Screen, SectionCard, DarkCard, GlassCard } from '@/shared/ui/screen';

import { Badge } from '@/components/ui/Badge';
import { IllustrationIcon } from '@/components/ui/IllustrationIcon';
import { ResultStat } from '@/components/ui/ResultStat';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';

type Phase = 'loading' | 'answering' | 'revealed' | 'result';

export default function TestSessionScreen() {
  const { locale } = useI18n();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const { libraryId, questionCount } = useLocalSearchParams<{ libraryId: string; questionCount: string }>();

  const [questions, setQuestions] = useState<MobileTestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');

  /* ── Load questions ── */
  useEffect(() => {
    if (!libraryId) return;
    testRepository
      .buildTestSession(libraryId, Number(questionCount) || 10)
      .then((qs) => {
        setQuestions(qs);
        setPhase(qs.length > 0 ? 'answering' : 'result');
      })
      .catch(() => setPhase('result'));
  }, [libraryId, questionCount]);

  const current = questions[currentIdx];
  const total = questions.length;
  const progressFraction = total > 0 ? (currentIdx + 1) / total : 0;

  /* ── Submit answer ── */
  const submit = () => {
    if (!current) return;
    const correct = userAnswer.trim().toLowerCase() === current.answer.trim().toLowerCase();
    setResults((prev) => [...prev, correct]);
    setPhase('revealed');
  };

  /* ── Next / Finish ── */
  const next = () => {
    if (currentIdx + 1 >= total) {
      setPhase('result');
    } else {
      setCurrentIdx((i) => i + 1);
      setUserAnswer('');
      setPhase('answering');
    }
  };

  /* ── Score ── */
  const correctCount = results.filter(Boolean).length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) || 0 : 0;

  /* ── Loading ── */
  if (phase === 'loading') {
    return (
      <Screen>
        <Animated.View entering={FadeIn.duration(400)}>
          <GlassCard>
            <View style={styles.loadingRow}>
              <MaterialIcons name="hourglass-top" size={28} color={Brand.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {locale === 'vi' ? 'Đang tạo bài kiểm tra…' : 'Building your test…'}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </Screen>
    );
  }

  /* ── Result Screen ── */
  if (phase === 'result') {
    const emoji = scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '💪';
    const badgeVariant = scorePercent >= 80 ? 'success' : scorePercent >= 50 ? 'warning' : 'destructive';
    return (
      <Screen>
        <Animated.View entering={ZoomIn.duration(500).springify()}>
          <DarkCard>
            <View style={styles.resultHero}>
              <CircularProgress value={scorePercent} size={120} strokeWidth={12} color={scorePercent >= 80 ? Brand.chart3 : scorePercent >= 50 ? Brand.chart4 : Brand.error} />
              <Text style={styles.resultEmoji}>{emoji}</Text>
              <Text style={styles.resultTitle}>
                {locale === 'vi' ? 'Kết quả kiểm tra' : 'Test Results'}
              </Text>
              <Badge variant={badgeVariant as any}>{scorePercent}%</Badge>
            </View>
          </DarkCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
          <GlassCard>
            <View style={styles.resultStats}>
              <ResultStat
                icon="check-circle"
                color={Brand.chart3}
                label={locale === 'vi' ? 'Đúng' : 'Correct'}
                value={correctCount.toString()}
              />
              <ResultStat
                icon="cancel"
                color={Brand.error}
                label={locale === 'vi' ? 'Sai' : 'Wrong'}
                value={(total - correctCount).toString()}
              />
              <ResultStat
                icon="help"
                color={Brand.primary}
                label={locale === 'vi' ? 'Tổng' : 'Total'}
                value={total.toString()}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Question breakdown */}
        <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
          <SectionCard>
            <View style={styles.sectionHeader}>
              <IllustrationIcon icon="list" variant="info" size="sm" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {locale === 'vi' ? 'Chi tiết' : 'Breakdown'}
              </Text>
            </View>

            {questions.map((q, idx) => {
              const wasCorrect = results[idx];
              return (
                <Animated.View key={q.id} entering={FadeInDown.delay(400 + idx * 50).duration(350)}>
                  <View style={[styles.breakdownItem, { borderColor: isDark ? Brand.darkBorder : Brand.lightBorder }]}>
                    <View style={[styles.breakdownDot, { backgroundColor: wasCorrect ? Brand.chart3 : Brand.error }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.breakdownPrompt, { color: colors.text }]}>{q.prompt}</Text>
                      <Text style={[styles.breakdownAnswer, { color: colors.textSecondary }]}>
                        {locale === 'vi' ? 'Đáp án: ' : 'Answer: '}{q.answer}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={wasCorrect ? 'check-circle' : 'cancel'}
                      size={20}
                      color={wasCorrect ? Brand.chart3 : Brand.error}
                    />
                  </View>
                </Animated.View>
              );
            })}
          </SectionCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(500).springify()}>
          <View style={styles.resultActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.resultBtn, styles.resultBtnOutline, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back" size={18} color={Brand.primary} />
              <Text style={[styles.resultBtnText, { color: Brand.primary }]}>
                {locale === 'vi' ? 'Quay lại' : 'Go Back'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setCurrentIdx(0);
                setUserAnswer('');
                setResults([]);
                setPhase('loading');
                testRepository
                  .buildTestSession(libraryId!, Number(questionCount) || 10)
                  .then((qs) => { setQuestions(qs); setPhase(qs.length > 0 ? 'answering' : 'result'); });
              }}
              style={({ pressed }) => [styles.resultBtn, styles.resultBtnPrimary, pressed && styles.pressed]}
            >
              <MaterialIcons name="replay" size={18} color="#fff" />
              <Text style={[styles.resultBtnText, { color: '#fff' }]}>
                {locale === 'vi' ? 'Làm lại' : 'Retry'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Screen>
    );
  }

  /* ── Answering / Revealed ── */
  return (
    <Screen>
      {/* Progress bar */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <GlassCard>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {locale === 'vi' ? 'Câu' : 'Q'} {currentIdx + 1}/{total}
            </Text>
            <Badge variant="default">{Math.round(progressFraction * 100)}%</Badge>
          </View>
          <ProgressBar label="" value={Math.round(progressFraction * 100)} color={Brand.primary} />
        </GlassCard>
      </Animated.View>

      {/* Question card */}
      <Animated.View key={`q-${currentIdx}`} entering={SlideInRight.duration(350).springify()}>
        <SectionCard>
          <View style={styles.questionHeader}>
            <IllustrationIcon icon="help-outline" variant="info" size="md" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>
                {locale === 'vi' ? `Câu hỏi ${currentIdx + 1}` : `Question ${currentIdx + 1}`}
              </Text>
            </View>
          </View>
          <Text style={[styles.questionPrompt, { color: colors.text }]}>{current?.prompt}</Text>
        </SectionCard>
      </Animated.View>

      {/* Answer input */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <SectionCard>
          <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
            {locale === 'vi' ? 'Câu trả lời của bạn' : 'Your Answer'}
          </Text>
          <TextInput
            value={userAnswer}
            onChangeText={setUserAnswer}
            editable={phase === 'answering'}
            multiline
            style={[
              styles.answerInput,
              {
                backgroundColor: colors.inputBg,
                borderColor: phase === 'revealed'
                  ? (results[currentIdx] ? Brand.chart3 : Brand.error)
                  : colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={locale === 'vi' ? 'Nhập đáp án…' : 'Type your answer…'}
            placeholderTextColor={colors.textSecondary}
          />

          {/* Revealed: show correct answer */}
          {phase === 'revealed' && (
            <Animated.View entering={FadeInUp.duration(350).springify()}>
              <View
                style={[
                  styles.revealCard,
                  {
                    backgroundColor: results[currentIdx]
                      ? `${Brand.chart3}12`
                      : `${Brand.error}12`,
                    borderColor: results[currentIdx] ? `${Brand.chart3}30` : `${Brand.error}30`,
                  },
                ]}
              >
                <MaterialIcons
                  name={results[currentIdx] ? 'check-circle' : 'cancel'}
                  size={22}
                  color={results[currentIdx] ? Brand.chart3 : Brand.error}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: results[currentIdx] ? Brand.chart3 : Brand.error, fontSize: 14 }}>
                    {results[currentIdx]
                      ? (locale === 'vi' ? 'Chính xác!' : 'Correct!')
                      : (locale === 'vi' ? 'Chưa đúng' : 'Incorrect')}
                  </Text>
                  <Text style={[styles.revealAnswer, { color: colors.text }]}>
                    {locale === 'vi' ? 'Đáp án: ' : 'Answer: '}{current?.answer}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </SectionCard>
      </Animated.View>

      {/* Action button */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        {phase === 'answering' ? (
          <Pressable
            onPress={submit}
            disabled={userAnswer.trim().length === 0}
            style={({ pressed }) => [
              styles.actionBtn,
              userAnswer.trim().length === 0 && styles.actionBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="send" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>
              {locale === 'vi' ? 'Nộp đáp án' : 'Submit'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: Brand.chart2 }, pressed && styles.pressed]}
          >
            <MaterialIcons name={currentIdx + 1 >= total ? 'done-all' : 'arrow-forward'} size={18} color="#fff" />
            <Text style={styles.actionBtnText}>
              {currentIdx + 1 >= total
                ? (locale === 'vi' ? 'Xem kết quả' : 'See Results')
                : (locale === 'vi' ? 'Câu tiếp' : 'Next')}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontWeight: '700', fontSize: 13 },

  questionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  questionLabel: { fontSize: 12, fontWeight: '700' },
  questionPrompt: { fontSize: 18, fontWeight: '800', lineHeight: 26 },

  answerLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  answerInput: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  revealCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  revealAnswer: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  actionBtn: {
    borderRadius: Radius.lg,
    backgroundColor: Brand.primary,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...NeuShadow.md,
  },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  actionBtnDisabled: { opacity: 0.45 },

  /* Result screen */
  resultHero: { alignItems: 'center', gap: 10, paddingVertical: 10 },
  resultEmoji: { fontSize: 36 },
  resultTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },

  resultStats: { flexDirection: 'row', justifyContent: 'space-around' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', flex: 1 },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownPrompt: { fontWeight: '700', fontSize: 14 },
  breakdownAnswer: { fontSize: 12, marginTop: 2 },

  resultActions: { flexDirection: 'row', gap: 12 },
  resultBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resultBtnOutline: { borderWidth: 1.5, borderColor: Brand.primary },
  resultBtnPrimary: { backgroundColor: Brand.primary, ...NeuShadow.sm },
  resultBtnText: { fontWeight: '800', fontSize: 15 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', paddingVertical: 20 },
  loadingText: { fontWeight: '700', fontSize: 16 },

  pressed: { opacity: 0.82 },
});
