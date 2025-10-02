import type { Block } from "@blocknote/core";

export type ParseNoteContentResult = {
  content: Block[] | undefined;
  error: Error | null;
};

function isBlockArray(value: unknown): value is Block[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((block) => {
    if (!block || typeof block !== "object") {
      return false;
    }

    const maybeBlock = block as Record<string, unknown>;

    return typeof maybeBlock.type === "string";
  });
}

export function parseNoteContent(rawContent: string | null | undefined): ParseNoteContentResult {
  if (!rawContent) {
    return { content: undefined, error: null };
  }

  if (typeof rawContent !== "string") {
    return { content: undefined, error: new Error("Note content must be a string") };
  }

  try {
    const parsed = JSON.parse(rawContent) as unknown;

    if (isBlockArray(parsed)) {
      return { content: parsed, error: null };
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { blocks?: unknown }).blocks) &&
      isBlockArray((parsed as { blocks: unknown }).blocks)
    ) {
      return { content: (parsed as { blocks: Block[] }).blocks, error: null };
    }

    return { content: undefined, error: new Error("Parsed note content does not match the expected BlockNote format") };
  } catch (error) {
    return {
      content: undefined,
      error: error instanceof Error ? error : new Error("Failed to parse note content"),
    };
  }
}
