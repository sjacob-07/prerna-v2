"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, Check, Church, HeartHandshake, LockKeyhole,
  MessageCircle, HandHeart, Sprout, Users, ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { HumanExperimentSession } from "@/lib/human-experiment/session";
import {
  loadParticipantAnswer,
  saveParticipantAnswer,
} from "@/lib/human-experiment/answerSaveClient";

type Language = "en" | "hi";
type Reflection = { restore: string; strengthen: string; nextStep: string; commitment: string };
type CommitmentEntry = { id: string; title: string; category: string; text: string };
const EMPTY: Reflection = { restore: "", strengthen: "", nextStep: "", commitment: "" };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const COPY = {
  en: {
    exp: "EXPERIENCE 05 · FINAL REFLECTION", title: "THE LIVING CHURCH",
    subtitle: "A faith that grows. A people who belong. A life devoted to Christ.",
    intro: "We have explored four everyday parts of Christian life. Now bring them together. This is a moment to look honestly at our own walk with God and consider the kind of church we are becoming.",
    begin: "BEGIN THE FINAL REFLECTION", journeyEyebrow: "LOOK BACK · MOVE FORWARD", journeyTitle: "Four experiences. One connected life.",
    journeyBody: "These were never meant to be four separate activities. God's Word shapes us, fellowship strengthens us, our choices reveal what we value, and prayer keeps us close to Him.",
    cards: [
      { n: "01", title: "BEYOND THE HABIT", body: "God's Word is not simply something to finish. It is truth that shapes how we live.", short: "GROW IN THE WORD", icon: "book" },
      { n: "02", title: "THE EMPTY SEAT", body: "We are not meant to follow Christ alone. We belong to a community that needs our presence and care.", short: "BELONG TO ONE ANOTHER", icon: "people" },
      { n: "03", title: "THE SUNDAY CHOICE", body: "Our faith reaches into ordinary decisions, responsibilities and the way we honour God.", short: "LIVE OUT YOUR FAITH", icon: "choice" },
      { n: "04", title: "THE QUIET CONNECTION", body: "Prayer is more than an emergency response. It is an ongoing relationship with God.", short: "WALK WITH GOD", icon: "prayer" },
    ],
    scriptureEyebrow: "OUR FOUNDATION", scriptureTitle: "A picture of the living church.",
    scripture: "They devoted themselves to the apostles’ teaching and to fellowship, to the breaking of bread and to prayer.",
    scriptureRef: "ACTS 2:42", scriptureNote: "The early believers were not devoted to a building or an occasional gathering. They were devoted to a shared life centred on Christ.",
    foundations: [
      { title: "THE APOSTLES’ TEACHING", body: "We keep growing through God's Word.", tag: "GROW IN TRUTH", icon: "book" },
      { title: "FELLOWSHIP", body: "We share life, carry one another's burdens and encourage one another.", tag: "LIVE IN COMMUNITY", icon: "people" },
      { title: "THE BREAKING OF BREAD", body: "We remember Christ and share in the life of His people.", tag: "REMEMBER CHRIST", icon: "bread" },
      { title: "PRAYER", body: "We remain dependent on God and connected with Him.", tag: "WALK WITH GOD", icon: "prayer" },
    ],
    reflectionEyebrow: "TAKE AN HONEST LOOK", reflectionTitle: "Where is God inviting me to grow?",
    reflectionBody: "Take a quiet moment. You do not need to write what sounds impressive. Be honest before God. Your responses are private and will not be shown to the room or facilitator.",
    restoreLabel: "SOMETHING I NEED TO RESTORE", restoreHint: "What have I been neglecting in my walk with God?",
    strengthenLabel: "SOMETHING I NEED TO STRENGTHEN", strengthenHint: "Where do I want to grow in my faith or relationships?",
    stepLabel: "ONE PRACTICAL STEP I WILL TAKE", stepHint: "What is one realistic action I can begin this week?",
    commitmentLabel: "MY PERSONAL COMMITMENT", commitmentHint: "With God's help, I will…",
    private: "PRIVATE · ONLY YOU CAN SEE WHAT YOU WRITE", save: "SAVE MY REFLECTION", saved: "YOUR REFLECTION IS SAVED PRIVATELY",
    saving: "SAVING…", error: "We couldn't save that just now. Please try again.", connectionError: "Your participant session could not be found. Please reconnect.",
    cardEyebrow: "A KEEPSAKE OF YOUR JOURNEY", cardTitle: "My walk with God.", cardSubtitle: "Small steps. A growing faith. A life devoted to Christ.", cardDownload: "DOWNLOAD MY COMMITMENT CARD", cardDownloading: "PREPARING YOUR CARD…", cardNote: "Keep this as a reminder of the steps you chose to take.", cardEmpty: "No personal commitment was saved in this experience.", cardExp1Label: "MY RESPONSES", cardFooter: "PRERNA 2026 · THE LIVING CHURCH · ACTS 2:42",
    collectiveEyebrow: "OUR SHARED RESPONSE", collectiveTitle: "We are the living church.", collectiveBody: "These are not promises that we make in our own strength. They are commitments we choose to pursue together, with God's help.",
    commitments: ["We will grow in God's Word.", "We will remain devoted to fellowship.", "We will make choices that honour Christ.", "We will continue in prayer."],
    readTogether: "LET US READ THESE COMMITMENTS TOGETHER", prayerEyebrow: "LET US PRAY TOGETHER", prayerTitle: "Lord, make us a living church.",
    prayerBody: "Father, thank You for calling us to belong to You and to one another. Give us a hunger for Your Word, hearts that care for each other, lives that honour Christ, and a constant desire to speak with You. Help us not only to hear these things today, but to live them in our homes, our church and our everyday choices. Strengthen those who feel tired, restore those who have drifted, and teach us to grow together in love. May our lives point people to Jesus. In His name, Amen.",
    facilitatorCue: "FACILITATOR: Lead the group in this prayer, allowing space for a quiet personal response.",
   completeEyebrow: "BEYOND THIS EXPERIENCE · A CONTINUING CALLING",
completeTitle: "A faith we live, not just profess.",
completeBody: "This experience may come to an end, but our calling as the Church continues. It is reflected in how we follow Christ, care for one another and live out our faith each day.",
    next: "CONTINUE", back: "BACK", finish: "FINISH", loading: "PREPARING YOUR REFLECTION…",
  },
  hi: {
    exp: "अनुभव ०५ · अंतिम मनन", title: "जीवित कलीसिया",
    subtitle: "बढ़ता हुआ विश्वास। अपनापन रखने वाले लोग। मसीह के लिए समर्पित जीवन।",
    intro: "हमने मसीही जीवन के चार रोज़मर्रा के पहलुओं पर विचार किया। अब उन्हें एक साथ जोड़ें। यह अपने परमेश्वर के साथ चलने के तरीके को ईमानदारी से देखने और यह सोचने का समय है कि हम कैसी कलीसिया बन रहे हैं।",
    begin: "अंतिम मनन शुरू करें", journeyEyebrow: "पीछे देखें · आगे बढ़ें", journeyTitle: "चार अनुभव। एक जुड़ा हुआ जीवन।",
    journeyBody: "ये चार अलग-अलग गतिविधियाँ नहीं थीं। परमेश्वर का वचन हमें आकार देता है, संगति हमें मज़बूत करती है, हमारे निर्णय बताते हैं कि हम क्या महत्व देते हैं, और प्रार्थना हमें उनसे जोड़े रखती है।",
    cards: [
      { n: "०१", title: "आदत से आगे", body: "परमेश्वर का वचन केवल पूरा करने की चीज़ नहीं है। यह सत्य है जो हमारे जीवन को बदलता है।", short: "वचन में बढ़ें", icon: "book" },
      { n: "०२", title: "खाली जगह", body: "हम मसीह के पीछे अकेले चलने के लिए नहीं बुलाए गए। हम एक ऐसे समुदाय का हिस्सा हैं जिसे हमारी ज़रूरत है।", short: "एक-दूसरे के बनें", icon: "people" },
      { n: "०३", title: "रविवार का चुनाव", body: "हमारा विश्वास रोज़मर्रा के निर्णयों और परमेश्वर का आदर करने के तरीके में दिखाई देता है।", short: "विश्वास को जीवन में दिखाएँ", icon: "choice" },
      { n: "०४", title: "शांत जुड़ाव", body: "प्रार्थना केवल परेशानी के समय की प्रतिक्रिया नहीं है। यह परमेश्वर के साथ लगातार बना रहने वाला रिश्ता है।", short: "परमेश्वर के साथ चलें", icon: "prayer" },
    ],
    scriptureEyebrow: "हमारी नींव", scriptureTitle: "जीवित कलीसिया की तस्वीर।",
    scripture: "वे प्रेरितों की शिक्षा और संगति में, रोटी तोड़ने और प्रार्थना करने में लौलीन रहे।",
    scriptureRef: "प्रेरितों के काम २:४२", scriptureNote: "पहले विश्वासी केवल किसी इमारत या कभी-कभार की सभा के लिए समर्पित नहीं थे। वे मसीह पर आधारित साझा जीवन के लिए समर्पित थे।",
    foundations: [
      { title: "प्रेरितों की शिक्षा", body: "हम परमेश्वर के वचन के द्वारा बढ़ते रहते हैं।", tag: "सत्य में बढ़ें", icon: "book" },
      { title: "संगति", body: "हम जीवन बाँटते हैं, एक-दूसरे का बोझ उठाते हैं और हौसला देते हैं।", tag: "समुदाय में जिएँ", icon: "people" },
      { title: "रोटी तोड़ना", body: "हम मसीह को याद करते हैं और उनके लोगों के साथ जीवन बाँटते हैं।", tag: "मसीह को याद रखें", icon: "bread" },
      { title: "प्रार्थना", body: "हम परमेश्वर पर निर्भर रहते हैं और उनसे जुड़े रहते हैं।", tag: "परमेश्वर के साथ चलें", icon: "prayer" },
    ],
    reflectionEyebrow: "ईमानदारी से अपने जीवन को देखें", reflectionTitle: "परमेश्वर मुझे कहाँ बढ़ने के लिए बुला रहे हैं?",
    reflectionBody: "कुछ पल शांत होकर सोचें। आपको प्रभावशाली बातें लिखने की ज़रूरत नहीं है। परमेश्वर के सामने ईमानदार रहें। आपके जवाब निजी रहेंगे और कमरे में या संचालक को नहीं दिखाए जाएँगे।",
    restoreLabel: "एक बात जिसे मुझे फिर से शुरू करना है", restoreHint: "मैं परमेश्वर के साथ अपने जीवन में किस बात को नज़रअंदाज़ कर रहा हूँ?",
    strengthenLabel: "एक बात जिसमें मुझे मज़बूत होना है", strengthenHint: "मैं अपने विश्वास या रिश्तों में कहाँ बढ़ना चाहता हूँ?",
    stepLabel: "एक व्यावहारिक कदम जो मैं उठाऊँगा", stepHint: "इस सप्ताह मैं कौन-सा छोटा और संभव कदम शुरू कर सकता हूँ?",
    commitmentLabel: "मेरा व्यक्तिगत संकल्प", commitmentHint: "परमेश्वर की मदद से, मैं…",
    private: "निजी · आपने जो लिखा है उसे केवल आप देख सकते हैं", save: "मेरा मनन सुरक्षित करें", saved: "आपका मनन निजी रूप से सुरक्षित है",
    saving: "सुरक्षित हो रहा है…", error: "अभी सुरक्षित नहीं हो पाया। कृपया फिर कोशिश करें।", connectionError: "आपका प्रतिभागी सत्र नहीं मिला। कृपया दोबारा जुड़ें।",
    cardEyebrow: "आपकी यात्रा की एक याद", cardTitle: "परमेश्वर के साथ मेरा जीवन।", cardSubtitle: "छोटे कदम। बढ़ता हुआ विश्वास। मसीह के लिए समर्पित जीवन।", cardDownload: "मेरा संकल्प कार्ड डाउनलोड करें", cardDownloading: "आपका कार्ड तैयार हो रहा है…", cardNote: "इसे उन कदमों की याद के रूप में अपने पास रखें जिन्हें आपने चुनने का निर्णय लिया है।", cardEmpty: "इस अनुभव में कोई निजी संकल्प सुरक्षित नहीं किया गया।", cardExp1Label: "मेरे जवाब", cardFooter: "प्रेरणा २०२६ · जीवित कलीसिया · प्रेरितों के काम २:४२",
    collectiveEyebrow: "हमारा साझा उत्तर", collectiveTitle: "हम ही जीवित कलीसिया हैं।", collectiveBody: "ये ऐसे वादे नहीं हैं जिन्हें हम अपनी ताकत से पूरा करेंगे। परमेश्वर की मदद से हम इन्हें साथ मिलकर अपनाते हैं।",
    commitments: ["हम परमेश्वर के वचन में बढ़ेंगे।", "हम संगति में बने रहेंगे।", "हम ऐसे निर्णय लेंगे जो मसीह का आदर करें।", "हम प्रार्थना करते रहेंगे।"],
    readTogether: "आइए, इन संकल्पों को मिलकर पढ़ें", prayerEyebrow: "आइए, मिलकर प्रार्थना करें", prayerTitle: "प्रभु, हमें जीवित कलीसिया बनाएँ।",
    prayerBody: "हे पिता, धन्यवाद कि आपने हमें अपना और एक-दूसरे का होने के लिए बुलाया है। हमारे भीतर अपने वचन की भूख जगाएँ, एक-दूसरे की परवाह करने वाला मन दें, मसीह का आदर करने वाला जीवन दें और आपसे बात करने की निरंतर इच्छा दें। हमारी मदद करें कि आज केवल इन बातों को सुनें नहीं, बल्कि अपने घरों, कलीसिया और रोज़मर्रा के निर्णयों में इन्हें जीएँ। जो थके हुए हैं उन्हें बल दें, जो दूर हो गए हैं उन्हें फिर से अपने पास लाएँ, और हमें प्रेम में साथ-साथ बढ़ना सिखाएँ। हमारा जीवन लोगों को यीशु की ओर ले जाए। उनके नाम में, आमीन।",
    facilitatorCue: "संचालक: समूह के साथ यह प्रार्थना करें और सभी को व्यक्तिगत रूप से शांत होकर प्रार्थना करने का समय दें।",
   completeEyebrow: "इस अनुभव से आगे · एक निरंतर बुलाहट",
completeTitle: "विश्वास केवल कहने की नहीं, जीने की बात है।",
completeBody: "यह अनुभव यहाँ समाप्त होता है, लेकिन कलीसिया होने की हमारी बुलाहट जारी रहती है। यह हमारे मसीह के पीछे चलने, एक-दूसरे की देखभाल करने और हर दिन अपने विश्वास को जीवन में उतारने से दिखाई देती है।",
    next: "आगे बढ़ें", back: "पीछे जाएँ", finish: "समाप्त करें", loading: "आपका मनन तैयार हो रहा है…",
  },
} as const;

