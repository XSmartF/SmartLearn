import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { buildDashboardEventsSectionModel } from "../events";
import type { DashboardSources } from "../../data/useDashboardSources";
import type { StudyEvent } from "@/features/study/types/calendar";

const createStudyEvent = (overrides: Partial<StudyEvent> = {}): StudyEvent => ({
  id: overrides.id ?? "event-1",
  userId: overrides.userId ?? "user-1",
  title: overrides.title ?? "Sự kiện",
  description: overrides.description ?? "Mô tả",
  startTime: overrides.startTime ?? new Date(Date.now() + 60 * 60 * 1000),
  endTime: overrides.endTime ?? new Date(Date.now() + 2 * 60 * 60 * 1000),
  type: overrides.type ?? "review",
  flashcardSet: overrides.flashcardSet ?? "Bộ cơ bản",
  cardCount: overrides.cardCount ?? 20,
  status: overrides.status ?? "upcoming",
  createdAt: overrides.createdAt ?? new Date(),
  updatedAt: overrides.updatedAt ?? new Date(),
  autoScheduled: overrides.autoScheduled ?? false,
  lastChoice: overrides.lastChoice,
  libraryId: overrides.libraryId,
  cardId: overrides.cardId,
  completedAt: overrides.completedAt,
});

const createSources = (events: StudyEvent[]): DashboardSources => ({
  user: null,
  isDarkMode: false,
  palette: {
    focus: "#000",
    review: "#111",
    axis: "#222",
    grid: "#333",
    radial: ["#000"],
  },
  libsLoading: false,
  ownedLibraries: [],
  sharedLibraries: [],
  allLibraries: [],
  favorites: [],
  favoriteIds: [],
  summaries: {},
  ownerProfiles: {},
  studyEvents: events,
});

describe("buildDashboardEventsSectionModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gán nhãn tiếng Việt cho loại sự kiện", () => {
    const studyEvents = [
      createStudyEvent({
        id: "event-review",
        type: "review",
        startTime: new Date("2024-06-02T07:00:00.000Z"),
      }),
    ];

    const model = buildDashboardEventsSectionModel(createSources(studyEvents));
    expect(model.items).toHaveLength(1);
    const [event] = model.items;
    expect(event.type).toBe("review");
    expect(event.typeLabel).toBe("Phiên ôn tập");
    expect(event.relativeTime).toContain("ngày");
  });

  it("loại bỏ sự kiện đã qua và giới hạn số lượng tối đa", () => {
    const studyEvents = [
      createStudyEvent({
        id: "past-event",
        startTime: new Date("2024-05-01T05:00:00.000Z"),
      }),
      ...Array.from({ length: 8 }, (_, index) =>
        createStudyEvent({
          id: `upcoming-${index}`,
          startTime: new Date(`2024-06-${index + 2}T03:00:00.000Z`),
        })
      ),
    ];

    const model = buildDashboardEventsSectionModel(createSources(studyEvents));

    expect(model.items.every((item) => item.scheduledAt.getTime() >= Date.now())).toBe(true);
    expect(model.items).toHaveLength(5);
  });
});
