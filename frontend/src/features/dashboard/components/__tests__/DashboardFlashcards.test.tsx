import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";

import { DashboardFlashcards } from "../flashcards/DashboardFlashcards";
import type { DashboardFlashcardSectionModel } from "../../types";

const makeMatchMedia = (matches: boolean) => (
  query: string
): MediaQueryList => {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  } as unknown as MediaQueryList;
};

const createModel = (count: number): DashboardFlashcardSectionModel => ({
  title: "Bộ flashcard gần đây",
  description: "Tiếp tục từ nơi bạn đã dừng lại",
  isLoading: false,
  items: Array.from({ length: count }, (_, index) => ({
    id: `library-${index}`,
    title: `Bộ số ${index + 1}`,
    progressPercent: 50,
    totalCards: 100,
    masteredCards: 25,
    accuracyPercent: 80,
    sessions: 4,
    ownerName: undefined,
    isOwned: true,
    continueHref: `/study/library-${index}`,
  })),
  emptyState: {
    title: "Chưa có bộ flashcard gần đây",
    description: "Hãy tạo hoặc mở một bộ flashcard để bắt đầu hành trình học tập.",
    actionHref: "/libraries",
    actionLabel: "Quản lý thư viện",
  },
});

describe("DashboardFlashcards", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("giới hạn tối đa 6 bộ flashcard trên màn hình lớn", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(makeMatchMedia(true));
    const model = createModel(12);

    const { container } = render(
      <MemoryRouter>
        <DashboardFlashcards model={model} />
      </MemoryRouter>
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(6);
  });

  it("chỉ hiển thị 4 bộ flashcard khi dưới ngưỡng màn hình lớn", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(makeMatchMedia(false));
    const model = createModel(12);

    const { container } = render(
      <MemoryRouter>
        <DashboardFlashcards model={model} />
      </MemoryRouter>
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(4);
  });
});
