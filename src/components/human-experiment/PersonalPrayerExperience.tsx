"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import {
  ArrowRight, BookOpen, Check, Heart, Languages, MessageCircle,
  Smartphone, Bell, Play, Sun, Users, LockKeyhole, Sprout, Flower2,
  Sparkles, ShieldCheck, Quote, Clock3, Feather,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { HumanExperimentSession } from "@/lib/human-experiment/session";
import {
  loadParticipantAnswer,
  loadRoomResults,
  saveParticipantAnswer,
} from "@/lib/human-experiment/answerSaveClient";

type Language = "en" | "hi";
type SceneKey = "scene1" | "scene2" | "scene3";
type Answers = { scene1: string | null; scene2: string | null; scene3: string | null; commitment: string | null };
type Counts = Record<SceneKey, Record<string, number>>;

const EMPTY: Answers = { scene1: null, scene2: null, scene3: null, commitment: null };
const OPTIONS = {
  scene1: ["pray_first", "check_messages", "watch_reels", "forget_prayer"],
  scene2: ["bring_to_god", "solve_alone", "pray_and_support", "keep_worrying"],
  scene3: ["restart", "wait_feeling", "make_plan", "leave_for_later"],
} as const;

const COPY = {
  en: {
    experience: "EXPERIENCE 04", title: "THE QUIET CONNECTION", subtitle: "Making room to speak with God.",
    intro: "Three everyday moments. Three decisions. Think honestly about what happens to prayer when routines, distractions and pressure fill our days.",
    honestyTitle: "A MOMENT OF HONESTY", honestyLead: "Choose what you would genuinely do.",
    honestyBody: "There are no right or wrong answers. Don't choose what you think you should do. Choose what you would naturally do in that situation.",
    honestyTag: "BE HONEST. YOUR ANSWER IS YOURS.", enter: "ENTER THE EXPERIENCE", scene: "SCENE", imagine: "PUT YOURSELF IN THIS SITUATION", choose: "What would you genuinely do?", select: "SELECT ONE RESPONSE", submit: "RECORD MY CHOICE", saving: "SAVING...", saved: "YOUR CHOICE HAS BEEN RECORDED", waiting: "WAITING FOR THE FACILITATOR", locked: "The facilitator has temporarily paused responses.", error: "Something went wrong. Please try again.", chooseError: "Please select a response first.", connectionError: "Your participant session could not be found. Please reconnect.", reveal: "THE ROOM'S RESPONSES", revealNote: "These results are anonymous. Personal reflections are never included.", responses: "RESPONSES", noResponses: "No responses have been recorded yet.", discussion: "TAKE A MOMENT TO REFLECT", discussionTitle: "Have I made time to speak with God?", discussionBody: "Prayer is not only for difficult moments. It is how we bring our ordinary days, worries, gratitude and decisions before God. We do not need impressive words or a perfect routine. We need an honest and growing relationship with our Father.",
    verse1: "But when you pray, go into your room, close the door and pray to your Father, who is unseen.", ref1: "MATTHEW 6:6", verse2: "Lord, teach us to pray.", ref2: "LUKE 11:1", verse3: "Do not be anxious about anything... present your requests to God.", ref3: "PHILIPPIANS 4:6–7", verse4: "Pray continually.", ref4: "1 THESSALONIANS 5:17",
    promptsTitle: "DISCUSS TOGETHER", prompts: ["What usually takes the first attention in your day?", "Why can prayer become our last response when life gets difficult?", "What makes consistency in prayer difficult?", "What is one realistic change you can make starting tomorrow?"],
    commitmentTitle: "A PRIVATE PERSONAL COMMITMENT", commitmentBody: "What is one realistic step you want to take to make prayer a regular part of your life?", commitmentPlaceholder: "My personal commitment...", saveCommitment: "SAVE MY PRIVATE COMMITMENT", private: "PRIVATE — THIS IS NOT SHARED WITH THE ROOM", commitmentSaved: "YOUR PRIVATE COMMITMENT HAS BEEN SAVED", complete: "EXPERIENCE COMPLETE", completeTitle: "Make room for the relationship.", completeBody: "Don't leave with another promise you will forget. Leave with one honest decision you are willing to live.",
    scenes: [
      { title: "THE BUSY MORNING", eyebrow: "THE FIRST MOMENT OF YOUR DAY", body: "You wake up in the morning and reach for your phone before even getting out of bed. You check WhatsApp messages and notifications. Then you open Instagram or YouTube Shorts and start watching reels. One video becomes five, and several minutes pass before you realise it.\n\nYou suddenly remember that you have not spent time with God. Your day is about to begin.", prompt: "What would you genuinely do?", teachingTitle: "WHAT GETS OUR FIRST ATTENTION?", teaching: "Sometimes we say we don't have time for prayer, but we have time to scroll. The issue isn't always a lack of time. Sometimes it is where our attention goes. Jesus taught us to make room for sincere, personal prayer. The challenge is not to follow someone else's exact routine, but to intentionally make room for God.", impact: "We don't always decide to stop praying. Sometimes we keep postponing it until postponing becomes normal." },
      { title: "WHEN LIFE GETS DIFFICULT", eyebrow: "A MOMENT OF PRESSURE", body: "You receive disappointing news. Something important isn't going as planned. You feel anxious, and your mind keeps returning to the problem. You have people you could speak to and practical steps you could take, but inside you feel overwhelmed.\n\nWhat would you most likely do?", prompt: "How would you respond?", teachingTitle: "DO I TURN TO GOD, OR ONLY TO MY OWN STRENGTH?", teaching: "Paul encourages believers to bring their requests to God through prayer and thanksgiving. Prayer does not mean ignoring problems, avoiding responsibility or refusing help. We can pray, seek wise support and take practical steps. We do not have to carry everything as though we are alone.", impact: "Is prayer part of my life before the crisis arrives, or only after every other option feels exhausted?" },
      { title: "THE DISTANT ROUTINE", eyebrow: "WHEN DAYS BECOME WEEKS", body: "A few months ago, you used to pray regularly. Gradually, days passed without meaningful prayer. You still believe prayer matters, but your personal time with God has slowly disappeared.\n\nYou know you need to begin again, but restarting feels difficult. What would you do?", prompt: "What would you do next?", teachingTitle: "YOU CAN BEGIN AGAIN TODAY.", teaching: "When the disciples saw Jesus praying, they asked Him to teach them to pray. Prayer is something we learn and grow in. We do not need impressive words or a perfect routine. We can return honestly, begin simply and build a realistic rhythm. Praying continually means living with an ongoing openness towards God.", impact: "You don't rebuild a relationship by waiting until you feel like it. You rebuild it by choosing to return." },
    ],
    options: {
      pray_first: { title: "PUT THE PHONE ASIDE AND PRAY", body: "Spend a few quiet minutes speaking with God before opening the day's distractions." },
      check_messages: { title: "CHECK MESSAGES FIRST", body: "Open WhatsApp and notifications before getting out of bed, planning to pray afterwards." },
      watch_reels: { title: "WATCH A FEW REELS", body: "Open Instagram or YouTube Shorts for a few minutes. One video leads to another, and prayer gets postponed." },
      forget_prayer: { title: "GET CAUGHT UP AND FORGET", body: "Move from the phone straight into morning responsibilities without making time to pray." },
      bring_to_god: { title: "BRING IT TO GOD", body: "Honestly tell God what you are facing and ask for wisdom and strength." },
      solve_alone: { title: "TRY TO SOLVE IT MYSELF", body: "Focus on fixing the situation first and turn to prayer only if I still need to." },
      pray_and_support: { title: "PRAY AND SEEK SUPPORT", body: "Bring the worry to God and speak with someone trustworthy while taking practical steps." },
      keep_worrying: { title: "KEEP WORRYING QUIETLY", body: "Keep the concern to myself and struggle to bring it to God or anyone else." },
      restart: { title: "START AGAIN TODAY", body: "Come honestly before God and begin with a simple prayer, even if it is brief." },
      wait_feeling: { title: "WAIT UNTIL I FEEL MOTIVATED", body: "Wait until I feel more spiritual or more ready before trying to pray again." },
      make_plan: { title: "MAKE A REALISTIC PLAN", body: "Choose a regular time and a simple place where I can pause and pray." },
      leave_for_later: { title: "LEAVE IT FOR ANOTHER DAY", body: "Continue as I am and hope that my prayer life improves on its own." },
    },
    resultLabels: {
      scene1: ["Put phone aside and pray", "Check messages first", "Watch reels first", "Get caught up and forget"],
      scene2: ["Bring it to God", "Try to solve it myself", "Pray and seek support", "Keep worrying quietly"],
      scene3: ["Start again today", "Wait until motivated", "Make a realistic plan", "Leave it for later"],
    },
  },
  hi: {
    experience: "अनुभव ०४", title: "प्रार्थना का समय", subtitle: "परमेश्वर से बात करने के लिए समय निकालना।",
    intro: "तीन रोज़मर्रा की परिस्थितियाँ। तीन निर्णय। सोचिए कि जब दिन व्यस्तता, ध्यान भटकाने वाली चीज़ों और परेशानियों से भर जाता है, तब हमारी प्रार्थना का क्या होता है।",
    honestyTitle: "ईमानदारी का एक पल", honestyLead: "वही चुनें जो आप सच में करेंगे।", honestyBody: "यहाँ कोई सही या गलत जवाब नहीं है। यह मत चुनें कि आपको क्या करना चाहिए। उस स्थिति में आप स्वाभाविक रूप से जो करेंगे, वही चुनें।", honestyTag: "ईमानदार रहें। आपका जवाब आपका अपना है।", enter: "अनुभव शुरू करें", scene: "दृश्य", imagine: "खुद को इस परिस्थिति में रखकर सोचें", choose: "आप सच में क्या करेंगे?", select: "एक जवाब चुनें", submit: "मेरा चुनाव दर्ज करें", saving: "सुरक्षित हो रहा है...", saved: "आपका चुनाव दर्ज हो गया है", waiting: "संचालक के अगले निर्देश की प्रतीक्षा करें", locked: "संचालक ने कुछ समय के लिए जवाब देना रोक दिया है।", error: "कुछ समस्या हुई। कृपया फिर कोशिश करें।", chooseError: "पहले एक जवाब चुनें।", connectionError: "आपका प्रतिभागी सत्र नहीं मिला। कृपया दोबारा जुड़ें।", reveal: "समूह के जवाब", revealNote: "ये जवाब गुमनाम हैं। निजी संकल्प समूह को नहीं दिखाए जाते।", responses: "जवाब", noResponses: "अभी तक कोई जवाब दर्ज नहीं हुआ है।", discussion: "थोड़ा रुककर विचार करें", discussionTitle: "क्या मैं परमेश्वर से बात करने के लिए समय निकालता हूँ?", discussionBody: "प्रार्थना केवल परेशानी के समय नहीं होती। इसके द्वारा हम अपने दिन, चिंताएँ, धन्यवाद और निर्णय परमेश्वर के सामने रखते हैं। हमें कठिन शब्दों या बिल्कुल सही दिनचर्या की जरूरत नहीं है। हमें अपने स्वर्गीय पिता के साथ सच्चे और बढ़ते हुए संबंध की जरूरत है।",
    verse1: "जब तू प्रार्थना करे, तो अपनी कोठरी में जा और द्वार बन्द करके अपने पिता से प्रार्थना कर।", ref1: "मत्ती 6:6", verse2: "हे प्रभु, हमें प्रार्थना करना सिखा।", ref2: "लूका 11:1", verse3: "किसी भी बात की चिन्ता मत करो... अपनी विनतियाँ परमेश्वर के सामने रखो।", ref3: "फिलिप्पियों 4:6–7", verse4: "निरन्तर प्रार्थना करते रहो।", ref4: "1 थिस्सलुनीकियों 5:17",
    promptsTitle: "मिलकर चर्चा करें", prompts: ["आपके दिन की शुरुआत में सबसे पहले किस चीज़ को आपका ध्यान मिलता है?", "परेशानी आने पर प्रार्थना हमारी आखिरी कोशिश क्यों बन जाती है?", "नियमित प्रार्थना करने में सबसे बड़ी कठिनाई क्या है?", "कल से आप कौन-सा एक व्यावहारिक बदलाव कर सकते हैं?"],
    commitmentTitle: "आपका निजी संकल्प", commitmentBody: "प्रार्थना को अपने जीवन का नियमित हिस्सा बनाने के लिए आप कौन-सा एक व्यावहारिक कदम उठाना चाहते हैं?", commitmentPlaceholder: "मेरा निजी संकल्प...", saveCommitment: "मेरा निजी संकल्प सुरक्षित करें", private: "निजी — यह जवाब समूह के साथ साझा नहीं होगा", commitmentSaved: "आपका निजी संकल्प सुरक्षित हो गया है", complete: "अनुभव पूरा हुआ", completeTitle: "इस रिश्ते के लिए समय निकालें।", completeBody: "आज एक ऐसा सच्चा निर्णय लेकर जाएँ जिसे आप अपने जीवन में अपनाना चाहते हैं।",
    scenes: [
      { title: "व्यस्त सुबह", eyebrow: "आपके दिन का पहला पल", body: "सुबह आपकी आँख खुलती है और बिस्तर से उठने से पहले ही आप फोन उठा लेते हैं। आप WhatsApp मैसेज और नोटिफिकेशन देखने लगते हैं। फिर Instagram या YouTube Shorts खोलकर रील्स देखने लगते हैं। एक वीडियो देखते-देखते पाँच हो जाते हैं और कई मिनट बीत जाते हैं।\n\nतभी आपको याद आता है कि आपने परमेश्वर के साथ समय नहीं बिताया। आपका दिन शुरू होने वाला है।", prompt: "आप सच में क्या करेंगे?", teachingTitle: "आपका ध्यान सबसे पहले कहाँ जाता है?", teaching: "कभी-कभी हम कहते हैं कि प्रार्थना के लिए समय नहीं है, लेकिन फोन पर स्क्रॉल करने के लिए समय मिल जाता है। समस्या हमेशा समय की कमी नहीं होती; कभी-कभी समस्या यह होती है कि हमारा ध्यान कहाँ जाता है। यीशु ने सच्ची और व्यक्तिगत प्रार्थना के लिए समय निकालना सिखाया।", impact: "हम हमेशा प्रार्थना छोड़ने का फैसला नहीं करते। कभी-कभी हम उसे टालते रहते हैं, जब तक टालना हमारी आदत न बन जाए।" },
      { title: "जब जीवन कठिन हो जाता है", eyebrow: "परेशानी का एक पल", body: "आपको कोई निराशाजनक खबर मिलती है। कोई ज़रूरी बात आपकी उम्मीद के अनुसार नहीं हो रही। आप परेशान हैं और बार-बार उसी समस्या के बारे में सोच रहे हैं। आप किसी भरोसेमंद व्यक्ति से बात कर सकते हैं और कुछ व्यावहारिक कदम भी उठा सकते हैं, लेकिन मन बहुत भारी है।\n\nआप आमतौर पर क्या करेंगे?", prompt: "आप कैसी प्रतिक्रिया देंगे?", teachingTitle: "क्या मैं परमेश्वर की ओर मुड़ता हूँ?", teaching: "पौलुस हमें सिखाते हैं कि हम अपनी विनतियाँ प्रार्थना और धन्यवाद के साथ परमेश्वर के सामने रखें। प्रार्थना का मतलब समस्याओं को नज़रअंदाज़ करना या मदद लेने से मना करना नहीं है। हम प्रार्थना कर सकते हैं, समझदार लोगों से सहायता ले सकते हैं और ज़रूरी कदम उठा सकते हैं।", impact: "क्या प्रार्थना मेरी ज़िंदगी का हिस्सा है, या मैं हर दूसरा रास्ता आज़माने के बाद ही परमेश्वर के पास जाता हूँ?" },
      { title: "छूटती हुई दिनचर्या", eyebrow: "जब दिन हफ्तों में बदल जाते हैं", body: "कुछ महीने पहले आप नियमित रूप से प्रार्थना करते थे। धीरे-धीरे कई दिन बिना सच्ची प्रार्थना के बीतने लगे। आप अब भी मानते हैं कि प्रार्थना ज़रूरी है, लेकिन परमेश्वर के साथ आपका निजी समय कम होता गया है।\n\nआप जानते हैं कि फिर से शुरू करना चाहिए, लेकिन शुरुआत करना मुश्किल लगता है। आप क्या करेंगे?", prompt: "अब आप क्या करेंगे?", teachingTitle: "आज से फिर शुरुआत हो सकती है।", teaching: "जब चेलों ने यीशु को प्रार्थना करते देखा, तो उन्होंने उनसे प्रार्थना करना सिखाने को कहा। प्रार्थना सीखने और बढ़ने की बात है। हमें कठिन शब्दों या बिल्कुल सही दिनचर्या की ज़रूरत नहीं है। हम सच्चाई से परमेश्वर के पास लौट सकते हैं और एक सरल नियमित समय बना सकते हैं।", impact: "रिश्ता फिर से बनाने के लिए सही भावना आने का इंतज़ार न करें। लौटने का फैसला करें।" },
    ],
    options: {
      pray_first: { title: "फोन रखकर पहले प्रार्थना करें", body: "दिन की भागदौड़ शुरू होने से पहले कुछ मिनट परमेश्वर से बात करें।" },
      check_messages: { title: "पहले मैसेज देखें", body: "बिस्तर से उठने से पहले WhatsApp और नोटिफिकेशन देखें और सोचें कि बाद में प्रार्थना करेंगे।" },
      watch_reels: { title: "कुछ रील्स देखें", body: "Instagram या YouTube Shorts पर कुछ मिनट बिताएँ। एक वीडियो के बाद दूसरा आता है और प्रार्थना टल जाती है।" },
      forget_prayer: { title: "व्यस्त होकर प्रार्थना भूल जाएँ", body: "फोन और सुबह के कामों में लग जाएँ और प्रार्थना के लिए समय निकाले बिना दिन शुरू कर दें।" },
      bring_to_god: { title: "परमेश्वर के सामने रखें", body: "परमेश्वर को अपनी परेशानी बताएँ और बुद्धि व सामर्थ्य माँगें।" },
      solve_alone: { title: "खुद ही समस्या सुलझाएँ", body: "पहले समस्या ठीक करने में लग जाएँ और ज़रूरत पड़ने पर ही प्रार्थना करें।" },
      pray_and_support: { title: "प्रार्थना करें और मदद लें", body: "अपनी चिंता परमेश्वर को बताएँ और किसी भरोसेमंद व्यक्ति से बात करते हुए व्यावहारिक कदम उठाएँ।" },
      keep_worrying: { title: "चुपचाप चिंता करते रहें", body: "अपनी परेशानी अपने तक रखें और परमेश्वर या किसी दूसरे से बात करने में कठिनाई महसूस करें।" },
      restart: { title: "आज ही फिर शुरू करें", body: "सच्चाई से परमेश्वर के सामने आएँ और एक सरल प्रार्थना से शुरुआत करें।" },
      wait_feeling: { title: "मन होने का इंतज़ार करें", body: "जब तक मन आध्यात्मिक या तैयार महसूस न करे, तब तक इंतज़ार करें।" },
      make_plan: { title: "एक व्यावहारिक योजना बनाएँ", body: "एक नियमित समय और शांत जगह चुनें जहाँ आप रुककर प्रार्थना कर सकें।" },
      leave_for_later: { title: "फिर कभी के लिए छोड़ दें", body: "जैसे चल रहा है वैसे चलने दें और उम्मीद करें कि प्रार्थना अपने आप बेहतर हो जाएगी।" },
    },
    resultLabels: {
      scene1: ["फोन रखकर प्रार्थना", "पहले मैसेज देखें", "पहले रील्स देखें", "व्यस्त होकर भूल जाएँ"],
      scene2: ["परमेश्वर के सामने रखें", "खुद ही सुलझाएँ", "प्रार्थना और सहायता", "चुपचाप चिंता करें"],
      scene3: ["आज फिर शुरू करें", "मन होने का इंतज़ार", "व्यावहारिक योजना", "बाद के लिए छोड़ दें"],
    },
  },
} as const;

