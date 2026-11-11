"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Armchair,
  Bell,
  BedDouble,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  Church,
  Clock3,
  Coffee,
  DoorOpen,
  Footprints,
  HandHeart,
  HeartHandshake,
  Languages,
  MapPin,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  Sunrise,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { HumanExperimentSession } from "@/lib/human-experiment/session";
import {
  loadParticipantAnswer,
  loadRoomResults,
  saveParticipantAnswer,
} from "@/lib/human-experiment/answerSaveClient";

type Language = "en" | "hi";
type QuestionKey = "scene1" | "scene2" | "scene3";
type SceneAnswers = {
  scene1: string | null;
  scene2: string | null;
  scene3: string | null;
  commitment: string | null;
};
type Breakdown = Record<string, number>;
type RoomResults = Record<QuestionKey, Breakdown>;

const EMPTY_ANSWERS: SceneAnswers = {
  scene1: null,
  scene2: null,
  scene3: null,
  commitment: null,
};

const copy = {
  en: {
    label: "EXPERIENCE 02",
    lab: "THE LIVING CHURCH",
    language: "LANGUAGE",
    introTitle: "THE EMPTY SEAT",
    introSubtitle: "Your presence matters.",
    introBody:
      "Three familiar Sunday moments. Three honest decisions. One reminder of why we gather.",
    introNote: "There are no scores. Choose what you would honestly do.",
    begin: "ENTER THE EXPERIENCE",
    scene: "SCENE",
    imagine: "PUT YOURSELF IN THIS MOMENT",
    question: "What would you do?",
    selectOne: "SELECT ONE RESPONSE",
    saveChoice: "RECORD MY CHOICE",
    saved: "YOUR CHOICE HAS BEEN RECORDED",
    waitingTitle: "WAIT.",
    waitingBody: "Your response is saved. Listen for the facilitator's next instruction.",
    waitingLabel: "WAITING FOR THE FACILITATOR",
    scene1Title: "The Sunday alarm",
    scene1Body:
      "You've been going to college or work all week. Finally, Sunday arrives — your day off. You sleep peacefully. No classes, no office, no deadlines.\n\nIt's 7:00 AM. Your phone alarm rings. Church starts at 9:00 AM, and it takes you one hour to get there. If you want to arrive on time, you need to get up now.",
    alarmLabel: "YOUR SUNDAY MORNING",
    alarmTime: "7:00 AM",
    alarmCaption: "THE ALARM IS RINGING",
    serviceTime: "9:00 AM",
    serviceCaption: "CHURCH BEGINS",
    travelTime: "1 HOUR",
    travelCaption: "TRAVEL TIME",
    wakeTitle: "WAKE UP AND GO",
    wakeDescription: "Get ready and make the journey to church.",
    sleepTitle: "SLEEP A LITTLE LONGER",
    sleepDescription: "It's your day off. Enjoy a little more rest.",
    scene2Title: "The little delay",
    scene2Body:
      "You are awake and getting ready. By 7:45 AM, you are ready to leave. The journey takes an hour, and the service begins at 9:00. If you leave now, you will arrive 15 minutes early.\n\nThen a message appears. You check your phone, take a little more time over breakfast, and suddenly it is 8:20.",
    scene2Prompt: "What will you choose?",
    leaveNowTitle: "LEAVE NOW",
    leaveNowDescription: "Be intentional. Reach early and settle in before worship.",
    delayTitle: "JUST A FEW MORE MINUTES",
    delayDescription: "Finish what you are doing and leave a little later.",
    continue: "CONTINUE",
    scene3Title: "Sunday Plans",
scene3Body:
  "It's Saturday evening. Your friends make a plan to go out together on Sunday morning. Everyone is excited, and you don't want to miss out.\n\nThe plan is to leave around the same time your church service begins. You realise that if you join them, you'll have to miss church this Sunday.\n\nYou now have a choice to make.",
scene3Prompt: "What would you do?",
enterTitle: "KEEP MY SUNDAY FOR CHURCH",
enterDescription:
  "I'll let my friends know I have church and suggest meeting them another time.",
returnTitle: "JOIN MY FRIENDS",
returnDescription:
  "It's been a while since I've spent time with them. I'll skip church this Sunday and join them.",
    back: "GO BACK",
    revealEyebrow: "THE REVEAL",
    revealTitle: "The empty seat",
    revealBody:
  "Imagine someone who has recently started attending your church.\n\nThey are still getting to know people. Every Sunday, they begin recognising familiar faces. Someone greets them, someone sits beside them, and someone takes time to talk to them.\n\nSlowly, they start feeling comfortable. They begin looking forward to seeing those familiar faces every Sunday.\n\nNow imagine one Sunday, some of those familiar faces are missing.",
revealSeatLine:
  "Someone may be looking forward to seeing you this Sunday.",
revealMeaning:
  "Your presence matters. You are not just attending a service; you are becoming part of one another's lives.",
    revealMeaningHindi: "",
    roomPulse: "THE ROOM'S RESPONSES",
    roomPulseDescription: "An anonymous look at the choices made in this room.",
    noResponses: "Responses will appear here once participants have submitted their choices.",
    responseCount: "RESPONSES",
    scene1Result: "Sunday alarm",
    scene2Result: "The little delay",
    scene3Result: "Sunday Plans",

biggerPicture: "We are the body of Christ.",
biggerPictureSecond: "Every member has a part to play.",
worshipTitle: "WORSHIP",
worshipText:
  "We gather to honour God, remember who He is and give Him the worship He deserves.",
fellowshipTitle: "FELLOWSHIP",
fellowshipText:
  "We share life with one another, build meaningful relationships and make room for everyone to belong.",
encouragementTitle: "ENCOURAGEMENT",
encouragementText:
  "We notice when someone is struggling, stand alongside them and strengthen one another in faith.",
growthTitle: "GROWTH",
growthText:
  "We learn God's Word, put it into practice and help one another become more like Christ.",
scriptureLabel: "HEBREWS 10:24–25 · NKJV",
scriptureText:
  "And let us consider one another in order to stir up love and good works, not forsaking the assembling of ourselves together, as is the manner of some, but exhorting one another, and so much the more as you see the Day approaching.",
scriptureNote: "NEW KING JAMES VERSION",
keyQuestion:
  "Am I simply attending church, or am I actively playing my part in the body of Christ?",
    revealNext: "CONTINUE THE REVEAL",
    reflectEyebrow: "A MOMENT TO REFLECT",
    reflectTitle: "Now, think about yourself.",
    reflectQuestion:
      "If everyone treated church attendance the way you do, what would your church look like?",
    reflectAction: "What is one thing you can change from this Sunday onward?",
    commitAttend: "Be more intentional about gathering.",
    commitEncourage: "Make an effort to encourage someone.",
    commitParticipate: "Participate instead of only attending.",
    saveCommitment: "SAVE MY COMMITMENT",
    privateNote: "Your commitment is not included in the room-wide results.",
    completed: "EXPERIENCE COMPLETE",
    completedTitle: "YOU ARE PART OF THE BODY.",
    completedBody: "Don't just occupy a seat. Be present. Be involved. Encourage someone.",
    sticker: "PHYSICAL PASS",
    stickerTitle: "ADD STICKER 02",
    stickerSubtitle: "THE EMPTY SEAT",
    chooseError: "Please choose an option before continuing.",
    saveError: "We couldn't save your response. Please try again or contact the facilitator.",
    connectionError: "Your participant session could not be identified. Please contact the facilitator.",
    saving: "SAVING...",
    savedButton: "SAVED",
    next: "NEXT",
    loading: "Loading your saved responses...",
    locked: "This experience is paused. Please wait for the facilitator.",
    minutes: "MINUTES",
    early: "EARLY",
    late: "LATE",
  },
  hi: {
    label: "अनुभव ०२",
    lab: "जीवित कलीसिया",
    language: "भाषा",
    introEyebrow: "एक मानवीय अनुभव",
    introTitle: "एक खाली कुर्सी",
    introSubtitle: "आपकी मौजूदगी मायने रखती है।",
    introBody:
      "रविवार के तीन आम पल। तीन सच्चे फैसले। और एक याद दिलाने वाली बात कि हम क्यों इकट्ठा होते हैं।",
    introNote: "यह कोई प्रतियोगिता नहीं है। ईमानदारी से चुनें कि आप क्या करेंगे।",
    begin: "अनुभव शुरू करें",
    scene: "दृश्य",
    imagine: "खुद को इस परिस्थिति में रखकर सोचें",
    question: "आप क्या करेंगे?",
    selectOne: "एक विकल्प चुनें",
    saveChoice: "मेरा उत्तर दर्ज करें",
    saved: "आपका उत्तर दर्ज हो गया है",
    waitingTitle: "प्रतीक्षा करें।",
    waitingBody: "आपका उत्तर सुरक्षित है। संचालक के अगले निर्देश की प्रतीक्षा करें।",
    waitingLabel: "संचालक की प्रतीक्षा करें",
    scene1Title: "रविवार की सुबह का अलार्म",
    scene1Body:
      "पूरे हफ्ते आप कॉलेज या काम में व्यस्त रहे। आखिरकार रविवार आ गया — आपकी छुट्टी का दिन। आप आराम से सो रहे हैं। न कॉलेज, न ऑफिस, न कोई समय-सीमा।\n\nसुबह 7:00 बजे आपका फोन अलार्म बजाता है। चर्च 9:00 बजे शुरू होती है और वहाँ पहुँचने में एक घंटा लगता है। अगर समय पर पहुँचना है, तो अब उठना होगा।",
    alarmLabel: "आपकी रविवार की सुबह",
    alarmTime: "सुबह 7:00",
    alarmCaption: "अलार्म बज रहा है",
    serviceTime: "सुबह 9:00",
    serviceCaption: "चर्च शुरू होती है",
    travelTime: "1 घंटा",
    travelCaption: "रास्ते का समय",
    wakeTitle: "उठकर चर्च जाएँ",
    wakeDescription: "तैयार होकर चर्च के लिए निकलें।",
    sleepTitle: "थोड़ी देर और सोएँ",
    sleepDescription: "आज छुट्टी है। थोड़ा और आराम कर लें।",
    scene2Title: "थोड़ी-सी देरी",
    scene2Body:
      "आप उठ चुके हैं और तैयार हो रहे हैं। सुबह 7:45 बजे तक आप निकलने के लिए तैयार हैं। रास्ते में एक घंटा लगेगा और सभा 9:00 बजे शुरू होती है। अभी निकलेंगे तो 15 मिनट पहले पहुँच जाएँगे।\n\nतभी एक संदेश आता है। आप फोन देखने लगते हैं, नाश्ते में थोड़ा और समय लगाते हैं और अचानक 8:20 बज जाते हैं।",
    scene2Prompt: "अब आप क्या चुनेंगे?",
    leaveNowTitle: "अभी निकलें",
    leaveNowDescription: "समय का ध्यान रखें। जल्दी पहुँचें और आराधना से पहले तैयार हों।",
    delayTitle: "बस कुछ मिनट और",
    delayDescription: "जो कर रहे हैं उसे पूरा करें और थोड़ी देर बाद निकलें।",
    continue: "आगे बढ़ें",
scene3Title: "रविवार के प्लान",
scene3Body:
  "शनिवार की शाम है। आपके दोस्त रविवार की सुबह कहीं बाहर घूमने जाने का प्लान बनाते हैं। सभी बहुत उत्साहित हैं और आपका भी उनके साथ जाने का मन है।\n\nउन्होंने जाने का समय वही रखा है, जब आपकी चर्च की सभा शुरू होती है। आप समझ जाते हैं कि अगर आप उनके साथ जाते हैं, तो इस रविवार चर्च नहीं जा पाएँगे।\n\nअब आपको फैसला करना है।",
scene3Prompt: "आप क्या करेंगे?",
enterTitle: "चर्च के लिए समय निकालें",
enterDescription:
  "मैं अपने दोस्तों को बताऊँगा कि मुझे चर्च जाना है और उनसे किसी दूसरे दिन मिलने का प्लान बनाऊँगा।",
returnTitle: "दोस्तों के साथ जाएँ",
returnDescription:
  "काफी समय से दोस्तों के साथ समय नहीं बिताया है। इस रविवार चर्च छोड़कर उनके साथ जाऊँगा।",
    back: "वापस जाएँ",
    revealEyebrow: "अब सच्चाई पर विचार करें",
    revealTitle: "खाली जगह",
   revealBody:
  "सोचिए, कोई व्यक्ति हाल ही में आपकी चर्च में आना शुरू हुआ है।\n\nवह अभी लोगों को जान रहा है। हर रविवार उसे कुछ जाने-पहचाने चेहरे दिखने लगते हैं। कोई उसका स्वागत करता है, कोई उसके पास बैठता है और कोई उससे बात करने के लिए समय निकालता है।\n\nधीरे-धीरे वह यहाँ सहज महसूस करने लगता है। उसे हर रविवार उन जाने-पहचाने चेहरों से मिलने का इंतज़ार रहता है।\n\nअब सोचिए, किसी रविवार को वे जाने-पहचाने चेहरे वहाँ न दिखें।",
revealSeatLine:
  "हो सकता है कोई इस रविवार आपको देखने का इंतज़ार कर रहा हो।",
revealMeaning:
  "आपका वहाँ होना मायने रखता है। आप सिर्फ सभा में शामिल नहीं हो रहे, बल्कि एक-दूसरे के साथ जुड़ रहे हैं|",
    revealMeaningHindi: "",
    roomPulse: "इस समूह के उत्तर",
    roomPulseDescription: "इस कमरे में चुने गए उत्तरों की एक अनाम झलक।",
    noResponses: "प्रतिभागियों के उत्तर जमा होने के बाद वे यहाँ दिखाई देंगे।",
    responseCount: "उत्तर",
    scene1Result: "रविवार का अलार्म",
    scene2Result: "थोड़ी-सी देरी",
    scene3Result: "रविवार के प्लान",

biggerPicture: "हम मसीह की देह हैं।",
biggerPictureSecond: "हर एक की अपनी भूमिका है।",

worshipTitle: "आराधना",
worshipText:
  "हम परमेश्वर का आदर करने, उसे याद रखने और उसकी महिमा करने के लिए इकट्ठा होते हैं।",

fellowshipTitle: "संगति",
fellowshipText:
  "हम एक-दूसरे के साथ समय बिताते हैं, अच्छे रिश्ते बनाते हैं और हर किसी को अपनापन महसूस कराते हैं।",

encouragementTitle: "एक-दूसरे का हौसला बढ़ाना",
encouragementText:
  "जब कोई मुश्किल में होता है, तो हम उसका साथ देते हैं और विश्वास में एक-दूसरे को मजबूत करते हैं।",

growthTitle: "आत्मिक बढ़ोतरी",
growthText:
  "हम परमेश्वर के वचन को सीखते हैं, उसे अपने जीवन में अपनाते हैं और एक-दूसरे को मसीह जैसा बनने में मदद करते हैं।",

scriptureLabel: "इब्रानियों 10:24–25 · हिंदी O.V.",
scriptureText:
  "और प्रेम, और भले कामों में उस्काने के लिये हम एक दूसरे की चिन्ता किया करें, और एक दूसरे के साथ इकट्ठा होना न छोड़ें, जैसे कि कितनों की रीति है, पर एक दूसरे को समझाते रहें; और ज्यों ज्यों उस दिन को निकट आते देखो त्यों–त्यों और भी अधिक यह किया करो।",
scriptureNote: "पवित्र बाइबल — हिंदी O.V.",

keyQuestion:
  "क्या मैं सिर्फ चर्च आता हूँ, या मसीह की देह का हिस्सा बनकर अपनी भूमिका भी निभा रहा हूँ?",

    revealNext: "आगे बढ़ें",
    reflectEyebrow: "थोड़ा मनन करें",
    reflectTitle: "अब अपने बारे में सोचिए।",
    reflectQuestion:
      "अगर हर कोई चर्च आने को आपकी तरह महत्व देता, तो आपकी चर्च कैसी होती?",
    reflectAction: "इस रविवार से आप अपनी किस एक आदत में बदलाव ला सकते हैं?",
    commitAttend: "और अधिक निष्ठा से चर्च आना।",
    commitEncourage: "किसी का हौसला बढ़ाने का प्रयास करना।",
    commitParticipate: "सिर्फ उपस्थित रहने के बजाय सक्रिय रूप से भाग लेना।",
    saveCommitment: "मेरा संकल्प सुरक्षित करें",
    privateNote: "आपका संकल्प समूह के सामूहिक परिणामों में नहीं दिखाया जाएगा।",
    completed: "अनुभव पूरा हुआ",
    completedTitle: "आप मसीह की देह का हिस्सा हैं।",
    completedBody: "सिर्फ एक जगह भरने के लिए मत आइए। उपस्थित रहिए, जुड़िए और किसी का हौसला बढ़ाइए।",
    sticker: "प्रतिभागी स्टिकर",
    stickerTitle: "स्टिकर ०२ लगाएँ",
    stickerSubtitle: "एक खाली कुर्सी",
    chooseError: "आगे बढ़ने से पहले कृपया एक विकल्प चुनें।",
    saveError: "आपका उत्तर सुरक्षित नहीं हो सका। कृपया फिर प्रयास करें या संचालक से संपर्क करें।",
    connectionError: "आपके प्रतिभागी सत्र की पहचान नहीं हो सकी। कृपया संचालक से संपर्क करें।",
    saving: "सुरक्षित हो रहा है...",
    savedButton: "सुरक्षित हो गया",
    next: "आगे बढ़ें",
    loading: "आपके पहले से दिए गए उत्तर लोड हो रहे हैं...",
    locked: "यह अनुभव अभी रुका हुआ है। कृपया संचालक की प्रतीक्षा करें।",
    minutes: "मिनट",
    early: "जल्दी",
    late: "देर से",
  },
} as const;

