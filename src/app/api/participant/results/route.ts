
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedParticipant } from "@/lib/human-experiment/participantAuth";
import { validateSameOrigin } from "@/lib/security/validateSameOrigin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const noStore = { "Cache-Control": "no-store" };

// Allowed choices per scene for the facilitator-led reveals of
// Experiences 02–04. Only these values are counted.
const SCENE_OPTIONS: Record<"2" | "3" | "4", Record<string, string[]>> = {
  "2": {
    scene1: ["WAKE", "SLEEP"],
    scene2: ["LEAVE", "DELAY"],
    scene3: ["ENTER", "RETURN"],
  },
  "3": {
    scene1: ["higher_salary", "sunday_off", "discuss"],
    scene2: ["accept", "explain", "hope"],
    scene3: ["continue", "reconsider", "talk"],
  },
  "4": {
    scene1: ["pray_first", "check_messages", "watch_reels", "forget_prayer"],
    scene2: ["bring_to_god", "solve_alone", "pray_and_support", "keep_worrying"],
    scene3: ["restart", "wait_feeling", "make_plan", "leave_for_later"],
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: noStore }
  );
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
    const experience = request.nextUrl.searchParams.get("experience");
    const round = request.nextUrl.searchParams.get("round");

    const isSceneExperience =
      experience === "2" || experience === "3" || experience === "4";

    if (
      !sessionId ||
      !UUID_REGEX.test(sessionId) ||
      !(
        (experience === "1" && (round === "1" || round === "2")) ||
        (isSceneExperience &&
          (round === "1" || round === "2" || round === "3"))
      )
    ) {
      return jsonError("Invalid session or results request.", 400);
    }

    const expectedStage = `REVEAL_${round}`;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("experiment_sessions")
      .select("id, current_experiment, current_stage")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) {
      console.error("Results session lookup failed:", sessionError);
      return jsonError("Could not load room results.", 500);
    }

    if (!session) return jsonError("Session not found.", 404);

    if (
      session.current_experiment !== Number(experience) ||
      session.current_stage !== expectedStage
    ) {
      return jsonError("Results are not currently available.", 403);
    }

    const { data: membership, error: membershipError } =
      await supabaseAdmin
        .from("experiment_participants")
        .select("id")
        .eq("session_id", sessionId)
        .eq("participant_key", participant.participantKey)
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Results membership check failed:",
        membershipError
      );
      return jsonError("Could not verify session membership.", 500);
    }

    if (!membership) {
      return jsonError(
        "Participant is not registered in this session.",
        403
      );
    }

    const { data: rows, error: resultsError } = await supabaseAdmin
      .from("experiment_participants")
      .select("answer")
      .eq("session_id", sessionId);

    if (resultsError) {
      console.error("Results aggregate query failed:", resultsError);
      return jsonError("Could not load room results.", 500);
    }

    // Experiences 02–04: anonymous per-scene counts for every scene
    // revealed so far (scene1..scene{round}). No individual answers leave.
    if (isSceneExperience) {
      const options = SCENE_OPTIONS[experience];
      const experimentKey = `experiment${experience}`;
      const revealedScenes = ["scene1", "scene2", "scene3"].slice(
        0,
        Number(round)
      );

      const sceneCounts: Record<string, Record<string, number>> = {};
      for (const scene of revealedScenes) {
        sceneCounts[scene] = Object.fromEntries(
          options[scene].map((option) => [option, 0])
        );
      }

      for (const row of rows ?? []) {
        if (!isRecord(row.answer)) continue;
        const response = row.answer[experimentKey];
        if (!isRecord(response)) continue;

        for (const scene of revealedScenes) {
          const choice = response[scene];
          if (
            typeof choice === "string" &&
            options[scene].includes(choice)
          ) {
            sceneCounts[scene][choice] += 1;
          }
        }
      }

      return NextResponse.json(
        { success: true, counts: sceneCounts },
        { headers: noStore }
      );
    }

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    const answerField = round === "1" ? "round1" : "round2";

    for (const row of rows ?? []) {
      const answer = row.answer;

      if (
        !answer ||
        typeof answer !== "object" ||
        Array.isArray(answer)
      ) {
        continue;
      }

      const answerData = answer as Record<string, unknown>;

      if (answerData.experiment !== 1) continue;

      const choice = answerData[answerField];

      if (
        typeof choice === "string" &&
        Object.prototype.hasOwnProperty.call(counts, choice)
      ) {
        counts[choice as keyof typeof counts] += 1;
      }
    }

    return NextResponse.json(
      {
        success: true,
        counts,
        total: Object.values(counts).reduce(
          (sum, count) => sum + count,
          0
        ),
      },
      { headers: noStore }
    );
  } catch (error) {
    console.error("Results API error:", error);
    return jsonError("Internal server error.", 500);
  }
}
