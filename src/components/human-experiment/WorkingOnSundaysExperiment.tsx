"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  BriefcaseBusiness,
  CalendarDays,
  Church,
  Clock3,
  Heart,
  LockKeyhole,
  Users,
  Languages,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { HumanExperimentSession } from "@/lib/human-experiment/session";
import {
  loadParticipantAnswer,
  loadRoomResults,
  saveParticipantAnswer,
} from "@/lib/human-experiment/answerSaveClient";

type Language = "en" | "hi";
type SceneKey = "scene1" | "scene2" | "scene3";

type Answers = {
  scene1: string | null;
  scene2: string | null;
  scene3: string | null;
  commitment: string | null;
};

type Counts = Record<SceneKey, Record<string, number>>;

const EMPTY: Answers = {
  scene1: null,
  scene2: null,
  scene3: null,
  commitment: null,
};

const OPTIONS = {
  scene1: ["higher_salary", "sunday_off", "discuss"],
  scene2: ["accept", "explain", "hope"],
  scene3: ["continue", "reconsider", "talk"],
} as const;

const TEXT = {
  en: {
    experience: "EXPERIENCE 03",
    theme: "THE LIVING CHURCH",
    title: "THE SUNDAY CHOICE",
    subtitle: "When work and worship meet.",
    intro:
      "Three moments. Three decisions. Think honestly about how you would respond when work, personal plans and worship compete for your time.",
    note: "There are no scores or perfect answers. Choose honestly.",
    enter: "ENTER THE EXPERIENCE",
    scene: "SCENE",
    imagine: "PUT YOURSELF IN THIS SITUATION",
    choose: "What would you do?",
    select: "SELECT ONE RESPONSE",
    submit: "RECORD MY CHOICE",
    saved: "YOUR CHOICE HAS BEEN RECORDED",
    waiting: "WAITING FOR THE FACILITATOR",
    waitingBody: "Your response has been saved. Please wait for the next instruction.",
    locked: "The facilitator has temporarily paused responses.",
    error: "Something went wrong. Please try again.",
    chooseError: "Please select a response first.",
    connectionError: "Your participant session could not be found. Please reconnect.",
    saving: "SAVING...",
    reveal: "THE ROOM'S RESPONSES",
    revealNote: "These results are anonymous. Every response is counted independently.",
    responses: "RESPONSES",
    noResponses: "No responses have been recorded yet.",
    discussion: "TAKE A MOMENT TO REFLECT",
    discussionTitle: "What are we making room for?",
    discussionBody:
      "Work is important. Providing for ourselves and our families is a responsibility. But repeated choices can gradually shape our priorities. The question is not simply whether we work on Sunday. It is whether we are intentionally making room for God and the people of His church.",
    verse1: "Remember the Sabbath day, to keep it holy.",
    reference1: "EXODUS 20:8",
    verse2: "The Sabbath was made for man, not man for the Sabbath.",
    reference2: "MARK 2:27",
    verse3: "Let us consider how to stir up one another to love and good works, not neglecting to meet together.",
    reference3: "HEBREWS 10:24–25",
    commitmentTitle: "A PERSONAL REFLECTION",
    commitmentBody:
      "What is one intentional step you want to take to protect your relationship with God and His church?",
    commitmentPlaceholder: "Write a private commitment...",
    saveCommitment: "SAVE MY PRIVATE REFLECTION",
    private: "PRIVATE — THIS IS NOT SHARED WITH THE ROOM",
    complete: "EXPERIENCE COMPLETE",
    completeTitle: "Your presence matters.",
    completeBody:
      "The church is more than a place we visit. We are a people who belong to Christ and to one another.",
    sticker: "ADD STICKER 03",
    back: "BACK",
    options: {
      higher_salary: {
        title: "CHOOSE THE HIGHER SALARY",
        body: "Accept the ₹75,000 offer, knowing Sunday shifts are part of the job.",
      },
      sunday_off: {
        title: "CHOOSE THE SUNDAY HOLIDAY",
        body: "Accept the ₹50,000 offer with a fixed Sunday holiday.",
      },
      discuss: {
        title: "DISCUSS BEFORE DECIDING",
        body: "Ask whether the first company can offer a workable Sunday arrangement.",
      },
      accept: {
        title: "ACCEPT THE ASSIGNMENT",
        body: "Attend work on Sunday because the manager has asked you to report.",
      },
      explain: {
        title: "EXPLAIN YOUR COMMITMENT",
        body: "Respectfully explain your worship commitment and ask whether another arrangement is possible.",
      },
      hope: {
        title: "AGREE AND HOPE IT IS ONCE",
        body: "Accept this time, hoping the Sunday assignment will not become regular.",
      },
      continue: {
        title: "KEEP THE SAME ROUTINE",
        body: "Use your free Sunday for rest or personal plans. You have become used to missing church.",
      },
      reconsider: {
        title: "RECONSIDER YOUR PRIORITIES",
        body: "Recognise the pattern and intentionally make room for worship and fellowship again.",
      },
      talk: {
        title: "HAVE AN HONEST CONVERSATION",
        body: "Explore whether your work arrangement can change and make a deliberate plan for Sundays when you are free.",
      },
    },
    scenes: [
      {
        title: "THE JOB OFFER",
        eyebrow: "A DECISION BEFORE YOU BEGIN",
        body:
          "You have received two job offers. Company A offers ₹75,000 per month, but Sunday shifts are included. Company B offers ₹50,000 per month, with a fixed Sunday holiday.\n\nBoth are genuine opportunities. You need the income, but Sunday worship and fellowship matter to you.",
        prompt: "Which offer would you choose?",
      },
      {
        title: "THE MANAGER'S REQUEST",
        eyebrow: "A DECISION AT WORK",
        body:
          "You have been working at a company for a few months. On Saturday evening, your manager informs you that an urgent assignment needs the team on Sunday. Everyone is expected to report.\n\nYou had planned to attend worship and fellowship. You know refusing may be difficult, especially as a new employee.",
        prompt: "How would you respond?",
      },
      {
        title: "THE GRADUAL DRIFT",
        eyebrow: "A PATTERN YOU DIDN'T NOTICE",
        body:
          "Sunday assignments have become frequent. You have missed worship and the Lord's Supper several times. At first, you felt uncomfortable. Gradually, it started feeling normal.\n\nOne Sunday, you finally have the day free. You could return to worship, but other plans are tempting.",
        prompt: "What would you do now?",
      },
    ],
    waitTitles: [
      "YOUR DECISION IS RECORDED",
      "PAUSE BEFORE THE NEXT SCENE",
      "TAKE A MOMENT",
    ],
    waitBodies: [
      "Consider what influenced your decision: income, security, faith, or the people around you.",
      "Think about the pressures people face at work. What makes this decision difficult?",
      "Notice how repeated decisions can slowly become habits.",
    ],
    resultLabels: [
      ["Higher salary", "Sunday holiday", "Discuss first"],
      ["Accept assignment", "Explain commitment", "Hope it's once"],
      ["Keep routine", "Reconsider", "Have a conversation"],
    ],
  },
  hi: {
    experience: "अनुभव ०३",
    theme: "जीवित कलीसिया",
    title: "रविवार का चुनाव",
    subtitle: "जब काम और आराधना आमने-सामने हों।",
    intro:
      "तीन परिस्थितियाँ। तीन निर्णय। सोचिए कि जब काम, निजी योजनाएँ और आराधना एक ही समय पर हों, तब आप क्या करेंगे।",
    note: "यहाँ कोई अंक या सही जवाब नहीं है। ईमानदारी से चुनाव करें।",
    enter: "अनुभव शुरू करें",
    scene: "दृश्य",
    imagine: "खुद को इस परिस्थिति में रखकर सोचें",
    choose: "आप क्या करेंगे?",
    select: "एक जवाब चुनें",
    submit: "मेरा चुनाव दर्ज करें",
    saved: "आपका चुनाव दर्ज हो गया है",
    waiting: "संचालक के अगले निर्देश की प्रतीक्षा करें",
    waitingBody: "आपका जवाब सुरक्षित है। कृपया अगले निर्देश की प्रतीक्षा करें।",
    locked: "संचालक ने कुछ समय के लिए जवाब देना रोक दिया है।",
    error: "कुछ समस्या हुई। कृपया फिर कोशिश करें।",
    chooseError: "पहले एक जवाब चुनें।",
    connectionError: "आपका प्रतिभागी सत्र नहीं मिला। कृपया दोबारा जुड़ें।",
    saving: "सुरक्षित हो रहा है...",
    reveal: "समूह के जवाब",
    revealNote: "ये जवाब गुमनाम हैं।",
    responses: "जवाब",
    noResponses: "अभी तक कोई जवाब दर्ज नहीं हुआ है।",
    discussion: "सोचने के लिए थोड़ा समय लें",
    discussionTitle: "हम किसके लिए समय निकाल रहे हैं?",
    discussionBody:
      "काम महत्वपूर्ण है। अपने और अपने परिवार की देखभाल करना हमारी जिम्मेदारी है। लेकिन बार-बार किए गए चुनाव हमारी प्राथमिकताओं को आकार देते हैं। सवाल केवल यह नहीं कि हम रविवार को काम करते हैं या नहीं, बल्कि यह है कि क्या हम जानबूझकर परमेश्वर और उसकी कलीसिया के लोगों के लिए समय निकाल रहे हैं।",
    verse1: "विश्रामदिन को पवित्र मानने के लिए स्मरण रख।",
    reference1: "निर्गमन 20:8",
    verse2: "विश्रामदिन मनुष्य के लिए बना है, न कि मनुष्य विश्रामदिन के लिए।",
    reference2: "मरकुस 2:27",
    verse3: "एक दूसरे को प्रेम और भले कामों में उकसाने के लिए विचार करें और एक-दूसरे के साथ इकट्ठा होना न छोड़ें।",
    reference3: "इब्रानियों 10:24–25",
    commitmentTitle: "व्यक्तिगत विचार",
    commitmentBody:
      "परमेश्वर और उसकी कलीसिया के साथ अपने संबंध को प्राथमिकता देने के लिए आप कौन-सा एक कदम उठाना चाहते हैं?",
    commitmentPlaceholder: "अपना निजी संकल्प लिखें...",
    saveCommitment: "मेरा निजी विचार सुरक्षित करें",
    private: "निजी — यह समूह के साथ साझा नहीं किया जाएगा",
    complete: "अनुभव पूरा हुआ",
    completeTitle: "आपकी उपस्थिति मायने रखती है।",
    completeBody:
      "कलीसिया केवल एक जगह नहीं जहाँ हम जाते हैं। हम मसीह और एक-दूसरे के हैं।",
    sticker: "स्टिकर ०३ लगाएँ",
    back: "वापस",
    options: {
      higher_salary: { title: "अधिक वेतन चुनें", body: "₹75,000 का प्रस्ताव स्वीकार करें, जिसमें रविवार को भी काम करना होगा।" },
      sunday_off: { title: "रविवार की छुट्टी चुनें", body: "₹50,000 का प्रस्ताव स्वीकार करें, जिसमें रविवार की निश्चित छुट्टी है।" },
      discuss: { title: "पहले बातचीत करें", body: "पूछें कि क्या पहली कंपनी रविवार के लिए कोई उचित व्यवस्था कर सकती है।" },
      accept: { title: "काम स्वीकार करें", body: "मैनेजर के कहने पर रविवार को काम पर जाएँ।" },
      explain: { title: "अपनी प्रतिबद्धता समझाएँ", body: "सम्मानपूर्वक अपनी आराधना की प्रतिबद्धता बताएँ और दूसरा विकल्प पूछें।" },
      hope: { title: "सोचें कि यह केवल एक बार होगा", body: "इस बार मान जाएँ और आशा करें कि ऐसा बार-बार नहीं होगा।" },
      continue: { title: "इसी दिनचर्या को जारी रखें", body: "रविवार को आराम या निजी योजनाओं के लिए रखें।" },
      reconsider: { title: "अपनी प्राथमिकताओं पर विचार करें", body: "इस आदत को पहचानें और फिर से आराधना और संगति के लिए समय निकालें।" },
      talk: { title: "खुलकर बातचीत करें", body: "काम की व्यवस्था बदलने की संभावना देखें और खाली रविवार को आराधना की योजना बनाएँ।" },
    },
    scenes: [
      {
        title: "नौकरी का प्रस्ताव",
        eyebrow: "शुरुआत से पहले एक निर्णय",
        body: "आपको नौकरी के दो प्रस्ताव मिले हैं। पहली कंपनी ₹75,000 देती है, लेकिन रविवार को भी काम करना होगा। दूसरी कंपनी ₹50,000 देती है और रविवार की निश्चित छुट्टी है।\n\nदोनों अच्छे अवसर हैं। आपको आय की जरूरत है, लेकिन रविवार की आराधना और संगति भी आपके लिए महत्वपूर्ण है।",
        prompt: "आप कौन-सा प्रस्ताव चुनेंगे?",
      },
      {
        title: "मैनेजर का अनुरोध",
        eyebrow: "काम पर एक निर्णय",
        body: "आप कुछ महीनों से एक कंपनी में काम कर रहे हैं। शनिवार शाम मैनेजर बताता है कि रविवार को एक जरूरी काम है और पूरी टीम से आने की अपेक्षा है।\n\nआपने आराधना और संगति में जाने की योजना बनाई थी। नए कर्मचारी होने के कारण मना करना कठिन हो सकता है।",
        prompt: "आप कैसे जवाब देंगे?",
      },
      {
        title: "धीरे-धीरे दूर होना",
        eyebrow: "एक आदत जिस पर ध्यान नहीं गया",
        body: "रविवार को काम बार-बार आने लगा है। आप कई बार आराधना और प्रभु भोज में शामिल नहीं हो पाए। पहले आपको इसका एहसास होता था, लेकिन धीरे-धीरे यह सामान्य लगने लगा।\n\nएक रविवार आपको छुट्टी मिलती है। आप आराधना में लौट सकते हैं, लेकिन दूसरी योजनाएँ भी आकर्षित करती हैं।",
        prompt: "अब आप क्या करेंगे?",
      },
    ],
    waitTitles: ["आपका निर्णय दर्ज हो गया", "अगले दृश्य से पहले रुकें", "थोड़ा विचार करें"],
    waitBodies: [
      "सोचें कि आपके निर्णय को किस बात ने प्रभावित किया — आय, सुरक्षा, विश्वास या आसपास के लोग।",
      "काम पर लोगों को किन दबावों का सामना करना पड़ता है? यह निर्णय कठिन क्यों है?",
      "ध्यान दें कि बार-बार किए गए निर्णय कैसे आदत बन सकते हैं।",
    ],
    resultLabels: [
      ["अधिक वेतन", "रविवार की छुट्टी", "पहले बातचीत"],
      ["काम स्वीकार", "प्रतिबद्धता समझाएँ", "केवल एक बार"],
      ["दिनचर्या जारी", "फिर विचार करें", "बातचीत करें"],
    ],
  },
};

