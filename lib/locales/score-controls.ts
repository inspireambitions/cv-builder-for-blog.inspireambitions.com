// Display strings only. The score model still returns the original English.
import type { FinishChange } from "../cv-finish";

// The exact source strings below come from lib/score.ts.
// Order for score rows: Arabic, Hindi, Urdu, Tagalog.
type Localised = readonly [string, string, string, string];
type Row = readonly [string, ...Localised];

const scoreRows = {
  "Completeness": ["اكتمال السيرة الذاتية", "सीवी कितना पूरा है", "سی وی کتنا مکمل ہے", "Pagkakumpleto ng CV"],
  "Content Quality": ["جودة المحتوى", "सामग्री की गुणवत्ता", "مواد کا معیار", "Kalidad ng nilalaman"],
  "Gulf Readiness": ["الاستعداد للعمل في الخليج", "खाड़ी में नौकरी की तैयारी", "خلیج میں ملازمت کی تیاری", "Paghahanda sa trabaho sa Gulpo"],
  "Computer readability": ["سهولة القراءة بأنظمة التوظيف", "भर्ती सिस्टम में पढ़ने में आसानी", "بھرتی کے سسٹم کے لیے پڑھنے میں آسانی", "Daling mabasa ng recruitment software"],
  "Contact Details": ["بيانات الاتصال", "संपर्क की जानकारी", "رابطے کی تفصیل", "Detalye sa pakikipag-ugnayan"],
  "About you (2 to 3 lines)": ["نبذة عنك (سطران إلى ثلاثة)", "आपके बारे में (2 से 3 लाइनें)", "آپ کے بارے میں (2 سے 3 سطریں)", "Tungkol sa iyo (2 hanggang 3 linya)"],
  "Work Experience": ["الخبرة العملية", "काम का अनुभव", "کام کا تجربہ", "Karanasan sa trabaho"],
  "Education": ["التعليم", "शिक्षा", "تعلیم", "Edukasyon"],
  "Action Verbs": ["أفعال تصف ما أنجزته", "काम बताने वाली क्रियाएँ", "کام بتانے والے افعال", "Mga pandiwang naglalarawan ng ginawa mo"],
  "Measurable Achievements": ["إنجازات تقاس بالأرقام", "मापी जा सकने वाली उपलब्धियाँ", "قابلِ پیمائش کامیابیاں", "Mga tagumpay na nasusukat"],
  "Skills Breadth": ["تنوع المهارات", "अलग-अलग कौशल", "مہارتوں کی اقسام", "Iba't ibang kasanayan"],
  "Timeline Coverage": ["تواريخ العمل والتعليم", "काम और पढ़ाई की तारीखें", "ملازمت اور تعلیم کی تاریخیں", "Mga petsa ng trabaho at pag-aaral"],
  "Visa & Availability": ["حالة التأشيرة وموعد بدء العمل", "वीज़ा और काम शुरू करने का समय", "ویزا اور کام شروع کرنے کا وقت", "Visa at petsa ng pagsisimula"],
  "Arabic Language": ["اللغة العربية", "अरबी भाषा", "عربی زبان", "Wikang Arabic"],
  "Driving Licence": ["رخصة القيادة", "ड्राइविंग लाइसेंस", "ڈرائیونگ لائسنس", "Lisensiya sa pagmamaneho"],
  "Regional Certifications": ["شهادات معترف بها في المنطقة", "क्षेत्र में मान्य प्रमाणपत्र", "خطے میں تسلیم شدہ اسناد", "Mga sertipikasyong kinikilala sa rehiyon"],
  "Gulf Market Fit": ["مدى ملاءمة السيرة لسوق الخليج", "खाड़ी की नौकरियों से मेल", "خلیج کی ملازمتوں سے مطابقت", "Kaangkupan sa trabaho sa Gulpo"],
  "LinkedIn URL": ["رابط LinkedIn", "LinkedIn लिंक", "LinkedIn لنک", "Link sa LinkedIn"],
  "Professional Title": ["المسمى الوظيفي", "पद का नाम", "عہدے کا نام", "Titulo sa trabaho"],
  "Profile length": ["طول النبذة المهنية", "प्रोफ़ाइल की लंबाई", "پیشہ ورانہ تعارف کی لمبائی", "Haba ng profile"],
  "Add your full name, phone, city and country.": ["أضف اسمك الكامل ورقم هاتفك ومدينتك وبلدك.", "अपना पूरा नाम, फ़ोन, शहर और देश जोड़ें।", "اپنا پورا نام، فون، شہر اور ملک شامل کریں۔", "Ilagay ang buong pangalan, telepono, lungsod at bansa mo."],
  "Add work details, skills or languages to build a fuller profile.": ["أضف تفاصيل عملك أو مهاراتك أو لغاتك لكتابة نبذة أوضح.", "प्रोफ़ाइल पूरी करने के लिए काम की जानकारी, कौशल या भाषाएँ जोड़ें।", "اپنا تعارف مکمل کرنے کے لیے کام کی تفصیل، مہارتیں یا زبانیں شامل کریں۔", "Idagdag ang mga detalye ng trabaho, kasanayan o wika para makumpleto ang profile mo."],
  "Add at least 2 roles with detailed descriptions (50+ characters each).": ["أضف وظيفتين على الأقل مع وصف مفصل لكل منهما (50 حرفاً على الأقل لكل وصف).", "कम से कम 2 पदों का विवरण जोड़ें। हर विवरण 50 या उससे अधिक अक्षरों का हो।", "کم از کم 2 ملازمتوں کی تفصیل شامل کریں۔ ہر تفصیل 50 یا زیادہ حروف میں لکھیں۔", "Magdagdag ng kahit 2 posisyon. Sumulat ng detalyeng may 50 character o higit pa sa bawat isa."],
  "Add your highest qualification.": ["أضف أعلى مؤهل حصلت عليه.", "अपनी सबसे ऊँची शैक्षिक योग्यता जोड़ें।", "اپنی اعلیٰ ترین تعلیمی قابلیت شامل کریں۔", "Idagdag ang pinakamataas na kwalipikasyon mo."],
  "Start bullet points with strong verbs: led, delivered, increased, reduced, built.": ["ابدأ كل نقطة بفعل واضح، مثل: قدت أو سلّمت أو زدت أو خفّضت أو أنشأت.", "हर बिंदु की शुरुआत काम बताने वाली क्रिया से करें। जैसे: नेतृत्व किया, पहुँचाया, बढ़ाया, घटाया या बनाया।", "ہر نکتے کا آغاز کام بتانے والے فعل سے کریں۔ جیسے: قیادت کی، پہنچایا، بڑھایا، کم کیا یا بنایا۔", "Simulan ang bawat bullet sa pandiwa, gaya ng namuno, naghatid, nagdagdag, nagbawas o gumawa."],
  "Add numbers: '20% increase', 'managed 150 employees', 'AED 2M budget'.": ["أضف أرقاماً من عملك، مثل: «زيادة 20%» أو «أدرت 150 موظفاً» أو «ميزانية مليوني درهم إماراتي». اذكر الرقم فقط إذا كان صحيحاً.", "अपने काम के सही आँकड़े जोड़ें। जैसे: ‘20% की बढ़ोतरी’, ‘150 कर्मचारियों का प्रबंधन किया’ या ‘20 लाख AED का बजट’।", "اپنے کام کے درست اعداد شامل کریں۔ جیسے: ’20% اضافہ‘، ’150 ملازمین کا انتظام کیا‘ یا ’20 لاکھ اماراتی درہم کا بجٹ‘۔", "Gumamit ng totoong numero mula sa trabaho mo. Halimbawa: ‘20% na pagtaas’, ‘namahala ng 150 empleyado’ o ‘badyet na AED 2 milyon’."],
  "List at least 8 relevant skills. Mix technical and soft skills.": ["اذكر 8 مهارات مرتبطة بالوظيفة على الأقل. اجمع بين المهارات التقنية ومهارات التعامل مع الآخرين.", "कम से कम 8 काम से जुड़े कौशल लिखें। तकनीकी और लोगों के साथ काम करने के कौशल शामिल करें।", "کم از کم 8 متعلقہ مہارتیں لکھیں۔ تکنیکی اور لوگوں کے ساتھ کام کرنے کی مہارتیں شامل کریں۔", "Maglista ng kahit 8 kasanayang kaugnay ng trabaho. Isama ang teknikal na kasanayan at pakikitungo sa tao."],
  "Ensure all roles and qualifications have dates.": ["أضف التواريخ لكل وظيفة ومؤهل.", "हर पद और योग्यता के साथ तारीखें लिखें।", "ہر ملازمت اور قابلیت کے ساتھ تاریخیں لکھیں۔", "Lagyan ng petsa ang bawat posisyon at kwalipikasyon."],
  "Mention your visa status and notice period. Gulf recruiters filter on these.": ["اذكر نوع تأشيرتك والمدة التي تحتاجها قبل ترك عملك الحالي. يستخدم مسؤولو التوظيف في الخليج هذه المعلومات لاختيار المرشحين.", "अपनी वीज़ा स्थिति और नोटिस अवधि लिखें। खाड़ी के भर्ती अधिकारी उम्मीदवार चुनते समय इन्हें देखते हैं।", "اپنے ویزے کی صورتِ حال اور نوٹس کی مدت لکھیں۔ خلیج میں بھرتی کرنے والے امیدوار چنتے وقت یہ معلومات دیکھتے ہیں۔", "Ilagay ang visa status at notice period mo. Tinitingnan ito ng mga recruiter sa Gulpo."],
  "If you speak any Arabic, add it to your languages section. Even 'Basic' scores points with Gulf employers.": ["إذا كنت تتحدث العربية، فأضفها إلى قسم اللغات. قد يفيدك حتى المستوى الأساسي لدى أصحاب العمل في الخليج.", "अगर आप थोड़ी अरबी भी बोलते हैं, तो उसे भाषा वाले भाग में जोड़ें। खाड़ी में ‘बुनियादी’ स्तर भी काम आ सकता है।", "اگر آپ تھوڑی عربی بھی بولتے ہیں تو اسے زبانوں کے حصے میں شامل کریں۔ خلیج میں بنیادی سطح بھی کام آ سکتی ہے۔", "Idagdag ang Arabic sa listahan ng mga wika kung marunong kang magsalita nito. Makakatulong kahit basic na antas sa mga employer sa Gulpo."],
  "Mention your UAE or international driving licence. Transport matters in the Gulf.": ["اذكر رخصة القيادة الإماراتية أو الدولية إذا كانت لديك. التنقل مهم للعمل في الخليج.", "अगर आपके पास यूएई या अंतरराष्ट्रीय ड्राइविंग लाइसेंस है, तो लिखें। खाड़ी में आने-जाने की सुविधा मायने रखती है।", "اگر آپ کے پاس اماراتی یا بین الاقوامی ڈرائیونگ لائسنس ہے تو اسے لکھیں۔ خلیج میں آمدورفت اہم ہے۔", "Ilagay ang lisensiya sa pagmamaneho sa UAE o international licence kung mayroon ka. Mahalaga ang transportasyon sa Gulpo."],
  "Add certifications recognised in the Gulf: CIPD, SHRM, PMP, NEBOSH, MOHRE, etc.": ["أضف شهاداتك المعترف بها في الخليج، مثل CIPD أو SHRM أو PMP أو NEBOSH أو MOHRE.", "खाड़ी में मान्य अपने प्रमाणपत्र जोड़ें। जैसे: CIPD, SHRM, PMP, NEBOSH या MOHRE।", "خلیج میں تسلیم شدہ اپنی اسناد شامل کریں۔ جیسے: CIPD، SHRM، PMP، NEBOSH یا MOHRE۔", "Ilagay ang mga sertipikasyon mong kinikilala sa Gulpo, gaya ng CIPD, SHRM, PMP, NEBOSH o MOHRE."],
  "Reference GCC employers, Emiratisation, free zones, or regional industry terms.": ["اذكر أصحاب العمل في دول الخليج أو التوطين أو المناطق الحرة أو مصطلحات القطاع في المنطقة إذا كانت مرتبطة بخبرتك.", "अगर आपके काम से मेल खाता है, तो खाड़ी के नियोक्ताओं, अमीरातीकरण, फ़्री ज़ोन या क्षेत्र के उद्योग की शब्दावली का ज़िक्र करें।", "اگر آپ کے کام سے متعلق ہو تو خلیجی آجروں، اماراتائزیشن، فری زونز یا خطے کی صنعت کی اصطلاحات کا ذکر کریں۔", "Banggitin ang mga employer sa Gulpo, Emiratisation, free zone o mga termino sa industriya kung kaugnay ang mga ito ng karanasan mo."],
  "Add your LinkedIn profile URL. Recruiters check it.": ["أضف رابط ملفك على LinkedIn. يراجعه مسؤولو التوظيف.", "अपने LinkedIn प्रोफ़ाइल का लिंक जोड़ें। भर्ती अधिकारी इसे देखते हैं।", "اپنے LinkedIn پروفائل کا لنک شامل کریں۔ بھرتی کرنے والے اسے دیکھتے ہیں۔", "Ilagay ang link ng LinkedIn profile mo. Tinitingnan ito ng mga recruiter."],
  "Add a clear job title (e.g. 'Senior HR Business Partner'). Company computers parse this field.": ["أضف مسمى وظيفياً واضحاً، مثل «شريك أعمال أول للموارد البشرية». تقرأ أنظمة التوظيف هذه الخانة.", "पद का साफ़ नाम जोड़ें, जैसे ‘सीनियर एचआर बिज़नेस पार्टनर’। कंपनी के भर्ती सिस्टम इस जानकारी को पढ़ते हैं।", "عہدے کا نام صاف لکھیں، جیسے ’سینئر ایچ آر بزنس پارٹنر‘۔ کمپنی کے بھرتی سسٹم یہ خانہ پڑھتے ہیں۔", "Maglagay ng malinaw na titulo sa trabaho, gaya ng ‘Senior HR Business Partner’. Binabasa ito ng recruitment software."],
  "Check that your work history and skills cover the role you want.": ["تأكد من أن خبرتك ومهاراتك تناسب الوظيفة التي تريدها.", "देखें कि आपके काम का अनुभव और कौशल आपकी पसंद की नौकरी से मेल खाते हैं।", "دیکھیں کہ آپ کا تجربہ اور مہارتیں مطلوبہ ملازمت سے ملتی ہیں۔", "Tingnan kung tugma sa gusto mong posisyon ang karanasan at kasanayan mo."],
} satisfies Record<string, Localised>;

