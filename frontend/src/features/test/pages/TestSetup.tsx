import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTestSetupView } from "@/features/test/hooks/useTestSetupView";
import {
  CardScopeSelector,
  QuestionTypeSelector,
  SetupActions,
  SetupHeader,
  SetupNotFoundState,
  SetupSkeleton,
  SetupSummary,
  TestConfigCard
} from "@/features/test/components/setup";
import { getTestPath } from "@/shared/constants/routes";

export default function TestSetup() {
  const { id } = useParams<{ id: string }>();
  const libraryId = id ?? null;
  const navigate = useNavigate();

  const setup = useTestSetupView({ libraryId });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { prefetchGenerator } = setup.actions;

  useEffect(() => {
    if (setup.status === "ready") {
      prefetchGenerator();
    }
  }, [prefetchGenerator, setup.status]);

  const handleStart = async () => {
    if (!setup.canStart || isSubmitting) return;
    setIsSubmitting(true);
    const result = await setup.actions.persistConfig();
    setIsSubmitting(false);
    if (result.success && result.config) {
      navigate(getTestPath(result.config.libraryId));
    }
  };

  const disabledReason = useMemo(() => {
    if (setup.status !== "ready") return "Đang tải dữ liệu, vui lòng đợi.";
    if (!setup.configState.questionTypes.length) return "Chọn ít nhất một dạng câu hỏi.";
    if (setup.configState.questionCountInput === "") return "Nhập số câu hỏi mong muốn.";
    return null;
  }, [setup.configState.questionCountInput, setup.configState.questionTypes.length, setup.status]);

  if (setup.status === "not-found" || !libraryId) {
    return <SetupNotFoundState libraryId={libraryId} isLoading={setup.status === "loading"} />;
  }

  if (setup.status === "loading" || setup.status === "idle") {
    return <SetupSkeleton />;
  }

  return (
    <div className="space-y-6">
      <SetupHeader
        status={setup.status}
        libraryId={libraryId}
        libraryTitle={setup.library.title}
        cardCount={setup.library.cardCount}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <QuestionTypeSelector
          options={setup.questionTypeOptions}
          selected={setup.configState.questionTypes}
          onToggle={setup.actions.toggleQuestionType}
          disabled={isSubmitting}
        />
        <TestConfigCard
          questionCountInput={setup.configState.questionCountInput}
          maxQuestions={setup.configState.maxQuestions}
          hasTimeLimit={setup.configState.hasTimeLimit}
          timeLimit={setup.configState.timeLimit}
          showAnswerImmediately={setup.configState.showAnswerImmediately}
          onQuestionCountChange={setup.actions.updateQuestionCountFromInput}
          onQuestionCountBlur={setup.actions.commitQuestionCount}
          onToggleTimeLimit={setup.actions.toggleTimeLimit}
          onTimeLimitChange={setup.actions.setTimeLimit}
          onToggleShowAnswer={setup.actions.toggleShowAnswer}
          disabled={isSubmitting}
        />
      </div>

      <SetupSummary
        questionCount={setup.configState.questionCount}
        questionTypes={setup.configState.questionTypes}
        questionTypeOptions={setup.questionTypeOptions}
        hasTimeLimit={setup.configState.hasTimeLimit}
        timeLimit={setup.configState.timeLimit}
        showAnswerImmediately={setup.configState.showAnswerImmediately}
        cardPoolSize={setup.cards.poolSize}
      />

      <CardScopeSelector
        cards={setup.cards.filtered}
        selectedIds={setup.cards.selectedIds}
        search={setup.cards.search}
        poolSize={setup.cards.poolSize}
        isOpen={setup.cards.isPickerOpen}
        onSearchChange={setup.actions.setCardSearch}
        onToggleOpen={setup.actions.toggleCardPicker}
        onToggleCard={setup.actions.toggleCardSelection}
        onToggleAll={setup.actions.toggleAllCards}
        disabled={isSubmitting}
      />

      <SetupActions
        canStart={setup.canStart}
        isBusy={isSubmitting}
        cardPoolSize={setup.cards.poolSize}
        disabledReason={disabledReason}
        onStart={handleStart}
        onPrefetch={setup.actions.prefetchGenerator}
      />
    </div>
  );
}
