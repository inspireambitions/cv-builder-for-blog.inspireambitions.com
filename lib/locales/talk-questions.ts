// Machine-translated first pass. Native-speaker review is pending for ar, hi, ur and tl.
// Order: English, Arabic, Hindi, Urdu, Filipino. UI copy never changes saved CV facts.
const rows: Record<string, readonly [string, string, string, string, string]> = {
  language: ["Which language do you want to use?", "ما اللغة التي تريد استخدامها؟", "आप कौन सी भाषा इस्तेमाल करना चाहते हैं?", "آپ کون سی زبان استعمال کرنا چاہتے ہیں؟", "Anong wika ang gusto mong gamitin?"],
  family: ["What work do you do?", "ما نوع عملك؟", "आप क्या काम करते हैं?", "آپ کیا کام کرتے ہیں؟", "Ano ang trabaho mo?"],
  title: ["What is your job title?", "ما مسمى وظيفتك؟", "आपका पद क्या है?", "آپ کا عہدہ کیا ہے؟", "Ano ang tawag sa posisyon mo?"],
  company: ["Where do you work?", "أين تعمل؟", "आप कहाँ काम करते हैं?", "آپ کہاں کام کرتے ہیں؟", "Saan ka nagtatrabaho?"],
  location: ["Which city and country?", "في أي مدينة ودولة؟", "कौन सा शहर और देश?", "کون سا شہر اور ملک؟", "Saang lungsod at bansa?"],
  start: ["When did you start?", "متى بدأت العمل؟", "आपने कब शुरू किया?", "آپ نے کب شروع کیا؟", "Kailan ka nagsimula?"],
  current: ["Do you still work there?", "هل ما زلت تعمل هناك؟", "क्या आप अभी भी वहाँ काम करते हैं?", "کیا آپ اب بھی وہاں کام کرتے ہیں؟", "Nagtatrabaho ka pa ba roon?"],
  end: ["When did you leave?", "متى تركت العمل؟", "आपने कब छोड़ा?", "آپ نے کب چھوڑا؟", "Kailan ka umalis?"],
  duties: ["What do you do each day?", "ما مهامك اليومية؟", "आप रोज़ क्या काम करते हैं?", "آپ روز کیا کام کرتے ہیں؟", "Ano ang ginagawa mo araw-araw sa trabaho?"],
  proud: ["What are you proud of?", "ما العمل الذي تفتخر به؟", "आपको किस काम पर गर्व है?", "آپ کو کس کام پر فخر ہے؟", "Anong nagawa mo ang ipinagmamalaki mo?"],
  another: ["Did you have a job before this?", "هل عملت في وظيفة قبل هذه؟", "क्या इससे पहले आपकी कोई नौकरी थी?", "کیا اس سے پہلے آپ کی کوئی ملازمت تھی؟", "May trabaho ka ba bago ito?"],
  school: ["What is your highest school level?", "ما أعلى مستوى دراسي أكملته؟", "आपने किस स्तर तक पढ़ाई की है?", "آپ نے کس درجے تک تعلیم حاصل کی ہے؟", "Hanggang saan ang natapos mong pag-aaral?"],
  "school-details": ["Would you like to add school details?", "هل تريد إضافة تفاصيل دراستك؟", "क्या आप पढ़ाई की जानकारी जोड़ना चाहते हैं?", "کیا آپ تعلیم کی تفصیلات شامل کرنا چاہتے ہیں؟", "Gusto mo bang idagdag ang detalye ng pag-aaral mo?"],
  skills: ["Which skills do you have?", "ما المهارات التي لديك؟", "आपके पास कौन से कौशल हैं?", "آپ کے پاس کون سی مہارتیں ہیں؟", "Ano ang mga kasanayan mo?"],
  languages: ["Which languages do you speak?", "ما اللغات التي تتحدثها؟", "आप कौन सी भाषाएँ बोलते हैं?", "آپ کون سی زبانیں بولتے ہیں؟", "Anong mga wika ang kaya mong salitain?"],
  visa: ["What is your visa status?", "ما وضع تأشيرتك؟", "आपके वीज़ा की स्थिति क्या है?", "آپ کے ویزے کی حیثیت کیا ہے؟", "Ano ang kasalukuyang visa mo?"],
  notice: ["When can you start?", "متى يمكنك بدء العمل؟", "आप कब शुरू कर सकते हैं?", "آپ کب شروع کر سکتے ہیں؟", "Kailan ka puwedeng magsimula?"],
  licence: ["Do you have a driving licence?", "هل لديك رخصة قيادة؟", "क्या आपके पास ड्राइविंग लाइसेंस है?", "کیا آپ کے پاس ڈرائیونگ لائسنس ہے؟", "May lisensiya ka ba sa pagmamaneho?"],
  letter: ["Can your sponsor let you change jobs?", "هل يسمح لك كفيلك بتغيير الوظيفة؟", "क्या आपका प्रायोजक आपको नौकरी बदलने दे सकता है?", "کیا آپ کا کفیل آپ کو ملازمت بدلنے دے سکتا ہے؟", "Papayag ba ang sponsor mo na lumipat ka ng trabaho?"],
  contact: ["How can companies contact you?", "كيف يمكن للشركات التواصل معك؟", "कंपनियाँ आपसे कैसे संपर्क कर सकती हैं?", "کمپنیاں آپ سے کیسے رابطہ کر سکتی ہیں؟", "Paano ka makokontak ng mga kumpanya?"],
  photo: ["Would you like to add a photo?", "هل تريد إضافة صورة؟", "क्या आप फोटो जोड़ना चाहते हैं?", "کیا آپ تصویر شامل کرنا چاہتے ہیں؟", "Gusto mo bang maglagay ng litrato?"],
  summary: ["Does this sound like you?", "هل يصفك هذا الكلام؟", "क्या यह आपको सही तरह से बताता है?", "کیا یہ آپ کی درست وضاحت کرتا ہے؟", "Tama ba itong paglalarawan sa iyo?"],
  design: ["Which design do you like?", "ما التصميم الذي يعجبك؟", "आपको कौन सा डिज़ाइन पसंद है?", "آپ کو کون سا ڈیزائن پسند ہے؟", "Aling disenyo ang gusto mo?"],
  done: ["Would you like to download your CV?", "هل تريد تنزيل سيرتك الذاتية؟", "क्या आप अपना सीवी डाउनलोड करना चाहते हैं?", "کیا آپ اپنا سی وی ڈاؤن لوڈ کرنا چاہتے ہیں؟", "Gusto mo bang i-download ang CV mo?"],
};

