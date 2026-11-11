
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  Languages,
  CheckCircle2,
  Sun,
  Leaf,
  CalendarDays,
  BedDouble,
  Smartphone,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import type { HumanExperimentSession } from "@/lib/human-experiment/session";
import { saveParticipantAnswer } from "@/lib/human-experiment/answerSaveClient";

type Language = "en" | "hi";
type Round = 1 | 2;
type Choice = "A" | "B" | "C" | "D";
type PreviewStage =
  | "INTRO"
  | "QUESTION_1"
  | "WAIT_1"
  | "REVEAL_1"
  | "QUESTION_2"
  | "WAIT_2"
  | "REVEAL_2"
  | "DISCUSSION"
  | "COMPLETE";

const content = {
  en: {
    label: "EXPERIENCE 01",
    title: "BEYOND THE HABIT",
    subtitle: "Making God's Word a priority",
    before: "BEFORE WE BEGIN",
    introduction:
      "This experience invites you to reflect on your relationship with God's Word. There are no perfect answers. Choose honestly, based on what you would naturally do.",
    waiting: "WAIT FOR THE FACILITATOR",
    waitingDescription: "The experience will begin when the room is ready.",
    round: "ROUND",
    busyDay: "THE BUSY DAY",
    busyQuestion:
      "You've had a very busy day. You planned to read your Bible, but the day passed and you haven't opened it. What would you most likely do?",
    mechanical: "BEYOND ROUTINE",
    mechanicalQuestion:
      "You have been reading the Bible every day, but lately you realise that you are reading mechanically without understanding or reflecting on what you read. What would you do?",
    options1: [
      "Adjust my schedule and make time for it.",
      "Read before going to sleep.",
      "Skip today and continue tomorrow.",
      "Forget about it and move on.",
    ],
    options2: [
      "Continue reading just to maintain my routine.",
      "Slow down and read a smaller portion.",
      "Reflect on the passage and apply it.",
      "Seek help to understand what I am reading.",
    ],
    submitted: "YOUR ANSWER HAS BEEN RECORDED",
    waitTitle: "WAIT.",
    waitDescription: "Your response has been recorded. Please wait for the facilitator.",
    reveal: "THE REVEAL",
    revealTitle: "LET'S LOOK AT THE RESPONSES.",
    revealDescription:
      "The facilitator will now share what the room chose. Take a moment to reflect honestly.",
    discussion: "A MOMENT IN GOD'S WORD",
    teachingTitle: "Beyond reading. Into living.",
    teaching: [
      {
        verse: "Psalm 119:105",
        text: "God's Word is described as a lamp to our feet and a light to our path.",
      },
      {
        verse: "Joshua 1:8",
        text: "The passage encourages us to meditate on God's Word day and night and be careful to live according to it.",
      },
      {
        verse: "James 1:22",
        text: "We are called to be doers of the Word, not hearers only.",
      },
    ],
    reflection: "PERSONAL REFLECTION",
    reflectionQuestions: [
      "What usually takes priority over spending time in God's Word?",
      "Am I reading to complete a routine, or to know and follow God?",
      "What is one change I can make starting today?",
    ],
    challenge: "YOUR SEVEN-DAY CHALLENGE",
    challengeDescription:
      "For the next seven days, set aside a specific time to read God's Word. Read a small passage, reflect on what it says, and identify one way to put it into practice.",
    completed: "EXPERIENCE COMPLETE",
    completedDescription:
      "Don't let this end as another activity. Take what you have reflected on and put it into practice.",
    waitingFacilitator: "WAITING FOR THE FACILITATOR",
    noAnswer: "Please choose one answer.",
    saveError: "We couldn't save your answer. Please try again.",
    saving: "SAVING...",
    submit: "SUBMIT ANSWER",
    answered: "ANSWER RECORDED",
    language: "LANGUAGE",
    noRightWrong: "There is no perfect answer. Choose honestly.",
  },
  hi: {
    label: "अनुभव ०१",
    title: "आदत से आगे",
    subtitle: "परमेश्वर के वचन को प्राथमिकता देना",
    before: "शुरू करने से पहले",
    introduction:
      "यह अनुभव आपको परमेश्वर के वचन के साथ अपने संबंध पर विचार करने के लिए आमंत्रित करता है। कोई पूर्ण उत्तर नहीं है। ईमानदारी से चुनें कि आप स्वाभाविक रूप से क्या करेंगे।",
    waiting: "संचालक की प्रतीक्षा करें",
    waitingDescription: "समूह तैयार होने पर अनुभव शुरू होगा।",
    round: "दौर",
    busyDay: "व्यस्त दिन",
    busyQuestion:
      "आपका दिन बहुत व्यस्त रहा। आपने बाइबल पढ़ने की योजना बनाई थी, लेकिन दिन बीत गया और आपने बाइबल नहीं खोली। आप सबसे अधिक संभावना क्या करेंगे?",
    mechanical: "सिर्फ आदत से आगे",
    mechanicalQuestion:
      "आप हर दिन बाइबल पढ़ रहे हैं, लेकिन अब आपको एहसास होता है कि आप बिना समझे या विचार किए केवल आदत के अनुसार पढ़ रहे हैं। आप क्या करेंगे?",
    options1: [
      "अपने समय में बदलाव करके पढ़ने का समय निकालूँगा।",
      "सोने से पहले पढ़ूँगा।",
      "आज छोड़कर कल फिर शुरू करूँगा।",
      "इसे भूलकर आगे बढ़ जाऊँगा।",
    ],
    options2: [
      "अपनी दिनचर्या बनाए रखने के लिए पढ़ता रहूँगा।",
      "धीरे पढ़ूँगा और थोड़ा कम हिस्सा पढ़ूँगा।",
      "पढ़े हुए वचन पर विचार करके उसे जीवन में लागू करूँगा।",
      "समझने के लिए किसी से सहायता लूँगा।",
    ],
    submitted: "आपका उत्तर दर्ज कर लिया गया है",
    waitTitle: "प्रतीक्षा करें।",
    waitDescription: "आपका उत्तर दर्ज हो गया है। कृपया संचालक की प्रतीक्षा करें।",
    reveal: "उत्तर सामने आएँगे",
    revealTitle: "आइए उत्तरों पर विचार करें।",
    revealDescription:
      "संचालक अब बताएँगे कि समूह ने क्या चुना। ईमानदारी से विचार करने के लिए थोड़ा समय लें।",
    discussion: "परमेश्वर के वचन में एक पल",
    teachingTitle: "सिर्फ पढ़ना नहीं, जीवन में उतारना।",
    teaching: [
      {
        verse: "भजन संहिता 119:105",
        text: "परमेश्वर का वचन हमारे पाँव के लिए दीपक और हमारे मार्ग के लिए प्रकाश बताया गया है।",
      },
      {
        verse: "यहोशू 1:8",
        text: "यह अंश हमें परमेश्वर के वचन पर दिन-रात मनन करने और उसके अनुसार जीवन जीने के लिए प्रोत्साहित करता है।",
      },
      {
        verse: "याकूब 1:22",
        text: "हमें वचन पर चलने वाले बनना है, केवल सुनने वाले नहीं।",
      },
    ],
    reflection: "व्यक्तिगत मनन",
    reflectionQuestions: [
      "कौन-सी बातें अक्सर परमेश्वर के वचन से अधिक प्राथमिकता पाती हैं?",
      "क्या मैं केवल दिनचर्या पूरी करने के लिए पढ़ रहा हूँ, या परमेश्वर को जानने और उनका अनुसरण करने के लिए?",
      "आज से मैं कौन-सा एक बदलाव कर सकता हूँ?",
    ],
    challenge: "आपकी सात दिन की चुनौती",
    challengeDescription:
      "अगले सात दिनों तक परमेश्वर के वचन को पढ़ने के लिए एक निश्चित समय रखें। एक छोटा अंश पढ़ें, उस पर मनन करें और उसे जीवन में लागू करने का एक तरीका पहचानें।",
    completed: "अनुभव पूरा हुआ",
    completedDescription:
      "इसे केवल एक गतिविधि बनकर समाप्त न होने दें। आपने जिस बात पर विचार किया है, उसे अपने जीवन में लागू करें।",
    waitingFacilitator: "संचालक की प्रतीक्षा करें",
    noAnswer: "कृपया एक उत्तर चुनें।",
    saveError: "आपका उत्तर सुरक्षित नहीं हो सका। कृपया फिर प्रयास करें।",
    saving: "सुरक्षित हो रहा है...",
    submit: "उत्तर जमा करें",
    answered: "उत्तर दर्ज हो गया",
    language: "भाषा",
    noRightWrong: "कोई पूर्ण उत्तर नहीं है। ईमानदारी से चुनें।",
  },
};