function BotanicalSprig({
  className = "",
  flip = false,
  tone = "#879b82",
}: {
  className?: string;
  flip?: boolean;
  tone?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 300"
      className={className}
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <g stroke={tone} strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" opacity=".88">
        <path d="M22 280C45 231 69 187 104 146c31-37 57-72 70-126" />
        <path d="M44 237c-25-4-36-19-36-37 22 0 37 12 36 37Z" />
        <path d="M58 215c-2-26 11-42 32-48 5 23-6 42-32 48Z" />
        <path d="M78 185c-24-8-32-26-25-47 22 4 35 21 25 47Z" />
        <path d="M96 161c-1-23 13-39 34-42 3 22-9 39-34 42Z" />
        <path d="M117 132c-19-10-24-29-13-47 20 7 28 25 13 47Z" />
        <path d="M139 101c2-20 17-32 36-30-1 20-14 33-36 30Z" />
        <path d="M158 69c-13-12-13-30 1-44 16 12 17 30-1 44Z" />
        <path d="M43 239c-7-18-18-29-35-39M59 216c8-18 20-31 31-49M79 185c-8-19-16-34-26-47M97 161c11-17 22-29 33-42M117 132c-1-18-2-32-13-47M139 101c12-12 23-21 36-30" />
      </g>
      <g stroke="#bd795c" strokeWidth="1.1" opacity=".8">
        <circle cx="180" cy="56" r="9" /><circle cx="180" cy="56" r="3" />
        <path d="M180 42v5m0 18v5m-14-14h5m18 0h5m-24-10 4 4m12 12 4 4m0-20-4 4m-12 12-4 4" />
      </g>
    </svg>
  );
}

