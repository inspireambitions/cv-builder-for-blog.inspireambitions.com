// Draft interface translations. Native-speaker review is pending.
// Order: English, Arabic, Hindi, Urdu, Tagalog.
type Row = readonly [string, string, string, string, string];

const rows = {
  "builder.nav.start": ["Start", "ابدأ", "शुरू करें", "شروع کریں", "Magsimula"],
  "builder.link.copyLabel": ["Copy link to continue on another phone", "انسخ الرابط للمتابعة على هاتف آخر", "दूसरे फ़ोन पर जारी रखने के लिए लिंक कॉपी करें", "دوسرے فون پر جاری رکھنے کے لیے لنک کاپی کریں", "Kopyahin ang link para magpatuloy sa ibang phone"],
  "builder.link.copying": ["Saving...", "جارٍ الحفظ...", "सहेज रहे हैं...", "محفوظ ہو رہا ہے...", "Sine-save..."],
  "builder.link.copied": ["Link copied", "نُسخ الرابط", "लिंक कॉपी हो गया", "لنک کاپی ہو گیا", "Nakopya ang link"],
  "builder.link.retry": ["Try again", "حاول مرة أخرى", "दोबारा कोशिश करें", "دوبارہ کوشش کریں", "Subukan ulit"],
  "builder.link.error": ["We could not copy your link. Try again.", "تعذر نسخ رابطك. حاول مرة أخرى.", "आपका लिंक कॉपी नहीं हो सका। दोबारा कोशिश करें।", "آپ کا لنک کاپی نہیں ہو سکا۔ دوبارہ کوشش کریں۔", "Hindi namin nakopya ang link mo. Subukan ulit."],
  "builder.link.continueElsewhere": ["Continue on another phone", "تابع على هاتف آخر", "दूसरे फ़ोन पर जारी रखें", "دوسرے فون پر جاری رکھیں", "Magpatuloy sa ibang phone"],
  "builder.link.hint": ["Save this link to open your CV on another phone.", "احفظ هذا الرابط لفتح سيرتك الذاتية على هاتف آخر.", "दूसरे फ़ोन पर अपना सीवी खोलने के लिए यह लिंक सहेजें।", "دوسرے فون پر اپنا سی وی کھولنے کے لیے یہ لنک محفوظ کریں۔", "I-save ang link na ito para mabuksan ang CV mo sa ibang phone."],
  "builder.link.copy": ["Copy link for another phone", "انسخ الرابط لهاتف آخر", "दूसरे फ़ोन के लिए लिंक कॉपी करें", "دوسرے فون کے لیے لنک کاپی کریں", "Kopyahin ang link para sa ibang phone"],
  "builder.draft.deleteConfirm": ["Delete this saved CV draft from this browser? This cannot be undone.", "هل تريد حذف مسودة السيرة الذاتية المحفوظة في هذا المتصفح؟ لا يمكنك التراجع عن الحذف.", "इस ब्राउज़र से सीवी का सहेजा हुआ ड्राफ़्ट मिटाएँ? इसे वापस नहीं ला सकेंगे।", "اس براؤزر سے سی وی کا محفوظ مسودہ مٹائیں؟ اسے واپس نہیں لا سکیں گے۔", "Burahin ang naka-save na draft ng CV sa browser na ito? Hindi na ito maibabalik."],
  "builder.draft.delete": ["Delete draft", "احذف المسودة", "ड्राफ़्ट मिटाएँ", "مسودہ مٹائیں", "Burahin ang draft"],
  "builder.draft.deleteSaved": ["Delete saved draft", "احذف المسودة المحفوظة", "सहेजा हुआ ड्राफ़्ट मिटाएँ", "محفوظ مسودہ مٹائیں", "Burahin ang naka-save na draft"],
  "builder.draft.restored": ["We restored your CV from {date}.", "استعدنا سيرتك الذاتية المحفوظة بتاريخ {date}.", "हमने {date} को सहेजा गया आपका सीवी वापस खोल दिया है।", "ہم نے {date} کو محفوظ کیا گیا آپ کا سی وی بحال کر دیا ہے۔", "Ibinalik namin ang CV na na-save mo noong {date}."],
  "builder.draft.privateLink": ["Your changes save on this device. Keep shared CV links private.", "نحفظ تغييراتك على هذا الجهاز. لا تنشر روابط سيرتك الذاتية.", "आपके बदलाव इसी डिवाइस पर सहेजे जाते हैं। सीवी के लिंक निजी रखें।", "آپ کی تبدیلیاں اسی ڈیوائس پر محفوظ ہوتی ہیں۔ سی وی کے لنک نجی رکھیں۔", "Naka-save sa device na ito ang mga pagbabago mo. Panatilihing pribado ang mga link ng CV."],
  "builder.draft.startFresh": ["Start fresh", "ابدأ من جديد", "नए सिरे से शुरू करें", "نئے سرے سے شروع کریں", "Magsimula ulit"],
  "builder.canvas.zoom": ["{percent} zoom", "التكبير: {percent}", "{percent} ज़ूम", "{percent} زوم", "Zoom: {percent}"],
  "builder.canvas.fullSize": ["Full size", "الحجم الكامل", "पूरा आकार", "پورا سائز", "Buong laki"],
  "builder.canvas.previewLabel": ["CV preview", "معاينة السيرة الذاتية", "सीवी की झलक", "سی وی کی جھلک", "Preview ng CV"],
  "builder.canvas.pinch": ["Pinch to zoom", "قرّب إصبعين أو باعد بينهما لتغيير الحجم", "दो उँगलियों से छोटा या बड़ा करें", "دو انگلیوں سے چھوٹا یا بڑا کریں", "Paglapitin o paglayuin ang dalawang daliri para mag-zoom"],
  "builder.canvas.export": ["Export", "تنزيل السيرة الذاتية", "सीवी डाउनलोड करें", "سی وی ڈاؤن لوڈ کریں", "I-download ang CV"],
  "builder.canvas.reviewLabel": ["CV score and export", "تقييم السيرة الذاتية وتنزيلها", "सीवी स्कोर और डाउनलोड", "سی وی اسکور اور ڈاؤن لوڈ", "Iskor at pag-download ng CV"],
  "builder.footer.description": ["Free career tools built by an HR Career Specialist with 20+ years of GCC experience.", "أدوات مهنية مجانية أنشأها أخصائي مسار مهني في الموارد البشرية بخبرة تزيد على 20 عاماً في دول الخليج.", "मुफ़्त करियर टूल। इन्हें खाड़ी देशों में 20 से अधिक साल का अनुभव रखने वाले एचआर करियर विशेषज्ञ ने बनाया है।", "مفت کیریئر ٹولز۔ انہیں خلیجی ممالک میں 20 سال سے زیادہ تجربہ رکھنے والے ایک ایچ آر کیریئر ماہر نے بنایا ہے۔", "Mga libreng career tool mula sa HR Career Specialist na may mahigit 20 taong karanasan sa mga bansa sa Gulpo."],
  "builder.footer.tools": ["Career Tools", "أدوات المسار المهني", "करियर टूल", "کیریئر ٹولز", "Mga career tool"],
  "builder.footer.whyFree": ["Why it is free", "لماذا نقدّمه مجاناً", "यह मुफ़्त क्यों है", "یہ مفت کیوں ہے", "Bakit ito libre"],
  "builder.footer.compare": ["Compare CV builders", "قارن أدوات إنشاء السيرة الذاتية", "सीवी बनाने वाले टूल की तुलना करें", "سی وی بنانے والے ٹولز کا موازنہ کریں", "Ihambing ang mga CV builder"],
  "builder.footer.dubaiJob": ["Should I Take This Dubai Job?", "هل أقبل هذه الوظيفة في دبي؟", "क्या मुझे दुबई की यह नौकरी लेनी चाहिए?", "کیا مجھے دبئی کی یہ ملازمت قبول کرنی چاہیے؟", "Tatanggapin ko ba ang trabahong ito sa Dubai?"],
  "builder.footer.internship": ["Dubai Internship Eligibility Checker", "تحقّق من أهليتك للتدريب في دبي", "दुबई में इंटर्नशिप की योग्यता जाँचें", "دبئی میں انٹرن شپ کی اہلیت جانچیں", "Alamin kung pasok ka sa internship sa Dubai"],
  "builder.footer.salary": ["UAE Salary Benchmarking Tool", "أداة مقارنة الرواتب في الإمارات", "यूएई में वेतन की तुलना करें", "امارات میں تنخواہوں کا موازنہ کریں", "Ihambing ang sahod sa UAE"],
  "builder.footer.resignation": ["UAE Resignation Letter Generator", "أنشئ خطاب استقالة للعمل في الإمارات", "यूएई की नौकरी के लिए इस्तीफ़ा पत्र बनाएँ", "امارات کی ملازمت کے لیے استعفے کا خط بنائیں", "Gumawa ng liham ng pagbibitiw para sa trabaho sa UAE"],
  "builder.footer.quickLinks": ["Quick Links", "روابط سريعة", "ज़रूरी लिंक", "اہم لنک", "Mabilisang link"],
  "builder.footer.allTools": ["All Career Tools", "كل أدوات المسار المهني", "सभी करियर टूल", "تمام کیریئر ٹولز", "Lahat ng career tool"],
  "builder.footer.blog": ["Blog & Articles", "المدونة والمقالات", "ब्लॉग और लेख", "بلاگ اور مضامین", "Blog at mga artikulo"],
  "builder.footer.copyright": ["© {year} InspireAmbitions.com. All rights reserved.", "© {year} InspireAmbitions.com. جميع الحقوق محفوظة.", "© {year} InspireAmbitions.com. सर्वाधिकार सुरक्षित।", "© {year} InspireAmbitions.com۔ جملہ حقوق محفوظ ہیں۔", "© {year} InspireAmbitions.com. Nakalaan ang lahat ng karapatan."],
} satisfies Record<string, Row>;

function pack(index: 0 | 1 | 2 | 3 | 4): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, value[index]]));
}

export const builderSharedControls = {
  en: pack(0),
  ar: pack(1),
  hi: pack(2),
  ur: pack(3),
  tl: pack(4),
};
