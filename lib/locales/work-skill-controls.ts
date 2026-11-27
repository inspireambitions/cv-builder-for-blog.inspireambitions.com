// Interface strings only. The column order is English, Arabic, Hindi, Urdu and Tagalog.
const rows: Record<string, readonly [string, string, string, string, string]> = {
  "workUi.intro": ["List your roles starting with the most recent", "اذكر وظائفك بدءاً بالأحدث", "अपनी नौकरियाँ लिखें, सबसे हाल की पहले।", "اپنی ملازمتیں لکھیں، سب سے حالیہ پہلے۔", "Ilista ang mga trabaho mo, unahin ang pinakabago."],
  "workUi.locationExample": ["e.g. Dubai, UAE", "مثلاً دبي، الإمارات", "जैसे, दुबई, यूएई", "مثلاً، دبئی، متحدہ عرب امارات", "Halimbawa, Dubai, UAE"],
  "workUi.gapExample": ["e.g. Career break for family relocation", "مثلاً، توقفت عن العمل بسبب انتقال أسرتي", "जैसे, परिवार के साथ दूसरी जगह जाने के लिए काम से विराम", "مثلاً، خاندان کی منتقلی کی وجہ سے کام سے وقفہ", "Halimbawa, nagpahinga sa trabaho dahil lumipat ang pamilya"],
  "workUi.dutyExample": ["Add one duty or result per line.", "اكتب مهمة أو نتيجة واحدة في كل سطر.", "हर पंक्ति में एक काम या नतीजा लिखें।", "ہر سطر میں ایک کام یا نتیجہ لکھیں۔", "Maglagay ng isang gawain o resulta sa bawat linya."],
  "workUi.promotion": ["This was a promotion from {role}", "ترقيت من منصب {role} إلى هذا المنصب", "मुझे {role} के पद से तरक्की मिली", "مجھے {role} کے عہدے سے ترقی ملی", "Na-promote ako mula sa tungkuling {role}"],
  "workUi.tip": ["Start with a clear action. Add a number only when you can prove it. Example: “Checked rooms before release and corrected missed items.”", "ابدأ بفعل واضح. لا تذكر رقماً إلا إذا أمكنك إثباته. مثال: «فحصت الغرف قبل تسليمها وصححت ما فات الفريق».", "किए गए काम से शुरू करें। वही संख्या लिखें जिसे साबित कर सकें। उदाहरण: “कमरे सौंपने से पहले जाँच की और छूटे काम पूरे किए।”", "کیے گئے کام سے شروع کریں۔ وہی عدد لکھیں جسے ثابت کر سکیں۔ مثال: «کمرے حوالے کرنے سے پہلے جانچ کی اور رہ جانے والے کام مکمل کیے۔»", "Simulan sa ginawa mo. Magdagdag lang ng bilang kung mapapatunayan mo ito. Halimbawa: “Sinuri ko ang mga kuwarto bago ibigay sa mga bisita at inayos ang mga nakaligtaan.”"],
  "skillUi.intro": ["Add your key skills. Type a skill and press Enter or click Add.", "أضف أهم مهاراتك. اكتب مهارة ثم اضغط إدخال أو إضافة.", "अपने मुख्य कौशल जोड़ें। कौशल लिखें, फिर Enter दबाएँ या जोड़ें पर टैप करें।", "اپنی اہم مہارتیں شامل کریں۔ مہارت لکھیں اور Enter دبائیں یا شامل کریں پر ٹیپ کریں۔", "Ilagay ang mga pangunahing kasanayan mo. Mag-type ng kasanayan at pindutin ang Enter o Idagdag."],
  "skillUi.single": ["{count} skill added", "أضفت مهارة واحدة ({count})", "{count} कौशल जोड़ा गया", "{count} مہارت شامل ہے", "{count} kasanayan ang nailagay"],
  "skillUi.langIntro": ["Add at least one language and choose how well you speak it.", "أضف لغة واحدة على الأقل واختر مدى إجادتك لها.", "कम से कम एक भाषा जोड़ें और चुनें कि आप उसे कितनी अच्छी तरह बोलते हैं।", "کم از کم ایک زبان شامل کریں اور چنیں کہ آپ اسے کتنی اچھی طرح بولتے ہیں۔", "Magdagdag ng kahit isang wika at piliin kung gaano mo ito kahusay magsalita."],
  "skillUi.langNumber": ["Language {number}", "اللغة {number}", "भाषा {number}", "زبان {number}", "Wika {number}"],
  "skillUi.langQuestion": ["How well do you speak it?", "إلى أي مدى تتحدث هذه اللغة؟", "आप यह भाषा कितनी अच्छी तरह बोलते हैं?", "آپ یہ زبان کتنی اچھی طرح بولتے ہیں؟", "Gaano mo kahusay magsalita sa wikang ito?"],
  "skillUi.langExample": ["e.g. English", "مثلاً، العربية", "जैसे, हिंदी", "مثلاً، اردو", "Halimbawa, Filipino"],
  "skillUi.addLang": ["Add Language", "إضافة لغة", "भाषा जोड़ें", "زبان شامل کریں", "Magdagdag ng wika"],
};

function pack(index: number): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]]));
}

export const workSkillControlTranslations = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };
