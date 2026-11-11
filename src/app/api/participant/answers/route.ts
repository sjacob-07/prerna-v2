
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedParticipant } from "@/lib/human-experiment/participantAuth";
import { validateSameOrigin } from "@/lib/security/validateSameOrigin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Experience = 1 | 2 | 3 | 4 | 5;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const noStore = { "Cache-Control": "no-store" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: noStore }
  );
}

// All requests must target the configured site.
// POST requires Origin. GET can also be verified using the request URL
// because browsers may omit Origin on same-origin GET requests.

function parseExperience(value: string | null): Experience | null {
  if (!value) return null;

  const number = Number(value);

  return [1, 2, 3, 4, 5].includes(number)
    ? (number as Experience)
    : null;
}

function getExperienceAnswer(
  answer: Record<string, unknown>,
  experience: Experience
) {
  if (experience === 1) {
    return {
      experiment: answer.experiment,
      round1: answer.round1,
      round2: answer.round2,
    };
  }

  const key = `experiment${experience}`;
  const saved = isRecord(answer[key]) ? answer[key] : {};

  if (experience === 5) {
    return {
      privateReflection: isRecord(saved.privateReflection)
        ? saved.privateReflection
        : {},
    };
  }

  return saved;
}

// Experience 05 uses these earlier personal commitments to build
// the participant's own journey card. This is never room-wide data.
function getOwnJourney(answer: Record<string, unknown>) {
  const experiment2 = isRecord(answer.experiment2)
    ? answer.experiment2
    : {};
  const experiment3 = isRecord(answer.experiment3)
    ? answer.experiment3
    : {};
  const experiment4 = isRecord(answer.experiment4)
    ? answer.experiment4
    : {};

  return {
    experiment: answer.experiment,
    round1: answer.round1,
    round2: answer.round2,
    experiment2: {
      commitment: experiment2.commitment,
    },
    experiment3: {
      commitment: experiment3.commitment,
    },
    experiment4: {
      commitment: experiment4.commitment,
    },
  };
}

function validatePatch(
  experience: Experience,
  patch: unknown
): patch is Record<string, unknown> {
  if (!isRecord(patch)) return false;

  const allowedKeys: Record<Experience, string[]> = {
    1: ["round1", "round2"],
    2: ["scene1", "scene2", "scene3", "commitment"],
    3: ["scene1", "scene2", "scene3", "commitment"],
    4: ["scene1", "scene2", "scene3", "commitment"],
    5: ["restore", "strengthen", "nextStep", "commitment"],
  };

  const keys = Object.keys(patch);

  if (
    keys.length === 0 ||
    keys.some((key) => !allowedKeys[experience].includes(key))
  ) {
    return false;
  }

  if (experience === 1) {
    return keys.every((key) =>
      ["A", "B", "C", "D"].includes(patch[key] as string)
    );
  }

  // Exact option validation for Experience 02.
  if (experience === 2) {
    const options: Record<string, string[]> = {
      scene1: ["WAKE", "SLEEP"],
      scene2: ["LEAVE", "DELAY"],
      scene3: ["ENTER", "RETURN"],
      commitment: ["ATTEND", "ENCOURAGE", "PARTICIPATE"],
    };

    return keys.every((key) => {
      const value = patch[key];
      return typeof value === "string" && options[key]?.includes(value);
    });
  }

  // Exact option validation for Experience 03.
  if (experience === 3) {
    const options: Record<string, string[]> = {
      scene1: ["higher_salary", "sunday_off", "discuss"],
      scene2: ["accept", "explain", "hope"],
      scene3: ["continue", "reconsider", "talk"],
    };

    return keys.every((key) => {
      const value = patch[key];

      if (key === "commitment") {
        return typeof value === "string" && value.length <= 2000;
      }

      return typeof value === "string" && options[key]?.includes(value);
    });
  }

  // Exact option validation for Experience 04.
  if (experience === 4) {
    const options: Record<string, string[]> = {
      scene1: [
        "pray_first",
        "check_messages",
        "watch_reels",
        "forget_prayer",
      ],
      scene2: [
        "bring_to_god",
        "solve_alone",
        "pray_and_support",
        "keep_worrying",
      ],
      scene3: [
        "restart",
        "wait_feeling",
        "make_plan",
        "leave_for_later",
      ],
    };

    return keys.every((key) => {
      const value = patch[key];

      if (key === "commitment") {
        return typeof value === "string" && value.length <= 2000;
      }

      return typeof value === "string" && options[key]?.includes(value);
    });
  }

  // Experience 05: free-text private reflection, bounded strings.
  return keys.every(
    (key) =>
      typeof patch[key] === "string" &&
      (patch[key] as string).length <= 2000
  );
}

