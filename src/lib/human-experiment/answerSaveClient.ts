"use client";

/**
 * Mobile-safe answer saving.
 *
 * On phones a save request can reach the database and commit, while the
 * response never makes it back to the browser: the connection drops when
 * switching between Wi-Fi and mobile data, the screen locks, the tab is
 * backgrounded, or the host returns an HTML gateway page (502/504) instead
 * of JSON. The browser then reports "Failed to fetch" / "Load failed" /
 * "The string did not match the expected pattern." even though the answer
 * is already stored.
 *
 * These helpers treat such failures as "unknown", not "failed": they retry
 * once (saves are idempotent merges) and then read the stored answer back
 * before showing an error to the participant.
 */

const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 800;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type SaveResult = { ok: true } | { ok: false; message: string };

/** True when every key in `patch` is stored with the same value. */
export function patchIsStored(
  stored: unknown,
  patch: Record<string, unknown>
): boolean {
  if (!isRecord(stored)) return false;
  return Object.keys(patch).every((key) => stored[key] === patch[key]);
}

class DefiniteError extends Error {}

async function fetchJson(
  input: string,
  init: RequestInit
): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      credentials: "same-origin",
    });

    // Never call response.json() directly: gateway/timeout pages are HTML.
    const text = await response.text();
    let body: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = text ? JSON.parse(text) : null;
      body = isRecord(parsed) ? parsed : null;
    } catch {
      body = null;
    }

    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Save through /api/participant/answers with timeout, one retry and
 * read-back verification.
 */
export async function saveParticipantAnswer(options: {
  sessionId: string;
  experience: 1 | 2 | 3 | 4 | 5;
  patch: Record<string, unknown>;
  markComplete?: boolean;
  fallbackMessage: string;
}): Promise<SaveResult> {
  const { sessionId, experience, patch, markComplete = false } = options;
  const payload = JSON.stringify({ sessionId, experience, patch, markComplete });

  const lastMessage = options.fallbackMessage;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { status, body } = await fetchJson("/api/participant/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (status >= 200 && status < 300 && body?.success === true) {
        return { ok: true };
      }

      // 4xx with a JSON error is a definite rejection: do not retry.
      if (status >= 400 && status < 500 && body) {
        throw new DefiniteError(
          typeof body.error === "string" ? body.error : options.fallbackMessage
        );
      }

      // 5xx or a non-JSON body: outcome unknown, fall through to retry.
    } catch (error) {
      if (error instanceof DefiniteError) {
        return { ok: false, message: error.message };
      }
      console.warn("Answer save attempt failed, outcome unknown:", error);
    }

    if (attempt === 0) await wait(RETRY_DELAY_MS);
  }

  // Both attempts were inconclusive. Check what the server actually stored.
  try {
    const params = new URLSearchParams({
      sessionId,
      experience: String(experience),
    });
    const { status, body } = await fetchJson(
      `/api/participant/answers?${params}`,
      { method: "GET" }
    );

    if (status === 200 && body?.success === true) {
      const stored =
        experience === 5 && isRecord(body.answer)
          ? body.answer.privateReflection
          : body.answer;

      // status/submitted_at are written in the same UPDATE as the answer,
      // so a stored patch also means completion was recorded.
      if (patchIsStored(stored, patch)) return { ok: true };
    }
  } catch (error) {
    console.warn("Answer save verification failed:", error);
  }

  return { ok: false, message: lastMessage };
}

/** Load this participant's own saved answer for one experience. */
export async function loadParticipantAnswer(
  sessionId: string,
  experience: 1 | 2 | 3 | 4 | 5
): Promise<{
  answer: Record<string, unknown>;
  journey: Record<string, unknown>;
}> {
  const params = new URLSearchParams({
    sessionId,
    experience: String(experience),
  });
  const { status, body } = await fetchJson(
    `/api/participant/answers?${params}`,
    { method: "GET" }
  );

  if (status !== 200 || body?.success !== true) {
    throw new Error(
      typeof body?.error === "string" ? body.error : "Could not load answers."
    );
  }

  return {
    answer: isRecord(body.answer) ? body.answer : {},
    journey: isRecord(body.journey) ? body.journey : {},
  };
}

/** Load anonymous room counts for a facilitator-led reveal. */
export async function loadRoomResults(
  sessionId: string,
  experience: 1 | 2 | 3 | 4,
  round: number
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    sessionId,
    experience: String(experience),
    round: String(round),
  });
  const { status, body } = await fetchJson(
    `/api/participant/results?${params}`,
    { method: "GET" }
  );

  if (status !== 200 || body?.success !== true || !isRecord(body.counts)) {
    throw new Error(
      typeof body?.error === "string" ? body.error : "Could not load results."
    );
  }

  return body.counts;
}