const labels = {
  en: "Interface language",
  ar: "لغة الواجهة",
  hi: "ऐप की भाषा",
  ur: "ایپ کی زبان",
  tl: "Wika ng app",
};

const commonRows: Record<string, readonly [string, string, string, string, string]> = {
  "talk.draft": ["Translation draft. Some labels still use English.", "مسودة ترجمة. بعض العناوين ما زالت بالإنجليزية.", "अनुवाद का पहला मसौदा है। कुछ शब्द अभी अंग्रेज़ी में हैं।", "ترجمے کا پہلا مسودہ ہے۔ کچھ الفاظ ابھی انگریزی میں ہیں۔", "Unang salin pa ito. May ilang label pa sa Ingles."],
  "talk.savedCV": ["Your CV is saved on this device.", "سيرتك الذاتية محفوظة على هذا الجهاز.", "आपका सीवी इस डिवाइस पर सुरक्षित है।", "آپ کا سی وی اس ڈیوائس پر محفوظ ہے۔", "Naka-save ang CV mo sa device na ito."],
  "talk.continue": ["Continue", "متابعة", "जारी रखें", "جاری رکھیں", "Magpatuloy"],
  "talk.progress": ["Question {current} of about {total}", "السؤال {current} من نحو {total}", "लगभग {total} में से सवाल {current}", "تقریباً {total} میں سے سوال {current}", "Tanong {current} sa humigit-kumulang {total}"],
  "talk.closeCV": ["Close my CV", "إغلاق سيرتي الذاتية", "मेरा सीवी बंद करें", "میرا سی وی بند کریں", "Isara ang CV ko"],
  "talk.seeCV": ["See my CV", "عرض سيرتي الذاتية", "मेरा सीवी देखें", "میرا سی وی دیکھیں", "Tingnan ang CV ko"],
  "talk.preview": ["Your CV preview", "معاينة سيرتك الذاتية", "आपके सीवी की झलक", "آپ کے سی وی کی جھلک", "Preview ng CV mo"],
  "talk.saved": ["Changes save on this device.", "تُحفظ التغييرات على هذا الجهاز.", "बदलाव इस डिवाइस पर सुरक्षित रहते हैं।", "تبدیلیاں اس ڈیوائس پر محفوظ رہتی ہیں۔", "Naka-save ang mga pagbabago sa device na ito."],
  "talk.back": ["Back", "رجوع", "पीछे", "واپس", "Bumalik"],
  "talk.saveContinue": ["Save and continue", "حفظ ومتابعة", "सुरक्षित करें और आगे बढ़ें", "محفوظ کریں اور آگے بڑھیں", "I-save at magpatuloy"],
  "talk.skip": ["Skip for now", "تخطي الآن", "अभी छोड़ें", "ابھی چھوڑ دیں", "Laktawan muna"],
  "talk.fullForm": ["Full form", "النموذج الكامل", "पूरा फ़ॉर्म", "پورا فارم", "Buong form"],
  "talk.chooseFamily": ["Choose your work, or choose Other work.", "اختر نوع عملك أو اختر عملاً آخر.", "अपना काम चुनें या दूसरा काम चुनें।", "اپنا کام چنیں یا دوسرا کام چنیں۔", "Piliin ang trabaho mo o ang ibang trabaho."],
  "talk.addTitle": ["Add your job title.", "أضف مسمى وظيفتك.", "अपना पद लिखें।", "اپنا عہدہ لکھیں۔", "Ilagay ang posisyon mo."],
  "talk.chooseDesign": ["Choose a design before you continue.", "اختر تصميماً قبل المتابعة.", "आगे बढ़ने से पहले डिज़ाइन चुनें।", "آگے بڑھنے سے پہلے ڈیزائن چنیں۔", "Pumili ng disenyo bago magpatuloy."],
  "talk.decideWords": ["Keep the suggested words, or remove them first.", "احتفظ بالكلمات المقترحة أو احذفها أولاً.", "सुझाए गए शब्द रखें या पहले हटाएँ।", "تجویز کردہ الفاظ رکھیں یا پہلے ہٹائیں۔", "Piliin kung gagamitin o aalisin ang mungkahing salita."],
  "talk.bothDates": ["Choose both a month and a year.", "اختر الشهر والسنة معاً.", "महीना और साल दोनों चुनें।", "مہینہ اور سال دونوں چنیں۔", "Piliin ang buwan at taon."],
  "talk.dateOrder": ["Your end date comes before your start date.", "تاريخ الانتهاء يسبق تاريخ البداية.", "अंत की तारीख शुरू की तारीख से पहले है।", "اختتام کی تاریخ شروع کی تاریخ سے پہلے ہے۔", "Mas maaga ang petsa ng pag-alis kaysa petsa ng pagsisimula."],
  "talk.checkEmail": ["Check the email address, or leave it blank.", "تحقق من البريد الإلكتروني أو اتركه فارغاً.", "ईमेल पता जाँचें या इसे खाली छोड़ दें।", "ای میل پتہ دیکھیں یا اسے خالی چھوڑ دیں۔", "Suriin ang email o iwanang blangko."],
  "talk.aiUnavailable": ["We could not write this right now. Your answers are saved. Tap the sentences instead.", "تعذر اقتراح كلمات الآن. إجاباتك محفوظة. اختر من الجمل المتاحة.", "अभी शब्द सुझाना संभव नहीं है। आपके जवाब सुरक्षित हैं। दी गई पंक्तियाँ चुनें।", "ابھی الفاظ تجویز نہیں ہو سکے۔ آپ کے جواب محفوظ ہیں۔ دیے گئے جملے چنیں۔", "Hindi kami makapagmungkahi ngayon. Naka-save ang sagot mo. Pumili muna sa mga pangungusap."],
};

function pack(locale: keyof typeof labels, index: number): Record<string, string> {
  return { "header.language": labels[locale],
    ...Object.fromEntries(Object.entries(rows).map(([kind, values]) => [`talk.question.${kind}`, values[index]])),
    ...Object.fromEntries(Object.entries(commonRows).map(([key, values]) => [key, values[index]])) };
}

export const talkQuestionTranslations = {
  en: pack("en", 0), ar: pack("ar", 1), hi: pack("hi", 2), ur: pack("ur", 3), tl: pack("tl", 4),
};

export const talkTranslationReview = { ar: "machine-translated", hi: "machine-translated", ur: "machine-translated", tl: "machine-translated" } as const;