async function getParticipantRow(
  sessionId: string,
  participantKey: string
) {
  return supabaseAdmin
    .from("experiment_participants")
    .select("id, answer")
    .eq("session_id", sessionId)
    .eq("participant_key", participantKey)
    .maybeSingle();
}

export async function GET(request: NextRequest) {
  try {
    if (!validateSameOrigin(request, false)) {
      return jsonError("Invalid request origin.", 403);
    }

    const participant = await getAuthenticatedParticipant();

    if (!participant) {
      return jsonError("Participant authentication required.", 401);
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const experience = parseExperience(
      request.nextUrl.searchParams.get("experience")
    );

    if (!sessionId || !UUID_REGEX.test(sessionId) || !experience) {
      return jsonError("Invalid session or experience.", 400);
    }

    const { data, error } = await getParticipantRow(
      sessionId,
      participant.participantKey
    );

    if (error) {
      console.error("Participant answer lookup failed:", error);
      return jsonError("Could not load your answers.", 500);
    }

    if (!data) {
      return jsonError(
        "Participant is not registered in this session.",
        403
      );
    }

    const answer = isRecord(data.answer) ? data.answer : {};

    return NextResponse.json(
      {
        success: true,
        answer: getExperienceAnswer(answer, experience),
        ...(experience === 5
          ? { journey: getOwnJourney(answer) }
          : {}),
      },
      { headers: noStore }
    );
  } catch (error) {
    console.error("Participant answers GET error:", error);
    return jsonError("Internal server error.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
  if (!validateSameOrigin(request, true)) {
    return jsonError("Invalid request origin.", 403);
    }

    const participant = await getAuthenticatedParticipant();

    if (!participant) {
      return jsonError("Participant authentication required.", 401);
    }

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return jsonError("Invalid request body.", 400);
    }

    const sessionId = body.sessionId;
    const experienceValue = body.experience;

    const experience =
      typeof experienceValue === "number" &&
      [1, 2, 3, 4, 5].includes(experienceValue)
        ? (experienceValue as Experience)
        : null;

    const patch = body.patch;
    const markComplete = body.markComplete === true;

    if (
      typeof sessionId !== "string" ||
      !UUID_REGEX.test(sessionId) ||
      !experience ||
      !validatePatch(experience, patch)
    ) {
      return jsonError(
        "Invalid session, experience, or answer data.",
        400
      );
    }

    // Experience 05 is private reflection, not a room submission.
    if (experience === 5 && markComplete) {
      return jsonError("Invalid completion request.", 400);
    }

    const { data: participantRow, error: readError } =
      await getParticipantRow(
        sessionId,
        participant.participantKey
      );

    if (readError) {
      console.error("Participant answer read failed:", readError);
      return jsonError("Could not save your answer.", 500);
    }

    if (!participantRow) {
      return jsonError(
        "Participant is not registered in this session.",
        403
      );
    }

    const previous = isRecord(participantRow.answer)
      ? participantRow.answer
      : {};

    let nextAnswer: Record<string, unknown>;

    if (experience === 1) {
      nextAnswer = {
        ...previous,
        experiment: 1,
        ...patch,
      };
    } else {
      const key = `experiment${experience}`;
      const previousExperiment = isRecord(previous[key])
        ? previous[key]
        : {};

      if (experience === 5) {
        const previousReflection = isRecord(
          previousExperiment.privateReflection
        )
          ? previousExperiment.privateReflection
          : {};

        nextAnswer = {
          ...previous,
          experiment5: {
            ...previousExperiment,
            privateReflection: {
              ...previousReflection,
              ...patch,
              savedAt: new Date().toISOString(),
            },
          },
        };
      } else {
        nextAnswer = {
          ...previous,
          [key]: {
            ...previousExperiment,
            ...patch,
          },
        };
      }
    }

    const updateValues: Record<string, unknown> = {
      answer: nextAnswer,
      connected: true,
      current_experiment: experience,
    };

    if (markComplete) {
      updateValues.status = "ANSWERED";
      updateValues.submitted_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("experiment_participants")
      .update(updateValues)
      .eq("session_id", sessionId)
      .eq("participant_key", participant.participantKey);

    if (updateError) {
      console.error("Participant answer save failed:", updateError);
      return jsonError("Could not save your answer.", 500);
    }

    return NextResponse.json(
      { success: true },
      { headers: noStore }
    );
  } catch (error) {
    console.error("Participant answers POST error:", error);
    return jsonError("Internal server error.", 500);
  }
}