function PrayerHands({ className = "", tone = "#bd795c" }: { className?: string; tone?: string }) {
  return (
    <svg viewBox="0 0 220 240" className={className} fill="none" aria-hidden="true">
      <g stroke={tone} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M91 211 89 137c-1-10-7-19-16-29l-26-30c-8-9 2-21 12-13l29 25-15-48c-3-11 12-17 18-6l20 42-8-54c-2-12 15-15 19-3l15 59 7-35c2-12 18-10 18 3l-8 64c-1 13-4 26-12 38l-8 61Z" />
        <path d="M91 211h81M89 137c8 10 16 17 25 20m-25-20 14-3m52 1c-8 8-16 14-27 18" />
        <path d="M111 101c8 9 13 20 13 34m20-24c-6 8-10 17-11 28" opacity=".65" />
      </g>
      <path d="M110 25c-9-11-22-11-29 0m29-1c9-11 22-11 29 0" stroke={tone} strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <circle cx="110" cy="16" r="4" fill={tone} opacity=".7" />
    </svg>
  );
}

function IntroPrayerRoomArtwork({ language }: { language: Language }) {
  const isHindi = language === "hi";

  return (
    <div className="relative mx-auto w-full max-w-[590px] lg:max-w-none">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 z-0 h-24 w-24 rounded-full border border-[#bd795c]/35 sm:-right-6 sm:-top-6 sm:h-28 sm:w-28"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -left-4 z-0 h-24 w-24 rounded-full border border-dashed border-[#81927d]/40 sm:-bottom-6 sm:-left-6 sm:h-32 sm:w-32"
        animate={{ rotate: -360 }}
        transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 overflow-hidden rounded-[2rem] border border-[#d2b795]/80 bg-[#e9e4d7] shadow-[0_24px_58px_rgba(34,53,42,.16)]">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/experience04-prayer-room-hero.png"
            alt={isHindi ? "एक व्यक्ति अपने कमरे में खुली बाइबल के पास शांत होकर प्रार्थना कर रहा है" : "A young man praying quietly in his room beside an open Bible as warm morning light enters through the window"}
            fill
            priority
            sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 46vw, 100vw"
            className="object-cover object-center transition-transform duration-[1400ms] ease-out hover:scale-[1.025]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#142c24]/55 via-transparent to-[#f8f3e9]/10" />
          <div className="pointer-events-none absolute inset-3 rounded-[1.55rem] border border-[#fff8e9]/65 sm:inset-4 sm:rounded-[1.7rem]" />

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[#f8f3e9]/75 bg-[#f8f3e9]/95 px-3 py-2 shadow-sm backdrop-blur-sm sm:left-7 sm:top-7 sm:px-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bd795c]" />
            <span className="font-mono text-[7px] font-bold uppercase tracking-[.18em] text-[#375444] sm:text-[8px]">
              {isHindi ? "परमेश्वर के साथ एक शांत पल" : "A QUIET MOMENT WITH GOD"}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="max-w-[70%] text-[#fffaf0]">
              <p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] text-[#f0c69b] sm:text-[8px]">
                {isHindi ? "तीन पल" : "THREE MOMENTS"}
              </p>
              <p className="mt-1 font-serif text-xl leading-tight sm:text-2xl">
                {isHindi ? "रुकें · साँस लें · प्रार्थना करें" : "Pause · Breathe · Pray"}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/15 text-white backdrop-blur-sm sm:h-12 sm:w-12">
              <BookOpen className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>

      <BotanicalSprig className="pointer-events-none absolute -bottom-10 -right-7 z-20 h-36 w-28 opacity-65 sm:-bottom-12 sm:-right-9 sm:h-44 sm:w-32" flip tone="#81927d" />
      <div className="pointer-events-none absolute -left-3 top-1/2 z-0 hidden h-14 w-14 -translate-y-1/2 rounded-full border border-[#bd795c]/30 lg:block" />
    </div>
  );
}

function PrayerArtwork({ sceneIndex = -1, compact = false, hideLabel = false }: { sceneIndex?: number; compact?: boolean; hideLabel?: boolean }) {  const intro = sceneIndex < 0;
  const eyebrow = intro
    ? "A SPACE TO BE STILL"
    : sceneIndex === 0
      ? "THE FIRST MOMENT OF YOUR DAY"
      : sceneIndex === 1
        ? "IN THE MIDDLE OF THE STORM"
        : "A PLACE TO BEGIN AGAIN";
  const bottomLabel = intro
    ? "Pause · Breathe · Pray"
    : sceneIndex === 0
      ? "Before the day begins"
      : sceneIndex === 1
        ? "You do not carry it alone"
        : "Return to a simple rhythm";

  return sceneIndex === 1 ? (
    <div className={`group relative isolate w-full overflow-hidden rounded-[2rem] border border-[#71836f]/25 bg-[#e6e7db] shadow-[0_24px_60px_rgba(38,57,43,.12)] ${compact ? "aspect-[5/4] min-h-[220px]" : "aspect-[5/4] min-h-[310px] sm:min-h-[390px]"}`}>
      <Image
        src="/images/experience04-scene2-prayer-card.webp"
        alt="A young man praying beside an open Bible at a desk as rain falls outside his window"
        fill
        priority
        sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 46vw, 100vw"
        className="object-cover object-center"
      />
    </div>
  ) : (
    <div className={`group relative isolate w-full overflow-hidden rounded-[2rem] border border-[#71836f]/25 bg-[#e6e7db] shadow-[0_24px_60px_rgba(38,57,43,.12)] ${compact ? "aspect-[5/3] min-h-[220px]" : "aspect-[5/4] min-h-[310px] sm:min-h-[390px]"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.86),transparent_33%),linear-gradient(145deg,#f0ebdf_0%,#dce3d7_72%,#d2ddcf_100%)]" />
      <div className="absolute inset-0 opacity-[.14]" style={{ backgroundImage: "radial-gradient(#687d6d .7px,transparent .7px)", backgroundSize: "9px 9px" }} />
      <motion.div className="absolute -right-16 top-10 h-64 w-64 rounded-full border border-[#bd795c]/25" animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute -right-3 top-24 h-44 w-44 rounded-full border border-dashed border-[#bd795c]/30" animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} />
      <p className="absolute left-6 top-6 z-20 flex items-center gap-3 font-mono text-[8px] font-bold uppercase tracking-[.25em] text-[#a35c43] sm:left-8 sm:top-8">
        <span className="h-px w-7 bg-[#bd795c]" />{eyebrow}
      </p>
      <svg viewBox="0 0 700 560" className="absolute inset-0 h-full w-full" role="img" aria-label={intro ? "A quiet prayer corner with an open Bible, morning light and folded hands" : sceneIndex === 0 ? "A morning phone displaying WhatsApp messages, notifications and reels beside an open Bible" : sceneIndex === 1 ? "A worried person sitting by a rain-streaked window, bowing their head and folding their hands in prayer beside an open Bible" : "An open Bible, journal and new plant representing a fresh start"}>
        <defs>
          <linearGradient id="prayer-window" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fffdf6"/><stop offset="1" stopColor="#cdd9cd"/></linearGradient>
          <linearGradient id="prayer-book" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffdf7"/><stop offset="1" stopColor="#e6ddce"/></linearGradient>
          <filter id="prayer-shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        {/* Shared arched window and quiet room */}
        <path d="M126 500V194c0-111 85-174 224-174s224 63 224 174v306" fill="url(#prayer-window)" stroke="#879b88" strokeOpacity=".55" strokeWidth="2.2" />
        <path d="M158 500V197c0-91 73-145 192-145s192 54 192 145v303" fill="none" stroke="#bd795c" strokeOpacity=".34" strokeWidth="1.5" strokeDasharray="5 10" />
        <path d="M350 64v232M170 275h360" stroke="#92a08f" strokeOpacity=".2" strokeWidth="2" />
        <circle cx="350" cy="166" r="54" fill="#d8b27d" opacity=".6" />
        <g stroke="#d5a66f" strokeWidth="2" opacity=".55"><path d="M350 86v-24m0 208v-24m80-80h24m-208 0h24m137-56 17-17m-154 154 17-17m0-120-17-17m154 154-17-17" /></g>
        <path d="M0 493c130-42 235-32 350-8 125 27 241 22 350-14v89H0Z" fill="#b9c8b6" opacity=".72" />
        <ellipse cx="350" cy="500" rx="205" ry="24" fill="#3d5545" opacity=".15" filter="url(#prayer-shadow)" />

        {intro ? (
          <>
            {/* Open Bible and folded hands: the core image of the experience */}
            <path d="M219 407c47-17 91-14 131 5v68c-43-19-87-20-131-5Z" fill="url(#prayer-book)" stroke="#7d927f" strokeWidth="2.2" />
            <path d="M350 412c43-19 87-22 131-5v68c-44-15-88-14-131 5Z" fill="#fffaf0" stroke="#7d927f" strokeWidth="2.2" />
            <path d="M350 412v68m-109-44 80-4m-80 16 80-4m-80 16 80-4m51-8 80-4m-80 16 80-4m-80 16 80-4" stroke="#b9ad9a" strokeWidth="2" strokeLinecap="round" />
            <path d="M110 497c-5-43 0-82 20-113m-19 83c-27-9-39-28-34-55 30 3 47 24 34 55Zm6-39c-1-27 12-45 39-53 6 28-9 49-39 53Z" fill="none" stroke="#6e8b72" strokeWidth="3" strokeLinecap="round" />
            <path d="M590 496c5-43 0-82-20-113m19 83c27-9 39-28 34-55-30 3-47 24-34 55Zm-6-39c1-27-12-45-39-53-6 28 9 49 39 53Z" fill="none" stroke="#6e8b72" strokeWidth="3" strokeLinecap="round" />
            <path d="M274 344c-18-24-19-46-5-63 18 17 22 38 5 63Zm152 0c18-24 19-46 5-63-18 17-22 38-5 63Z" fill="none" stroke="#bd795c" strokeWidth="2" opacity=".55" />
          </>
        ) : sceneIndex === 0 ? (
          <>
            {/* A believable morning phone scene: messages, alerts and endless short videos */}
            <path d="M86 410h528v27H86z" fill="#bda98f" opacity=".78" />
            <path d="M119 437v53m462-53v53" stroke="#927b64" strokeWidth="8" strokeLinecap="round" />

            {/* Phone body and screen */}
            <rect x="245" y="153" width="178" height="267" rx="30" fill="#193d33" stroke="#fffaf0" strokeWidth="8" />
            <rect x="258" y="168" width="152" height="235" rx="19" fill="#fffdf7" />
            <rect x="305" y="177" width="58" height="5" rx="3" fill="#aeb5a8" />
            <circle cx="334" cy="390" r="5" fill="#91a08f" />
            <text x="273" y="202" fontSize="10" fontWeight="700" fill="#19382f">Good morning</text>
            <text x="273" y="217" fontSize="7" fill="#849084">Your day is just beginning</text>

            {/* WhatsApp message preview */}
            <rect x="270" y="231" width="128" height="62" rx="9" fill="#e7eee4" />
            <circle cx="286" cy="248" r="9" fill="#668d70" />
            <path d="M282 248h8m-4-4v8" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
            <text x="301" y="246" fontSize="8" fontWeight="700" fill="#315b42">WhatsApp</text>
            <text x="301" y="257" fontSize="6.5" fill="#637767">4 new messages</text>
            <path d="M281 271h99m-99 8h72" stroke="#a0afa0" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="386" cy="238" r="8" fill="#bd795c" />
            <text x="386" y="241" fontSize="8" fontWeight="700" textAnchor="middle" fill="#fff">4</text>

            {/* Social notification and short-video preview */}
            <rect x="270" y="302" width="128" height="82" rx="9" fill="#f1e5d8" />
            <rect x="279" y="311" width="33" height="43" rx="5" fill="#c78361" />
            <rect x="283" y="315" width="25" height="35" rx="3" fill="#e8c49e" />
            <path d="M293 325v15l11-7.5Z" fill="#fff8eb" />
            <text x="319" y="319" fontSize="7" fontWeight="700" fill="#6f5142">REELS</text>
            <text x="319" y="331" fontSize="6" fill="#8b7667">Next video</text>
            <path d="M319 342h66m-66 8h48m-48 8h55" stroke="#b49b88" strokeWidth="2.5" strokeLinecap="round" />

            {/* Floating WhatsApp alert */}
            <rect x="45" y="245" width="182" height="72" rx="12" fill="#fffaf2" stroke="#d7c8b5" strokeWidth="1.5" />
            <circle cx="68" cy="267" r="12" fill="#6f9477" />
            <path d="M63 267h10m-5-5v10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <text x="88" y="264" fontSize="9" fontWeight="700" fill="#315b42">WhatsApp · 4 new</text>
            <text x="88" y="278" fontSize="7" fill="#718276">Messages waiting for you</text>
            <path d="M61 294h144" stroke="#e2d8c9" strokeWidth="1" />
            <text x="61" y="306" fontSize="6.5" fill="#8a9184">“Are you awake?” · “Good morning!”</text>

            {/* Phone notification banner */}
            <rect x="438" y="204" width="211" height="66" rx="12" fill="#fffaf2" stroke="#d7c8b5" strokeWidth="1.5" />
            <rect x="451" y="217" width="23" height="23" rx="6" fill="#bd795c" />
            <path d="M457 234v-7a5 5 0 0 1 10 0v7m-12 0h14" fill="none" stroke="#fffaf2" strokeWidth="1.5" strokeLinecap="round" />
            <text x="483" y="220" fontSize="8" fontWeight="700" fill="#4e5f50">Notifications</text>
            <text x="483" y="233" fontSize="7" fill="#7d887b">Instagram · New activity</text>
            <text x="483" y="246" fontSize="6.5" fill="#9a8b7a">You have updates waiting</text>
            <circle cx="632" cy="216" r="8" fill="#bd795c" />
            <text x="632" y="219" fontSize="8" fontWeight="700" textAnchor="middle" fill="#fff">3</text>

            {/* A stack of short-form videos: one becomes the next */}
            <rect x="463" y="300" width="128" height="104" rx="10" fill="#d7dfd2" stroke="#8ea18f" strokeWidth="1.5" />
            <rect x="476" y="288" width="128" height="104" rx="10" fill="#e8cdb0" stroke="#fffaf2" strokeWidth="2" />
            <rect x="489" y="276" width="128" height="104" rx="10" fill="#f2e4d3" stroke="#bd795c" strokeWidth="1.5" />
            <rect x="498" y="285" width="110" height="62" rx="6" fill="#c9d7c7" />
            <circle cx="552" cy="316" r="19" fill="#e6bd8c" opacity=".9" />
            <path d="M547 306v20l16-10Z" fill="#fffaf2" />
            <text x="499" y="361" fontSize="7" fontWeight="700" fill="#6d5948">SHORTS · 00:15</text>
            <text x="499" y="371" fontSize="6" fill="#8b7667">Swipe for the next video</text>
            <motion.path d="M624 315h25m-8-8 8 8-8 8" stroke="#bd795c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} />

            {/* Bible remains open beside the phone, waiting */}
            <path d="M174 410c40-15 77-13 111 3v43c-36-15-73-16-111-2Z" fill="url(#prayer-book)" stroke="#80917e" strokeWidth="2" />
            <path d="M285 413c34-16 72-18 108-3v44c-36-14-73-13-108 2Z" fill="#fffaf0" stroke="#80917e" strokeWidth="2" />
            <path d="M285 413v43m-91-23 77-3m-77 14 77-3m27-11 82-3m-82 14 82-3" stroke="#b4a995" strokeWidth="1.8" />
            <motion.path d="M170 145c18-16 35-16 52 0" stroke="#bd795c" strokeWidth="2" fill="none" strokeLinecap="round" initial={{ opacity: .2 }} animate={{ opacity: [.2, .8, .2], y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity }} />
          </>

        ) : (
          <>
            {/* An open Bible and journal; a sprout grows toward the light */}
            <path d="M170 380c55-24 111-22 180 5v78c-62-27-120-29-180-5Z" fill="url(#prayer-book)" stroke="#778d7d" strokeWidth="2.5" />
            <path d="M350 385c66-27 126-29 180-5v78c-60-24-118-22-180 5Z" fill="#fffaf1" stroke="#778d7d" strokeWidth="2.5" />
            <path d="M350 385v78m-153-48 114-7m-113 22 113-7m-112 22 112-7m62-8 111-7m-111 22 111-7m-111 22 111-7" stroke="#b9ad9a" strokeWidth="2" strokeLinecap="round" />
            <rect x="225" y="303" width="250" height="34" rx="5" fill="#d8c8b3" opacity=".65" />
            <path d="M251 301v33m198-33v33" stroke="#9b826d" strokeWidth="3" />
            <path d="M520 423c-5-70-1-115 20-159m-19 114c-32-10-45-32-39-63 35 4 54 27 39 63Zm9-45c-1-32 15-53 46-62 7 32-10 58-46 62Z" fill="none" stroke="#66866d" strokeWidth="3" strokeLinecap="round" />
            <path d="M542 260c-13-17-16-34-7-50 18 11 23 28 7 50Zm-21 73c-21-13-29-31-21-52 22 10 31 28 21 52Z" fill="none" stroke="#66866d" strokeWidth="2.4" />
            <path d="M105 419c-5-37-1-63 16-93m-15 68c-21-7-31-22-28-43 24 3 37 19 28 43Zm6-31c-1-22 9-37 29-44 6 22-5 39-29 44Z" fill="none" stroke="#718f76" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M288 302c-16-22-17-41-4-58 17 17 20 36 4 58Zm119 0c16-22 17-41 4-58-17 17-20 36-4 58Z" stroke="#bd795c" strokeWidth="2" fill="none" opacity=".65" />
          </>
        )}
      </svg>
      {intro && <motion.div className="pointer-events-none absolute left-1/2 top-[24%] z-10 w-[29%] -translate-x-1/2" animate={{ y: [0, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}><PrayerHands className="h-auto w-full" /></motion.div>}
      <BotanicalSprig className="pointer-events-none absolute -bottom-8 -right-7 z-10 h-44 w-32 opacity-55" flip tone="#758f78" />
      {!hideLabel && (
  <motion.div className="absolute bottom-5 left-5 z-20 rounded-2xl border border-white/75 bg-[#fffdf7]/90 px-4 py-3 shadow-[0_12px_30px_rgba(35,55,42,.12)] backdrop-blur sm:bottom-7 sm:left-7" animate={{ y: [0, -4, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
    <p className="font-mono text-[7px] font-bold uppercase tracking-[.2em] text-[#a35c43]">{intro ? "THREE MOMENTS" : sceneIndex === 0 ? "ATTENTION" : sceneIndex === 1 ? "DEPENDENCE" : "RENEWAL"}</p>
    <p className="mt-1 font-serif text-lg text-[#19382f]">{bottomLabel}</p>
  </motion.div>
)}
    </div>
  );
}

function OrnamentalRule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2" aria-hidden="true">
      <span className="h-px flex-1 bg-[#71836f]/25" />
      <Flower2 className="h-4 w-4 text-[#bd795c]/75" />
      {label && <span className="font-mono text-[7px] font-bold uppercase tracking-[.22em] text-[#8c9b88]">{label}</span>}
      <span className="h-px flex-1 bg-[#71836f]/25" />
    </div>
  );
}

function ScriptureMotif({ index }: { index: number }) {
  const label = ["PRIVATE PRAYER", "A PRAYERFUL RESPONSE", "LEARNING TO PRAY", "A CONTINUING CONVERSATION"][index] ?? "SCRIPTURE";
  return (
    <div className="flex items-center gap-3 text-[#a35c43]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bd795c]/35 bg-[#f3ebdf]"><BookOpen className="h-4 w-4" /></span>
      <span className="font-mono text-[7px] font-bold uppercase tracking-[.2em]">{label}</span>
    </div>
  );
}

export default function PersonalPrayerExperience({
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
  const t = COPY[language];
  const stage = String(session.stage ?? "INTRO");
  const locked = session.status === "PAUSED";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [stage]);

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
        const { answer: saved } = await loadParticipantAnswer(sessionId, 4);
        if (cancelled) return;
        setAnswers({
          scene1: typeof saved.scene1 === "string" ? saved.scene1 : null,
          scene2: typeof saved.scene2 === "string" ? saved.scene2 : null,
          scene3: typeof saved.scene3 === "string" ? saved.scene3 : null,
          commitment: typeof saved.commitment === "string" ? saved.commitment : null,
        });
        setCommitment(typeof saved.commitment === "string" ? saved.commitment : "");
      } catch (err) {
        console.error("PRAYER EXPERIENCE LOAD FAILED:", err);
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
        experience: 4,
        patch,
        markComplete,
        fallbackMessage: t.error,
      });
      if (!result.ok) {
        console.error("PRAYER EXPERIENCE SAVE FAILED:", result.message);
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
    if (!answers[scene]) { setError(t.chooseError); return; }
    await savePatch({ [scene]: answers[scene] });
  }
  async function submitCommitment() {
    if (!commitment.trim()) { setError(t.chooseError); return; }
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
        const counts = await loadRoomResults(sessionId, 4, round);
        if (!cancelled) setResults(counts as Counts);
      } catch (err) {
        console.error("PRAYER EXPERIENCE RESULTS FAILED:", err);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }

    void loadResults();
    return () => { cancelled = true; };
  }, [stage, session.sessionId]);

  const currentSceneIndex = ["QUESTION_1", "WAIT_1", "REVEAL_1"].includes(stage) ? 0 : ["QUESTION_2", "WAIT_2", "REVEAL_2"].includes(stage) ? 1 : ["QUESTION_3", "WAIT_3", "REVEAL_3"].includes(stage) ? 2 : -1;
  const questionStage = stage.startsWith("QUESTION_");
  const waitingStage = stage.startsWith("WAIT_");
  const revealStage = stage.startsWith("REVEAL_");
  const introStage = stage === "INTRO" || stage === "START";
  const discussionStage = stage === "DISCUSSION";
  const completeStage = stage === "COMPLETE";
  const sceneKey: SceneKey = currentSceneIndex === 0 ? "scene1" : currentSceneIndex === 1 ? "scene2" : "scene3";
  const scene =
    currentSceneIndex === 0 ? t.scenes[0] :
    currentSceneIndex === 1 ? t.scenes[1] :
    currentSceneIndex === 2 ? t.scenes[2] : null;
  const optionKeys = currentSceneIndex >= 0 ? OPTIONS[sceneKey] : [];
  const resultRows = (key: SceneKey) => {
    const counts = results?.[key];
    if (!counts) return [];
    const labels = t.resultLabels[key];
    const keys = OPTIONS[key] as readonly string[];
    const total = (Object.values(counts) as number[]).reduce(
  (sum, count) => sum + count,
  0
);
    return keys.map((option, index) => ({ option, label: labels[index], count: counts[option] ?? 0, percentage: total ? Math.round(((counts[option] ?? 0) / total) * 100) : 0 }));
  };
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f0e6] text-[#19382f] selection:bg-[#bd795c]/20">
      {/* Paper grain, prayerful botanical line art and soft light */}
      <div className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: "radial-gradient(rgba(67,77,60,.42) .6px, transparent .6px)", backgroundSize: "8px 8px" }} />
      <div className="pointer-events-none absolute -left-52 -top-56 h-[620px] w-[620px] rounded-full border border-[#bd795c]/15" />
      <div className="pointer-events-none absolute right-[-260px] top-[42rem] h-[650px] w-[650px] rounded-full border border-[#81927d]/15" />
      <BotanicalSprig className="pointer-events-none absolute -left-16 top-24 z-0 hidden h-[360px] w-[260px] opacity-25 lg:block" />
      <BotanicalSprig className="pointer-events-none absolute -right-20 top-[52rem] z-0 hidden h-[420px] w-[300px] opacity-20 lg:block" flip tone="#bd795c" />

      <div className="relative mx-auto max-w-[1480px] px-4 pb-12 pt-4 sm:px-7 sm:pt-6 lg:px-12 lg:pb-16">
        <header className={`relative z-20 mb-8 pb-5 sm:mb-10 sm:pb-6 ${introStage ? "border-b-0" : "border-b border-[#19382f]/12"}`}>
          <div className="flex items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[.36em] text-[#bd563b] sm:text-[11px]">PRERNA / 2026</p>
              <h2 className="mt-2 font-serif text-[1.65rem] leading-none tracking-[-.035em] text-[#123b35] sm:text-[2.15rem]">Human Experiment</h2>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[.31em] text-[#173c37] sm:text-[12px]">THE LIVING CHURCH</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <p className="hidden font-mono text-[7px] uppercase tracking-[.2em] text-[#8c9587] sm:block">{language === "en" ? "CHOOSE YOUR LANGUAGE" : "भाषा चुनें"}</p>
              <div className="flex items-center gap-1 rounded-full border border-[#19382f]/15 bg-[#fffdf7]/90 p-1 shadow-sm">
                <Languages className="mx-1.5 h-4 w-4 text-[#8a9a89] sm:mx-2" />
                <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`rounded-full px-3.5 py-2 font-mono text-[8px] font-bold tracking-[.12em] transition sm:px-4 ${language === "en" ? "bg-[#19382f] text-[#f8f3e9] shadow" : "text-[#718276] hover:bg-[#e9e4d8]"}`}>EN</button>
                <button type="button" onClick={() => setLanguage("hi")} aria-pressed={language === "hi"} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-4 ${language === "hi" ? "bg-[#19382f] text-[#f8f3e9] shadow" : "text-[#718276] hover:bg-[#e9e4d8]"}`}>हिन्दी</button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-[55vh] items-center justify-center">
            <div className="text-center">
              <motion.div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#bd795c]/35 bg-[#fffdf7]/80" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}><BookOpen className="h-8 w-8 text-[#bd795c]" /></motion.div>
              <p className="mt-5 font-mono text-[8px] uppercase tracking-[.25em] text-[#71877b]">{language === "en" ? "PREPARING YOUR EXPERIENCE" : "आपका अनुभव तैयार हो रहा है"}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {introStage && (
              <motion.section key="intro" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: .5, ease: "easeOut" }}>
                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,.96fr)] lg:gap-10 xl:gap-14">
                  <div className="relative z-10 min-w-0">
                    <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 }} className="flex items-center gap-3 font-mono text-[8px] font-bold uppercase tracking-[.24em] text-[#b85e43] sm:text-[16px]">
                      {t.experience}<span className="h-px w-8 bg-[#bd795c]/70" />A MOMENT TO CONSIDER
                    </motion.p>
                    <h1 className="mt-4 max-w-[700px] font-serif text-[3.2rem] leading-[.88] tracking-[-.055em] sm:text-6xl lg:text-[5.15rem] xl:text-[5.5rem]">
                      {language === "en" ? <>THE QUIET<br /><span className="ml-2 italic text-[#81927d] sm:ml-4">CONNECTION</span></> : t.title}
                    </h1>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="h-px w-8 shrink-0 bg-[#bd795c]" />
                      <p className="font-serif text-lg italic leading-tight text-[#71887a] sm:text-xl xl:text-2xl">{t.subtitle}</p>
                    </div>
                    <p className="mt-4 max-w-[620px] text-[13px] leading-6 text-[#526a5f] sm:text-[14px] sm:leading-7">{t.intro}</p>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="relative mt-5 max-w-[640px] overflow-hidden rounded-[1.45rem] border border-[#d2b6a1]/35 bg-[#19382f] px-5 py-5 text-[#f8f3e9] shadow-[0_18px_42px_rgba(25,56,47,.14)] sm:px-7 sm:py-6">
                      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-[#e3c9a7]/20" />
                      <div className="pointer-events-none absolute -right-1 top-0 h-28 w-28 rounded-full border border-dashed border-[#e3c9a7]/20" />
                      <BotanicalSprig className="pointer-events-none absolute -bottom-20 -right-3 h-44 w-32 opacity-35" tone="#d9b18b" />
                      <div className="relative flex items-center gap-2 text-[#dfb58b]">
                        <MessageCircle className="h-4 w-4" />
                        <p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] sm:text-[8px]">{t.honestyTitle}</p>
                        <Sparkles className="ml-auto h-4 w-4 opacity-80" />
                      </div>
                      <p className="relative mt-3 max-w-xl font-serif text-[1.65rem] leading-[1.12] sm:text-[1.9rem]">{t.honestyLead}</p>
                      <p className="relative mt-3 max-w-xl text-[12px] leading-6 text-[#f8f3e9]/82 sm:text-[13px] sm:leading-7">{t.honestyBody}</p>
                      <div className="relative mt-4 flex items-center gap-3 border-t border-white/15 pt-3">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d6a879]" />
                        <p className="font-mono text-[7px] font-semibold uppercase tracking-[.16em] text-[#e4bd96] sm:text-[8px]">{t.honestyTag}</p>
                      </div>
                    </motion.div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {[Smartphone, Heart, Sprout].map((Icon, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-full border border-[#8c9a87]/25 bg-[#fffdf7]/75 px-3 py-2">
                          <Icon className="h-3.5 w-3.5 text-[#bd795c]" />
                          <span className="font-mono text-[7px] font-bold uppercase tracking-[.13em] text-[#748c79]">
                            {index === 0 ? (language === "en" ? "ATTENTION" : "ध्यान") : index === 1 ? (language === "en" ? "RELATIONSHIP" : "रिश्ता") : (language === "en" ? "DAILY RHYTHM" : "रोज़ की आदत")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.div initial={{ opacity: 0, scale: .985, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .65, delay: .08 }} className="relative mx-auto w-full max-w-[590px] self-center lg:mt-3 lg:max-w-none">
                    <IntroPrayerRoomArtwork language={language} />
                    <div className="mt-5 flex items-center gap-3 px-1 text-[#81927d]">
                      <span className="h-px w-8 bg-[#bd795c]/70" />
                      <span className="font-mono text-[7px] font-semibold uppercase tracking-[.2em]">{language === "en" ? "A MOMENT SET APART" : "परमेश्वर के लिए अलग किया गया समय"}</span>
                      <Flower2 className="ml-auto h-4 w-4 text-[#bd795c]/70" />
                    </div>
                  </motion.div>
                </div>
              </motion.section>
            )}

            {questionStage && scene && currentSceneIndex >= 0 && (
              <motion.section key={stage} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: .42 }}>
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#19382f]/15 pb-5">
                  <div><p className="font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#b85e43]">{t.scene} 0{currentSceneIndex + 1} / 03</p><h1 className="mt-2 max-w-5xl font-serif text-4xl leading-[.94] tracking-[-.04em] sm:text-6xl lg:text-7xl">{scene.title}</h1></div>
                  <div className="flex items-center gap-3 pb-1"><span className="font-mono text-[7px] uppercase tracking-[.18em] text-[#849184]">{language === "en" ? "THREE MOMENTS" : "तीन पल"}</span><div className="flex items-center gap-1.5">{[0, 1, 2].map((step) => <span key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === currentSceneIndex ? "w-11 bg-[#bd6547]" : step < currentSceneIndex ? "w-5 bg-[#718b79]" : "w-5 bg-[#19382f]/15"}`} />)}</div></div>
                </div>
                <div className="grid items-stretch gap-6 xl:grid-cols-[.88fr_1.12fr] xl:gap-9">
                  <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .06 }} className="relative"><PrayerArtwork sceneIndex={currentSceneIndex} /><div className="mt-3 flex items-center gap-2 px-1"><span className="h-1.5 w-1.5 rounded-full bg-[#bd795c]" /><p className="font-mono text-[7px] uppercase tracking-[.2em] text-[#829184]">{currentSceneIndex === 0 ? (language === "en" ? "ATTENTION & DISTRACTION" : "ध्यान और भटकाव") : currentSceneIndex === 1 ? (language === "en" ? "WORRY & DEPENDENCE" : "चिंता और भरोसा") : (language === "en" ? "RETURN & CONSISTENCY" : "वापसी और नियमितता")}</p></div></motion.div>
                  <div className="flex flex-col justify-center rounded-[1.8rem] border border-[#19382f]/10 bg-[#fffdf8]/80 p-5 shadow-[0_16px_42px_rgba(52,61,48,.055)] sm:p-8 lg:p-9">
                    <p className="flex items-center gap-3 font-mono text-[7px] font-bold uppercase tracking-[.25em] text-[#b85e43] sm:text-[8px]"><span className="h-px w-8 bg-[#bd795c]" />{t.imagine}</p>
                    <div className="mt-5 space-y-4">{scene.body.split("\n\n").map((paragraph, index) => <p key={index} className={index === 0 ? "font-serif text-lg leading-[1.55] text-[#304b3e] sm:text-[1.45rem] sm:leading-[1.6]" : "border-l-2 border-[#bd795c]/45 pl-4 text-[13px] leading-7 text-[#687b6d] sm:text-[14px] sm:leading-8"}>{paragraph}</p>)}</div>
                    <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#edf0e8] px-4 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fffaf0]"><Quote className="h-3.5 w-3.5 text-[#bd795c]" /></span><p className="font-serif text-[14px] italic text-[#607868] sm:text-base">{currentSceneIndex === 0 ? (language === "en" ? "One video becomes five." : "एक वीडियो देखते-देखते पाँच हो जाते हैं।") : currentSceneIndex === 1 ? (language === "en" ? "You don't have to carry it alone." : "आपको अकेले सब सहना नहीं है।") : (language === "en" ? "A small beginning still matters." : "छोटी शुरुआत भी मायने रखती है।")}</p></div>
                  </div>
                </div>
                <div className="mt-10 border-t border-[#19382f]/15 pt-8 sm:mt-12 sm:pt-9">
                  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[7px] font-bold uppercase tracking-[.24em] text-[#b85e43]">PAUSE · REFLECT · CHOOSE</p><h2 className="mt-2 font-serif text-2xl leading-tight sm:text-4xl">{scene.prompt}</h2></div><p className="font-mono text-[7px] uppercase tracking-[.18em] text-[#8a988e]">{t.select}</p></div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">{optionKeys.map((key, index) => { const option = t.options[key as keyof typeof t.options]; const selected = answers[sceneKey] === key; const optionIcons = [BookOpen, Bell, Play, Clock3]; const OptionIcon = optionIcons[index]; return (
                    <motion.button key={key} type="button" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} whileHover={{ y: -3 }} whileTap={{ scale: .99 }} disabled={locked || saving} onClick={() => { setAnswers((current) => ({ ...current, [sceneKey]: key })); setError(""); }} aria-pressed={selected} className={`group relative min-h-[136px] overflow-hidden rounded-[1.35rem] border p-5 text-left transition-all sm:p-6 ${selected ? "border-[#bd6547] bg-[#f1e5d8] shadow-[0_14px_32px_rgba(189,101,71,.12)]" : "border-[#19382f]/12 bg-[#fffdf8]/85 hover:border-[#8da08b]/65 hover:bg-white hover:shadow-[0_14px_32px_rgba(52,61,48,.07)]"} disabled:opacity-55`}>
                      <span className={`absolute -right-7 -top-8 h-24 w-24 rounded-full transition ${selected ? "bg-[#bd6547]/10" : "bg-[#879b86]/[.07]"}`} />
                      <span className="relative flex items-start gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${selected ? "border-[#bd6547] bg-[#bd6547] text-white" : "border-[#8a9b87]/30 bg-[#f5f1e8] text-[#788d7a] group-hover:text-[#bd6547]"}`}>{selected ? <Check className="h-5 w-5" /> : <OptionIcon className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="font-mono text-[8px] tracking-[.18em] text-[#b8755b]">0{index + 1}</span>{selected && <span className="font-mono text-[7px] font-bold uppercase tracking-[.16em] text-[#a45f46]">SELECTED</span>}</span><span className="mt-2 block text-[10px] font-bold uppercase leading-5 tracking-[.09em] text-[#263f34] sm:text-[11px]">{option.title}</span><span className="mt-2 block text-[12px] leading-6 text-[#718074] sm:text-[13px]">{option.body}</span></span></span>
                    </motion.button>
                  ); })}</div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-h-6">{locked && <p className="text-xs text-[#bd5939]">{t.locked}</p>}{error && <p role="alert" className="text-xs text-[#bd5939]">{error}</p>}</div><motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: .98 }} onClick={() => void submitScene(sceneKey)} disabled={locked || saving || !answers[sceneKey]} className="inline-flex min-h-14 w-full items-center justify-center gap-4 rounded-full bg-[#19382f] px-8 py-4 font-mono text-[8px] font-bold uppercase tracking-[.18em] text-[#f8f3e9] shadow-[0_14px_28px_rgba(25,56,47,.16)] transition hover:bg-[#294b3d] disabled:opacity-35 sm:w-auto sm:min-w-[255px]">{saving ? t.saving : t.submit}<ArrowRight className="h-4 w-4" /></motion.button></div>
                </div>
              </motion.section>
            )}

            {waitingStage && currentSceneIndex >= 0 && (
              <motion.section key={stage} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid min-h-[62vh] items-center gap-8 overflow-hidden rounded-[2rem] border border-[#19382f]/10 bg-[#e8e9dd]/65 p-5 shadow-inner sm:p-9 lg:grid-cols-[.9fr_1.1fr] lg:p-12">
                <div className="relative mx-auto w-full max-w-[490px]"><PrayerArtwork sceneIndex={currentSceneIndex} compact /><div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full border border-[#bd795c]/35" /></div>
                <div className="relative mx-auto max-w-xl text-center lg:text-left"><div className="mx-auto flex h-24 w-24 items-center justify-center lg:mx-0"><motion.div animate={{ rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} className="absolute h-24 w-24 rounded-full border border-[#19382f]/20" /><motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute h-20 w-20 rounded-full border border-dashed border-[#bd795c]/55" /><motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 4, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#19382f] text-[#f8f3e9] shadow-xl"><BookOpen className="h-6 w-6" /></motion.div></div>
                  <p className="mt-7 font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#bd5939]">{t.waiting}</p><h1 className="mt-3 font-serif text-5xl leading-none tracking-[-.04em] sm:text-7xl">{language === "en" ? "A MOMENT OF STILLNESS" : "शांति का एक पल"}</h1><p className="mt-5 max-w-lg text-[14px] leading-8 text-[#657b6d] sm:text-base">{language === "en" ? "Your response is saved. Listen for the facilitator's next instruction." : "आपका जवाब सुरक्षित है। संचालक के अगले निर्देश को ध्यान से सुनें।"}</p><div className="mt-7 flex items-center justify-center gap-3 lg:justify-start"><span className="h-px w-10 bg-[#bd795c]/65" /><span className="font-mono text-[7px] uppercase tracking-[.22em] text-[#9a9e8d]">PAUSE · BREATHE · PRAY</span><span className="h-px w-10 bg-[#bd795c]/65" /></div>
                </div>
              </motion.section>
            )}

            {revealStage && currentSceneIndex >= 0 && scene && (
              <motion.section key={stage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid items-stretch gap-6 xl:grid-cols-[.82fr_1.18fr] xl:gap-9">
                  <div className="relative"><PrayerArtwork sceneIndex={currentSceneIndex} compact /><div className="mt-3 flex items-center gap-2 px-1"><BookOpen className="h-3.5 w-3.5 text-[#bd795c]"/><p className="font-mono text-[7px] font-bold uppercase tracking-[.2em] text-[#829184]">{currentSceneIndex === 0 ? "MATTHEW 6:6" : currentSceneIndex === 1 ? "PHILIPPIANS 4:6–7" : "LUKE 11:1 · 1 THESSALONIANS 5:17"}</p></div></div>
                  <div className="flex flex-col justify-center"><p className="flex items-center gap-3 font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#b85e43]">{t.reveal}<span className="h-px w-9 bg-[#bd795c]"/>0{currentSceneIndex + 1}</p><h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[.96] tracking-[-.04em] sm:text-6xl">{scene.teachingTitle}</h1><p className="mt-5 text-[14px] leading-8 text-[#62796b] sm:text-base sm:leading-9">{scene.teaching}</p><div className="relative mt-6 overflow-hidden rounded-[1.5rem] bg-[#19382f] p-6 text-[#f8f3e9] shadow-[0_18px_42px_rgba(25,56,47,.15)] sm:p-8"><BotanicalSprig className="absolute -bottom-16 -right-2 h-48 w-36 opacity-45" flip tone="#dfbd97"/><div className="relative flex items-center gap-2 text-[#dfbd97]"><Quote className="h-4 w-4"/><p className="font-mono text-[7px] font-bold uppercase tracking-[.22em]">A THOUGHT TO CARRY</p></div><p className="relative mt-4 font-serif text-xl leading-snug sm:text-2xl">“{scene.impact}”</p></div></div>
                </div>
                <div className="mt-9 grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
                  <div className="relative overflow-hidden rounded-[1.6rem] border border-[#19382f]/10 bg-[#e8e8dc] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fffaf0]"><Feather className="h-4 w-4 text-[#bd795c]"/></span><p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] text-[#b85e43]">REFLECT · UNDERSTAND · RESPOND</p></div><p className="mt-5 font-serif text-lg leading-[1.65] text-[#405d4d] sm:text-xl">{currentSceneIndex === 0 ? t.verse1 : currentSceneIndex === 1 ? t.verse3 : `${t.verse2} ${t.verse4}`}</p><p className="mt-5 font-mono text-[8px] font-bold tracking-[.2em] text-[#bd795c]">{currentSceneIndex === 0 ? t.ref1 : currentSceneIndex === 1 ? t.ref3 : `${t.ref2} · ${t.ref4}`}</p><BotanicalSprig className="absolute -bottom-20 -right-8 h-48 w-36 opacity-25" tone="#bd795c"/></div>
                  <div className="rounded-[1.6rem] border border-[#19382f]/12 bg-[#fffdf8]/90 p-5 shadow-[0_18px_45px_rgba(52,61,48,.06)] sm:p-7"><div className="flex items-center justify-between gap-4 border-b border-[#19382f]/10 pb-4"><div><p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] text-[#b8755b]">THE ROOM · ANONYMOUS</p><h2 className="mt-2 font-serif text-xl sm:text-2xl">{t.revealNote}</h2></div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1e8db]"><Users className="h-4 w-4 text-[#bd6547]"/></div></div>
                    {resultsLoading ? <p className="mt-6 text-sm text-[#71877b]">{language === "en" ? "Gathering responses…" : "जवाब एकत्र किए जा रहे हैं…"}</p> : (() => { const rows = resultRows(sceneKey); const total = rows.reduce((sum, row) => sum + row.count, 0); return total === 0 ? <div className="mt-5 rounded-xl bg-[#f2eee5] p-5 text-[13px] text-[#71877b]">{t.noResponses}</div> : <div className="mt-5 space-y-5">{rows.map((row, index) => <div key={row.option}><div className="mb-2 flex items-start justify-between gap-4"><span className="text-[12px] leading-5 text-[#3d5948] sm:text-[13px]">{row.label}</span><span className="shrink-0 font-mono text-[9px] font-bold text-[#3d5948]">{row.percentage}% <span className="font-normal text-[#829187]">({row.count})</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#e7e6dc]"><motion.div initial={{ width: 0 }} animate={{ width: `${row.percentage}%` }} transition={{ duration: .9, delay: index * .1 }} className={`h-full rounded-full ${index === 0 ? "bg-[#bd795c]" : index === 1 ? "bg-[#6d8b78]" : index === 2 ? "bg-[#c3a276]" : "bg-[#8c9a88]"}`}/></div></div>)}</div>; })()}
                  </div>
                </div>
              </motion.section>
            )}

            {discussionStage && (
              <motion.section key="discussion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid items-center gap-6 lg:grid-cols-[1.12fr_.88fr]">
                  <div className="relative overflow-hidden rounded-[2rem] bg-[#19382f] px-6 py-9 text-[#f8f3e9] sm:px-10 sm:py-12"><BotanicalSprig className="absolute -right-5 -top-14 h-64 w-48 opacity-40" flip tone="#dfbd97"/><div className="relative"><p className="flex items-center gap-3 font-mono text-[7px] font-bold uppercase tracking-[.28em] text-[#e0b68f] sm:text-[8px]">{t.discussion}<span className="h-px w-9 bg-[#d6a879]/60"/></p><h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[.98] tracking-[-.04em] sm:text-6xl">{t.discussionTitle}</h1><p className="mt-5 max-w-3xl text-[13px] leading-7 text-[#f8f3e9]/78 sm:text-[15px] sm:leading-8">{t.discussionBody}</p></div><div className="relative mt-7 flex items-center gap-3 border-t border-white/15 pt-5 text-[#dfbd97]"><BookOpen className="h-4 w-4"/><span className="font-mono text-[7px] font-bold uppercase tracking-[.2em]">A RELATIONSHIP THAT GROWS IN EVERYDAY LIFE</span></div></div>
                  <div className="relative mx-auto w-full max-w-[440px]"><PrayerArtwork sceneIndex={3} compact /><div className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 rounded-full border border-[#bd795c]/40"/></div>
                </div>
                <div className="mt-9 flex items-center gap-4"><p className="font-mono text-[7px] font-bold uppercase tracking-[.24em] text-[#b85e43]">WORDS TO RETURN TO</p><div className="h-px flex-1 bg-[#19382f]/15"/><BookOpen className="h-4 w-4 text-[#bd795c]"/></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">{[{ verse: t.verse1, ref: t.ref1 }, { verse: t.verse2, ref: t.ref2 }, { verse: t.verse3, ref: t.ref3 }, { verse: t.verse4, ref: t.ref4 }].map((item, index) => <motion.div key={item.ref} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className="group relative min-h-[150px] overflow-hidden rounded-[1.35rem] border border-[#19382f]/10 bg-[#fffdf8]/90 p-5 shadow-[0_12px_30px_rgba(52,61,48,.04)] sm:p-6"><span className="absolute -right-3 -top-5 font-serif text-[6rem] leading-none text-[#8ca08b]/10">0{index + 1}</span><div className="relative"><ScriptureMotif index={index}/><p className="mt-4 font-serif text-base leading-7 text-[#344f40] sm:text-lg">“{item.verse}”</p><p className="mt-4 flex items-center gap-2 font-mono text-[7px] font-bold tracking-[.2em] text-[#bd795c]"><span className="h-px w-5 bg-[#bd795c]"/>{item.ref}</p></div></motion.div>)}</div>
                <div className="mt-10"><div className="flex items-center gap-3"><p className="font-mono text-[7px] font-bold uppercase tracking-[.24em] text-[#b85e43]">{t.promptsTitle}</p><div className="h-px flex-1 bg-[#19382f]/15"/><MessageCircle className="h-4 w-4 text-[#bd795c]"/></div><div className="mt-4 grid gap-3 md:grid-cols-2">{t.prompts.map((prompt, index) => <motion.div key={prompt} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="relative flex min-h-[106px] items-start gap-4 overflow-hidden rounded-[1.2rem] border border-[#19382f]/10 bg-[#eae7dc]/75 p-5"><span className="font-serif text-3xl italic leading-none text-[#bd795c]">0{index + 1}</span><p className="relative pt-1 text-[12px] leading-6 text-[#506657] sm:text-[13px] sm:leading-7">{prompt}</p><Flower2 className="absolute -bottom-2 -right-2 h-9 w-9 text-[#bd795c]/20"/></motion.div>)}</div></div>
                <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#d3b08d]/35 bg-[#19382f] p-5 text-[#f8f3e9] shadow-[0_24px_55px_rgba(25,56,47,.16)] sm:p-9"><BotanicalSprig className="absolute -bottom-20 -right-4 h-64 w-48 opacity-35" flip tone="#deb58e"/><div className="relative grid gap-7 lg:grid-cols-[.94fr_1.06fr] lg:items-center"><div><div className="flex items-center gap-3 text-[#deb58e]"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#deb58e]/45"><LockKeyhole className="h-4 w-4"/></div><p className="font-mono text-[7px] font-bold uppercase tracking-[.22em] sm:text-[8px]">{t.commitmentTitle}</p><ShieldCheck className="ml-auto h-5 w-5 opacity-80 lg:hidden"/></div><h2 className="mt-5 max-w-2xl font-serif text-2xl leading-tight sm:text-3xl">{t.commitmentBody}</h2><div className="mt-5 flex items-center gap-2 text-[#deb58e]"><Feather className="h-4 w-4"/><span className="font-mono text-[7px] uppercase tracking-[.18em]">A PRIVATE RESPONSE · BETWEEN YOU AND GOD</span></div></div><div className="rounded-[1.3rem] border border-[#d7c6a5]/50 bg-[#f5f0e6] p-3 shadow-inner"><div className="flex items-center justify-between border-b border-[#19382f]/10 px-3 pb-3"><span className="font-mono text-[7px] font-bold uppercase tracking-[.2em] text-[#9b6c52]">MY PRAYER JOURNAL</span><BookOpen className="h-4 w-4 text-[#78907c]"/></div><textarea value={commitment} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCommitment(event.target.value)} rows={4} maxLength={800} placeholder={t.commitmentPlaceholder} disabled={locked || saving || Boolean(answers.commitment)} className="mt-2 min-h-[150px] w-full resize-y bg-transparent px-3 py-3 font-serif text-[14px] leading-8 text-[#294638] outline-none placeholder:text-[#8b9587] disabled:opacity-70"/><div className="flex items-center justify-between border-t border-[#19382f]/10 px-3 pt-3"><p className="flex items-center gap-2 text-[8px] text-[#a35c43]"><LockKeyhole className="h-3 w-3"/>{t.private}</p><span className="font-mono text-[7px] text-[#879284]">{commitment.length}/800</span></div></div></div><div className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"><div className="min-h-5 flex-1">{error && <p role="alert" className="text-xs text-[#f0b9a6]">{error}</p>}</div><motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: .98 }} onClick={() => void submitCommitment()} disabled={locked || saving || Boolean(answers.commitment) || !commitment.trim()} className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#d6b38e] px-7 py-4 font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#19382f] shadow-lg disabled:opacity-40">{answers.commitment ? t.commitmentSaved : saving ? t.saving : t.saveCommitment}<ArrowRight className="h-4 w-4"/></motion.button></div></div>
              </motion.section>
            )}

            {completeStage && (
              <motion.section key="complete" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2.2rem] border border-[#19382f]/10 bg-[#e5e9de] px-5 py-12 shadow-inner sm:px-10 sm:py-16"><BotanicalSprig className="absolute -left-9 bottom-0 h-72 w-52 opacity-35"/><BotanicalSprig className="absolute -right-9 top-0 h-72 w-52 opacity-35" flip tone="#bd795c"/><div className="relative mx-auto grid max-w-5xl items-center gap-8 text-center lg:grid-cols-[.8fr_1.2fr] lg:text-left"><div className="relative mx-auto w-full max-w-[360px]"><PrayerArtwork sceneIndex={3} compact hideLabel /></div><div className="relative"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#19382f] text-[#f8f3e9] shadow-xl lg:mx-0"><Check className="h-7 w-7"/></div><p className="mt-6 font-mono text-[8px] font-bold uppercase tracking-[.28em] text-[#bd5939]">{t.complete}</p><h1 className="mt-4 font-serif text-4xl leading-[.98] tracking-[-.04em] sm:text-6xl">{t.completeTitle}</h1><p className="mt-5 max-w-xl text-[13px] leading-8 text-[#657b6d] sm:text-[15px]">{t.completeBody}</p><OrnamentalRule label="A LIFE OF PRAYER"/><div className="flex items-center justify-center gap-3 font-mono text-[7px] font-bold uppercase tracking-[.18em] text-[#bd5939] lg:justify-start"><Heart className="h-4 w-4"/>PRAYER · RELATIONSHIP · DAILY LIFE</div></div></div></motion.section>
            )}
          </AnimatePresence>
        )}

        <footer className="mt-12 flex items-center gap-4 pt-5"><span className="font-mono text-[7px] uppercase tracking-[.22em] text-[#9a9e8d]">PRERNA 2026</span><div className="h-px flex-1 bg-[#19382f]/10"/><span className="font-serif text-sm italic text-[#8c9a88]">The quiet connection</span><Flower2 className="h-4 w-4 text-[#bd795c]/65"/></footer>
      </div>
    </main>
  );
}
