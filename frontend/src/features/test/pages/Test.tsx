import { useParams } from "react-router-dom";
import { useTestSessionView } from "@/features/test/hooks/useTestSessionView";
import {
  QuestionCard,
  QuestionNavigator,
  SessionActions,
  SessionEmptyState,
  SessionHeader,
  SessionLoadingState,
  SessionResultView
} from "@/features/test/components/session";

export default function Test() {
  const { id } = useParams<{ id: string }>();
  const libraryId = id ?? "";

  const session = useTestSessionView({ libraryId });

  if (session.status === "loading" || session.status === "generating") {
    return <SessionLoadingState />;
  }

  if (session.status === "empty" && session.config) {
    return <SessionEmptyState libraryId={session.config.libraryId} />;
  }

  if (session.flags?.isCompleted && session.result && session.config) {
    return (
      <SessionResultView
        result={session.result}
        libraryTitle={session.libraryTitle}
        onRetry={session.actions.restart}
        onBackToLibrary={session.actions.goToLibrary}
      />
    );
  }

  if (!session.flags?.isReady || !session.currentQuestion || !session.config) {
    return <SessionLoadingState />;
  }

  const currentQuestionNumber = session.currentIndex + 1;
  const instantFeedback = session.config.showAnswerImmediately;

  return (
    <div className="space-y-6">
      <SessionHeader
        libraryTitle={session.libraryTitle}
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={session.totalQuestions}
        progressPercent={session.progressPercent}
        answeredCount={session.answeredCount}
        timeDisplay={session.time.display}
        isTimeCritical={session.time.isCritical}
        onBack={session.actions.goToSetup}
      />

      <QuestionNavigator
        items={session.navigation.items}
        onSelect={session.actions.selectQuestionIndex}
      />

      <QuestionCard
        question={session.currentQuestion}
        index={session.currentIndex}
        answer={session.currentAnswer}
        showAnswer={session.showAnswer}
        onSelectOption={session.actions.submitAnswer}
        onFillAnswer={session.actions.updateFillAnswer}
        isInstantFeedback={instantFeedback}
      />

      <SessionActions
        canGoPrevious={session.navigation.canGoPrevious}
        canGoNext={session.navigation.canGoNext}
        isLastQuestion={session.navigation.isLastQuestion}
        hasAnswer={session.isCurrentAnswered}
        showAnswer={session.showAnswer}
        instantFeedback={instantFeedback}
        onPrevious={session.actions.goToPreviousQuestion}
        onNext={session.actions.goToNextQuestion}
        onFinish={session.actions.finishTest}
        onReveal={session.actions.revealAnswer}
      />
    </div>
  );
}