const LABELS: Record<SceneKey, string[]> = {
  scene1: [...OPTIONS.scene1],
  scene2: [...OPTIONS.scene2],
  scene3: [...OPTIONS.scene3],
};

export default function WorkingOnSundaysExperiment({
  session,
}: {
  session: HumanExperimentSession;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [commitment, setCommitment] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Counts | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  const t = TEXT[language];
  const stage = String(session.stage ?? "INTRO");
  const locked = session.status === "PAUSED";

  // Restore this participant's own answers. Identity comes from the
  // secure participant cookie on the server, not from localStorage.
  useEffect(() => {
    if (!session.sessionId) {
      setLoading(false);
      return;
    }
    const sessionId = session.sessionId;
    let cancelled = false;

    async function loadAnswers() {
      setLoading(true);
      try {
        const { answer: saved } = await loadParticipantAnswer(sessionId, 3);
        if (cancelled) return;
        setAnswers({
          scene1: typeof saved.scene1 === "string" ? saved.scene1 : null,
          scene2: typeof saved.scene2 === "string" ? saved.scene2 : null,
          scene3: typeof saved.scene3 === "string" ? saved.scene3 : null,
          commitment: typeof saved.commitment === "string" ? saved.commitment : null,
        });
        setCommitment(typeof saved.commitment === "string" ? saved.commitment : "");
      } catch (err) {
        console.error("SUNDAY CHOICE LOAD FAILED:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAnswers();
    return () => { cancelled = true; };
  }, [session.sessionId]);

  async function savePatch(patch: Partial<Answers>, markComplete = false) {
    if (!session.sessionId) {
      setError(t.connectionError);
      return false;
    }
    if (locked || saving) return false;

    setSaving(true);
    setError("");
    try {
      const result = await saveParticipantAnswer({
        sessionId: session.sessionId,
        experience: 3,
        patch,
        markComplete,
        fallbackMessage: t.error,
      });
      if (!result.ok) {
        console.error("SUNDAY CHOICE SAVE FAILED:", result.message);
        setError(t.error);
        return false;
      }
      setAnswers((current) => ({ ...current, ...patch }));
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function submitScene(scene: SceneKey) {
    if (!answers[scene]) {
      setError(t.chooseError);
      return;
    }
    await savePatch({ [scene]: answers[scene] });
  }

  async function submitCommitment() {
    if (!commitment.trim()) {
      setError(t.chooseError);
      return;
    }
    await savePatch({ commitment: commitment.trim() }, true);
  }

  // Anonymous room counts for the reveal, aggregated on the server.
  useEffect(() => {
    const revealRounds: Record<string, number> = { REVEAL_1: 1, REVEAL_2: 2, REVEAL_3: 3 };
    const round = revealRounds[stage];
    if (!round || !session.sessionId) return;
    const sessionId = session.sessionId;
    let cancelled = false;

    async function loadResults() {
      setResultsLoading(true);
      try {
        const counts = await loadRoomResults(sessionId, 3, round);
        if (!cancelled) setResults(counts as Counts);
      } catch (err) {
        console.error("SUNDAY CHOICE RESULTS FAILED:", err);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }

    void loadResults();
    return () => { cancelled = true; };
  }, [stage, session.sessionId]);

  const currentSceneIndex =
    stage === "QUESTION_1" || stage === "WAIT_1" || stage === "REVEAL_1" ? 0 :
    stage === "QUESTION_2" || stage === "WAIT_2" || stage === "REVEAL_2" ? 1 :
    stage === "QUESTION_3" || stage === "WAIT_3" || stage === "REVEAL_3" ? 2 : -1;

  const questionStage = stage.startsWith("QUESTION_");
  const waitingStage = stage.startsWith("WAIT_");
  const revealStage = stage.startsWith("REVEAL_");
  const discussionStage = stage === "DISCUSSION";
  const completeStage = stage === "COMPLETE";
  const introStage = stage === "INTRO" || stage === "START";
  const sceneKey: SceneKey = currentSceneIndex === 0 ? "scene1" : currentSceneIndex === 1 ? "scene2" : "scene3";
  const scene = currentSceneIndex >= 0 ? t.scenes[currentSceneIndex] : null;
  const optionKeys = currentSceneIndex >= 0 ? OPTIONS[sceneKey] : [];

  const percentages = (key: SceneKey) => {
    const counts = results?.[key];
    if (!counts) return [];
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return LABELS[key].map((option, index) => ({
      option,
      count: counts[option] ?? 0,
      percentage: total ? Math.round(((counts[option] ?? 0) / total) * 100) : 0,
      label: t.resultLabels[key === "scene1" ? 0 : key === "scene2" ? 1 : 2][index],
    }));
  };

  const renderResults = (key: SceneKey) => {
    const rows = percentages(key);
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const sceneNumber = key === "scene1" ? "01" : key === "scene2" ? "02" : "03";

    return (
      <div className="mt-9">
        <div className="relative overflow-hidden border border-[#244238]/15 bg-[#fffdf8]/80 p-5 shadow-[0_18px_55px_rgba(35,54,45,0.06)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-[#c85c3b]/15" />
          <div className="pointer-events-none absolute -right-5 -top-9 h-32 w-32 rounded-full border border-[#c85c3b]/10" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#bd5939]">{t.reveal}</p>
              <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight text-[#18382f] sm:text-[2.65rem]">
                {language === "en" ? "A room full of different decisions." : "एक कमरे में अलग-अलग निर्णय।"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#526b60]">{t.revealNote}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#bd5939]/25 bg-[#f8eee5] text-[#bd5939]">
              <Users className="h-6 w-6" strokeWidth={1.4} />
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="border border-[#244238]/10 bg-[#f4f0e7] p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#63786e]">{t.responses}</p>
              <p className="mt-2 font-serif text-4xl text-[#18382f] tabular-nums">{resultsLoading ? "—" : total}</p>
            </div>
            <div className="border border-[#244238]/10 bg-[#f4f0e7] p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#63786e]">{language === "en" ? "SCENE" : "दृश्य"}</p>
              <p className="mt-2 font-serif text-4xl text-[#18382f] tabular-nums">{sceneNumber}<span className="text-xl text-[#9aaca1]"> / 03</span></p>
            </div>
          </div>

          {resultsLoading ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-[#63786e]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#bd5939]" />
              {language === "en" ? "Gathering the room's responses…" : "जवाब एकत्र किए जा रहे हैं…"}
            </div>
          ) : total === 0 ? (
            <div className="mt-8 border-t border-[#244238]/10 pt-6 text-sm text-[#63786e]">{t.noResponses}</div>
          ) : (
            <div className="relative mt-8 space-y-6">
              {rows.map((row, index) => (
                <motion.div
                  key={row.option}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.12, duration: 0.45 }}
                >
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 font-mono text-[9px] tracking-widest text-[#bd5939]">0{index + 1}</span>
                      <span className="text-sm font-medium leading-6 text-[#18382f]">{row.label}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-serif text-2xl text-[#18382f] tabular-nums">{row.percentage}%</span>
                      <span className="ml-2 font-mono text-[9px] text-[#788a80]">{row.count}</span>
                    </div>
                  </div>
                  <div className="h-[9px] overflow-hidden rounded-full bg-[#e7e6dc]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.percentage}%` }}
                      transition={{ duration: 1.05, delay: 0.25 + index * 0.13, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${index === 0 ? "bg-[#bd5939]" : index === 1 ? "bg-[#647e70]" : "bg-[#b6a58c]"}`}
                    />
                  </div>
                </motion.div>
              ))}
              <div className="flex items-center justify-between border-t border-[#244238]/10 pt-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#718379]">
                  {language === "en" ? "ANONYMOUS ROOM RESULTS" : "गुमनाम समूह परिणाम"}
                </p>
                <p className="font-mono text-[9px] text-[#718379]">{total} {t.responses}</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-start gap-3 border-l-2 border-[#bd5939] bg-[#f0e9dd]/70 px-5 py-4">
          <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#bd5939]" strokeWidth={1.5} />
          <p className="text-sm leading-7 text-[#526b60]">{t.waitBodies[key === "scene1" ? 0 : key === "scene2" ? 1 : 2]}</p>
        </div>
      </div>
    );
  };

  const sceneProgress = currentSceneIndex >= 0 ? (currentSceneIndex + 1) / 3 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4eee3] text-[#19382f] selection:bg-[#c85c3b]/20">
      {/* Quiet paper texture and the curved architectural mark from the Prerna identity. */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(89,79,58,.10) 0px, rgba(89,79,58,.10) 1px, transparent 1px, transparent 7px)" }} />
      <div className="pointer-events-none absolute -left-28 -top-36 h-[330px] w-[520px] rounded-[50%] border border-[#c85c3b]/15 bg-[#e9d9c8]/30" />
      <div className="pointer-events-none absolute -left-16 -top-24 h-[250px] w-[430px] rounded-[50%] border border-[#c85c3b]/10" />

      <div className="relative mx-auto max-w-[1560px] px-5 pb-8 pt-6 sm:px-10 sm:pt-7 lg:px-16">
        {/* Persistent Prerna header — intentionally identical across every stage. */}
       <header className="relative z-20 mb-10 grid grid-cols-[1fr_auto] items-start gap-4 border-b border-[#19382f]/20 pb-7 sm:mb-12 sm:pb-8">

  {/* LEFT: PRERNA IDENTITY */}
  <div className="min-w-0">
    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.42em] text-[#c34f2c] sm:text-[12px]">
      PRERNA / 2026
    </p>

    <h2 className="mt-4 whitespace-nowrap font-serif text-xl leading-none tracking-[-0.035em] text-[#17382f] sm:text-3xl lg:text-[2rem]">
      HUMAN EXPERIMENT
    </h2>

    <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.32em] text-[#000000] sm:text-[11px]">
      THE LIVING CHURCH
    </p>
  </div>

  {/* RIGHT: EXPERIENCE + LANGUAGE */}
  <div className="flex flex-col items-end gap-2 sm:gap-3">

    <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-[#000000] sm:text-[12px]">
      EXPERIENCE 03
    </p>

    <p className="font-mono text-sm font-semibold tracking-[0.12em] text-[#c34f2c] sm:text-base">
      03 / 05
    </p>

    <div className="mt-1 flex items-center border border-[#19382f]/15 bg-[#f8f3e9]/70 p-1">

      <span className="flex h-8 w-8 items-center justify-center text-[#71877b]">
        <Languages className="h-4 w-4" strokeWidth={1.4} />
      </span>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-3 py-2 font-mono text-[9px] transition-colors ${
          language === "en"
            ? "bg-[#18382f] text-[#f8f3e9]"
            : "text-[#71877b]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("hi")}
        className={`px-3 py-2 text-xs transition-colors ${
          language === "hi"
            ? "bg-[#18382f] text-[#f8f3e9]"
            : "text-[#71877b]"
        }`}
      >
        हिन्दी
      </button>

    </div>
  </div>

</header>

        {loading ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <motion.span className="absolute inset-0 rounded-full border border-[#c34f2c]/35" animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
              <BookOpen className="h-6 w-6 text-[#c34f2c]" strokeWidth={1.3} />
            </div>
            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.25em] text-[#71877b]">{language === "en" ? "PREPARING YOUR EXPERIENCE" : "आपका अनुभव तैयार हो रहा है"}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {introStage && (
              <motion.section key="intro" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="pt-12 sm:pt-16 lg:pt-[4.5rem]">
                <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] lg:gap-16">
                  <div>
           <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.08, duration: 0.7 }}
  className="mb-7 flex flex-wrap items-baseline gap-x-5 gap-y-2"
>
  <h2 className="whitespace-nowrap font-mono text-[18px] font-semibold uppercase tracking-[0.32em] text-[#c34f2c] sm:text-[18px]">
    {t.experience}
  </h2>

  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c34f2c] sm:text-[18px]">
    {language === "en"
      ? "- A MOMENT TO CONSIDER"
      : "विचार करने का एक क्षण"}
  </p>
</motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.7 }} className="mt-6 max-w-4xl font-serif text-[3.35rem] leading-[0.95] tracking-[-0.045em] text-[#18382f] sm:text-7xl lg:text-[6.4rem]">
                      {t.title}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 font-serif text-xl text-[#688173] sm:text-2xl">{t.subtitle}</motion.p>
                    <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="mt-8 max-w-2xl whitespace-pre-line text-[15px] leading-8 text-[#526a5f] sm:text-base sm:leading-9">{t.intro}</motion.p>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-7 flex items-center gap-3">
                      <span className="h-px w-8 bg-[#c34f2c]" />
                      <p className="font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-[#bd5939] sm:text-[9px]">{t.note}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }} className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 text-[#71877b]">
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]"><BriefcaseBusiness className="h-4 w-4 text-[#bd5939]" strokeWidth={1.4} /> WORK</span>
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]"><Sun className="h-4 w-4 text-[#bd5939]" strokeWidth={1.4} /> WORSHIP</span>
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]"><Heart className="h-4 w-4 text-[#bd5939]" strokeWidth={1.4} /> PRIORITIES</span>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, scale: 0.94, x: 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.28, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[440px] lg:ml-auto">
                    <div className="absolute -inset-5 rounded-[48%] border border-[#c34f2c]/15" />
                    <div className="absolute -inset-10 rounded-[48%] border border-[#19382f]/[0.07]" />
                    <div className="relative overflow-hidden border border-[#19382f]/15 bg-[#eae4d7]/80 p-7 sm:p-9">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#bd5939]">THE QUESTION</span>
                        <span className="font-mono text-[8px] text-[#809187]">03 / 03</span>
                      </div>
                      <div className="my-8 flex items-center justify-center">
                        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-[#19382f]/15 sm:h-56 sm:w-56">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full border border-dashed border-[#bd5939]/30" />
                          <div className="absolute left-4 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-[#19382f]/10 bg-[#f6f1e8] text-[#bd5939] shadow-sm"><BriefcaseBusiness className="h-5 w-5" strokeWidth={1.3} /></div>
                          <div className="absolute bottom-7 right-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#19382f]/10 bg-[#f6f1e8] text-[#71877b] shadow-sm"><Church className="h-5 w-5" strokeWidth={1.3} /></div>
                          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#18382f] text-[#f5eee2] shadow-[0_14px_32px_rgba(24,56,47,.2)] sm:h-28 sm:w-28">
                            <Clock3 className="h-5 w-5" strokeWidth={1.3} />
                            <span className="mt-2 font-mono text-[7px] tracking-[0.2em]">SUNDAY</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-[#19382f]/15 pt-5">
                        <p className="font-serif text-2xl leading-tight text-[#18382f]">{language === "en" ? "Where will your time go?" : "आप अपना समय कहाँ देंगे?"}</p>
                        <p className="mt-2 text-xs leading-6 text-[#718379]">{language === "en" ? "A choice can become a pattern. A pattern can shape a life." : "एक चुनाव आदत बन सकता है। एक आदत जीवन को आकार दे सकती है।"}</p>
                      </div>
                    </div>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-5 -left-4 border border-[#c34f2c]/15 bg-[#f8f3e9] px-4 py-3 shadow-[0_12px_30px_rgba(35,54,45,.07)] sm:-left-8">
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#bd5939]">{language === "en" ? "THREE MOMENTS" : "तीन परिस्थितियाँ"}</span>
                    </motion.div>
                  </motion.div>


                </div>
              </motion.section>
            )}

            {questionStage && scene && currentSceneIndex >= 0 && (
              <motion.section key={stage} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="pt-1 sm:pt--1 lg:pt--1">
              <div className="mb-6 sm:mb-8 flex items-end justify-between gap-5">

  {/* Scene title — left */}
  <div>
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#bd5939]">
      {t.scene} 0{currentSceneIndex + 1} / 03
    </p>

    <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.02] tracking-[-0.035em] text-[#18382f] sm:text-5xl lg:text-6xl">
      {scene.title}
    </h1>
  </div>

  {/* Progress — right */}
  <div className="w-[70px] shrink-0 pb-1 text-right sm:w-[85px]">
    <p className="font-mono text-[9px] tracking-[0.15em] text-[#809187]">
      {currentSceneIndex + 1} / 3
    </p>

    <div className="mt-4 flex gap-1.5">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: item * 0.08 }}
          className={`h-[4px] flex-1 origin-left ${
            item <= currentSceneIndex
              ? "bg-[#bd5939]"
              : "bg-[#19382f]/15"
          }`}
        />
      ))}
    </div>
  </div>

</div>
                <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.38fr)] lg:gap-14">
                  <motion.p
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.65, delay: 0.15 }}
  className="mt-0 max-w-5xl whitespace-pre-line font-serif text-[19px] leading-[1.8] tracking-[0.005em] text-[#252923] sm:text-[22px] sm:leading-[1.85] lg:text-[24px]"
>
  {scene.body}
</motion.p>
                  </div>

                {/* CINEMATIC SCENE VISUALS */}
                {currentSceneIndex === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 }}
                    className="relative mt-10 max-w-5xl overflow-hidden border border-[#19382f]/15 bg-[#eae4d8]/75 p-5 shadow-[0_20px_60px_rgba(35,54,45,.07)] sm:p-8"
                  >
                    <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[#bd5939]/15" />
                    <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-[#bd5939]/10" />
                    <div className="relative flex items-center justify-between">
                      <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-[#bd5939]">
                        {language === "en" ? "TWO PATHS · ONE DECISION" : "दो रास्ते · एक निर्णय"}
                      </p>
                      <span className="font-mono text-[8px] tracking-[0.2em] text-[#809187]">01 / 03</span>
                    </div>

                    <div className="relative mt-8 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -28, rotate: -2 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="relative min-h-[190px] overflow-hidden border border-[#bd5939]/25 bg-[#fffaf2] p-5 shadow-[0_12px_28px_rgba(35,54,45,.07)] sm:p-6"
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f0dfd2]/70" />
                        <div className="relative flex items-center justify-between">
                          <span className="font-mono text-[8px] tracking-[0.24em] text-[#bd5939]">COMPANY A</span>
                          <BriefcaseBusiness className="h-5 w-5 text-[#bd5939]" strokeWidth={1.3} />
                        </div>
                        <p className="relative mt-7 font-serif text-4xl tracking-tight text-[#18382f] sm:text-5xl">₹75,000</p>
                        <p className="relative mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#89968d]">{language === "en" ? "PER MONTH" : "प्रति माह"}</p>
                        <div className="relative mt-5 flex items-center gap-2 border-t border-[#19382f]/10 pt-4 text-xs text-[#8c513d]">
                          <Clock3 className="h-4 w-4" />
                          {language === "en" ? "Sunday shifts included" : "रविवार को भी काम"}
                        </div>
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute right-5 top-[4.4rem] h-2 w-2 rounded-full bg-[#bd5939]/65"
                        />
                      </motion.div>

                      <div className="relative z-10 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="flex h-14 w-14 items-center justify-center rounded-full border border-[#19382f]/15 bg-[#f4eee3] font-serif text-xl text-[#bd5939] shadow-sm"
                        >
                          ?
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, x: 28, rotate: 2 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="relative min-h-[190px] overflow-hidden border border-[#668072]/30 bg-[#e9eee6] p-5 shadow-[0_12px_28px_rgba(35,54,45,.06)] sm:p-6"
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#d7e0d5]/80" />
                        <div className="relative flex items-center justify-between">
                          <span className="font-mono text-[8px] tracking-[0.24em] text-[#668072]">COMPANY B</span>
                          <CalendarDays className="h-5 w-5 text-[#668072]" strokeWidth={1.3} />
                        </div>
                        <p className="relative mt-7 font-serif text-4xl tracking-tight text-[#18382f] sm:text-5xl">₹50,000</p>
                        <p className="relative mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#89968d]">{language === "en" ? "PER MONTH" : "प्रति माह"}</p>
                        <div className="relative mt-5 flex items-center gap-2 border-t border-[#19382f]/10 pt-4 text-xs text-[#526b60]">
                          <CalendarDays className="h-4 w-4" />
                          {language === "en" ? "Fixed Sunday holiday" : "रविवार की निश्चित छुट्टी"}
                        </div>
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute right-5 top-[4.4rem] h-2 w-2 rounded-full bg-[#668072]/65"
                        />
                      </motion.div>
                    </div>

                    <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-[#19382f]/10 pt-5">
                      <motion.div
                        animate={{ rotate: [0, -7, 0, 7, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18382f] text-[#f5eee2]"
                      >
                        <Sun className="h-4 w-4" />
                      </motion.div>
                      <p className="font-serif text-lg text-[#365548]">
                        {language === "en" ? "What matters most in the long run?" : "लंबे समय में आपके लिए सबसे महत्वपूर्ण क्या है?"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentSceneIndex === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 }}
                    className="relative mt-10 max-w-5xl overflow-hidden border border-[#19382f]/15 bg-[#e8e4da] p-5 shadow-[0_20px_60px_rgba(35,54,45,.07)] sm:p-8"
                  >
                    <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full border border-[#bd5939]/15" />
                    <div className="relative grid items-center gap-7 lg:grid-cols-[.8fr_1.2fr]">
                      <div className="relative mx-auto flex w-full max-w-[270px] flex-col items-center py-5">
                        <motion.div
                          animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.9, 0.55] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute h-52 w-52 rounded-full border border-dashed border-[#bd5939]/35"
                        />
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                          className="absolute h-60 w-60 rounded-full border border-[#19382f]/10"
                        />
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#18382f] text-[#f5eee2] shadow-[0_18px_38px_rgba(24,56,47,.2)]">
                          <BriefcaseBusiness className="h-10 w-10" strokeWidth={1.15} />
                        </div>
                        <motion.div
                          animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute right-3 top-7 flex h-12 w-12 items-center justify-center rounded-full border border-[#bd5939]/20 bg-[#f8f1e7] text-[#bd5939] shadow-md"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </motion.div>
                        <motion.div
                          animate={{ y: [0, 7, 0] }}
                          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#668072]/25 bg-[#eef0e8] text-[#668072] shadow-md"
                        >
                          <CalendarDays className="h-5 w-5" />
                        </motion.div>
                        <p className="relative mt-8 font-mono text-[8px] uppercase tracking-[0.25em] text-[#bd5939]">
                          {language === "en" ? "SATURDAY · 7:42 PM" : "शनिवार · शाम ७:४२"}
                        </p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, x: 26, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.65 }}
                        className="relative border border-[#19382f]/15 bg-[#fffaf2] p-5 shadow-[0_14px_35px_rgba(35,54,45,.07)] sm:p-7"
                      >
                        <div className="flex items-center justify-between border-b border-[#19382f]/10 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18382f] text-[#f4eee3]">
                              <BriefcaseBusiness className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#7a8b80]">{language === "en" ? "WORKPLACE MESSAGE" : "कार्यस्थल का संदेश"}</p>
                              <p className="mt-1 font-serif text-lg text-[#18382f]">{language === "en" ? "Your manager" : "आपके मैनेजर"}</p>
                            </div>
                          </div>
                          <motion.span
                            animate={{ opacity: [1, 0.45, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="rounded-full bg-[#f2e1d6] px-3 py-1 font-mono text-[7px] tracking-[0.16em] text-[#bd5939]"
                          >
                            {language === "en" ? "NEW MESSAGE" : "नया संदेश"}
                          </motion.span>
                        </div>
                        <div className="pt-6">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.65, duration: 0.5 }}
                            className="border-l-2 border-[#bd5939] bg-[#f3eee4] px-5 py-5"
                          >
                            <MessageCircle className="h-4 w-4 text-[#bd5939]" strokeWidth={1.4} />
                            <p className="mt-3 font-serif text-xl leading-relaxed text-[#18382f] sm:text-2xl">
                              “{language === "en" ? "An urgent assignment needs the team tomorrow. Everyone is expected to report." : "कल एक जरूरी काम है। पूरी टीम से आने की अपेक्षा है।"}”
                            </p>
                          </motion.div>
                          <div className="mt-5 flex items-center justify-between gap-3">
                            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#87958b]">{language === "en" ? "SUNDAY · TOMORROW" : "रविवार · कल"}</span>
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 2.4, repeat: Infinity }}
                              className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#bd5939]"
                            >
                              <span className="h-2 w-2 rounded-full bg-[#bd5939]" />
                              {language === "en" ? "RESPONSE REQUIRED" : "जवाब अपेक्षित"}
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <div className="relative mt-7 grid grid-cols-7 gap-1.5 border-t border-[#19382f]/10 pt-5 sm:gap-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                        <div key={`${day}-${index}`} className={`relative flex h-12 items-center justify-center border text-[9px] font-mono ${index === 6 ? "border-[#bd5939]/40 bg-[#f1dfd3] text-[#bd5939]" : "border-[#19382f]/10 bg-[#f5f0e7] text-[#8a988e]"}`}>
                          {day}
                          {index === 6 && <motion.span animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#bd5939]" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSceneIndex === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 }}
                    className="relative mt-10 max-w-5xl overflow-hidden border border-[#19382f]/15 bg-[#eae4d8]/75 p-5 shadow-[0_20px_60px_rgba(35,54,45,.07)] sm:p-8"
                  >
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#bd5939]/15" />
                    <div className="relative flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-[8px] uppercase tracking-[0.26em] text-[#bd5939]">{language === "en" ? "THE SUNDAYS THAT ADD UP" : "बीते हुए रविवार"}</p>
                      <span className="font-mono text-[8px] tracking-[0.18em] text-[#849188]">{language === "en" ? "FOUR WEEKS" : "चार सप्ताह"}</span>
                    </div>
                    <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                      {["01", "02", "03", "04"].map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, y: 18, rotate: index % 2 === 0 ? -2 : 2 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          transition={{ delay: 0.18 + index * 0.16, duration: 0.55 }}
                          className="relative overflow-hidden border border-[#19382f]/10 bg-[#fffaf2]/85 p-4 text-center sm:p-5"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-[#bd5939]/65" />
                          <span className="font-mono text-[8px] tracking-[0.16em] text-[#8a988e]">{language === "en" ? "SUNDAY" : "रविवार"} {item}</span>
                          <motion.div
                            animate={{ scale: [1, 1.07, 1] }}
                            transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                            className="mx-auto my-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e1d5] text-[#bd5939]"
                          >
                            <Clock3 className="h-6 w-6" strokeWidth={1.25} />
                          </motion.div>
                          <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#bd5939]">{language === "en" ? "MISSED" : "अनुपस्थित"}</span>
                          <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.45 + index * 0.16, duration: 0.5 }}
                            className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#bd5939]/60"
                          />
                        </motion.div>
                      ))}
                    </div>
                    <div className="relative mt-7 flex flex-col items-center justify-between gap-5 border-t border-[#19382f]/10 pt-6 sm:flex-row">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#18382f] text-[#f5eee2]">
                          <Church className="h-5 w-5" strokeWidth={1.3} />
                        </div>
                        <div>
                          <p className="font-serif text-xl text-[#18382f]">{language === "en" ? "The doors are still open." : "दरवाज़े अब भी खुले हैं।"}</p>
                          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#829187]">{language === "en" ? "A PLACE TO RETURN TO" : "लौटने की जगह"}</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center gap-3 text-[#bd5939]"
                      >
                        <span className="h-px w-10 bg-[#bd5939]/50" />
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-12 border-t border-[#19382f]/15 pt-8 sm:mt-14">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div><p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#bd5939]">{t.imagine}</p><h2 className="mt-3 font-serif text-3xl leading-tight text-[#18382f] sm:text-4xl">{scene.prompt}</h2></div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#8a988e]">{t.select}</p>
                  </div>
                  <div className="mt-7 grid gap-3">
                    {optionKeys.map((key, index) => {
                      const option = t.options[key as keyof typeof t.options];
                      const selected = answers[sceneKey] === key;
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + index * 0.08 }}
                          disabled={locked || saving}
                          onClick={() => { setAnswers((current) => ({ ...current, [sceneKey]: key })); setError(""); }}
                          aria-pressed={selected}
                          className={`group relative w-full overflow-hidden border px-5 py-5 text-left transition-all duration-300 sm:px-7 sm:py-6 ${selected ? "border-[#bd5939] bg-[#f3e7dc] shadow-[0_10px_26px_rgba(189,89,57,.08)]" : "border-[#19382f]/15 bg-[#fffdf8]/65 hover:border-[#71877b]/60 hover:bg-[#fffdf8]"} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <span className={`absolute bottom-0 left-0 top-0 w-[3px] origin-bottom transition-transform duration-300 ${selected ? "scale-y-100 bg-[#bd5939]" : "scale-y-0 bg-[#bd5939] group-hover:scale-y-100"}`} />
                          <span className="flex items-start gap-4 sm:gap-5">
                            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[9px] transition-colors ${selected ? "border-[#bd5939] bg-[#bd5939] text-white" : "border-[#19382f]/20 text-[#809187] group-hover:border-[#bd5939] group-hover:text-[#bd5939]"}`}>{selected ? <Check className="h-3.5 w-3.5" /> : `0${index + 1}`}</span>
                            <span className="min-w-0 flex-1"><span className={`block text-[10px] font-semibold uppercase tracking-[0.13em] ${selected ? "text-[#a94e32]" : "text-[#19382f]"}`}>{option.title}</span><span className="mt-2 block max-w-3xl text-sm leading-7 text-[#65786e]">{option.body}</span></span>
                            <span className={`mt-1 hidden transition-transform duration-300 sm:block ${selected ? "translate-x-0 text-[#bd5939]" : "-translate-x-2 text-[#9aa69d] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}><ArrowRight className="h-4 w-4" /></span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-5">{locked && <p className="text-xs text-[#bd5939]">{t.locked}</p>}{error && <p role="alert" className="text-xs text-[#bd5939]">{error}</p>}</div>
                    <button type="button" onClick={() => void submitScene(sceneKey)} disabled={locked || saving || !answers[sceneKey]} className="group inline-flex min-h-14 w-full items-center justify-center gap-4 bg-[#18382f] px-7 py-4 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f5eee2] transition-all duration-300 hover:bg-[#244b3e] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto sm:min-w-[260px]">
                      <span>{saving ? t.saving : t.submit}</span><ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {waitingStage && currentSceneIndex >= 0 && (
  <motion.section
    key={stage}
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-14 text-center"
  >
    {/* Animated clock illustration */}
    <div className="relative flex h-40 w-40 items-center justify-center">

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-[#19382f]/20"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-3 rounded-full border border-dashed border-[#bd5939]/50"
      />

      <motion.span
        animate={{ scale: [1, 1.2, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-4 top-4 h-4 w-4 rounded-full bg-[#bd5939]"
      />

      <Clock3
        className="h-12 w-12 text-[#bd5939]"
        strokeWidth={1.35}
      />
    </div>

    {/* Waiting label */}
    <p className="mt-10 font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[#bd5939]">
      {t.waiting}
    </p>

    {/* Main heading */}
    <motion.h1
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.7 }}
      className="mt-5 font-serif text-6xl leading-none tracking-[-0.035em] text-[#18382f] sm:text-7xl"
    >
      {language === "en" ? "WAIT." : "प्रतीक्षा करें।"}
    </motion.h1>

    {/* Supporting message */}
    <p className="mx-auto mt-8 max-w-xl font-serif text-lg leading-[1.8] text-[#71877b] sm:text-xl sm:leading-[1.9]">
      {language === "en"
        ? "Your response is saved. Listen for the facilitator's next instruction."
        : "आपका जवाब सुरक्षित है। संचालक के अगले निर्देश को ध्यान से सुनें।"}
    </p>

    {/* Waiting status panel */}
    <div className="mt-12 flex w-full max-w-md items-center justify-center gap-4 border border-[#19382f]/15 bg-white/20 px-5 py-6">

      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#bd5939]"
      />

      <p className="font-mono text-[8px] font-medium uppercase tracking-[0.25em] text-[#71877b] sm:text-[9px]">
        {t.waiting}
      </p>
    </div>
  </motion.section>
)}

            {revealStage && currentSceneIndex >= 0 && (
              <motion.section key={stage} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="pt-10 sm:pt-14">
                <div className="relative overflow-hidden border-b border-[#19382f]/15 pb-8">
                  <div className="pointer-events-none absolute -right-10 -top-20 font-serif text-[16rem] leading-none text-[#19382f]/[0.035]">{currentSceneIndex + 1}</div>
                  <p className="relative font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-[#bd5939]">{language === "en" ? "THE REVEAL" : "परिणाम"} · 0{currentSceneIndex + 1}</p>
                  <h1 className="relative mt-4 max-w-4xl font-serif text-4xl leading-[1.02] tracking-[-0.035em] text-[#18382f] sm:text-6xl">{t.scenes[currentSceneIndex].title}</h1>
                  <p className="relative mt-4 max-w-2xl text-sm leading-7 text-[#6a7d72]">{language === "en" ? "Every response tells us something about the pressures, hopes and priorities in this room." : "हर जवाब इस कमरे के दबावों, आशाओं और प्राथमिकताओं के बारे में कुछ बताता है।"}</p>
                </div>
                {renderResults(sceneKey)}
              </motion.section>
            )}

            {discussionStage && (
              <motion.section
                key="discussion"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="pt-8 pb-10 sm:pt-12"
              >
                {/* Simple opening */}
                <div className="grid gap-7 border-b border-[#19382f]/15 pb-9 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#bd5939] sm:text-[11px]">
                      {language === "en" ? "SCRIPTURE & REFLECTION" : "पवित्रशास्त्र और मनन"}
                    </p>
                    <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.035em] text-[#18382f] sm:text-6xl">
                      {language === "en" ? "What are we making room for?" : "हम किसके लिए जगह बना रहे हैं?"}
                    </h1>
                  </div>
                  <div className="flex items-center border-l-2 border-[#bd5939]/60 pl-6 sm:pl-8">
                    <p className="font-serif text-xl leading-[1.65] text-[#365548] sm:text-2xl">
                      {language === "en"
                        ? "Work matters. Caring for our families matters. But our lives can become so busy that we slowly leave less and less room for God and His people."
                        : "काम जरूरी है। अपने परिवार की देखभाल करना भी जरूरी है। लेकिन कभी-कभी जीवन इतना व्यस्त हो जाता है कि धीरे-धीरे परमेश्वर और उसके लोगों के लिए समय कम होता जाता है।"}
                    </p>
                  </div>
                </div>

                {/* One clear teaching idea */}
                <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
                  <div className="bg-[#18382f] p-7 text-[#f5eee2] sm:p-9">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e0a58d]">
                      {language === "en" ? "THE BIG IDEA" : "मुख्य बात"}
                    </p>
                    <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
                      {language === "en" ? "God wants to be at the centre of our lives." : "परमेश्वर हमारे जीवन के केन्द्र में होना चाहते हैं।"}
                    </h2>
                    <p className="mt-5 text-base leading-8 text-[#d5ded7] sm:text-lg">
                      {language === "en"
                        ? "In the Old Testament, God told His people to set apart the Sabbath as a day of rest. It reminded them that life was not only about work. They belonged to God, and they could trust Him to provide."
                        : "पुराने नियम में परमेश्वर ने अपने लोगों को विश्रामदिन अलग रखने की आज्ञा दी। यह उन्हें याद दिलाता था कि जीवन केवल काम के बारे में नहीं है। वे परमेश्वर के हैं और अपनी जरूरतों के लिए उस पर भरोसा कर सकते हैं।"}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center border border-[#19382f]/15 bg-[#fffdf8]/75 p-7 sm:p-9">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bd5939]">
                      {language === "en" ? "WHY THIS MATTERS TO US" : "यह हमारे लिए क्यों जरूरी है"}
                    </p>
                    <p className="mt-4 font-serif text-xl leading-[1.7] text-[#365548] sm:text-2xl">
                      {language === "en"
                        ? "Jesus showed that God's commands are meant for our good, not to burden us. And the New Testament reminds us that we need one another. Following Jesus includes making room for worship, encouragement and fellowship."
                        : "यीशु ने दिखाया कि परमेश्वर की आज्ञाएँ हमारी भलाई के लिए हैं, हमें बोझ देने के लिए नहीं। नया नियम हमें याद दिलाता है कि हमें एक-दूसरे की जरूरत है। यीशु के पीछे चलने में आराधना, प्रोत्साहन और संगति के लिए समय निकालना भी शामिल है।"}
                    </p>
                  </div>
                </div>

                {/* Three verses, each with one plain explanation */}
                <div className="mt-12 sm:mt-14">
                  <div className="mb-6">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#bd5939] sm:text-[11px]">
                      {language === "en" ? "THREE VERSES TO REMEMBER" : "याद रखने के लिए तीन वचन"}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl leading-tight text-[#18382f] sm:text-4xl">
                      {language === "en" ? "What does the Bible teach us?" : "बाइबल हमें क्या सिखाती है?"}
                    </h2>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <article className="border border-[#19382f]/15 bg-[#fffdf8]/80 p-6 sm:p-7">
                      <span className="font-serif text-4xl text-[#bd5939]/60">01</span>
                      <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bd5939]">EXODUS 20:8–10</p>
                      <p className="mt-4 font-serif text-xl leading-relaxed text-[#18382f] sm:text-2xl">“{t.verse1}”</p>
                      <div className="my-5 h-px bg-[#19382f]/15" />
                      <h3 className="font-serif text-2xl text-[#18382f]">{language === "en" ? "Remember God" : "परमेश्वर को याद रखें"}</h3>
                      <p className="mt-2 text-base leading-7 text-[#5f7469]">
                        {language === "en"
                          ? "Do not let work become your whole life. Make time to remember God and depend on Him."
                          : "काम को अपना पूरा जीवन न बनने दें। परमेश्वर को याद करने और उस पर भरोसा रखने के लिए समय निकालें।"}
                      </p>
                    </article>

                    <article className="border border-[#19382f]/15 bg-[#e8ede5] p-6 sm:p-7">
                      <span className="font-serif text-4xl text-[#71877b]/65">02</span>
                      <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668072]">MARK 2:27</p>
                      <p className="mt-4 font-serif text-xl leading-relaxed text-[#18382f] sm:text-2xl">“{t.verse2}”</p>
                      <div className="my-5 h-px bg-[#19382f]/15" />
                      <h3 className="font-serif text-2xl text-[#18382f]">{language === "en" ? "Receive God's gift" : "परमेश्वर का उपहार ग्रहण करें"}</h3>
                      <p className="mt-2 text-base leading-7 text-[#526b60]">
                        {language === "en"
                          ? "Jesus taught that the Sabbath was made for people's good. God cares about our needs and our well-being."
                          : "यीशु ने सिखाया कि विश्रामदिन मनुष्य की भलाई के लिए बनाया गया था। परमेश्वर हमारी जरूरतों और भलाई की परवाह करते हैं।"}
                      </p>
                    </article>

                    <article className="border border-[#19382f]/15 bg-[#fffdf8]/80 p-6 sm:p-7">
                      <span className="font-serif text-4xl text-[#bd5939]/60">03</span>
                      <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bd5939]">HEBREWS 10:24–25</p>
                      <p className="mt-4 font-serif text-xl leading-relaxed text-[#18382f] sm:text-2xl">“{t.verse3}”</p>
                      <div className="my-5 h-px bg-[#19382f]/15" />
                      <h3 className="font-serif text-2xl text-[#18382f]">{language === "en" ? "Stay connected" : "जुड़े रहें"}</h3>
                      <p className="mt-2 text-base leading-7 text-[#5f7469]">
                        {language === "en"
                          ? "Church is more than attending a meeting. We gather to encourage one another and grow together in faith."
                          : "कलीसिया केवल सभा में आने का नाम नहीं है। हम एक-दूसरे को प्रोत्साहित करने और विश्वास में साथ बढ़ने के लिए इकट्ठा होते हैं।"}
                      </p>
                    </article>
                  </div>
                </div>

                {/* Clear, compassionate connection to the scenarios */}
                <div className="mt-10 border-l-4 border-[#bd5939] bg-[#eae4d8]/80 px-6 py-6 sm:px-9 sm:py-8">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bd5939]">
                    {language === "en" ? "BRING IT INTO EVERYDAY LIFE" : "इसे अपने जीवन में लागू करें"}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl leading-tight text-[#18382f] sm:text-3xl">
                    {language === "en" ? "Small choices can shape our priorities." : "छोटे चुनाव हमारी प्राथमिकताओं को आकार देते हैं।"}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[#526b60] sm:text-lg">
                    {language === "en"
                      ? "Sometimes work demands are outside our control, and providing for a family is a real responsibility. This is not about judging people. It is about asking whether, where we do have a choice, we are making room for God, worship and the people who help us grow."
                      : "कभी-कभी काम की मांगें हमारे नियंत्रण से बाहर होती हैं, और परिवार की देखभाल करना एक वास्तविक जिम्मेदारी है। यह किसी को दोष देने के बारे में नहीं है। यह पूछने के बारे में है कि जहाँ हमारे पास चुनाव करने की स्वतंत्रता है, क्या हम परमेश्वर, आराधना और विश्वास में बढ़ने में मदद करने वाले लोगों के लिए समय निकाल रहे हैं?"}
                  </p>
                </div>

                {/* Private personal response — preserve existing save behaviour */}
                <div className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-10">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bd5939]">
                      {language === "en" ? "YOUR PERSONAL RESPONSE" : "आपका व्यक्तिगत जवाब"}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl leading-tight text-[#18382f] sm:text-4xl">
                      {language === "en" ? "What is one step you can take?" : "आप कौन-सा एक कदम उठा सकते हैं?"}
                    </h2>
                    <p className="mt-4 text-base leading-8 text-[#63786e] sm:text-lg">
                      {language === "en"
                        ? "Think about your own routine. What is one practical change that can help you make more room for God and His people?"
                        : "अपनी दिनचर्या के बारे में सोचें। कौन-सा एक व्यावहारिक बदलाव आपको परमेश्वर और उसके लोगों के लिए अधिक समय निकालने में मदद कर सकता है?"}
                    </p>
                  </div>

                  <div className="border border-[#19382f]/15 bg-[#fffdf8]/85 p-6 shadow-[0_14px_40px_rgba(35,54,45,.05)] sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#bd5939]">
                        <Heart className="h-5 w-5" strokeWidth={1.4} />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
                          {language === "en" ? "PRIVATE REFLECTION" : "निजी मनन"}
                        </span>
                      </div>
                      <LockKeyhole className="h-4 w-4 text-[#809187]" strokeWidth={1.4} />
                    </div>
                    <textarea
                      value={commitment}
                      onChange={(event) => setCommitment(event.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder={t.commitmentPlaceholder}
                      disabled={locked || saving}
                      className="mt-5 min-h-[140px] w-full resize-y border-0 border-b border-[#19382f]/25 bg-transparent px-0 py-3 text-base leading-8 text-[#18382f] outline-none placeholder:text-[#9aa69d] focus:border-[#bd5939] disabled:opacity-50 sm:text-lg"
                    />
                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-sm text-[#718379]">
                        <LockKeyhole className="h-4 w-4" />{t.private}
                      </p>
                      <button
                        type="button"
                        onClick={() => void submitCommitment()}
                        disabled={locked || saving || !commitment.trim()}
                        className="group inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#18382f] px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f5eee2] transition-colors hover:bg-[#244b3e] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                      >
                        {saving ? t.saving : t.saveCommitment}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                    {error && <p role="alert" className="mt-4 text-sm text-[#bd5939]">{error}</p>}
                  </div>
                </div>
                {locked && <p className="mt-5 text-center text-sm text-[#bd5939]">{t.locked}</p>}
              </motion.section>
            )}

            {completeStage && (
              <motion.section key="complete" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center py-14 text-center">
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-[#bd5939]/35" />
                  <span className="absolute inset-3 rounded-full border border-[#19382f]/15" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#18382f] text-[#f5eee2] shadow-[0_15px_35px_rgba(24,56,47,.18)]"><Church className="h-8 w-8" strokeWidth={1.2} /></div>
                </div>
                <p className="mt-9 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-[#bd5939]">{t.complete}</p>
                <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-[#18382f] sm:text-7xl">{t.completeTitle}</h1>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#63786e]">{t.completeBody}</p>
                <div className="mt-12 flex w-full max-w-md items-center gap-4 border-y border-[#19382f]/15 py-6 text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#bd5939]/25 bg-[#f1e6dc] text-[#bd5939]"><BookOpen className="h-5 w-5" strokeWidth={1.3} /></div>
                  <div className="min-w-0"><p className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-[#bd5939]">{t.sticker}</p><p className="mt-1 font-serif text-lg text-[#18382f]">THE SUNDAY CHOICE</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#86958b]">PRERNA / 2026</p></div>
                  <Check className="ml-auto h-5 w-5 text-[#71877b]" strokeWidth={1.4} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        )}

        {locked && !loading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#bd5939]"><span className="h-1.5 w-1.5 rounded-full bg-[#bd5939]" />{t.locked}</div>
        )}

        <footer className="relative mt-16 flex flex-col gap-3 border-t border-[#19382f]/15 pt-5 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#8b9a90]">PRERNA 2026 <span className="px-2 text-[#bd5939]">/</span> THE LIVING CHURCH</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8b9a90]">WORK <span className="px-1 text-[#bd5939]">·</span> WORSHIP <span className="px-1 text-[#bd5939]">·</span> PRIORITIES</p>
        </footer>
      </div>
    </main>
  );
}