type Stage =
  | "INTRO"
  | "JOURNEY"
  | "SCRIPTURE"
  | "REFLECTION"
  | "CARD"
  | "PREVIOUS_COMMITMENTS"
  | "COLLECTIVE"
  | "ONE_BODY"
  | "COMPLETE";
const STAGES: Stage[] = [
  "INTRO",
  "JOURNEY",
  "SCRIPTURE",
  "REFLECTION",
  "CARD",
  "PREVIOUS_COMMITMENTS",
  "COLLECTIVE",
  "ONE_BODY",
  "COMPLETE"
];
function IconMark({ kind, className = "h-5 w-5" }: { kind: string; className?: string }) {
  if (kind === "book") return <BookOpen className={className} />;
  if (kind === "people") return <Users className={className} />;
  if (kind === "choice") return <HeartHandshake className={className} />;
  if (kind === "bread") return <HandHeart className={className} />;
  return <HeartHandshake className={className} />;
}

function BotanicalMark({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 180 220" fill="none" className={className}><g stroke="#829681" strokeWidth="1.4" opacity=".65"><path d="M18 205C50 151 86 99 154 18"/><path d="M43 164C17 158 8 139 16 120c22 4 34 20 27 44Z"/><path d="M70 127c-3-24 10-40 31-43 4 22-8 38-31 43Z"/><path d="M99 91c-20-9-26-27-16-46 20 6 28 24 16 46Z"/><path d="M44 164c-4-18-13-32-28-44m55 7c7-16 18-29 30-43m-2 7c-1-17-2-29-16-46"/></g><circle cx="154" cy="18" r="7" stroke="#bd795c" opacity=".7"/></svg>;
}

export default function LivingChurchReflection({
  session,
}: {
  session: HumanExperimentSession;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [reflection, setReflection] = useState<Reflection>(EMPTY);
  const [journeyEntries, setJourneyEntries] = useState<CommitmentEntry[]>([]);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const t = COPY[language];
  const stage = String(session.stage ?? "INTRO") as Stage;
  const locked = session.status === "PAUSED";
  const isHindi = language === "hi";
  const stageIndex = STAGES.indexOf(stage);
  const stageNumber = stageIndex < 0 ? 0 : stageIndex;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [stage]);
  useEffect(() => {
    if (!session.sessionId) { setLoading(false); return; }
    const sessionId = session.sessionId;
    let cancelled = false;
    async function loadPrivateReflection() {
      setLoading(true);
      // Identity comes from the secure participant cookie on the server.
      // The API returns only this participant's reflection plus their own
      // earlier commitments ("journey"), never other participants' data.
      let loaded: Awaited<ReturnType<typeof loadParticipantAnswer>>;
      try { loaded = await loadParticipantAnswer(sessionId, 5); }
      catch (err) { console.error("EXPERIENCE 05 PRIVATE REFLECTION LOAD FAILED:", err); if (!cancelled) setLoading(false); return; }
      if (cancelled) return;
      const answer: Record<string, unknown> = { ...loaded.journey, experiment5: { privateReflection: loaded.answer.privateReflection } };
      const saved = isRecord(answer.experiment5) && isRecord(answer.experiment5.privateReflection) ? answer.experiment5.privateReflection : {};
      setReflection({ restore: typeof saved.restore === "string" ? saved.restore : "", strengthen: typeof saved.strengthen === "string" ? saved.strengthen : "", nextStep: typeof saved.nextStep === "string" ? saved.nextStep : "", commitment: typeof saved.commitment === "string" ? saved.commitment : "" });
      setSaved(Boolean(saved.savedAt));

      // Read only this participant's own saved answers. Experience 01 had choices, not a written commitment.
      const entries: CommitmentEntry[] = [];
      const exp1Choices = answer.experiment === 1 ? answer : {};
      const round1 = typeof exp1Choices.round1 === "string" ? exp1Choices.round1 : "";
      const round2 = typeof exp1Choices.round2 === "string" ? exp1Choices.round2 : "";
      const exp1Options = {
        en: [
          ["Adjust my schedule and make time for it.", "Read before going to sleep.", "Skip today and continue tomorrow.", "Forget about it and move on."],
          ["Continue reading just to maintain my routine.", "Slow down and read a smaller portion.", "Reflect on the passage and apply it.", "Seek help to understand what I am reading."],
        ],
        hi: [
          ["अपने समय में बदलाव करके पढ़ने का समय निकालूँगा।", "सोने से पहले पढ़ूँगा।", "आज छोड़कर कल फिर शुरू करूँगा।", "इसे भूलकर आगे बढ़ जाऊँगा।"],
          ["दिनचर्या बनाए रखने के लिए पढ़ता रहूँगा।", "धीरे पढ़ूँगा और थोड़ा कम हिस्सा पढ़ूँगा।", "वचन पर विचार करके उसे जीवन में लागू करूँगा।", "समझने के लिए किसी से सहायता लूँगा।"],
        ],
      } as const;
      const choiceIndex = (value: string) => ({ A: 0, B: 1, C: 2, D: 3 } as Record<string, number>)[value];
      const exp1Lines = [round1 ? `${language === "en" ? "Busy day" : "व्यस्त दिन"}: ${exp1Options[language][0][choiceIndex(round1)] ?? round1}` : "", round2 ? `${language === "en" ? "Beyond routine" : "सिर्फ आदत से आगे"}: ${exp1Options[language][1][choiceIndex(round2)] ?? round2}` : ""].filter(Boolean);
      if (exp1Lines.length) entries.push({ id: "01", title: language === "en" ? "BEYOND THE HABIT" : "आदत से आगे", category: language === "en" ? "MY RESPONSES" : "मेरे जवाब", text: exp1Lines.join("\n") });

      const exp2 = isRecord(answer.experiment2) ? answer.experiment2 : {};
      const exp2Commitment = typeof exp2.commitment === "string" ? exp2.commitment : "";
      const exp2Labels: Record<string, { en: string; hi: string }> = {
        ATTEND: { en: "Be more intentional about gathering.", hi: "और अधिक निष्ठा से चर्च आना।" },
        ENCOURAGE: { en: "Make an effort to encourage someone.", hi: "किसी का हौसला बढ़ाने का प्रयास करना।" },
        PARTICIPATE: { en: "Participate instead of only attending.", hi: "सिर्फ उपस्थित रहने के बजाय सक्रिय रूप से भाग लेना।" },
      };
      if (exp2Commitment && exp2Labels[exp2Commitment]) entries.push({ id: "02", title: language === "en" ? "THE EMPTY SEAT" : "खाली जगह", category: language === "en" ? "FELLOWSHIP" : "संगति", text: exp2Labels[exp2Commitment][language] });

      const exp3 = isRecord(answer.experiment3) ? answer.experiment3 : {};
      if (typeof exp3.commitment === "string" && exp3.commitment.trim()) entries.push({ id: "03", title: language === "en" ? "THE SUNDAY CHOICE" : "रविवार का चुनाव", category: language === "en" ? "DAILY CHOICES" : "रोज़मर्रा के निर्णय", text: exp3.commitment.trim() });
      const exp4 = isRecord(answer.experiment4) ? answer.experiment4 : {};
      if (typeof exp4.commitment === "string" && exp4.commitment.trim()) entries.push({ id: "04", title: language === "en" ? "THE QUIET CONNECTION" : "शांत जुड़ाव", category: language === "en" ? "PRAYER" : "प्रार्थना", text: exp4.commitment.trim() });
      setJourneyEntries(entries);
      setLoading(false);
    }
    void loadPrivateReflection();
    return () => { cancelled = true; };
  }, [session.sessionId]);

  async function savePrivateReflection() {
    if (!session.sessionId) { setError(t.connectionError); return; }
    if (locked || saving) return;
    if (![reflection.restore, reflection.strengthen, reflection.nextStep, reflection.commitment].some((value) => value.trim())) { setError(isHindi ? "कृपया कम-से-कम एक बात लिखें।" : "Please write at least one reflection before saving."); return; }
    setSaving(true); setError("");
    try {
      const result = await saveParticipantAnswer({ sessionId: session.sessionId, experience: 5, patch: { ...reflection }, fallbackMessage: t.error });
      if (result.ok) setSaved(true);
      else { console.error("EXPERIENCE 05 PRIVATE REFLECTION SAVE FAILED:", result.message); setError(t.error); }
    }
    finally { setSaving(false); }
  }

  const cardEntries = useMemo(() => {
  const fields = [
    {
      id: "05.1",
      title: isHindi ? "जीवित कलीसिया" : "THE LIVING CHURCH",
      category: isHindi ? "एक बात जिसे मुझे फिर से शुरू करना है" : "SOMETHING I NEED TO RESTORE",
      text: reflection.restore,
    },
    {
      id: "05.2",
      title: isHindi ? "जीवित कलीसिया" : "THE LIVING CHURCH",
      category: isHindi ? "एक बात जिसमें मुझे मज़बूत होना है" : "SOMETHING I NEED TO STRENGTHEN",
      text: reflection.strengthen,
    },
    {
      id: "05.3",
      title: isHindi ? "जीवित कलीसिया" : "THE LIVING CHURCH",
      category: isHindi ? "एक व्यावहारिक कदम" : "ONE PRACTICAL STEP I WILL TAKE",
      text: reflection.nextStep,
    },
    {
      id: "05.4",
      title: isHindi ? "जीवित कलीसिया" : "THE LIVING CHURCH",
      category: isHindi ? "मेरा व्यक्तिगत संकल्प" : "MY PERSONAL COMMITMENT",
      text: reflection.commitment,
    },
  ];

  return fields
    .filter((field) => field.text.trim())
    .map((field) => ({ ...field, text: field.text.trim() }));
}, [reflection, isHindi]);

const previousCommitments = useMemo(
  () => journeyEntries.filter((entry) => ["02", "03", "04"].includes(entry.id)),
  [journeyEntries]
);
  async function downloadCommitmentCard(
  entries: CommitmentEntry[],
  filename: string,
  heading: string,
  subtitle: string
) {
  if (!entries.length || downloadingCard) return;
    setDownloadingCard(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = document.createElement("canvas");
      const width = 1200;
      const padding = 88;
      const contentWidth = width - padding * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable.");
      const wrap = (value: string, maxWidth: number, font: string) => {
        ctx.font = font;
        const lines: string[] = [];
        for (const paragraph of value.split("\n")) {
          const words = paragraph.split(/\s+/).filter(Boolean);
          let line = "";
          for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
            else line = candidate;
          }
          if (line) lines.push(line);
          if (!paragraph) lines.push("");
        }
        return lines;
      };
      const titleFont = isHindi ? '600 34px "Noto Serif Devanagari", Georgia, serif' : '600 34px Georgia, serif';
      const bodyFont = isHindi ? '28px "Noto Sans Devanagari", Arial, sans-serif' : '28px Georgia, serif';
      const sectionLayouts = entries.map((entry) => {
  const lines = wrap(entry.text, contentWidth - 100, bodyFont);
  return { entry, lines, height: 112 + lines.length * 42 + 34 };
});

const height =
  410 + sectionLayouts.reduce((sum, item) => sum + item.height + 22, 0) + 170;

canvas.width = width;
canvas.height = height;

// Premium ivory background
ctx.fillStyle = "#F8F5ED";
ctx.fillRect(0, 0, width, height);

// Fine outer frame
ctx.strokeStyle = "rgba(25,56,47,0.15)";
ctx.lineWidth = 2;
ctx.strokeRect(28, 28, width - 56, height - 56);

// Forest green header
const headerHeight = 340;
ctx.fillStyle = "#19382F";
ctx.fillRect(30, 30, width - 60, headerHeight);

ctx.textAlign = "center";

ctx.fillStyle = "#DFBD97";
ctx.font = "700 17px Arial, sans-serif";
ctx.fillText("P R E R N A   /   2 0 2 6", width / 2, 92);

ctx.fillStyle = "#F8F5ED";
ctx.font = isHindi
  ? '600 48px "Noto Serif Devanagari", Georgia, serif'
  : "600 56px Georgia, serif";
ctx.fillText(heading, width / 2, 175, contentWidth);

ctx.fillStyle = "#D8C8AD";
ctx.font = isHindi
  ? '23px "Noto Sans Devanagari", Arial, sans-serif'
  : "22px Arial, sans-serif";
ctx.fillText(subtitle, width / 2, 225, contentWidth);

ctx.fillStyle = "#DFBD97";
ctx.fillRect(width / 2 - 32, 263, 64, 2);

ctx.fillStyle = "#DFBD97";
ctx.font = 'italic 25px Georgia, serif';
ctx.fillText(
  isHindi ? "छोटे कदम। बढ़ता हुआ विश्वास।" : "Small steps. A growing faith.",
  width / 2,
  305
);

// Commitment panels
let y = 405;

sectionLayouts.forEach(({ entry, lines, height: panelHeight }, index) => {
  const x = padding - 12;
  const panelWidth = width - x * 2;

  // Individual ivory panel
  ctx.fillStyle = "#FFFDF8";
  ctx.strokeStyle = "rgba(25,56,47,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, panelWidth, panelHeight, 22);
  ctx.fill();
  ctx.stroke();

  // Small terracotta accent
  ctx.fillStyle = "#BD795C";
  ctx.fillRect(x + 26, y + 26, 5, 27);

  // Experience label
  ctx.textAlign = "left";
  ctx.fillStyle = "#BD795C";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText(
    `${entry.id}  /  ${entry.category}`,
    x + 48,
    y + 47,
    panelWidth - 90
  );

  // Actual personal commitment
  ctx.fillStyle = "#19382F";
  ctx.font = bodyFont;

  let textY = y + 105;
  for (const line of lines) {
    ctx.fillText(line, x + 48, textY, panelWidth - 96);
    textY += 42;
  }

  y += panelHeight + 22;
});

// Footer
const footerY = height - 145;

ctx.fillStyle = "#E8EDE4";
ctx.fillRect(30, footerY, width - 60, height - footerY - 30);

ctx.textAlign = "center";
ctx.fillStyle = "#19382F";
ctx.font = "italic 30px Georgia, serif";
ctx.fillText("Acts 2:42", width / 2, footerY + 65);

ctx.fillStyle = "#BD795C";
ctx.font = "700 14px Arial, sans-serif";
ctx.fillText(
  isHindi
    ? "प्रेरणा २०२६ · जीवित कलीसिया"
    : "PRERNA 2026 · THE LIVING CHURCH",
  width / 2,
  footerY + 100
);
      const blob: Blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not create image.")), "image/png"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) { console.error("COMMITMENT CARD DOWNLOAD FAILED:", downloadError); setError(isHindi ? "कार्ड डाउनलोड नहीं हो पाया। कृपया फिर कोशिश करें।" : "The card could not be downloaded. Please try again."); }
    finally { setDownloadingCard(false); }
  }

  const updateField = (field: keyof Reflection, value: string) => { setReflection((current) => ({ ...current, [field]: value })); setSaved(false); };
  const stageTitles = useMemo(
    () => [
      t.title,
      t.journeyTitle,
      t.scriptureTitle,
      t.reflectionTitle,
      t.cardTitle,
      isHindi ? "मेरे व्यक्तिगत संकल्प" : "MY PERSONAL COMMITMENTS",
      t.collectiveTitle,
      isHindi ? "एक शरीर, अनेक अंग" : "ONE BODY, MANY MEMBERS",
      t.completeTitle,
    ],
    [t, isHindi]
  );

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f5f0e6] px-6 text-[#19382f]"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#bd795c]/40 bg-[#fffdf7]"><Sprout className="h-6 w-6 text-[#bd795c]"/></div><p className="mt-5 font-mono text-[9px] uppercase tracking-[.24em] text-[#71877b]">{t.loading}</p></div></main>;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f0e6] text-[#19382f]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: "radial-gradient(rgba(67,77,60,.42) .6px, transparent .6px)", backgroundSize: "8px 8px" }}/>
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-52 h-[560px] w-[560px] rounded-full border border-[#bd795c]/15"/>
      <BotanicalMark className="pointer-events-none absolute -left-10 top-24 hidden h-72 w-56 lg:block"/>
      <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-7 lg:px-12 lg:pb-16">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-[#19382f]/12 pb-5">
          <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.36em] text-[#bd563b] sm:text-[10px]">PRERNA / 2026</p><p className="mt-1 font-serif text-2xl sm:text-3xl">Human Experiment</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.32em] text-[#536b5d]">THE LIVING CHURCH · 05</p></div>
          <div className="flex items-center gap-2 rounded-full border border-[#19382f]/12 bg-[#fffdf7]/80 p-1 shadow-sm"><button type="button" onClick={() => setLanguage("en")} className={`rounded-full px-4 py-2 font-mono text-[8px] font-bold tracking-[.15em] ${language === "en" ? "bg-[#19382f] text-[#fffdf7]" : "text-[#71877b]"}`}>EN</button><button type="button" onClick={() => setLanguage("hi")} className={`rounded-full px-4 py-2 text-xs font-semibold ${language === "hi" ? "bg-[#19382f] text-[#fffdf7]" : "text-[#71877b]"}`}>हिन्दी</button></div>
        </header>

        <div className="mb-7 flex items-center justify-between gap-4"><p className="font-mono text-[8px] uppercase tracking-[.22em] text-[#8b9587]">{t.exp}</p><div className="flex items-center gap-1.5" aria-label={`Step ${stageNumber + 1} of ${STAGES.length}`}>{STAGES.map((item, index) => <span key={item} className={`h-1.5 w-5 rounded-full sm:w-8 ${index <= stageNumber ? "bg-[#bd795c]" : "bg-[#19382f]/12"}`}/>)}</div></div>

        <AnimatePresence mode="wait" initial={false}>
          {stage === "INTRO" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative isolate grid items-center gap-10 overflow-hidden rounded-[2.2rem] border border-[#19382f]/10 bg-[#eee9dc] px-5 py-8 shadow-[0_24px_70px_rgba(25,56,47,.07)] sm:px-9 sm:py-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-12 lg:px-12"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#bd795c]/20" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full border border-[#19382f]/10" />
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-1 w-2/5 bg-gradient-to-r from-[#bd795c]/70 via-[#bd795c]/20 to-transparent" />
              <BotanicalMark className="pointer-events-none absolute -bottom-12 right-[34%] hidden h-64 w-52 rotate-12 opacity-50 md:block" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#bd795c]/25 bg-[#fffdf7]/75 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#bd795c]" />
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#bd6547]">{t.exp}</p>
                </div>
                <h1 className="mt-7 max-w-4xl font-serif text-6xl leading-[.88] tracking-[-.055em] text-[#19382f] sm:text-8xl">
                  {t.title}
                </h1>
                <p className="mt-7 max-w-2xl font-serif text-xl italic leading-relaxed text-[#718675] sm:text-2xl">
                  {t.subtitle}
                </p>
                <p className="mt-6 max-w-2xl text-[14px] leading-8 text-[#526a5f] sm:text-base">
                  {t.intro}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-full bg-[#19382f] px-5 py-3 font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#fffdf7] shadow-lg">
                    <ArrowRight className="h-4 w-4 text-[#dfbd97]" />
                    {isHindi ? "संचालक के साथ आगे बढ़ें" : "YOUR FACILITATOR WILL GUIDE EACH STEP"}
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-[.2em] text-[#81927d]">ACTS 2:42</span>
                </div>
              </div>

              <div className="relative z-10 mx-auto w-full max-w-[510px]">
                <div className="absolute -inset-4 rounded-[2.5rem] border border-[#bd795c]/20" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#f7f5ec,#dfe7dc)] p-5 shadow-[0_28px_70px_rgba(34,53,42,.13)] sm:p-7">
                  <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full border border-[#bd795c]/25" />
                  <div className="absolute -right-2 top-0 h-28 w-28 rounded-full border border-[#19382f]/10" />
                  <div className="relative mx-auto flex aspect-square max-w-[280px] items-center justify-center">
                    <div className="absolute inset-3 rounded-full border border-dashed border-[#bd795c]/45" />
                    <div className="absolute inset-9 rounded-full border border-[#19382f]/15" />
                    <div className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-[#bd795c]" />
                    <div className="absolute bottom-5 left-7 h-2.5 w-2.5 rounded-full bg-[#81927d]" />
                    <div className="absolute bottom-5 right-7 h-2.5 w-2.5 rounded-full bg-[#81927d]" />
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#19382f] text-[#f8f3e9] shadow-[0_18px_45px_rgba(25,56,47,.22)] sm:h-40 sm:w-40">
                      <Church className="h-16 w-16" strokeWidth={1.1} />
                    </div>
                    <span className="absolute -left-1 top-1/2 rounded-full border border-[#19382f]/10 bg-[#fffdf7] p-3 text-[#bd795c] shadow-sm"><BookOpen className="h-5 w-5" /></span>
                    <span className="absolute -right-1 top-1/2 rounded-full border border-[#19382f]/10 bg-[#fffdf7] p-3 text-[#718a78] shadow-sm"><Users className="h-5 w-5" /></span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-[#19382f]/10 bg-[#fffdf7] p-3 text-[#bd795c] shadow-sm"><HeartHandshake className="h-5 w-5" /></span>
                  </div>
                  <div className="relative mt-4 grid grid-cols-2 gap-2.5">
                    {[BookOpen, Users, HeartHandshake, MessageCircle].map((Icon, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-xl border border-[#19382f]/10 bg-[#fffdf7]/85 px-3 py-3">
                        <Icon className="h-4 w-4 shrink-0 text-[#bd795c]" />
                        <span className="font-mono text-[7px] font-bold uppercase tracking-[.12em] text-[#536b5d]">
                          {isHindi ? ["वचन", "संगति", "दैनिक जीवन", "प्रार्थना"][index] : ["THE WORD", "FELLOWSHIP", "DAILY LIFE", "PRAYER"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative mx-auto -mt-4 w-fit rounded-xl border border-white bg-[#fffdf7] px-6 py-3 text-center shadow-lg">
                  <p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] text-[#bd795c]">ACTS 2:42</p>
                  <p className="mt-1 font-serif text-lg italic text-[#19382f]">{isHindi ? "एक साथ बढ़ते हुए" : "Growing together"}</p>
                </div>
              </div>
            </motion.section>
          )}

          {stage === "JOURNEY" && (
            <motion.section
              key="journey"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[2rem] bg-[#19382f] px-6 py-8 text-[#f8f3e9] shadow-[0_24px_65px_rgba(25,56,47,.13)] sm:px-10 sm:py-11">
                <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#dfbd97]/15" />
                <div aria-hidden="true" className="absolute -right-2 -top-10 h-48 w-48 rounded-full border border-[#dfbd97]/10" />
                <BotanicalMark className="pointer-events-none absolute -bottom-20 right-8 hidden h-64 w-52 opacity-40 sm:block" />
                <div className="relative max-w-3xl">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#dfbd97]">{t.journeyEyebrow}</p>
                  <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">{t.journeyTitle}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-[#f8f3e9]/75 sm:text-base">{t.journeyBody}</p>
                </div>
                <div className="relative mt-7 flex items-center gap-3">
                  <span className="h-px w-12 bg-[#dfbd97]/70" />
                  <span className="font-mono text-[8px] uppercase tracking-[.22em] text-[#dfbd97]">{isHindi ? "एक ही यात्रा · चार अनुभव" : "ONE JOURNEY · FOUR EXPERIENCES"}</span>
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                {t.cards.map((card, index) => (
                  <motion.article
                    key={card.n}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * .07 }}
                    className="group relative isolate overflow-hidden rounded-[1.6rem] border border-[#19382f]/10 bg-[#fffdf8]/90 p-6 shadow-[0_14px_36px_rgba(52,61,48,.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(52,61,48,.10)] sm:p-8"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-8 -z-10 font-serif text-[8rem] leading-none text-[#81927d]/10">{card.n}</span>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#bd795c]/25 bg-[#f1eee4] text-[#bd795c] shadow-sm">
                        <IconMark kind={card.icon} className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-[#19382f]/10 px-3 py-1.5 font-mono text-[7px] font-bold tracking-[.18em] text-[#81927d]">{card.n} / 04</span>
                    </div>
                    <p className="mt-6 font-mono text-[8px] font-bold uppercase tracking-[.22em] text-[#bd795c]">{card.short}</p>
                    <h2 className="mt-2 font-serif text-2xl text-[#19382f] sm:text-3xl">{card.title}</h2>
                    <p className="mt-3 max-w-lg text-[13px] leading-7 text-[#607568] sm:text-sm">{card.body}</p>
                    <div className="mt-6 flex items-center gap-2">
                      <span className="h-px w-8 bg-[#bd795c]/60" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#81927d]" />
                    </div>
                  </motion.article>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-[#bd795c]/20 bg-[#e9ede4] px-5 py-4 text-center">
                <Sprout className="h-5 w-5 shrink-0 text-[#718a78]" />
                <p className="font-serif text-base italic text-[#536b5d] sm:text-lg">{isHindi ? "वचन · संगति · जीवन · प्रार्थना — एक ही विश्वास यात्रा" : "The Word · Fellowship · Daily Life · Prayer — one connected walk of faith"}</p>
              </div>
            </motion.section>
          )}

          {stage === "SCRIPTURE" && <motion.section key="scripture" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mx-auto max-w-4xl text-center"><p className="font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#bd6547]">{t.scriptureEyebrow}</p><h1 className="mt-4 font-serif text-4xl sm:text-6xl">{t.scriptureTitle}</h1><div className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#19382f] px-6 py-10 text-[#f8f3e9] shadow-[0_24px_60px_rgba(25,56,47,.15)] sm:px-14 sm:py-14"><div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border border-[#dfbd97]/20"/><BookOpen className="mx-auto h-8 w-8 text-[#dfbd97]"/><p className="relative mt-6 font-serif text-2xl leading-relaxed sm:text-4xl">“{t.scripture}”</p><p className="relative mt-6 font-mono text-[9px] font-bold tracking-[.25em] text-[#dfbd97]">{t.scriptureRef}</p></div><p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#607568]">{t.scriptureNote}</p></div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">{t.foundations.map((item, index) => <div key={item.title} className="flex items-start gap-4 rounded-[1.3rem] border border-[#19382f]/10 bg-[#fffdf8]/85 p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9eee5] text-[#718a78]"><IconMark kind={item.icon}/></div><div><p className="font-mono text-[7px] font-bold uppercase tracking-[.18em] text-[#bd795c]">{`0${index + 1}`} · {item.tag}</p><h2 className="mt-2 font-serif text-xl">{item.title}</h2><p className="mt-1 text-[13px] leading-6 text-[#607568]">{item.body}</p></div></div>)}</div>
          </motion.section>}

          {stage === "REFLECTION" && <motion.section key="reflection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid gap-7 lg:grid-cols-[.82fr_1.18fr] lg:items-start"><div className="rounded-[1.8rem] bg-[#19382f] p-6 text-[#f8f3e9] shadow-[0_24px_55px_rgba(25,56,47,.14)] sm:p-9"><p className="font-mono text-[8px] font-bold uppercase tracking-[.24em] text-[#dfbd97]">{t.reflectionEyebrow}</p><h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{t.reflectionTitle}</h1><p className="mt-5 text-[13px] leading-7 text-[#f8f3e9]/75 sm:text-sm sm:leading-8">{t.reflectionBody}</p><div className="mt-7 flex items-center gap-2 border-t border-white/15 pt-5 text-[#dfbd97]"><LockKeyhole className="h-4 w-4"/><span className="font-mono text-[7px] font-bold uppercase tracking-[.17em]">{t.private}</span></div></div>
              <div className="space-y-4">{([{ key: "restore", label: t.restoreLabel, hint: t.restoreHint }, { key: "strengthen", label: t.strengthenLabel, hint: t.strengthenHint }, { key: "nextStep", label: t.stepLabel, hint: t.stepHint }, { key: "commitment", label: t.commitmentLabel, hint: t.commitmentHint }] as const).map((field, index) => <label key={field.key} className="block rounded-[1.35rem] border border-[#19382f]/10 bg-[#fffdf8]/90 p-5 shadow-[0_10px_28px_rgba(52,61,48,.035)] sm:p-6"><span className="flex items-center gap-3 font-mono text-[8px] font-bold uppercase tracking-[.17em] text-[#bd795c]"><span className="font-serif text-2xl italic text-[#81927d]">0{index + 1}</span>{field.label}</span><span className="mt-2 block text-[12px] leading-6 text-[#71877b]">{field.hint}</span><textarea value={reflection[field.key]} onChange={(event) => updateField(field.key, event.target.value)} disabled={locked || saving} rows={2} maxLength={500} className="mt-3 min-h-[76px] w-full resize-y rounded-xl border border-[#19382f]/10 bg-[#f8f5ed] px-4 py-3 text-sm leading-7 text-[#294638] outline-none placeholder:text-[#9aa397] focus:border-[#bd795c]/55 disabled:opacity-70" placeholder={isHindi ? "यहाँ लिखें…" : "Write your reflection here…"}/></label>)}
                {previousCommitments.length > 0 && (
  <section className="mb-7 overflow-hidden rounded-[1.5rem] border border-[#19382f]/10 bg-[#e9ede4] p-5 sm:p-7">
    <p className="font-mono text-[8px] font-bold uppercase tracking-[.24em] text-[#bd795c]">
      {isHindi ? "मेरे पिछले संकल्प" : "MY PREVIOUS COMMITMENTS"}
    </p>

    <h2 className="mt-3 font-serif text-2xl text-[#19382f] sm:text-3xl">
      {isHindi ? "मैंने पहले क्या चुना था?" : "What I chose before."}
    </h2>

    <p className="mt-2 text-sm leading-7 text-[#607568]">
      {isHindi
        ? "पिछले अनुभवों में किए गए अपने व्यक्तिगत संकल्पों को फिर से देखें।"
        : "Take a moment to revisit the personal commitments you made in the earlier experiences."}
    </p>

    <div className="mt-5 space-y-3">
      {previousCommitments.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border border-[#19382f]/10 bg-[#fffdf8] p-4 sm:p-5"
        >
          <p className="font-mono text-[8px] font-bold uppercase tracking-[.18em] text-[#bd795c]">
            {entry.id} · {entry.title}
          </p>
          <p className="mt-2 font-serif text-lg leading-relaxed text-[#19382f]">
            {entry.text}
          </p>
        </article>
      ))}
    </div>
  </section>
)}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="min-h-5 text-xs text-[#bd6547]" role="alert">{error || (saved ? t.saved : "")}</p><button type="button" onClick={() => void savePrivateReflection()} disabled={locked || saving} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#19382f] px-7 py-3 font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#fffdf7] shadow-md disabled:opacity-45">{saved ? t.saved : saving ? t.saving : t.save}<ShieldCheck className="h-4 w-4"/></button></div>
              </div></div>
          </motion.section>}

          {stage === "CARD" && <motion.section key="card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-4xl">
            <div className="text-center"><p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd6547]">{t.cardEyebrow}</p><h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl">{t.cardTitle}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#607568]">{t.cardSubtitle}</p></div>
            <div className="mt-9 overflow-hidden rounded-[2rem] border border-[#19382f]/10 bg-[#f8f3e9] shadow-[0_24px_65px_rgba(25,56,47,.12)]">
              <div className="bg-[#19382f] px-6 py-10 text-center text-[#f8f3e9] sm:px-12"><p className="font-mono text-[9px] font-bold tracking-[.35em] text-[#dfbd97]">P R E R N A  /  2 0 2 6</p><h2 className="mt-6 font-serif text-4xl sm:text-5xl">{isHindi ? "परमेश्वर के साथ मेरा जीवन" : "MY WALK WITH GOD"}</h2><p className="mt-3 font-mono text-[8px] tracking-[.2em] text-[#d8c8ad]">{isHindi ? "जीवित कलीसिया · व्यक्तिगत संकल्प" : "THE LIVING CHURCH · PERSONAL COMMITMENTS"}</p><div className="mx-auto mt-6 h-px w-12 bg-[#dfbd97]"/><p className="mt-5 font-serif text-lg italic text-[#dfbd97]">{isHindi ? "छोटे कदम। बढ़ता हुआ विश्वास।" : "Small steps. A growing faith."}</p></div>
              <div className="divide-y divide-[#19382f]/15 px-5 sm:px-10">{cardEntries.length ? cardEntries.map((entry) => <article key={entry.id} className="py-7"><p className="font-mono text-[8px] font-bold uppercase tracking-[.22em] text-[#bd795c]">{entry.id} · {entry.category}</p><h3 className="mt-2 font-serif text-2xl text-[#19382f] sm:text-3xl">{entry.title}</h3><p className="mt-3 whitespace-pre-line text-[14px] leading-8 text-[#405b4b] sm:text-base">{entry.text}</p></article>) : <p className="py-12 text-center text-sm text-[#718675]">{t.cardEmpty}</p>}</div>
              <div className="bg-[#e8ede4] px-6 py-8 text-center"><p className="font-serif text-2xl italic text-[#19382f]">Acts 2:42</p><p className="mt-2 font-mono text-[8px] font-bold tracking-[.2em] text-[#718675]">{t.cardFooter}</p></div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3"><button type="button" onClick={() =>
  void downloadCommitmentCard(
    cardEntries,
    "Prerna-2026-My-Reflection.png",
    isHindi ? "मेरा मनन" : "MY REFLECTION",
    isHindi
      ? "जीवित कलीसिया · मेरा व्यक्तिगत मनन"
      : "THE LIVING CHURCH · MY PERSONAL REFLECTION"
  )
} disabled={!cardEntries.length || downloadingCard} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#19382f] px-8 py-4 font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#fffdf7] shadow-lg disabled:opacity-45">{downloadingCard ? t.cardDownloading : t.cardDownload}<ArrowRight className="h-4 w-4"/></button><p className="text-center text-xs leading-6 text-[#718675]">{t.cardNote}</p></div>
          </motion.section>}
        {stage === "PREVIOUS_COMMITMENTS" && (
  <motion.section
    key="previous-commitments"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="mx-auto max-w-4xl"
  >
    <div className="text-center">
      <p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd6547]">
        PRERNA 2026 · THE LIVING CHURCH
      </p>

      <h1 className="mt-4 font-serif text-4xl leading-tight text-[#19382f] sm:text-5xl">
        {isHindi ? "मेरी विश्वास यात्रा" : "My Journey of Commitment"}
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#718675]">
        {isHindi
          ? "उन व्यक्तिगत संकल्पों को याद करें जिन्हें आपने इस यात्रा में चुना था।"
          : "A reminder of the personal commitments you made throughout this journey."}
      </p>
    </div>

    <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#19382f]/10 bg-[#f8f3e9] px-6 py-10 shadow-[0_24px_65px_rgba(25,56,47,.12)] sm:px-12">
      <div className="bg-[#19382f] px-6 py-8 text-center text-[#f8f3e9]">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[.35em] text-[#dfbd97]">
          PRERNA 2026
        </p>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
          {isHindi ? "मेरे व्यक्तिगत संकल्प" : "My Personal Commitments"}
        </h2>
      </div>

      <div className="divide-y divide-[#19382f]/15 px-4 sm:px-8">
        {previousCommitments.length > 0 ? (
          previousCommitments.map((entry) => (
            <article key={entry.id} className="py-7">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[.25em] text-[#bd6547]">
                {entry.id} · {entry.title}
              </p>
              <p className="mt-3 font-serif text-xl leading-relaxed text-[#19382f] sm:text-2xl">
                {entry.text}
              </p>
            </article>
          ))
        ) : (
          <p className="py-10 text-center font-serif text-lg text-[#718675]">
            {isHindi
              ? "कोई पिछला संकल्प दर्ज नहीं है।"
              : "No previous commitments were recorded."}
          </p>
        )}
      </div>

      <div className="bg-[#e8ede4] px-6 py-8 text-center">
        <p className="font-serif text-2xl italic text-[#19382f]">
          Acts 2:42
        </p>
        <p className="mt-2 font-mono text-[8px] uppercase tracking-[.25em] text-[#718675]">
          PRERNA 2026 · THE LIVING CHURCH
        </p>
      </div>
    </div>

    <div className="mt-7 flex justify-center">
      <button
        type="button"
        onClick={() =>
          void downloadCommitmentCard(
            previousCommitments,
            "Prerna-2026-Previous-Commitments.png",
            isHindi ? "मेरे व्यक्तिगत संकल्प" : "MY PERSONAL COMMITMENTS",
            isHindi
              ? "मेरी विश्वास यात्रा · प्रेर्णा 2026"
              : "MY JOURNEY OF COMMITMENT · PRERNA 2026"
          )
        }
        disabled={!previousCommitments.length || downloadingCard}
        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#19382f] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[.2em] text-[#f8f3e9] disabled:opacity-40"
      >
        {downloadingCard
          ? "PREPARING..."
          : isHindi
            ? "मेरे संकल्प डाउनलोड करें"
            : "DOWNLOAD MY COMMITMENTS"}
      </button>
    </div>
  </motion.section>
)}
          {stage === "COLLECTIVE" && <motion.section key="collective" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-5xl"><div className="text-center"><p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd6547]">{t.collectiveEyebrow}</p><h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl">{t.collectiveTitle}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#607568]">{t.collectiveBody}</p></div><div className="mt-9 grid gap-3 sm:grid-cols-2">{t.commitments.map((item, index) => <div key={item} className="flex min-h-28 items-center gap-5 rounded-[1.4rem] border border-[#19382f]/10 bg-[#fffdf8]/90 p-5 sm:p-7"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8ede4] font-serif text-xl italic text-[#bd795c]">0{index + 1}</span><p className="font-serif text-xl leading-snug sm:text-2xl">{item}</p></div>)}</div><div className="mt-8 rounded-[1.2rem] border border-[#d5b48f]/45 bg-[#eee8dc] px-5 py-4 text-center font-mono text-[8px] font-bold uppercase tracking-[.2em] text-[#9c654c]">{t.readTogether}</div></motion.section>}
        {stage === "ONE_BODY" && (
          <motion.section
            key="one-body"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-6xl"
          >
            <div className="relative isolate overflow-hidden rounded-[2.2rem] bg-[#19382f] px-6 py-10 text-center text-[#f8f3e9] shadow-[0_28px_75px_rgba(25,56,47,.16)] sm:px-12 sm:py-14">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#dfbd97]/20" />
              <div aria-hidden="true" className="pointer-events-none absolute -left-20 -bottom-32 h-80 w-80 rounded-full border border-[#dfbd97]/15" />
              <BotanicalMark className="pointer-events-none absolute -right-5 bottom-0 hidden h-56 w-44 opacity-35 sm:block" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#dfbd97]/45 bg-[#fffdf7]/5 text-[#dfbd97]">
                <Users className="h-8 w-8" strokeWidth={1.2} />
              </div>
              <p className="relative mt-6 font-mono text-[8px] font-bold uppercase tracking-[.32em] text-[#dfbd97]">
                {isHindi ? "अंतिम पाठ · 1 कुरिन्थियों 12" : "THE FINAL READING · 1 CORINTHIANS 12"}
              </p>
              <h1 className="relative mt-4 font-serif text-4xl leading-tight tracking-[-.025em] sm:text-6xl lg:text-7xl">
                {isHindi ? "एक शरीर, अनेक अंग" : "ONE BODY, MANY MEMBERS"}
              </h1>
              <p className="relative mx-auto mt-4 max-w-2xl font-serif text-lg italic leading-relaxed text-[#d8c8ad] sm:text-2xl">
                {isHindi ? "हम अलग-अलग हैं, फिर भी मसीह में एक हैं।" : "Different members. One body. One in Christ."}
              </p>
              <div className="relative mx-auto mt-8 flex max-w-md items-center justify-center gap-3">
                <span className="h-px flex-1 bg-[#dfbd97]/35" />
                <span className="h-2 w-2 rotate-45 border border-[#dfbd97] bg-[#bd795c]" />
                <span className="h-px flex-1 bg-[#dfbd97]/35" />
              </div>
              <p className="relative mt-5 font-mono text-[8px] uppercase tracking-[.24em] text-[#dfbd97]">PRERNA 2026 · THE LIVING CHURCH</p>
            </div>

            <div className="relative mt-7 grid items-stretch gap-5 lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[#bd795c]/20 bg-[#e9ede4] p-6 sm:p-8">
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#19382f]/10" />
                <div className="relative">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd795c]">{isHindi ? "हमारा आधार" : "OUR FOUNDATION"}</p>
                  <BookOpen className="mt-5 h-7 w-7 text-[#718a78]" />
                  <p className="mt-5 font-serif text-2xl leading-relaxed text-[#19382f] sm:text-3xl">
                    {isHindi
                      ? "जैसे देह एक है और उसके अंग बहुत से हैं, और देह के सब अंग बहुत होने पर भी एक ही देह हैं, वैसे ही मसीह भी हैं।"
                      : "For as the body is one, and hath many members, and all the members of that one body, being many, are one body: so also is Christ."}
                  </p>
                </div>
                <div className="relative mt-8 flex items-center justify-between gap-3 border-t border-[#19382f]/15 pt-5">
                  <span className="font-mono text-[8px] font-bold tracking-[.18em] text-[#bd795c]">1 CORINTHIANS 12:12 · KJV</span>
                  <span className="h-2 w-2 rounded-full bg-[#bd795c]" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.8rem] border border-[#19382f]/10 bg-[#fffdf8] p-6 shadow-[0_14px_38px_rgba(52,61,48,.05)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd795c]">{isHindi ? "एकता में विविधता" : "UNITY IN DIVERSITY"}</p>
                    <h2 className="mt-2 font-serif text-2xl text-[#19382f] sm:text-3xl">{isHindi ? "हर अंग का अपना स्थान है।" : "Every member has a place."}</h2>
                  </div>
                  <span className="hidden rounded-full bg-[#e9ede4] p-3 text-[#718a78] sm:inline-flex"><HeartHandshake className="h-6 w-6" /></span>
                </div>
                <svg aria-hidden="true" viewBox="0 0 520 220" className="mt-5 w-full" fill="none">
                  <path d="M260 110C190 30 112 48 80 105M260 110C330 30 408 48 440 105M260 110C190 190 112 172 80 115M260 110C330 190 408 172 440 115" stroke="#9BAA98" strokeWidth="2" strokeDasharray="5 7"/>
                  <path d="M260 110L80 105M260 110L440 105M260 110L80 115M260 110L440 115" stroke="#BD795C" strokeOpacity=".5" strokeWidth="1.5"/>
                  <circle cx="260" cy="110" r="43" fill="#19382F"/>
                  <circle cx="260" cy="110" r="51" stroke="#BD795C" strokeOpacity=".5"/>
                  <circle cx="80" cy="105" r="28" fill="#E8EDE4" stroke="#81927D" strokeWidth="2"/>
                  <circle cx="440" cy="105" r="28" fill="#E8EDE4" stroke="#81927D" strokeWidth="2"/>
                  <circle cx="80" cy="115" r="10" fill="#BD795C"/>
                  <circle cx="440" cy="115" r="10" fill="#BD795C"/>
                  <circle cx="260" cy="110" r="9" fill="#DFBD97"/>
                  <path d="M260 77V143M227 110H293" stroke="#DFBD97" strokeOpacity=".65" strokeWidth="1"/>
                  <circle cx="80" cy="105" r="7" fill="#BD795C"/>
                  <circle cx="440" cy="105" r="7" fill="#BD795C"/>
                </svg>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="font-mono text-[7px] font-bold tracking-[.15em] text-[#bd795c]">{isHindi ? "अलग-अलग" : "DIFFERENT"}</p></div>
                  <div><p className="font-mono text-[7px] font-bold tracking-[.15em] text-[#19382f]">{isHindi ? "मसीह में एक" : "ONE IN CHRIST"}</p></div>
                  <div><p className="font-mono text-[7px] font-bold tracking-[.15em] text-[#bd795c]">{isHindi ? "जुड़े हुए" : "CONNECTED"}</p></div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd795c]">{isHindi ? "इस पाठ से चार बातें" : "FOUR TRUTHS TO CARRY WITH US"}</p>
                  <h2 className="mt-2 font-serif text-3xl text-[#19382f] sm:text-4xl">{isHindi ? "हम एक साथ बढ़ते हैं।" : "We are built together."}</h2>
                </div>
                <span className="hidden font-mono text-[8px] tracking-[.18em] text-[#81927d] sm:block">1 CORINTHIANS 12</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    number: "01",
                    title: isHindi ? "एक शरीर" : "ONE BODY",
                    verse: isHindi ? "1 कुरिन्थियों 12:12" : "1 Corinthians 12:12",
                    body: isHindi
                      ? "कलीसिया केवल लोगों का समूह नहीं है। हम मसीह में एक शरीर हैं। हमारा विश्वास हमें एक-दूसरे से जोड़ता है।"
                      : "The Church is more than a gathering of people. We are one body in Christ. Our faith connects us to one another.",
                  },
                  {
                    number: "02",
                    title: isHindi ? "अनेक अंग" : "MANY MEMBERS",
                    verse: isHindi ? "1 कुरिन्थियों 12:14" : "1 Corinthians 12:14",
                    body: isHindi
                      ? "हर व्यक्ति एक जैसा नहीं है। परमेश्वर ने हमें अलग-अलग क्षमताएँ और जिम्मेदारियाँ दी हैं।"
                      : "Not everyone is the same. God has given us different abilities, roles and responsibilities.",
                  },
                  {
                    number: "03",
                    title: isHindi ? "हर अंग महत्वपूर्ण है" : "EVERY MEMBER MATTERS",
                    verse: isHindi ? "1 कुरिन्थियों 12:21–22" : "1 Corinthians 12:21–22",
                    body: isHindi
                      ? "कोई भी यह नहीं कह सकता कि उसे दूसरे की ज़रूरत नहीं है। कोई भी व्यक्ति महत्वहीन नहीं है।"
                      : "No member can say they do not need another. No person in the Church is insignificant.",
                  },
                  {
                    number: "04",
                    title: isHindi ? "मिलकर बढ़ें" : "BUILT TOGETHER",
                    verse: isHindi ? "1 कुरिन्थियों 12:25–27" : "1 Corinthians 12:25–27",
                    body: isHindi
                      ? "हम एक-दूसरे की परवाह करते हैं, एक-दूसरे के दुख और आनंद में सहभागी होते हैं और साथ मिलकर बढ़ते हैं।"
                      : "We care for one another, share one another's joys and struggles, and grow together as Christ's body.",
                  },
                ].map((item) => (
                  <motion.article
                    key={item.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Number(item.number) * .06 }}
                    className="group relative overflow-hidden rounded-[1.6rem] border border-[#19382f]/10 bg-[#fffdf8] p-6 shadow-[0_12px_32px_rgba(52,61,48,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(52,61,48,.09)] sm:p-8"
                  >
                    <span aria-hidden="true" className="absolute -right-2 -top-7 font-serif text-[7rem] leading-none text-[#81927d]/10">{item.number}</span>
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9ede4] font-serif text-lg italic text-[#bd795c]">{item.number}</span>
                      <span className="font-mono text-[7px] font-bold uppercase tracking-[.15em] text-[#bd795c]">{item.verse}</span>
                    </div>
                    <h3 className="relative mt-5 font-serif text-2xl text-[#19382f] sm:text-3xl">{item.title}</h3>
                    <p className="relative mt-3 text-sm leading-8 text-[#607568]">{item.body}</p>
                    <div className="mt-6 h-px w-12 bg-[#bd795c]/55" />
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#bd795c]/25 bg-[#e8ede4] px-6 py-10 text-center sm:px-12 sm:py-14">
              <div aria-hidden="true" className="pointer-events-none absolute -left-14 -top-20 h-52 w-52 rounded-full border border-[#19382f]/10" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -bottom-20 h-52 w-52 rounded-full border border-[#19382f]/10" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#19382f] text-[#dfbd97] shadow-md">
                <HeartHandshake className="h-7 w-7" />
              </div>
              <p className="relative mt-5 font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#bd795c]">
                {isHindi ? "हमारी साझा घोषणा" : "OUR SHARED DECLARATION"}
              </p>
              <h2 className="relative mx-auto mt-4 max-w-4xl font-serif text-3xl leading-relaxed text-[#19382f] sm:text-5xl">
                {isHindi
                  ? "मैं मसीह की देह का एक अंग हूँ। मेरा होना महत्वपूर्ण है। मेरा योगदान महत्वपूर्ण है।"
                  : "I am part of the Body of Christ. My presence matters. My contribution matters."}
              </h2>
              <p className="relative mt-5 text-sm leading-7 text-[#607568]">
                {isHindi
                  ? "हम अलग-अलग होकर भी एक हैं। हम साथ मिलकर बढ़ेंगे।"
                  : "Different in our gifts, united in Christ. We will grow together."}
              </p>
              <p className="relative mt-7 font-mono text-[8px] font-bold tracking-[.22em] text-[#bd795c]">1 CORINTHIANS 12:27</p>
            </div>
          </motion.section>
        )}

          {stage === "COMPLETE" && <motion.section key="complete" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-4xl rounded-[2rem] border border-[#19382f]/10 bg-[#e7ebe2] px-6 py-12 text-center shadow-inner sm:px-12 sm:py-16"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#19382f] text-[#fffdf7]"><Check className="h-7 w-7"/></div><p className="mt-7 font-mono text-[12px] font-bold uppercase tracking-[.25em] text-[#bd6547]">{t.completeEyebrow}</p><h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl">{t.completeTitle}</h1><p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#607568] sm:text-base">{t.completeBody}</p><div className="mx-auto mt-9 flex max-w-xl items-center justify-center gap-3 font-mono text-[12px] font-bold uppercase tracking-[.17em] text-[#bd795c]"><Sprout className="h-5 w-5"/>ACTS 2:42 · THE LIVING CHURCH</div></motion.section>}
        </AnimatePresence>

        {stage !== "COMPLETE" && <div className="mt-10 flex items-center justify-between border-t border-[#19382f]/12 pt-5"><span className="font-mono text-[12px] uppercase tracking-[.18em] text-[#8b9587]">PRERNA 2026 · ACTS 2:42</span><span className="font-mono text-[12px] uppercase tracking-[.18em] text-[#8b9587]">{stageTitles[stageNumber]}</span></div>}
      </div>
    </main>
  );

}
