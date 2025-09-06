// Centralized singleton loaders for dynamically imported heavy modules.
// Ensures stable promise reuse & makes prefetch orchestration simpler.

let testQuestionGeneratorPromise: Promise<typeof import('./testQuestionGenerator')> | null = null;
export function loadTestQuestionGenerator() {
  if (!testQuestionGeneratorPromise) {
    testQuestionGeneratorPromise = import('./testQuestionGenerator');
  }
  return testQuestionGeneratorPromise;
}

// Future: add loaders for other optional heavy modules here (analytics, AI helpers, etc.)