function IconChoice({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { y: -4 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative flex min-h-[154px] w-full flex-col justify-between overflow-hidden border p-5 text-left transition-all duration-300 sm:min-h-[170px] sm:p-6 ${
        selected
          ? "border-[#c7542b] bg-[#f1e4d1] shadow-[0_12px_28px_rgba(80,55,35,0.10)]"
          : "border-[#19352c]/15 bg-[#eee5d5]/65 hover:border-[#c7542b]/60 hover:bg-[#f4eadb]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <div className="absolute -right-5 -top-6 h-24 w-24 rounded-full border border-[#19352c]/[0.06] transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex w-full items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center border transition-colors ${
            selected
              ? "border-[#c7542b] bg-[#c7542b] text-[#fff8ed]"
              : "border-[#19352c]/15 bg-[#f8f1e6] text-[#c7542b] group-hover:border-[#c7542b]/50"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
            selected ? "border-[#c7542b] bg-[#c7542b] text-white" : "border-[#19352c]/25 text-transparent"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="relative mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#19352c] sm:text-[11px]">
          {title}
        </p>
        <p className="mt-2 max-w-[94%] font-serif text-sm leading-6 text-[#19352c]/60 sm:text-base">
          {description}
        </p>
      </div>
    </motion.button>
  );
}

function StageHeader({
  eyebrow,
  title,
  number,
}: {
  eyebrow: string;
  title: string;
  number: string;
}) {
  return (
  <div className="relative flex items-end justify-between gap-4 pb-5">
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#c7542b]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl">{title}</h2>
      </div>
      <div className="text-right">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#19352c]/40">
          {number}
        </span>
        <div className="mt-3 flex justify-end gap-1.5">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-1 w-6 ${step <= Number(number.slice(0, 1)) ? "bg-[#c7542b]" : "bg-[#19352c]/10"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WaitPanel({ title, body, label }: { title: string; body: string; label: string }) {
  return (
    <motion.div
      key="waiting-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto max-w-2xl py-12 text-center sm:py-16"
    >
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#19352c]/15 bg-[#eee5d5]/60">
        <div className="absolute inset-2 rounded-full border border-dashed border-[#c7542b]/40" />
        <Clock3 className="h-10 w-10 text-[#c7542b]" strokeWidth={1.2} />
        <span className="absolute right-1 top-3 h-3 w-3 animate-pulse rounded-full bg-[#c7542b]" />
      </div>
      <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.3em] text-[#c7542b]">{label}</p>
      <h2 className="mt-4 font-serif text-5xl sm:text-7xl">{title}</h2>
      <p className="mx-auto mt-5 max-w-md font-serif text-base leading-8 text-[#19352c]/60">{body}</p>
      <div className="mx-auto mt-9 flex max-w-xs items-center justify-center gap-3 border border-[#19352c]/10 bg-[#eee5d5]/45 px-5 py-4">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#c7542b]" />
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#19352c]/50">{label}</span>
      </div>
    </motion.div>
  );
}

function ResultBars({
  title,
  counts,
  options,
  totalLabel,
}: {
  title: string;
  counts: Breakdown | null;
  options: { key: string; label: string; color: string }[];
  totalLabel: string;
}) {
  const total = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : 0;
  return (
    <div className="border border-[#19352c]/10 bg-[#f8f1e6]/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-serif text-lg">{title}</h4>
        <span className="shrink-0 font-mono text-[8px] uppercase tracking-wider text-[#19352c]/40">
          {total} {totalLabel}
        </span>
      </div>
      {total === 0 ? (
        <p className="mt-5 text-sm leading-6 text-[#19352c]/50">—</p>
      ) : (
        <div className="mt-5 space-y-4">
          {options.map((option) => {
            const value = counts?.[option.key] ?? 0;
            const pct = Math.round((value / total) * 100);
            return (
              <div key={option.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs leading-5 text-[#19352c]/75">{option.label}</span>
                  <span className="shrink-0 font-mono text-[10px] text-[#19352c]/55">{value} · {pct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden bg-[#19352c]/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full ${option.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default function CommitmentExperiment({
  session,
}: {
  session: HumanExperimentSession;
}) {
  const [language, setLanguage] = useState<Language>("en");
  const [answers, setAnswers] = useState<SceneAnswers>(EMPTY_ANSWERS);
  const [answersLoading, setAnswersLoading] = useState(true);
  const [sceneOneSaved, setSceneOneSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [roomResults, setRoomResults] = useState<RoomResults | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  const t = copy[language];
  const stage = String(session.stage ?? "INTRO");
  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [stage]);
  const isLocked = session.status === "PAUSED";

  // Restore this participant's choices if the page is refreshed.
  // Identity comes from the secure participant cookie on the server.
  useEffect(() => {
    if (!session.sessionId) {
      setAnswersLoading(false);
      return;
    }
    const sessionId = session.sessionId;
    let cancelled = false;

    async function loadAnswers() {
      setAnswersLoading(true);
      try {
        const { answer: saved } = await loadParticipantAnswer(sessionId, 2);
        if (cancelled) return;
        setAnswers({
          scene1: typeof saved.scene1 === "string" ? saved.scene1 : null,
          scene2: typeof saved.scene2 === "string" ? saved.scene2 : null,
          scene3: typeof saved.scene3 === "string" ? saved.scene3 : null,
          commitment: typeof saved.commitment === "string" ? saved.commitment : null,
        });
        setSceneOneSaved(typeof saved.scene1 === "string");
      } catch (err) {
        console.error("CHURCH ATTENDANCE ANSWER LOAD FAILED:", err);
      } finally {
        if (!cancelled) setAnswersLoading(false);
      }
    }

    void loadAnswers();
    return () => {
      cancelled = true;
    };
  }, [session.sessionId]);

  // Reset only the local sub-navigation when the facilitator opens a new phase.
  useEffect(() => {
    if (stage === "DISCUSSION") setError("");
  }, [stage]);

  // Save through the authenticated API. The server merges the patch into
  // this participant's answer and preserves other experiences' answers.
  async function saveAnswerPatch(patch: Partial<SceneAnswers>, markComplete = false) {
    if (!session.sessionId) {
      setError(t.connectionError);
      return false;
    }

    if (isLocked || saving) return false;

    setSaving(true);
    setError("");

    try {
      const result = await saveParticipantAnswer({
        sessionId: session.sessionId,
        experience: 2,
        patch,
        markComplete,
        fallbackMessage: t.saveError,
      });

      if (!result.ok) {
        console.error("CHURCH ATTENDANCE ANSWER SAVE FAILED:", result.message);
        setError(t.saveError);
        return false;
      }

      setAnswers((previous) => ({ ...previous, ...patch }));
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function submitSceneOne() {
    if (!answers.scene1) {
      setError(t.chooseError);
      return;
    }
    const saved = await saveAnswerPatch({ scene1: answers.scene1 });
    if (saved) setSceneOneSaved(true);
  }

  async function submitSceneTwo() {
    if (!answers.scene2) {
      setError(t.chooseError);
      return;
    }
    const saved = await saveAnswerPatch({ scene2: answers.scene2 });
    if (saved) {
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submitSceneThree() {
    if (!answers.scene3) {
      setError(t.chooseError);
      return;
    }
    const saved = await saveAnswerPatch({ scene3: answers.scene3 });
    if (saved) {
      setError("");
    }
  }

  async function submitCommitment() {
    if (!answers.commitment) {
      setError(t.chooseError);
      return;
    }
    const saved = await saveAnswerPatch({ commitment: answers.commitment }, true);
    if (saved) setError("");
  }

  // Anonymous room counts for the facilitator-led reveal, aggregated on the server.
  useEffect(() => {
    const revealRounds: Record<string, number> = { REVEAL_1: 1, REVEAL_2: 2, REVEAL_3: 3 };
    const round = revealRounds[stage];
    if (!round || !session.sessionId) return;
    const sessionId = session.sessionId;
    let cancelled = false;

    async function loadResults() {
      setResultsLoading(true);
      try {
        const counts = await loadRoomResults(sessionId, 2, round);
        if (!cancelled) setRoomResults(counts as RoomResults);
      } catch (err) {
        console.error("CHURCH ATTENDANCE RESULTS LOAD FAILED:", err);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }

    void loadResults();
    return () => {
      cancelled = true;
    };
  }, [stage, session.sessionId]);

const intro = stage === "INTRO" || stage === "START";

const sceneOne = stage === "QUESTION_1";
const waitingOne = stage === "WAIT_1";

const sceneTwo = stage === "QUESTION_2";
const waitingTwo = stage === "WAIT_2";

const sceneThree = stage === "QUESTION_3";
const waitingThree = stage === "WAIT_3";

const revealOne = stage === "REVEAL_1";
const revealTwo = stage === "REVEAL_2";
const revealThree = stage === "REVEAL_3";

const reflection = stage === "DISCUSSION";
const complete = stage === "COMPLETE";

  const scene1Results = roomResults?.scene1 ?? null;
  const scene2Results = roomResults?.scene2 ?? null;
  const scene3Results = roomResults?.scene3 ?? null;

  return (
    <main className="experience-paper min-h-screen text-[#19352c]">
      <div className="mx-auto min-h-screen max-w-[1200px] px-5 py-6 sm:px-8 sm:py-9">
        <header className="flex items-start justify-between gap-4 border-b border-[#19352c]/15 pb-5">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#c7542b]">PRERNA / 2026</p>
            <h1 className="mt-2 font-serif text-xl tracking-wide sm:text-2xl">HUMAN EXPERIMENT</h1>
            <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.22em] text-[#00000]">{t.lab}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00000]"> {t.label}</p>
              <p className="mt-1 font-mono text-sm font-bold text-[#c7542b]">02 / 05</p>
            </div>
            <div className="flex items-center gap-1 border border-[#19352c]/15 bg-[#f8f1e6]/70 p-1">
              <Languages className="ml-1 h-3.5 w-3.5 text-[#19352c]/55" />
              <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={`px-2.5 py-1.5 font-mono text-[9px] transition-colors ${language === "en" ? "bg-[#19352c] text-[#f8f1e6]" : "text-[#19352c]/60 hover:bg-[#19352c]/5"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                aria-pressed={language === "hi"}
                className={`px-2.5 py-1.5 font-mono text-[9px] transition-colors ${language === "hi" ? "bg-[#19352c] text-[#f8f1e6]" : "text-[#19352c]/60 hover:bg-[#19352c]/5"}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </header>

        {isLocked && !intro && !complete && (
          <div className="mt-5 border border-[#c7542b]/25 bg-[#c7542b]/[0.06] px-4 py-3 text-center font-mono text-[9px] uppercase tracking-wider text-[#9e482d]">
            {t.locked}
          </div>
        )}

        <section className="mx-auto max-w-[1040px] py-9 sm:py-14">
          <AnimatePresence mode="wait">
       {intro && (
  <motion.div
    key="intro"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="relative flex min-h-[72vh] flex-col items-center justify-center overflow-hidden px-4 py-14 text-center"
  >
    {/* Background ornaments */}
    <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full border border-[#c7542b]/[0.09]" />
    <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full border border-[#19352c]/[0.06]" />
    <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full border border-[#c7542b]/[0.09]" />

    {/* Fine corner ornaments */}
    <div className="pointer-events-none absolute left-5 top-7 h-20 w-20 border-l border-t border-[#c7542b]/25 sm:left-12 sm:top-10" />
    <div className="pointer-events-none absolute right-5 top-7 h-20 w-20 border-r border-t border-[#c7542b]/25 sm:right-12 sm:top-10" />
    <div className="pointer-events-none absolute bottom-7 left-5 h-20 w-20 border-b border-l border-[#c7542b]/20 sm:bottom-10 sm:left-12" />
    <div className="pointer-events-none absolute bottom-7 right-5 h-20 w-20 border-b border-r border-[#c7542b]/20 sm:bottom-10 sm:right-12" />


   {/* Experience number */}
<p className="mb-3 font-mono text-[16px] font-bold uppercase tracking-[0.35em] text-[#c7542b]">
  {language === "hi" ? "अनुभव ०२" : "EXPERIENCE 02"}
</p>

{/* Crystal ornament */}
<div className="mb-7 flex items-center justify-center gap-3">
  <span className="h-px w-12 bg-[#c7542b]/35" />
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 text-[#c7542b]"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 1.5L15 9L22.5 12L15 15L12 22.5L9 15L1.5 12L9 9L12 1.5Z"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
  </svg>
  <span className="h-px w-12 bg-[#c7542b]/35" />
</div>

{/* Heading and small chair illustration */}
    <div className="relative flex w-full max-w-5xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
      <h2 className="relative z-10 max-w-full font-serif text-5xl leading-[1.05] tracking-[-0.045em] text-[#19352c] sm:text-6xl lg:text-[76px]">
        {t.introTitle}
      </h2>

      {/* Hand-drawn empty chair with botanical details */}
      <svg
        viewBox="0 0 190 220"
        className="h-32 w-28 shrink-0 text-[#c7542b] sm:h-36 sm:w-32"
        fill="none"
        aria-label="Decorative illustration of an empty chair"
        role="img"
      >
        {/* Botanical branch on the left */}
        <path
          d="M22 184C35 160 42 133 39 105C38 91 33 78 25 67"
          stroke="#71836f"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path d="M37 128C19 124 12 112 14 99C29 101 39 112 37 128Z" stroke="#71836f" strokeWidth="1.1" />
        <path d="M37 128C49 113 51 99 45 88C34 98 31 113 37 128Z" stroke="#71836f" strokeWidth="1.1" />
        <path d="M29 87C14 81 10 70 15 59C28 65 33 76 29 87Z" stroke="#71836f" strokeWidth="1.1" />
        <path d="M29 87C40 74 41 62 34 53C25 63 24 76 29 87Z" stroke="#71836f" strokeWidth="1.1" />

        {/* Chair back */}
        <path
          d="M68 76C68 68 74 62 82 62H111C119 62 125 68 125 76V133H68V76Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M77 76V123M116 76V123" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        <path d="M82 72H111" stroke="currentColor" strokeWidth="1" opacity="0.5" />

        {/* Seat */}
        <path d="M62 132C62 128 66 125 70 125H123C128 125 131 128 131 132V140H62V132Z" stroke="currentColor" strokeWidth="2" />
        <path d="M68 141L65 190M125 141L129 190" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M65 190H57M129 190H137" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M61 151H132" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />

        {/* Small decorative cushion detail */}
        <path d="M81 132C84 128 108 128 112 132" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />

        {/* Small botanical sprig on right */}
        <path d="M151 180C144 157 147 136 162 116" stroke="#71836f" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M150 157C136 155 130 146 132 135C144 137 152 145 150 157Z" stroke="#71836f" strokeWidth="1.1" />
        <path d="M153 144C166 139 170 129 165 119C154 126 150 135 153 144Z" stroke="#71836f" strokeWidth="1.1" />
        <path d="M159 124C149 115 150 104 158 97C167 107 166 117 159 124Z" stroke="#71836f" strokeWidth="1.1" />

        {/* Ground line */}
        <path d="M39 197H153" stroke="#c7542b" strokeWidth="0.8" opacity="0.35" />
        <circle cx="95" cy="202" r="2" fill="#c7542b" opacity="0.65" />
      </svg>
    </div>

    {/* Subtitle */}
    <p className="mt-5 font-serif text-xl text-[#c7542b] sm:mt-7 sm:text-2xl">
      {t.introSubtitle}
    </p>

    {/* Decorative separator */}
    <div className="mt-8 flex items-center gap-3">
      <span className="h-px w-14 bg-[#c7542b]/35" />
      <span className="h-2 w-2 rotate-45 border border-[#c7542b]/65" />
      <span className="h-px w-14 bg-[#c7542b]/35" />
    </div>

    {/* Main description */}
    <p className="mx-auto mt-8 max-w-2xl whitespace-pre-line font-serif text-lg leading-9 text-[#536c62] sm:text-xl sm:leading-10">
      {t.introBody}
    </p>

    <p className="mt-5 max-w-md text-xs leading-7 tracking-wide text-[#19352c]/55 sm:text-sm">
      {t.introNote}
    </p>

    {/* Bottom ornament */}
    <div className="mt-9 flex items-center gap-2 text-[#71836f]/60">
      <span className="h-px w-8 bg-current" />
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M12 3C14 8 16 10 21 12C16 14 14 16 12 21C10 16 8 14 3 12C8 10 10 8 12 3Z" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="h-px w-8 bg-current" />
    </div>

    {/* Facilitator waiting indicator */}
    <div className="mt-7 inline-flex items-center gap-3 border border-[#19352c]/15 bg-[#19352c]/[0.035] px-6 py-4">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c7542b]/40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c7542b]" />
      </span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#19352c]/65">
        {t.waitingLabel}
      </span>
    </div>
  </motion.div>
)}
            {sceneOne && (
              <motion.div key="scene-one" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>
                <StageHeader eyebrow={`${t.scene} 01 / 03`} title={t.scene1Title} number="1 / 3" />
                <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[1.12fr_0.88fr]">
                  <div className="flex flex-col justify-center border-l-[3px] border-[#c7542b] py-3 pl-6 sm:pl-8">
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#c7542b]">{t.imagine}</p>
                    <p className="mt-5 whitespace-pre-line font-serif text-lg leading-9 text-[#19352c]/80 sm:text-xl">{t.scene1Body}</p>
                  </div>
                  <div className="relative overflow-hidden border border-[#19352c]/10 bg-[#eee5d5]/65 p-5 sm:p-6">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#19352c]/10" />
                    <div className="relative flex items-center justify-between">
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#19352c]/45">{t.alarmLabel}</span>
                      <Bell className="h-4 w-4 text-[#c7542b]" />
                    </div>
                    <div className="relative mt-5 rounded-sm bg-[#19352c] p-5 text-[#f8f1e6] sm:p-6">
                      <div className="flex items-center gap-2 text-[#e6b18e]">
                        <AlarmClock className="h-4 w-4" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.2em]">{t.alarmCaption}</span>
                      </div>
                      <p className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">{t.alarmTime}</p>
                      <div className="mt-5 h-px bg-white/15" />
                      <div className="mt-4 flex items-center justify-between text-xs text-white/55">
                        <span>{t.serviceCaption}</span>
                        <span className="font-mono text-sm text-[#f8f1e6]">{t.serviceTime}</span>
                      </div>
                    </div>
                    <div className="relative mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="border border-[#19352c]/10 bg-[#f8f1e6]/70 p-3">
                        <MapPin className="h-4 w-4 text-[#c7542b]" />
                        <p className="mt-2 font-mono text-sm font-bold">{t.travelTime}</p>
                        <p className="mt-1 text-[9px] leading-4 text-[#19352c]/50">{t.travelCaption}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#c7542b]" />
                      <div className="border border-[#19352c]/10 bg-[#f8f1e6]/70 p-3">
                        <Church className="h-4 w-4 text-[#19352c]/65" />
                        <p className="mt-2 font-mono text-sm font-bold">9:00</p>
                        <p className="mt-1 text-[9px] leading-4 text-[#19352c]/50">{t.serviceCaption}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-xl">{t.question}</h3>
                    <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#19352c]/40">{t.selectOne}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <IconChoice icon={Sunrise} title={t.wakeTitle} description={t.wakeDescription} selected={answers.scene1 === "WAKE"} disabled={answersLoading || isLocked || saving} onClick={() => { setAnswers((p) => ({ ...p, scene1: "WAKE" })); setSceneOneSaved(false); setError(""); }} />
                    <IconChoice icon={BedDouble as LucideIcon} title={t.sleepTitle} description={t.sleepDescription} selected={answers.scene1 === "SLEEP"} disabled={answersLoading || isLocked || saving} onClick={() => { setAnswers((p) => ({ ...p, scene1: "SLEEP" })); setSceneOneSaved(false); setError(""); }} />
                  </div>
                </div>
                <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[#19352c]/10 pt-6 sm:flex-row">
                  <p className="text-center text-xs text-[#19352c]/45 sm:text-left">{t.introNote}</p>
                  <button type="button" onClick={() => void submitSceneOne()} disabled={answersLoading || saving || isLocked || !answers.scene1} className="inline-flex w-full items-center justify-center gap-3 bg-[#19352c] px-7 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#f8f1e6] transition-colors hover:bg-[#c7542b] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto">
                    {saving ? t.saving : sceneOneSaved ? t.savedButton : t.saveChoice}<ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {sceneOneSaved && <p className="mt-3 text-right font-mono text-[8px] uppercase tracking-[0.15em] text-[#59745b]">{t.saved}</p>}
                {error && <p role="alert" className="mt-4 text-center text-sm text-[#c7542b]">{error}</p>}
              </motion.div>
            )}

            {waitingOne && <WaitPanel title={t.waitingTitle} body={t.waitingBody} label={t.waitingLabel} />}

            {(sceneTwo || sceneThree) && (
              <AnimatePresence mode="wait">
                {sceneTwo && (
                  <motion.div key="scene-two" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
                    <StageHeader eyebrow={`${t.scene} 02 / 03`} title={t.scene2Title} number="2 / 3" />
                    <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="relative overflow-hidden bg-[#19352c] p-6 text-[#f8f1e6] sm:p-8">
                        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />
                        <div className="relative flex items-center gap-3 text-[#e6b18e]">
                          <CalendarClock className="h-5 w-5" />
                          <p className="font-mono text-[12px] uppercase tracking-[0.2em]">{language === "hi" ? "सुबह 8:00 बजे / निकलने का समय" : "8:00 AM / TIME TO LEAVE"}</p>
                        </div>
                        <p className="relative mt-8 font-serif text-5xl sm:text-6xl">08:00</p>
                        <p className="relative mt-2 text-m leading-6 text-white/55">{language === "hi"
  ? "सभा शुरू होने से पहले चर्च पहुँचने के लिए आपके पास पर्याप्त समय है।": "You have enough time to reach church before the service begins."}</p>
                        <div className="relative mt-8 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center bg-white/10"><Coffee className="h-4 w-4" /></span>
                            <div className="flex-1"><p className="text-xs">{language === "hi" ? "निकलने के लिए तैयार" : "Ready to leave"}</p><div className="mt-1 h-px bg-white/15" /></div>
                            <span className="font-mono text-[9px] text-white/45">7:45</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center bg-white/10"><Smartphone className="h-4 w-4" /></span>
                            <div className="flex-1"><p className="text-xs">{language === "hi" ? "एक नया संदेश" : "A new message"}</p><div className="mt-1 h-px bg-white/15" /></div>
                            <span className="font-mono text-[9px] text-white/45">8:00</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center bg-[#c7542b]"><Clock3 className="h-4 w-4" /></span>
                            <div className="flex-1"><p className="text-xs">{language === "hi" ? "समय बीत रहा है" : "Time is passing"}</p><div className="mt-1 h-px bg-[#c7542b]/70" /></div>
                            <span className="font-mono text-[9px] text-[#e6b18e]">8:20</span>
                          </div>
                        </div>
                        <div className="relative mt-8 border-t border-white/15 pt-5">
                          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/45">{language === "hi"
  ? "थोड़ी-सी देरी आपके पहुँचने का समय बदल सकती है"
  : "A small delay can change your arrival"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center py-2">
                        <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c7542b]">{t.imagine}</p>
                        <h3 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{t.scene2Title}</h3>
                        <p className="mt-5 whitespace-pre-line font-serif text-base leading-8 text-[#19352c]/70">{t.scene2Body}</p>
                        <div className="mt-7 flex flex-wrap items-center gap-2">
                          <span className="border border-[#19352c]/10 bg-[#eee5d5]/60 px-3 py-2 font-mono text-[8px] uppercase tracking-wider">8:00 — Ready</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#c7542b]" />
                          <span className="border border-[#c7542b]/25 bg-[#c7542b]/[0.06] px-3 py-2 font-mono text-[8px] uppercase tracking-wider text-[#a34b2e]">8:25 — Delayed</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-9">
                      <h3 className="mb-4 font-serif text-xl">{t.scene2Prompt}</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <IconChoice icon={Footprints} title={t.leaveNowTitle} description={t.leaveNowDescription} selected={answers.scene2 === "LEAVE"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, scene2: "LEAVE" })); setError(""); }} />
                        <IconChoice icon={Smartphone} title={t.delayTitle} description={t.delayDescription} selected={answers.scene2 === "DELAY"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, scene2: "DELAY" })); setError(""); }} />
                      </div>
                    </div>
                    <div className="mt-7 flex flex-col items-center justify-end gap-4 border-t border-[#19352c]/10 pt-6 sm:flex-row">
                      <button type="button" onClick={() => void submitSceneTwo()} disabled={answersLoading || saving || isLocked || !answers.scene2} className="inline-flex w-full items-center justify-center gap-3 bg-[#19352c] px-7 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#f8f1e6] transition-colors hover:bg-[#c7542b] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto">
                        {saving ? t.saving : t.continue}<ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    {error && <p role="alert" className="mt-4 text-center text-sm text-[#c7542b]">{error}</p>}
                  </motion.div>
                )}

                {sceneThree && (
                  <motion.div key="scene-three" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
                    <StageHeader eyebrow={`${t.scene} 03 / 03`} title={t.scene3Title} number="3 / 3" />
                    <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
  <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#19352c] p-6 text-[#f8f1e6] sm:p-8">
  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />

  <div className="relative flex items-center gap-3 text-[#e6b18e]">
    <CalendarClock className="h-5 w-5" />
    <p className="font-mono text-[8px] uppercase tracking-[0.2em]">
      {language === "hi" ? "रविवार की सुबह" : "SUNDAY MORNING"}
    </p>
  </div>

  <div className="relative my-8 text-center">
    <p className="font-serif text-6xl tracking-tight sm:text-7xl">
      {language === "hi" ? "रविवार" : "SUNDAY"}
    </p>
    <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
      {language === "hi" ? "दो प्लान, एक सुबह" : "TWO PLANS. ONE MORNING"}
    </p>
  </div>

  <div className="relative grid grid-cols-2 gap-3 border-t border-white/20 pt-5">
    <div className="flex flex-col items-center gap-2 text-[#e6b18e]">
      <Church className="h-8 w-8" strokeWidth={1.2} />
      <span className="font-mono text-[8px] uppercase tracking-wider">
        {language === "hi" ? "चर्च" : "CHURCH"}
      </span>
    </div>
    <div className="flex flex-col items-center gap-2 text-white/60">
      <Users className="h-8 w-8" strokeWidth={1.2} />
      <span className="font-mono text-[8px] uppercase tracking-wider">
        {language === "hi" ? "दोस्त" : "FRIENDS"}
      </span>
    </div>
  </div>

  <p className="relative mt-5 text-center font-mono text-[8px] uppercase tracking-widest text-white/45">
    {language === "hi" ? "आप कहाँ होंगे?" : "WHERE WILL YOU BE?"}
  </p>
</div>
                      <div className="flex flex-col justify-center py-2">
                        <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c7542b]">{t.imagine}</p>
                        <h3 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{t.scene3Title}</h3>
                        <p className="mt-5 font-serif text-base leading-8 text-[#19352c]/70">{t.scene3Body}</p>
                        <div className="mt-6 flex items-center gap-3 border-l-2 border-[#c7542b] bg-[#eee5d5]/55 p-4">
                          <DoorOpen className="h-5 w-5 shrink-0 text-[#c7542b]" />
                          <p className="font-serif text-sm leading-6 text-[#19352c]/65">{t.scene3Prompt}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-9 grid gap-4 sm:grid-cols-2">
                      <IconChoice icon={Church} title={t.enterTitle} description={t.enterDescription} selected={answers.scene3 === "ENTER"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, scene3: "ENTER" })); setError(""); }} />
                      <IconChoice icon={Users} title={t.returnTitle} description={t.returnDescription} selected={answers.scene3 === "RETURN"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, scene3: "RETURN" })); setError(""); }} />
                    </div>
                    <div className="mt-7 flex flex-col-reverse items-center justify-between gap-4 border-t border-[#19352c]/10 pt-6 sm:flex-row">
                      <button type="button" onClick={() => void submitSceneThree()} disabled={answersLoading || saving || isLocked || !answers.scene3} className="inline-flex w-full items-center justify-center gap-3 bg-[#19352c] px-7 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#f8f1e6] transition-colors hover:bg-[#c7542b] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto">
                        {saving ? t.saving : t.saveChoice}<CheckCircle2 className="h-4 w-4" />
                      </button>
                    </div>
                    {error && <p role="alert" className="mt-4 text-center text-sm text-[#c7542b]">{error}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {waitingTwo && <WaitPanel title={t.waitingTitle} body={t.waitingBody} label={t.waitingLabel} />}
            {waitingThree && <WaitPanel title={t.waitingTitle} body={t.waitingBody} label={t.waitingLabel} />}
            {(revealOne || revealTwo || revealThree) && (
              <motion.div key={stage} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>

                {revealOne && (
                  <div className="mt-8">
                    <div className="mb-7 max-w-2xl">
                      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#c7542b]">{t.roomPulse}</p>
                      <h3 className="mt-3 font-serif text-3xl">{t.roomPulseDescription}</h3>
                    </div>
                    {resultsLoading ? (
                      <div className="border border-[#19352c]/10 bg-[#eee5d5]/45 p-8 text-center font-serif text-[#19352c]/55">{t.loading}</div>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-3">
                        <ResultBars title={t.scene1Result} counts={scene1Results} totalLabel={t.responseCount} options={[{ key: "WAKE", label: t.wakeTitle, color: "bg-[#19352c]" }, { key: "SLEEP", label: t.sleepTitle, color: "bg-[#c7542b]" }]} />
                        <ResultBars title={t.scene2Result} counts={scene2Results} totalLabel={t.responseCount} options={[{ key: "LEAVE", label: t.leaveNowTitle, color: "bg-[#19352c]" }, { key: "DELAY", label: t.delayTitle, color: "bg-[#c7542b]" }]} />
                        <ResultBars title={t.scene3Result} counts={scene3Results} totalLabel={t.responseCount} options={[{ key: "ENTER", label: t.enterTitle, color: "bg-[#19352c]" }, { key: "RETURN", label: t.returnTitle, color: "bg-[#c7542b]" }]} />
                      </div>
                    )}
                    {(!roomResults || Object.values(roomResults).every((group) => Object.values(group).every((count) => count === 0))) && (
                      <p className="mt-5 text-center text-[10px] text-[#19352c]/40">{t.noResponses}</p>
                    )}
                  </div>
                )}

                {revealTwo && (
                  <div className="mt-8 grid items-center gap-7 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative overflow-hidden bg-[#19352c] p-7 text-[#f8f1e6] sm:p-9">
                      <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full border border-white/10" />
                      <div className="relative flex items-center gap-2 text-[#e6b18e]">
                        <Church className="h-5 w-5" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.22em]">{t.revealEyebrow}</span>
                      </div>
                      <div className="relative mt-12 grid grid-cols-3 gap-2">
                        {[0, 1, 2, 3, 4, 5].map((seat) => (
                          <div key={seat} className={`flex h-20 items-center justify-center border ${seat === 4 ? "border-[#e4a27c] bg-[#c7542b]/20 text-[#e6b18e]" : "border-white/15 bg-white/[0.05] text-white/35"}`}>
                            {seat === 4 ? <span className="font-mono text-[8px] uppercase tracking-widest">EMPTY</span> : <Armchair className="h-8 w-8" strokeWidth={1.1} />}
                          </div>
                        ))}
                      </div>
                      <p className="relative mt-7 text-center font-serif text-lg text-white/75">{t.revealSeatLine}</p>
                    </div>
                    <div className="py-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#c7542b]">{t.imagine}</p>
                      <h3 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{t.revealTitle}</h3>
                      <p className="mt-6 font-serif text-base leading-8 text-[#19352c]/70">{t.revealBody}</p>
                      <div className="mt-7 border-l-[3px] border-[#c7542b] bg-[#eee5d5]/60 p-5 sm:p-6">
                        <p className="font-serif text-xl leading-8 text-[#19352c]">{t.revealMeaning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {revealThree && (
<div className="relative mt-0 overflow-hidden">
    {/* ===== OPENING: THE BIG IDEA ===== */}
    <section className="relative overflow-hidden px-4 pt-2 pb-12 sm:px-8 sm:pt-4 sm:pb-14">

      {/* Botanical artwork - left */}
      <svg
        viewBox="0 0 180 280"
        className="pointer-events-none absolute -left-5 top-8 h-56 w-36 text-[#71836f]/35 sm:left-0 sm:h-72 sm:w-44"
        fill="none"
        aria-hidden="true"
      >
        <path d="M25 260C65 205 65 125 25 35" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M47 205C12 205 0 180 9 158C35 163 51 181 47 205Z" stroke="currentColor"/>
        <path d="M47 205C77 182 82 157 65 139C43 158 38 181 47 205Z" stroke="currentColor"/>
        <path d="M48 145C15 137 6 113 20 94C44 105 55 125 48 145Z" stroke="currentColor"/>
        <path d="M48 145C77 127 84 104 69 85C46 99 39 122 48 145Z" stroke="currentColor"/>
        <path d="M31 77C12 60 15 39 33 27C48 48 47 65 31 77Z" stroke="currentColor"/>
        <path d="M31 77C54 65 64 46 55 28C35 38 26 57 31 77Z" stroke="currentColor"/>
      </svg>

      {/* Botanical artwork - right */}
      <svg
        viewBox="0 0 180 280"
        className="pointer-events-none absolute -right-5 bottom-0 h-56 w-36 -scale-x-100 text-[#c7542b]/25 sm:right-0 sm:h-72 sm:w-44"
        fill="none"
        aria-hidden="true"
      >
        <path d="M25 260C65 205 65 125 25 35" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M47 205C12 205 0 180 9 158C35 163 51 181 47 205Z" stroke="currentColor"/>
        <path d="M47 205C77 182 82 157 65 139C43 158 38 181 47 205Z" stroke="currentColor"/>
        <path d="M48 145C15 137 6 113 20 94C44 105 55 125 48 145Z" stroke="currentColor"/>
        <path d="M48 145C77 127 84 104 69 85C46 99 39 122 48 145Z" stroke="currentColor"/>
        <path d="M31 77C12 60 15 39 33 27C48 48 47 65 31 77Z" stroke="currentColor"/>
        <path d="M31 77C54 65 64 46 55 28C35 38 26 57 31 77Z" stroke="currentColor"/>
      </svg>

      <div className="relative mx-auto max-w-4xl text-center">

        {/* Emblem */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rotate-45 border border-[#c7542b]/25" />
          <div className="absolute inset-2 rounded-full border border-[#c7542b]/20" />
          <HeartHandshake
            className="relative h-9 w-9 text-[#c7542b]"
            strokeWidth={1.25}
          />
        </div>

        <p className="mt-8 font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-[#c7542b]">
          {language === "hi" ? "हमारी पहचान" : "OUR IDENTITY"}
        </p>

        <h3 className={`mt-5 font-serif leading-[1.15] tracking-tight text-[#19352c] ${
          language === "hi" ? "text-4xl sm:text-5xl" : "text-4xl sm:text-6xl"
        }`}>
          {t.biggerPicture}
        </h3>

        <p className="mt-4 font-serif text-xl leading-relaxed text-[#c7542b] sm:text-2xl">
          {t.biggerPictureSecond}
        </p>

        <div className="mx-auto mt-8 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#c7542b]/40" />
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#c7542b]" fill="none" aria-hidden="true">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="currentColor" strokeWidth="1"/>
          </svg>
          <span className="h-px w-16 bg-[#c7542b]/40" />
        </div>
      </div>
    </section>

    {/* ===== FOUR EXPRESSIONS OF CHURCH LIFE ===== */}
    <section className="relative mt-5">

      <div className="mb-7 flex items-center gap-4 px-1">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#c7542b]">
            {language === "hi" ? "एक साथ जीवन" : "LIFE TOGETHER"}
          </p>
          <p className="mt-1 font-serif text-lg text-[#19352c]">
            {language === "hi" ? "हम एक-दूसरे के लिए कैसे हैं" : "What it means to belong"}
          </p>
        </div>
        <span className="h-px flex-1 bg-[#19352c]/15" />
        <span className="font-mono text-[9px] tracking-widest text-[#19352c]/40">01 — 04</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* 01 WORSHIP */}
        <article className="relative min-h-[230px] overflow-hidden bg-[#19352c] p-7 text-[#f8f1e6] sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/[0.09]" />
          <div className="pointer-events-none absolute -right-2 -top-4 h-32 w-32 rounded-full border border-[#e6b18e]/[0.12]" />

          <div className="relative flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center border border-[#e6b18e]/35 text-[#e6b18e]">
              <Sun className="h-6 w-6" strokeWidth={1.2}/>
            </div>
            <span className="font-serif text-6xl text-white/[0.12]">01</span>
          </div>

          <h4 className={`relative mt-7 font-bold text-[#e6b18e] ${
            language === "hi" ? "font-sans text-base" : "font-mono text-[10px] tracking-[0.2em]"
          }`}>
            {t.worshipTitle}
          </h4>
          <p className="relative mt-3 max-w-md font-serif text-base leading-8 text-[#f8f1e6]/85 sm:text-lg">
            {t.worshipText}
          </p>
          <div className="relative mt-6 h-px w-12 bg-[#e6b18e]/55"/>
        </article>

        {/* 02 FELLOWSHIP */}
        <article className="relative min-h-[230px] overflow-hidden border border-[#19352c]/12 bg-[#f8f1e6]/70 p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-[#c7542b]/[0.09]"/>

          <div className="relative flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center border border-[#c7542b]/25 bg-[#c7542b]/[0.045] text-[#c7542b]">
              <Users className="h-6 w-6" strokeWidth={1.2}/>
            </div>
            <span className="font-serif text-6xl text-[#c7542b]/15">02</span>
          </div>

          <h4 className={`relative mt-7 font-bold text-[#19352c] ${
            language === "hi" ? "font-sans text-base" : "font-mono text-[10px] tracking-[0.2em]"
          }`}>
            {t.fellowshipTitle}
          </h4>
          <p className="relative mt-3 max-w-md font-serif text-base leading-8 text-[#536c62] sm:text-lg">
            {t.fellowshipText}
          </p>
          <div className="relative mt-6 h-px w-12 bg-[#c7542b]/55"/>
        </article>

        {/* 03 ENCOURAGEMENT */}
        <article className="relative min-h-[230px] overflow-hidden border border-[#19352c]/12 bg-[#f8f1e6]/70 p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-[#c7542b]/[0.09]"/>

          <div className="relative flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center border border-[#c7542b]/25 bg-[#c7542b]/[0.045] text-[#c7542b]">
              <HandHeart className="h-6 w-6" strokeWidth={1.2}/>
            </div>
            <span className="font-serif text-6xl text-[#c7542b]/15">03</span>
          </div>

          <h4 className={`relative mt-7 font-bold text-[#19352c] ${
            language === "hi" ? "font-sans text-base" : "font-mono text-[10px] tracking-[0.2em]"
          }`}>
            {t.encouragementTitle}
          </h4>
          <p className="relative mt-3 max-w-md font-serif text-base leading-8 text-[#536c62] sm:text-lg">
            {t.encouragementText}
          </p>
          <div className="relative mt-6 h-px w-12 bg-[#c7542b]/55"/>
        </article>

        {/* 04 GROWTH */}
        <article className="relative min-h-[230px] overflow-hidden border border-[#19352c]/12 bg-[#eee5d5]/80 p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border border-[#19352c]/[0.08]"/>

          <div className="relative flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center border border-[#c7542b]/25 bg-[#c7542b]/[0.045] text-[#c7542b]">
              <BookOpen className="h-6 w-6" strokeWidth={1.2}/>
            </div>
            <span className="font-serif text-6xl text-[#c7542b]/15">04</span>
          </div>

          <h4 className={`relative mt-7 font-bold text-[#19352c] ${
            language === "hi" ? "font-sans text-base" : "font-mono text-[10px] tracking-[0.2em]"
          }`}>
            {t.growthTitle}
          </h4>
          <p className="relative mt-3 max-w-md font-serif text-base leading-8 text-[#536c62] sm:text-lg">
            {t.growthText}
          </p>
          <div className="relative mt-6 h-px w-12 bg-[#c7542b]/55"/>
        </article>
      </div>
    </section>

    {/* ===== SCRIPTURE FEATURE ===== */}
    <section className="relative mt-12 overflow-hidden bg-[#19352c] px-7 py-10 text-[#f8f1e6] sm:px-12 sm:py-14">

      {/* Double frame */}
      <div className="pointer-events-none absolute inset-3 border border-[#e6b18e]/20 sm:inset-5"/>
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/[0.08]"/>
      <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border border-[#e6b18e]/[0.13]"/>

      <div className="relative mx-auto max-w-4xl">

        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-[#e6b18e]/60"/>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#e6b18e]">
            {t.scriptureLabel}
          </p>
        </div>

        <div className="mt-7 flex items-start gap-3 sm:gap-6">
          <span className="shrink-0 font-serif text-7xl leading-[0.8] text-[#e6b18e]/65 sm:text-8xl">
            “
          </span>
          <p className={`font-serif text-[#f8f1e6] ${
            language === "hi"
              ? "text-xl leading-[2.1] sm:text-2xl"
              : "text-xl leading-[1.75] sm:text-2xl sm:leading-[1.8]"
          }`}>
            {t.scriptureText}
          </p>
        </div>

        <div className="mt-9 flex items-center gap-4">
          <span className="h-px w-10 bg-[#e6b18e]/50"/>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
            {t.scriptureNote}
          </p>
        </div>
      </div>
    </section>

    {/* ===== REFLECTION ===== */}
    <section className="relative mx-auto mt-9 max-w-5xl overflow-hidden border border-[#19352c]/10 bg-[#eee5d5]/70 px-7 py-9 sm:px-12 sm:py-11">

      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-[#c7542b]/10"/>
      <div className="pointer-events-none absolute -right-5 -top-9 h-32 w-32 rounded-full border border-[#19352c]/[0.06]"/>

      <div className="relative flex items-center gap-3">
        <span className="h-px w-8 bg-[#c7542b]/60"/>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#c7542b]">
          {language === "hi" ? "अपने मन से एक सवाल" : "A QUESTION TO CARRY WITH YOU"}
        </p>
      </div>

      <p className={`relative mt-6 max-w-4xl font-serif leading-relaxed text-[#19352c] ${
        language === "hi" ? "text-xl leading-[1.9] sm:text-2xl" : "text-2xl sm:text-3xl"
      }`}>
        {t.keyQuestion}
      </p>

      <div className="relative mt-8 flex items-center gap-3">
        <span className="h-px w-10 bg-[#c7542b]/55"/>
        <span className="h-2 w-2 rotate-45 border border-[#c7542b]/65"/>
      </div>
    </section>

  </div>
)}

              </motion.div>
            )}

            {reflection && (
              <motion.div key="reflection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>
                <div className="border-b border-[#19352c]/15 pb-5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#c7542b]">{t.reflectEyebrow}</p>
                  <h2 className="mt-3 font-serif text-3xl sm:text-5xl">{t.reflectTitle}</h2>
                </div>
                <div className="mx-auto mt-9 max-w-3xl">
                  <div className="relative overflow-hidden bg-[#19352c] p-7 text-[#f8f1e6] sm:p-9">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
                    <p className="relative font-mono text-[8px] uppercase tracking-[0.22em] text-[#e6b18e]">01 / THINK ABOUT THIS</p>
                    <h3 className="relative mt-5 font-serif text-2xl leading-9 sm:text-3xl">{t.reflectQuestion}</h3>
                  </div>
                  <div className="mt-7">
                    <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#c7542b]">02 / YOUR NEXT STEP</p>
                    <h3 className="mt-3 font-serif text-xl leading-8 sm:text-2xl">{t.reflectAction}</h3>
                    <div className="mt-5 grid gap-3">
                      <IconChoice icon={CalendarClock} title={t.commitAttend} description="" selected={answers.commitment === "ATTEND"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, commitment: "ATTEND" })); setError(""); }} />
                      <IconChoice icon={HeartHandshake} title={t.commitEncourage} description="" selected={answers.commitment === "ENCOURAGE"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, commitment: "ENCOURAGE" })); setError(""); }} />
                      <IconChoice icon={Users} title={t.commitParticipate} description="" selected={answers.commitment === "PARTICIPATE"} disabled={answersLoading || saving || isLocked} onClick={() => { setAnswers((p) => ({ ...p, commitment: "PARTICIPATE" })); setError(""); }} />
                    </div>
                  </div>
                  <div className="mt-7 flex flex-col items-center justify-between gap-4 border-t border-[#19352c]/10 pt-6 sm:flex-row">
                    <p className="text-xs text-[#19352c]/45">{t.privateNote}</p>
                    <button type="button" onClick={() => void submitCommitment()} disabled={answersLoading || saving || isLocked || !answers.commitment} className="inline-flex w-full items-center justify-center gap-3 bg-[#19352c] px-7 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#f8f1e6] transition-colors hover:bg-[#c7542b] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto">
                      {saving ? t.saving : t.saveCommitment}<CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                  {error && <p role="alert" className="mt-4 text-center text-sm text-[#c7542b]">{error}</p>}
                </div>
              </motion.div>
            )}

            {complete && (
              <motion.div key="complete" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl py-8 text-center sm:py-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c7542b]/25 bg-[#c7542b]/[0.06] text-[#c7542b]">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={1.3} />
                </div>
                <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.3em] text-[#c7542b]">{t.completed}</p>
                <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">{t.completedTitle}</h2>
                <div className="relative mx-auto mt-9 max-w-2xl overflow-hidden bg-[#19352c] p-8 text-[#f8f1e6] sm:p-12">
                  <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
                  <Church className="relative mx-auto h-9 w-9 text-[#e6b18e]" strokeWidth={1.2} />
                  <p className="relative mt-6 font-serif text-xl leading-9 sm:text-2xl">{t.completedBody}</p>
                </div>
                <div className="mt-12">
                  <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#c7542b]">{t.sticker}</p>
                  <h3 className="mt-3 font-serif text-3xl">{t.stickerTitle}</h3>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#19352c]/45">{t.stickerSubtitle}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !sceneOne && !sceneTwo && !sceneThree && !reflection && (
            <p role="alert" className="mt-5 text-center text-sm text-[#c7542b]">{error}</p>
          )}
        </section>
      </div>
    </main>
  );
}