export default function BibleReadingExperience({
  previewMode = false,
  session,
}: {
  previewMode?: boolean;
  session: HumanExperimentSession;
}) {
  const [previewStage, setPreviewStage] =
  useState<PreviewStage>("INTRO");

  const [language, setLanguage] = useState<Language>("en");
  const [answers, setAnswers] = useState<Record<Round, Choice | null>>({
    1: null,
    2: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [revealResults, setRevealResults] = useState<{
  A: number;
  B: number;
  C: number;
  D: number;
} | null>(null);

const [resultsLoading, setResultsLoading] = useState(false);
const [resultsError, setResultsError] = useState("");
  const t = content[language];
  const isLocked = !previewMode && session.status === "PAUSED";

  // Load this participant's own saved answers through the authenticated API.
  useEffect(() => {
    if (previewMode || !session.sessionId) return;

    let cancelled = false;

    async function loadSavedAnswers() {
      try {
        const params = new URLSearchParams({
          sessionId: session.sessionId!,
          experience: "1",
        });
        const response = await fetch(`/api/participant/answers?${params}`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Could not load saved answers.");
        }

        if (cancelled) return;

        setAnswers({
          1: ["A", "B", "C", "D"].includes(result.answer?.round1)
            ? result.answer.round1
            : null,
          2: ["A", "B", "C", "D"].includes(result.answer?.round2)
            ? result.answer.round2
            : null,
        });
      } catch (err) {
        console.error("EXPERIENCE 01 ANSWER LOAD FAILED:", err);
      }
    }

    void loadSavedAnswers();

    return () => {
      cancelled = true;
    };
  }, [previewMode, session.sessionId]);



  const stage = previewMode ? previewStage : session.stage;
useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
}, [stage]);
  const round: Round | null =
    stage === "QUESTION_1" || stage === "WAIT_1" || stage === "REVEAL_1"
      ? 1
      : stage === "QUESTION_2" || stage === "WAIT_2" || stage === "REVEAL_2"
        ? 2
        : null;

  const options = round === 1 ? t.options1 : t.options2;

  const question =
    round === 1 ? t.busyQuestion : t.mechanicalQuestion;

  const questionTitle =
    round === 1 ? t.busyDay : t.mechanical;

  const currentAnswer = round ? answers[round] : null;

  async function submitAnswer() {
  if (!round || !currentAnswer) {
    setError(t.noAnswer);
    return;
  }

  // Preview mode: save locally and move to the waiting screen.
  if (previewMode) {
    setError("");
    setPreviewStage(round === 1 ? "WAIT_1" : "WAIT_2");
    return;
  }

  if (!session.sessionId) {
    setError(t.noAnswer);
    return;
  }

    if (isLocked || saving) return;

    setSaving(true);
    setError("");

    try {
      const result = await saveParticipantAnswer({
        sessionId: session.sessionId,
        experience: 1,
        patch: round === 1
          ? { round1: currentAnswer }
          : { round2: currentAnswer },
        markComplete: true,
        fallbackMessage: t.saveError,
      });

      if (!result.ok) {
        console.error("EXPERIENCE 01 ANSWER SAVE FAILED:", result.message);
        setError(result.message);
      }
    } finally {
      setSaving(false);
    }
  }

  const chooseAnswer = (choice: Choice) => {
    if (!round || stage !== `QUESTION_${round}` || isLocked || saving) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [round]: choice,
    }));

    setError("");
  };

  const intro = stage === "INTRO" || stage === "START";
  const questionStage =
    stage === "QUESTION_1" || stage === "QUESTION_2";
  const waitStage = stage === "WAIT_1" || stage === "WAIT_2";
  const revealStage = stage === "REVEAL_1" || stage === "REVEAL_2";
  useEffect(() => {
    if (previewMode || !revealStage || !session.sessionId || !round) {
      setRevealResults(null);
      setResultsError("");
      return;
    }

    let cancelled = false;

    async function loadRevealResults() {
      setResultsLoading(true);
      setResultsError("");

      try {
        const params = new URLSearchParams({
          sessionId: session.sessionId!,
          experience: "1",
          round: String(round),
        });
        const response = await fetch(`/api/participant/results?${params}`, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Results could not be loaded.");
        }

        if (cancelled) return;

        setRevealResults(result.counts);
      } catch (err) {
        console.error("Failed to load reveal results:", err);
        if (!cancelled) {
          setResultsError("Results could not be loaded. Please contact the facilitator.");
          setRevealResults(null);
        }
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }

    void loadRevealResults();

    return () => {
      cancelled = true;
    };
  }, [previewMode, revealStage, round, session.sessionId]);
  const discussionStage = stage === "DISCUSSION";
  const completeStage = stage === "COMPLETE";

  return (
    <main className="experience-paper min-h-screen text-[#19352c]">
      <div className="mx-auto min-h-screen max-w-[1200px] px-5 py-6 sm:px-8 sm:py-10">

        {/* HEADER */}
        <header className="flex items-start justify-between border-b border-[#19352c]/15 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c7542b]">
              Prerna / 2026
            </p>

            <h1 className="mt-2 font-serif text-2xl tracking-wide sm:text-3xl">
              HUMAN EXPERIMENT
            </h1>

            <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.25em] text-[#000000] sm:text-[11px]">
              The Living Church
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#000000]">
                {t.label}
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-[#c7542b]">
                01 / 05
              </p>
            </div>

            <div className="flex items-center gap-1 border border-[#19352c]/15 p-1">
              <Languages className="ml-1 h-3 w-3" />
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 font-mono text-[9px] ${
                  language === "en"
                    ? "bg-[#19352c] text-[#f8f1e6]"
                    : "text-[#19352c]/60"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2 py-1 font-mono text-[9px] ${
                  language === "hi"
                    ? "bg-[#19352c] text-[#f8f1e6]"
                    : "text-[#19352c]/60"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1000px] py-12 sm:py-20">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {intro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="text-center"
              >
                <BookOpen className="mx-auto h-10 w-10 text-[#c7542b]" />

                <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-[#c7542b]">
                  {t.label}
                </p>

                <h2 className="mt-5 font-serif text-5xl leading-none sm:text-7xl">
                  {t.title}
                </h2>

                <p className="mx-auto mt-7 max-w-xl font-serif text-lg leading-8 text-[#19352c]/65 sm:text-xl">
                  {t.subtitle}
                </p>

                <div className="mx-auto mt-12 max-w-xl border border-[#19352c]/15 bg-[#eee5d5]/40 p-6 text-left sm:p-8">
                  <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c7542b]">
                    {t.before}
                  </p>

                  <p className="mt-5 font-serif text-base leading-8">
                    {t.introduction}
                  </p>
                </div>

                <div className="mt-10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#19352c]/40">
                    {t.waiting}
                  </p>
                  <p className="mt-3 font-serif text-sm italic text-[#19352c]/45">
                    {t.waitingDescription}
                  </p>
                </div>

                {previewMode && (
  <button
    onClick={() => setPreviewStage("QUESTION_1")}
    className="mt-8 bg-[#19352c] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f1e6]"
  >
    Start Preview <ArrowRight className="ml-2 inline h-4 w-4" />
  </button>
)}
              </motion.div>
            )}


            {/* QUESTION ROUNDS */}
            {questionStage && round && (
              <motion.div
                key={`question-${round}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative mx-auto max-w-5xl"
              >
                {/* Decorative background number */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-16 select-none font-serif text-[180px] leading-none text-[#19352c]/[0.035] sm:-right-8 sm:-top-24 sm:text-[260px]"
                >
                  0{round}
                </div>

                {/* Round header */}
                <div className="relative flex items-center justify-between border-b border-[#19352c]/15 pb-5">
                  <div>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#c7542b]">
                      {t.round} 0{round}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl tracking-wide sm:text-3xl">
                      {questionTitle}
                    </h2>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-[9px] tracking-[0.2em] text-[#19352c]/40">
                      0{round} / 02
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <div className={`h-1 w-7 ${round >= 1 ? "bg-[#c7542b]" : "bg-[#19352c]/10"}`} />
                      <div className={`h-1 w-7 ${round >= 2 ? "bg-[#c7542b]" : "bg-[#19352c]/10"}`} />
                    </div>
                  </div>
                </div>

{/* Question + Square Bible Artwork */}
<div className="relative mt-8 grid grid-cols-1 items-center gap-6 overflow-hidden border border-[#19352c]/10 bg-[#eee5d5]/45 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:p-7">

  {/* Left: Moment to Reflect */}
  <div className="relative flex min-w-0 min-h-[250px] flex-col justify-center border-l-[4px] border-[#c7542b] py-5 pl-6 pr-3 sm:min-h-[270px] sm:pl-8 lg:py-8">
    <div className="flex items-center gap-3">
      <Sun className="h-5 w-5 shrink-0 text-[#c7542b]" strokeWidth={1.4} />
      <p className="editorial-label text-[9px] font-bold tracking-[0.25em] text-[#c7542b]">
        A MOMENT TO REFLECT
      </p>
      </div>

    <h3 className="editorial-heading mt-6 max-w-2xl text-2xl leading-snug sm:text-3xl lg:text-[34px] lg:leading-[1.3]">
      {question}
    </h3>

    <p className="editorial-label mt-6 text-[8px] tracking-[0.22em] text-[#19352c]/45">
      CONSIDER WHAT YOU WOULD HONESTLY DO
    </p>
  </div>


{/* Right: Animated illustrated Bible */}
<div className="relative mx-auto flex aspect-square w-full max-w-[320px] shrink-0 items-center justify-center overflow-hidden bg-[#eee5d5]">

  {/* Warm background glow */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(190,139,91,.28),transparent_65%)]" />

  {/* Decorative background circles */}
  <div className="absolute right-[-12%] top-[-12%] h-52 w-52 rounded-full border border-[#19352c]/10" />
  <div className="absolute right-[-5%] top-[-5%] h-40 w-40 rounded-full border border-[#c7542b]/15" />

  {/* Oversized editorial number */}
  <span className="absolute left-2 top-1 font-serif text-[105px] leading-none text-[#19352c]/[0.055]">
    01
  </span>

  {/* Small decorative dots */}
  <div
    className="absolute bottom-[23%] left-[8%] h-16 w-14 opacity-50"
    style={{
      backgroundImage: "radial-gradient(#19352c 1.3px, transparent 1.3px)",
      backgroundSize: "10px 10px"
    }}
  />

  {/* Botanical detail */}
  <svg
    viewBox="0 0 130 230"
    className="absolute right-[4%] top-[7%] z-10 h-[65%] w-[38%] animate-bible-branch"
    fill="none"
    aria-hidden="true"
  >
    <path d="M55 225 C55 160 76 105 96 8" stroke="#344d36" strokeWidth="2.2" />
    <g fill="#627653" stroke="#40583e" strokeWidth="1">
      <path d="M67 135 C30 126 15 96 25 68 C57 77 77 103 67 135Z" />
      <path d="M75 105 C100 73 120 72 130 88 C112 116 91 120 75 105Z" />
      <path d="M52 183 C20 173 8 150 18 127 C45 137 61 157 52 183Z" />
    </g>
    <g stroke="#d7c7a5" strokeWidth="1">
      <path d="M67 135 L25 68" />
      <path d="M75 105 L130 88" />
      <path d="M52 183 L18 127" />
    </g>
  </svg>

  {/* Illustrated Bible */}
  <div className="relative z-20 mt-8 w-[88%] animate-bible-float">

    {/* Soft shadow underneath */}
    <div className="absolute -bottom-3 left-[12%] h-7 w-[76%] rounded-[50%] bg-[#19352c]/15 blur-xl" />

    <svg
      viewBox="0 0 440 300"
      className="relative h-auto w-full overflow-visible"
      fill="none"
      role="img"
      aria-label="An illustrated open Bible with cream pages and a forest-green cover"
    >
      <defs>
        <linearGradient id="bibleCover" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#294b3d" />
          <stop offset="100%" stopColor="#142d25" />
        </linearGradient>
        <linearGradient id="bibleLeftPage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff9e9" />
          <stop offset="100%" stopColor="#d9c9a9" />
        </linearGradient>
        <linearGradient id="bibleRightPage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbea" />
          <stop offset="100%" stopColor="#e6d8bb" />
        </linearGradient>
        <linearGradient id="biblePageEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d9b9" />
          <stop offset="100%" stopColor="#bca984" />
        </linearGradient>
      </defs>

      {/* Cover */}
      <path
        d="M35 91 Q110 56 213 100 Q315 55 405 91 L390 245 Q310 216 215 260 Q115 216 48 248 Z"
        fill="url(#bibleCover)"
        stroke="#19352c"
        strokeWidth="4"
      />

      {/* Cover inner border */}
      <path
        d="M48 101 Q120 72 212 111 Q315 73 391 101 L379 232 Q303 207 215 246 Q125 207 59 235 Z"
        stroke="#b89a68"
        strokeOpacity=".65"
        strokeWidth="1.5"
      />

      {/* Left page block */}
      <path
        d="M45 88 Q125 54 215 102 L215 235 Q120 194 51 224 Z"
        fill="url(#biblePageEdge)"
        stroke="#a99370"
        strokeWidth="2"
      />

      {/* Right page block */}
      <path
        d="M215 102 Q305 54 395 88 L389 224 Q310 194 215 235 Z"
        fill="#d2c09e"
        stroke="#a99370"
        strokeWidth="2"
      />

      {/* Left open page */}
      <path
        d="M48 76 Q130 39 215 92 L215 224 Q130 181 55 213 Z"
        fill="url(#bibleLeftPage)"
        stroke="#c4b18c"
        strokeWidth="1.5"
      />

      {/* Right open page */}
      <path
        d="M215 92 Q300 39 392 76 L385 213 Q304 181 215 224 Z"
        fill="url(#bibleRightPage)"
        stroke="#c4b18c"
        strokeWidth="1.5"
      />

      {/* Page highlights */}
      <path d="M57 80 Q135 49 207 96" stroke="white" strokeWidth="3" strokeOpacity=".8" />
      <path d="M224 96 Q300 49 382 80" stroke="white" strokeWidth="3" strokeOpacity=".8" />

      {/* Printed text lines: left */}
      <g stroke="#8e8068" strokeWidth="2" strokeLinecap="round" opacity=".48">
        <path d="M83 102 Q140 85 190 112" />
        <path d="M80 116 Q140 99 190 126" />
        <path d="M78 130 Q140 113 190 140" />
        <path d="M77 144 Q140 127 190 154" />
        <path d="M78 158 Q140 141 190 168" />
        <path d="M81 172 Q140 155 190 182" />
      </g>

      {/* Printed text lines: right */}
      <g stroke="#8e8068" strokeWidth="2" strokeLinecap="round" opacity=".48">
        <path d="M240 112 Q290 85 350 102" />
        <path d="M240 126 Q290 99 352 116" />
        <path d="M240 140 Q290 113 354 130" />
        <path d="M240 154 Q290 127 353 144" />
        <path d="M240 168 Q290 141 351 158" />
        <path d="M240 182 Q290 155 348 172" />
      </g>

      {/* Centre binding */}
      <path
        d="M215 92 Q204 158 215 235"
        stroke="#9d8966"
        strokeWidth="5"
        strokeOpacity=".7"
      />
      <path
        d="M220 96 Q228 160 220 231"
        stroke="#fff5df"
        strokeWidth="2"
        strokeOpacity=".8"
      />

      {/* Animated page */}
      <g className="animate-bible-page" style={{ transformOrigin: "215px 95px" }}>
        <path
          d="M215 94 Q270 45 383 77 Q323 65 215 112 Z"
          fill="#fff8e9"
          stroke="#c4b18c"
          strokeWidth="1"
        />
        <path
          d="M230 99 Q295 73 365 81"
          stroke="#a99a7c"
          strokeWidth="1.5"
          strokeOpacity=".5"
        />
      </g>

      {/* Terracotta bookmark */}
      <path
        d="M225 222 L225 273 L236 262 L247 273 L247 226"
        fill="#c7542b"
        stroke="#9e4227"
        strokeWidth="1"
      />

      {/* Gold page detail */}
      <path d="M62 216 Q130 191 207 229" stroke="#c19a5e" strokeWidth="1.5" />
      <path d="M222 229 Q305 191 378 216" stroke="#c19a5e" strokeWidth="1.5" />
    </svg>
  </div>

  {/* Small title below illustration */}
  <div className="absolute bottom-[5%] left-0 right-0 z-30 text-center">
    <p className="editorial-label text-[8px] font-bold tracking-[0.25em] text-[#19352c]/65">
      GOD'S WORD · EVERY DAY
    </p>
  </div>
</div>
</div>

{/* Photographic answer cards */}
<div className="relative mt-10 sm:mt-12">
  <div className="mb-5 flex items-center justify-between">
    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#19352c]/65">
      CHOOSE YOUR RESPONSE
    </p>
    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#19352c]/35">
      SELECT ONE
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
    {options.map((option, index) => {
      const choice = String.fromCharCode(65 + index) as Choice;
      const selected = currentAnswer === choice;

      const visuals = [
        {
          src: "/images/experience-01/daily-planner.jpg",
          alt: "A daily planner and pen",
          caption: "MAKE TIME"
        },
        {
          src: "/images/experience-01/bedside-reading.jpg",
          alt: "A peaceful bedside reading scene",
          caption: "END THE DAY"
        },
        {
          src: "/images/experience-01/tomorrow-calendar.webp",
          alt: "A calendar representing tomorrow",
          caption: "PUT IT OFF"
        },
        {
          src: "/images/experience-01/phone-distraction.png",
          alt: "A smartphone representing digital distractions",
          caption: "GET DISTRACTED"
        }
      ];

      const visual = visuals[index];

      return (
        <motion.button
          key={choice}
          type="button"
          whileHover={!isLocked && !saving ? { y: -4 } : undefined}
          whileTap={!isLocked && !saving ? { scale: 0.99 } : undefined}
          onClick={() => chooseAnswer(choice)}
          disabled={isLocked || saving}
          className={`group relative min-h-[165px] overflow-hidden border text-left transition-all duration-300 sm:min-h-[185px] ${
            selected
              ? "border-[#c7542b] shadow-[0_8px_25px_rgba(199,84,43,0.15)]"
              : "border-[#19352c]/15 hover:border-[#c7542b]/70"
          } disabled:cursor-not-allowed`}
        >
          <div className="absolute inset-0">
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className={`object-cover object-center transition-transform duration-700 ${
                selected ? "scale-105" : "group-hover:scale-105"
              }`}
            />
          </div>

          <div className={`absolute inset-0 transition-colors ${
            selected
              ? "bg-gradient-to-r from-[#f3e8d6] via-[#f3e8d6]/95 to-[#f3e8d6]/20"
              : "bg-gradient-to-r from-[#f5eddf] via-[#f5eddf]/80 to-[#f5eddf]/5"
          }`} />

          {selected && (
            <div className="absolute left-0 top-0 h-full w-1 bg-[#c7542b]" />
          )}

          <div className="relative z-10 flex min-h-[165px] items-start gap-4 p-5 sm:min-h-[185px] sm:p-6">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center border font-mono text-sm font-bold transition-all ${
                selected
                  ? "border-[#c7542b] bg-[#c7542b] text-[#f8f1e6]"
                  : "border-[#19352c]/30 bg-[#f5eddf]/70 text-[#19352c] group-hover:border-[#c7542b] group-hover:text-[#c7542b]"
              }`}
            >
              {choice}
            </span>

            <div className="max-w-[72%] pt-1">
              <p className="editorial-label mb-3 text-[8px] font-bold tracking-[0.2em] text-[#c7542b]">
                {visual.caption}
              </p>

              <span className="block font-serif text-base leading-7 text-[#19352c] sm:text-lg">
                {option}
              </span>
            </div>

            <div className="absolute bottom-5 right-5">
              {selected ? (
                <CheckCircle2 className="h-5 w-5 text-[#c7542b]" />
              ) : (
                <span className="block h-5 w-5 rounded-full border border-[#19352c]/35 bg-[#f5eddf]/50 transition-colors group-hover:border-[#c7542b]" />
              )}
            </div>
          </div>
        </motion.button>
      );
    })}
  </div>
