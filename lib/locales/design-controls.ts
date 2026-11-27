// Draft interface translations. Native-speaker review is pending.
// Order: English, Arabic, Hindi, Urdu, Tagalog.
type Row = readonly [string, string, string, string, string];

const rows = {
  "design.heading": ["Choose your CV design", "اختر تصميم سيرتك الذاتية", "अपने सीवी का डिज़ाइन चुनें", "اپنے سی وی کا ڈیزائن چنیں", "Piliin ang disenyo ng CV mo"],
  "design.recommendation": ["We recommend a clear layout for {title}. You can change it at any time.", "نقترح تنسيقاً واضحاً يناسب {title}. يمكنك تغييره في أي وقت.", "{title} के लिए हम एक साफ़ डिज़ाइन सुझाते हैं। इसे कभी भी बदल सकते हैं।", "ہم ایسا صاف ڈیزائن تجویز کرتے ہیں جو {title} کے لیے موزوں ہو۔ آپ اسے کسی بھی وقت بدل سکتے ہیں۔", "Iminumungkahi namin ang malinaw na ayos para sa {title}. Maaari mo itong palitan anumang oras."],
  "design.target": ["your target job", "الوظيفة التي تريدها", "आपकी पसंद की नौकरी", "آپ کی مطلوبہ ملازمت", "trabahong inaaplayan mo"],
  "design.selected": ["Selected", "تم الاختيار", "चुना गया", "منتخب", "Napili"],
  "design.recommended": ["Recommended for your target job", "مناسب للوظيفة التي تريدها", "आपकी पसंद की नौकरी के लिए सुझाव", "آپ کی مطلوبہ ملازمت کے لیے تجویز", "Bagay sa trabahong inaaplayan mo"],
  "design.photoHidden": ["Photo hidden", "الصورة لا تظهر", "फ़ोटो नहीं दिखती", "تصویر نظر نہیں آتی", "Hindi lalabas ang larawan"],
  "design.photoOptional": ["Photo optional", "الصورة اختيارية", "फ़ोटो ज़रूरी नहीं", "تصویر اختیاری ہے", "Opsyonal ang larawan"],
  "design.photoProminent": ["Photo prominent", "الصورة بارزة", "फ़ोटो साफ़ दिखती है", "تصویر نمایاں ہے", "Kitang-kita ang larawan"],
  "design.showAll": ["See all CV designs", "عرض كل تصاميم السيرة الذاتية", "सीवी के सभी डिज़ाइन देखें", "سی وی کے تمام ڈیزائن دیکھیں", "Tingnan ang lahat ng disenyo ng CV"],
  "design.documentLanguage": ["CV document language", "لغة ملف السيرة الذاتية", "सीवी दस्तावेज़ की भाषा", "سی وی دستاویز کی زبان", "Wika ng dokumento ng CV"],
  "design.documentLanguageHelp": ["This changes headings and layout direction. Your own content stays unchanged.", "يغيّر هذا العناوين واتجاه التنسيق. يبقى محتواك كما كتبته.", "इससे शीर्षक और डिज़ाइन की दिशा बदलती है। आपने जो लिखा है वह नहीं बदलता।", "اس سے عنوان اور ترتیب کی سمت بدلتی ہے۔ آپ کا لکھا ہوا مواد نہیں بدلتا۔", "Magbabago ang mga heading at direksiyon ng ayos. Hindi magbabago ang isinulat mo."],
  "design.formatEnglish": ["English, left to right", "الإنجليزية، من اليسار إلى اليمين", "अंग्रेज़ी, बाएँ से दाएँ", "انگریزی، بائیں سے دائیں", "English, kaliwa pakanan"],
  "design.formatArabic": ["العربية، من اليمين إلى اليسار", "العربية، من اليمين إلى اليسار", "अरबी, दाएँ से बाएँ", "عربی، دائیں سے بائیں", "Arabic, kanan pakaliwa"],
  "design.sameSample": ["The same sample data is used in every preview for a fair comparison.", "تستخدم كل المعاينات المعلومات النموذجية نفسها لتسهيل المقارنة.", "ताकि आप ठीक से तुलना कर सकें, हर झलक में वही नमूना जानकारी दिखती है।", "آسان موازنے کے لیے ہر جھلک میں نمونے کی ایک ہی معلومات دکھائی جاتی ہیں۔", "Pareho ang halimbawang impormasyon sa bawat preview para madali mong maikumpara ang mga disenyo."],
  "design.tipTitle": ["HR Career Specialist Tip", "نصيحة من أخصائي المسار المهني في الموارد البشرية", "एचआर करियर विशेषज्ञ की सलाह", "ایچ آر کیریئر ماہر کی تجویز", "Payo ng HR Career Specialist"],
  "design.tip": ["In the Gulf/MENA region, including a professional photo on your CV is standard practice. In Europe and North America, it's generally discouraged. Choose a template that matches your target market.", "من المعتاد وضع صورة مهنية على سيرتك الذاتية في الخليج والشرق الأوسط وشمال أفريقيا. في أوروبا وأمريكا الشمالية لا يُنصح بذلك عادةً. اختر تصميماً يناسب المكان الذي تتقدم للعمل فيه.", "खाड़ी, मध्य पूर्व और उत्तरी अफ़्रीका में सीवी पर प्रोफ़ेशनल फ़ोटो लगाना आम है। यूरोप और उत्तरी अमेरिका में आम तौर पर इसकी सलाह नहीं दी जाती। जिस जगह नौकरी के लिए आवेदन कर रहे हैं, उसके हिसाब से डिज़ाइन चुनें।", "خلیج، مشرقِ وسطیٰ اور شمالی افریقہ میں سی وی پر پیشہ ورانہ تصویر لگانا عام ہے۔ یورپ اور شمالی امریکا میں عموماً اس کا مشورہ نہیں دیا جاتا۔ جہاں درخواست دے رہے ہیں، اس کے مطابق ڈیزائن چنیں۔", "Karaniwan ang propesyonal na larawan sa CV sa Gulpo, Gitnang Silangan at Hilagang Aprika. Sa Europa at Hilagang Amerika, kadalasang hindi ito ipinapayo. Pumili ng disenyong bagay sa lugar na inaaplayan mo."],
  "design.description.ats-clean": ["Compact single-column layout with centred contact details and blue section rules.", "تصميم مختصر بعمود واحد، تتوسطه بيانات الاتصال وتفصل بين أقسامه خطوط زرقاء.", "एक कॉलम का छोटा डिज़ाइन। संपर्क की जानकारी बीच में और भागों के बीच नीली रेखाएँ हैं।", "ایک کالم کا مختصر ڈیزائن۔ رابطے کی تفصیل درمیان میں ہے اور حصوں کے بیچ نیلی لکیریں ہیں۔", "Siksik na ayos na may isang column. Nasa gitna ang detalye sa pakikipag-ugnayan at may mga asul na guhit sa pagitan ng mga seksiyon."],
  "design.description.classic": ["Balanced Gulf format for broad professional use.", "تصميم متوازن يناسب مختلف الوظائف في الخليج.", "खाड़ी में अलग-अलग तरह की नौकरियों के लिए संतुलित डिज़ाइन।", "خلیج میں مختلف ملازمتوں کے لیے متوازن ڈیزائن۔", "Balanseng ayos para sa iba't ibang uri ng trabaho sa Gulpo."],
  "design.description.site": ["Construction and engineering, with licences and projects first.", "للبناء والهندسة، مع عرض التراخيص والمشاريع أولاً.", "निर्माण और इंजीनियरिंग के लिए। लाइसेंस और प्रोजेक्ट पहले दिखते हैं।", "تعمیرات اور انجینئرنگ کے لیے۔ لائسنس اور منصوبے پہلے نظر آتے ہیں۔", "Para sa konstruksiyon at engineering. Nauuna ang mga lisensiya at proyekto."],
  "design.description.service": ["Hospitality and F&B, with languages and employers prominent.", "للضيافة والأغذية والمشروبات، مع إبراز اللغات وأماكن العمل.", "होटल और खान-पान की नौकरियों के लिए। भाषाएँ और नियोक्ता साफ़ दिखते हैं।", "مہمان نوازی اور کھانے پینے کی خدمات کے لیے۔ زبانیں اور آجر نمایاں ہیں۔", "Para sa hospitality at pagkain at inumin. Kapansin-pansin ang mga wika at employer."],
  "design.description.care": ["Healthcare, with DHA, DOH, MOH and clinical skills prioritised.", "للرعاية الصحية، مع التركيز على DHA وDOH وMOH والمهارات السريرية.", "स्वास्थ्य सेवाओं के लिए। DHA, DOH, MOH और मरीज़ों की देखभाल के कौशल पहले दिखते हैं।", "صحت کی دیکھ بھال کے لیے۔ DHA، DOH، MOH اور مریضوں کی دیکھ بھال کی مہارتیں پہلے نظر آتی ہیں۔", "Para sa pangangalagang pangkalusugan. Nauuna ang DHA, DOH, MOH at mga kasanayan sa pag-aalaga ng pasyente."],
  "design.description.ledger": ["Banking and finance, conservative and compliance-led.", "للبنوك والتمويل، بتصميم رسمي يبرز الالتزام باللوائح.", "बैंकिंग और वित्त के लिए सादा डिज़ाइन। नियमों के पालन पर ज़ोर है।", "بینکنگ اور مالیات کے لیے سادہ ڈیزائن۔ قواعد کی پابندی کو اہمیت دیتا ہے۔", "Para sa bangko at pananalapi. Pormal ang ayos at binibigyang-diin ang pagsunod sa mga tuntunin."],
  "design.description.crew": ["Aviation and service roles, with photo and languages supported.", "لوظائف الطيران والخدمات، مع مساحة للصورة واللغات.", "विमानन और सेवा की नौकरियों के लिए। फ़ोटो और भाषाएँ जोड़ सकते हैं।", "ہوابازی اور خدمات کی ملازمتوں کے لیے۔ تصویر اور زبانیں شامل کر سکتے ہیں۔", "Para sa trabaho sa eroplano at serbisyo. Maaaring maglagay ng larawan at mga wika."],
  "design.description.stack": ["Technology roles, with skills and projects surfaced early.", "لوظائف التقنية، مع عرض المهارات والمشاريع في البداية.", "टेक्नोलॉजी की नौकरियों के लिए। कौशल और प्रोजेक्ट शुरुआत में दिखते हैं।", "ٹیکنالوجی کی ملازمتوں کے لیے۔ مہارتیں اور منصوبے شروع میں نظر آتے ہیں۔", "Para sa trabaho sa teknolohiya. Makikita agad ang mga kasanayan at proyekto."],
  "design.description.move": ["Logistics and retail, with licences, systems and availability.", "للخدمات اللوجستية والتجزئة، مع مساحة للتراخيص والأنظمة وموعد بدء العمل.", "लॉजिस्टिक्स और खुदरा काम के लिए। लाइसेंस, आपके इस्तेमाल के सिस्टम और काम शुरू करने का समय दिखता है।", "رسد اور پرچون کے کام کے لیے۔ لائسنس، استعمال کیے گئے سسٹم اور کام شروع کرنے کا وقت نظر آتے ہیں۔", "Para sa logistics at retail. Makikita ang mga lisensiya, sistemang ginagamit mo at kung kailan ka puwedeng magsimula."],
  "design.description.corner": ["Executive and management CV with board-level authority.", "سيرة ذاتية للمديرين والقيادات التنفيذية العليا.", "वरिष्ठ प्रबंधन और बोर्ड स्तर की नौकरियों के लिए सीवी।", "اعلیٰ انتظامی اور بورڈ کی سطح کی ملازمتوں کے لیے سی وی۔", "CV para sa mga tagapamahala at ehekutibo, kasama ang mga tungkulin sa lupon."],
} satisfies Record<string, Row>;

function pack(index: 0 | 1 | 2 | 3 | 4): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, value[index]]));
}

export const designControls = {
  en: pack(0),
  ar: pack(1),
  hi: pack(2),
  ur: pack(3),
  tl: pack(4),
};