// Order for finishing rows: English, Arabic, Hindi, Urdu, Tagalog.
const finishRows = {
  "review.finish.one": ["We tidied {count} thing", "عدد التعديلات على سيرتك الذاتية: {count}", "हमने {count} जगह सुधार की", "ہم نے {count} جگہ درست کی", "Inayos namin ang {count} detalye"],
  "review.finish.many": ["We tidied {count} things", "عدد التعديلات على سيرتك الذاتية: {count}", "हमने {count} जगहों पर सुधार किया", "ہم نے {count} جگہیں درست کیں", "Inayos namin ang {count} detalye"],
  "review.finish.details": ["View details", "عرض التفاصيل", "जानकारी देखें", "تفصیل دیکھیں", "Tingnan ang detalye"],
  "review.finish.job-order": ["Put recent jobs first.", "رتبنا الوظائف من الأحدث إلى الأقدم.", "हमने हाल की नौकरियाँ पहले रखीं।", "ہم نے حالیہ ملازمتیں پہلے رکھیں۔", "Inuna namin ang mga pinakabagong trabaho."],
  "review.finish.education-order": ["Put recent qualifications first.", "رتبنا المؤهلات من الأحدث إلى الأقدم.", "हमने हाल की योग्यताएँ पहले रखीं।", "ہم نے حالیہ تعلیمی قابلیت پہلے رکھی۔", "Inuna namin ang mga pinakabagong kwalipikasyon."],
  "review.finish.headline": ["Used your latest job title for the heading, where available.", "استخدمنا مسمى آخر وظيفة في العنوان عند توفره.", "अगर हाल का पद दर्ज था, तो हमने उसका नाम शीर्षक में रखा।", "اگر حالیہ عہدہ درج تھا تو ہم نے اسے سرخی میں لکھا۔", "Ginamit namin ang huling titulo mo sa trabaho bilang heading kung nakalista ito."],
  "review.finish.dates": ["Used the same format for work dates.", "وحدنا صيغة تواريخ العمل.", "हमने काम की तारीखें एक ही रूप में लिखीं।", "ہم نے ملازمت کی تاریخیں ایک ہی انداز میں لکھیں۔", "Gumamit kami ng iisang ayos para sa mga petsa ng trabaho."],
  "review.finish.bullet": ["Tidied work bullets and kept up to six per job.", "راجعنا نقاط الخبرة وأبقينا ست نقاط كحد أقصى لكل وظيفة.", "हमने काम के बिंदु ठीक किए और हर नौकरी में अधिकतम छह रखे।", "ہم نے کام کے نکات درست کیے اور ہر ملازمت کے لیے زیادہ سے زیادہ چھ رکھے۔", "Inayos namin ang mga bullet at nag-iwan ng hanggang anim sa bawat trabaho."],
  "review.finish.skills": ["Tidied skill names and kept up to ten skills.", "راجعنا أسماء المهارات وأبقينا عشر مهارات كحد أقصى.", "हमने कौशल के नाम ठीक किए और अधिकतम दस कौशल रखे।", "ہم نے مہارتوں کے نام درست کیے اور زیادہ سے زیادہ دس رکھیں۔", "Inayos namin ang mga pangalan ng kasanayan at nag-iwan ng hanggang sampu."],
  "review.finish.empty-sections": ["Left blank extra entries out of your CV.", "لم نعرض الخانات الإضافية الفارغة في سيرتك الذاتية.", "हमने खाली अतिरिक्त जानकारी सीवी में नहीं दिखाई।", "ہم نے خالی اضافی اندراجات سی وی میں شامل نہیں کیے۔", "Hindi namin isinama sa CV ang mga dagdag na entry na walang laman."],
  "review.finish.profile": ["Built your profile from your work, skills and languages.", "كتبنا الملف المهني من خبراتك ومهاراتك ولغاتك.", "हमने आपके काम, कौशल और भाषाओं से प्रोफ़ाइल बनाई।", "ہم نے آپ کے کام، مہارتوں اور زبانوں سے تعارف بنایا۔", "Binuo namin ang profile mula sa trabaho, kasanayan at mga wika mo."],
  "review.finish.wording": ["Left out phrases flagged by the CV language check.", "حذفنا العبارات التي لا تتوافق مع مراجعة صياغة السيرة الذاتية.", "सीवी की भाषा जाँच में जिन वाक्यांशों पर निशान लगा, उन्हें हटा दिया।", "سی وی کی زبان کی جانچ میں جن فقروں کی نشان دہی ہوئی، ہم نے انہیں ہٹا دیا۔", "Inalis namin ang mga pariralang minarkahan sa pagsusuri ng pananalita sa CV."],
} satisfies Record<`review.finish.${"one" | "many" | "details" | FinishChange["kind"]}`, Row>;

const scoreKey = (source: string) => `review.score.${source}`;

export function scoreDisplayText(source: string, t: (key: string) => string): string {
  if (!Object.prototype.hasOwnProperty.call(scoreRows, source)) return source;
  const key = scoreKey(source);
  const message = t(key);
  return message === key ? source : message;
}

function pack(locale: 0 | 1 | 2 | 3 | 4): Record<string, string> {
  const scoreIndex = (locale ? locale - 1 : 0) as 0 | 1 | 2 | 3;
  return Object.fromEntries([
    ...Object.entries(scoreRows).map(([key, value]) => [scoreKey(key), locale ? value[scoreIndex] : key]),
    ...Object.entries(finishRows).map(([key, value]) => [key, value[locale]]),
  ]);
}

export const scoreControls = {
  en: pack(0),
  ar: pack(1),
  hi: pack(2),
  ur: pack(3),
  tl: pack(4),
};