</div>

                {/* Submission */}
                <div className="mt-8 border-t border-[#19352c]/10 pt-6 sm:mt-10">
                  <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                    <p className="max-w-sm text-center font-serif text-sm italic leading-6 text-[#19352c]/50 sm:text-left">
                      {t.noRightWrong}
                    </p>

                    <button
                      onClick={submitAnswer}
                      disabled={!currentAnswer || saving || isLocked}
                      className="flex w-full items-center justify-center gap-4 bg-[#19352c] px-9 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f1e6] transition-all hover:bg-[#c7542b] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                    >
                      {saving ? t.saving : t.submit}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <p className="mt-5 text-center text-sm text-[#c7542b]">
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            )}


            {/* WAIT */}
            {waitStage && (
              <motion.div
                key={`wait-${round}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="mx-auto max-w-xl border border-[#19352c]/15 bg-[#eee5d5]/40 p-10 sm:p-16">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-[#c7542b]" />

                  <p className="mt-6 font-mono text-[8px] uppercase tracking-[0.3em] text-[#c7542b]">
                    {t.submitted}
                  </p>

                  <h2 className="mt-6 font-serif text-5xl sm:text-7xl">
                    {t.waitTitle}
                  </h2>

                  <p className="mx-auto mt-6 max-w-md font-serif text-lg leading-8 text-[#19352c]/60">
                    {t.waitDescription}
                  </p>

                  <div className="mt-8 h-px bg-[#19352c]/10" />

                  <p className="mt-8 font-mono text-[8px] uppercase tracking-[0.2em] text-[#19352c]/40">
                    {t.answered}
                  </p>
                </div>

                <p className="mt-10 font-mono text-[8px] uppercase tracking-[0.25em] text-[#19352c]/45">
                  {t.waitingFacilitator}
                </p>
                {previewMode && (
  <button
    onClick={() =>
      setPreviewStage(round === 1 ? "REVEAL_1" : "REVEAL_2")
    }
    className="mt-8 bg-[#19352c] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f1e6]"
  >
    Simulate Facilitator Reveal <ArrowRight className="ml-2 inline h-4 w-4" />
  </button>
)}
              </motion.div>
            )}

            {/* REVEAL */}
            {revealStage && (
              <motion.div
                key={`reveal-${round}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#c7542b]">
                  {t.reveal} / 0{round}
                </p>

                <h2 className="mt-6 font-serif text-4xl sm:text-6xl">
                  {t.revealTitle}
                </h2>

                <div className="mx-auto mt-12 max-w-xl border border-[#19352c]/15 bg-[#eee5d5]/45 p-8 sm:p-12">
                  <BookOpen className="mx-auto h-9 w-9 text-[#c7542b]" />

                  <p className="mt-7 font-serif text-lg leading-8 text-[#19352c]/65">
                    {t.revealDescription}
                  </p>
                  <div className="mt-10 border-t border-[#19352c]/15 pt-8 text-left">
  <div className="flex items-center justify-between gap-3">
    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em]">
      {round === 1 ? t.busyDay : t.mechanical}
    </p>
    <span className="font-mono text-[9px] text-[#19352c]/45">
      {revealResults
        ? `${Object.values(revealResults).reduce((a, b) => a + b, 0)} RESPONSES`
        : ""}
    </span>
  </div>

  {resultsLoading && (
    <p className="mt-6 text-center font-mono text-xs text-[#19352c]/50">
      Loading room responses...
    </p>
  )}

  {resultsError && (
    <p className="mt-6 text-center text-sm text-[#c7542b]">
      {resultsError}
    </p>
  )}

  {previewMode && (
    <p className="mt-6 text-center font-mono text-xs text-[#19352c]/50">
      Live room results will appear here during the event.
    </p>
  )}

  {revealResults && (() => {
    const total = Object.values(revealResults).reduce(
      (sum, count) => sum + count,
      0
    );

    return (
      <div className="mt-7 space-y-7">
        {(["A", "B", "C", "D"] as const).map((key, index) => {
          const count = revealResults[key];
          const percentage = total
            ? Math.round((count / total) * 100)
            : 0;

          return (
            <div key={key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="font-mono text-xs font-bold text-[#c7542b]">
                    {key}
                  </span>
                  <p className="font-serif text-sm leading-6">
                    {options[index]}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold">{count}</p>
                  <p className="font-mono text-[10px] text-[#19352c]/50">
                    {percentage}%
                  </p>
                </div>
              </div>

              <div className="ml-7 mt-3 h-2 overflow-hidden bg-[#19352c]/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#c7542b]"
                />
              </div>
            </div>
          );
        })}

        {total === 0 && (
          <p className="text-center font-mono text-xs text-[#19352c]/50">
            No responses have been recorded yet.
          </p>
        )}
      </div>
    );
  })()}
</div>
                </div>

                <p className="mt-8 font-mono text-[8px] uppercase tracking-[0.25em] text-[#19352c]/40">
                  {t.waitingFacilitator}
                </p>
                {previewMode && (
  <button
    onClick={() =>
      setPreviewStage(round === 1 ? "QUESTION_2" : "DISCUSSION")
    }
    className="mt-8 bg-[#19352c] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f1e6]"
  >
    {round === 1 ? "Continue to Round 2" : "Continue to Teaching"}
    <ArrowRight className="ml-2 inline h-4 w-4" />
  </button>
)}
              </motion.div>
            )}

            {/* BIBLICAL TEACHING AND REFLECTION */}
            {discussionStage && (
              <motion.div
                key="discussion"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#c7542b]">
                  {t.discussion}
                </p>

                <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
                  {t.teachingTitle}
                </h2>

                <div className="mt-10 space-y-4">
                  {t.teaching.map((item) => (
                    <div
                      key={item.verse}
                      className="border-l-2 border-[#c7542b] bg-[#eee5d5]/45 p-6"
                    >
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7542b]">
                        {item.verse}
                      </p>
                      <p className="mt-3 font-serif text-base leading-8">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-14 border-t border-[#19352c]/15 pt-10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#c7542b]">
                    {t.reflection}
                  </p>

                  <div className="mt-6 space-y-5">
                    {t.reflectionQuestions.map((questionText, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="font-mono text-sm text-[#c7542b]">
                          0{index + 1}
                        </span>
                        <p className="font-serif text-lg leading-8">
                          {questionText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-14 border border-[#19352c]/15 bg-[#19352c] p-7 text-[#f8f1e6] sm:p-10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#e5a080]">
                    {t.challenge}
                  </p>

                  <p className="mt-5 font-serif text-2xl leading-9">
                    {t.challengeDescription}
                  </p>
                </div>
              </motion.div>
            )}

            {/* COMPLETE */}
            {completeStage && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <CheckCircle2 className="mx-auto h-10 w-10 text-[#c7542b]" />

                <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.35em] text-[#c7542b]">
                  {t.completed}
                </p>

                <h2 className="mt-5 font-serif text-5xl sm:text-7xl">
                  {t.title}
                </h2>

                <div className="mx-auto mt-10 max-w-xl border border-[#19352c]/15 bg-[#eee5d5]/50 p-8 sm:p-12">
                  <p className="font-serif text-xl leading-9">
                    {t.completedDescription}
                  </p>
                </div>
                {previewMode && (
  <button
    onClick={() => {
      setAnswers({ 1: null, 2: null });
      setError("");
      setPreviewStage("INTRO");
    }}
    className="mt-10 bg-[#19352c] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#f8f1e6]"
  >
    Restart Preview
    <ArrowRight className="ml-2 inline h-4 w-4" />
  </button>
)}
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}