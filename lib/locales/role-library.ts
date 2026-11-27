import { getRoleFamilies } from "../role-suggestions";
import { getRoleExamplesForFamily } from "../role-examples";
import { translatedRoleSentenceSources } from "./role-sentence-source";
import { roleLabelCompletion } from "./role-label-completion";
import { serviceRoleSentenceBatch } from "./role-sentence-batch-service";
import { operationsRoleSentenceRows } from "./role-sentence-batch-operations";
import { tradeRoleSentenceRows } from "./role-sentence-batch-trades";
import { legacyRoleSentenceRows } from "./role-sentence-batch-legacy";

export const newRoleSentenceTranslations = {
  ...serviceRoleSentenceBatch,
  ...operationsRoleSentenceRows,
  ...tradeRoleSentenceRows,
  ...legacyRoleSentenceRows,
};

// Machine-translated first pass. Native-speaker review pending for ar, hi, ur and tl.
// Keep the existing English library as the source of truth. Translation rows use
// Arabic, Hindi, Urdu and Filipino, in that order. No English fallback in these packs.
type Row = readonly [string, string, string, string];
const labels: Record<string, Row> = {
  "kitchen-steward": ["تنظيف المطبخ والأواني", "रसोई और बर्तन की सफ़ाई", "باورچی خانے اور برتنوں کی صفائی", "Paglilinis ng kusina at mga gamit"],
  housekeeping: ["تنظيف الغرف", "कमरों की सफ़ाई", "کمروں کی صفائی", "Housekeeping"],
  "food-service": ["المطاعم وتقديم الطعام", "रेस्तराँ और भोजन सेवा", "ریستوران اور کھانے کی خدمت", "Serbisyo sa restawran"],
  culinary: ["الطهي وعمل المطبخ", "खाना पकाना और रसोई का काम", "کھانا پکانا اور باورچی خانے کا کام", "Pagluluto at trabaho sa kusina"],
  "front-office": ["استقبال الفندق", "होटल का रिसेप्शन", "ہوٹل کا استقبالیہ", "Pagtanggap ng bisita sa hotel"],
  hr: ["الموارد البشرية", "मानव संसाधन", "انسانی وسائل", "Human resources"],
  administration: ["الإدارة والاستقبال", "दफ़्तर और रिसेप्शन", "دفتر اور استقبالیہ", "Trabaho sa opisina at reception"],
  "retail-sales": ["المتاجر والمبيعات", "दुकान और बिक्री", "دکان اور فروخت", "Pagtitinda at pagbebenta"],
  "customer-service": ["خدمة العملاء", "ग्राहक सेवा", "گاہکوں کی خدمت", "Pag-asikaso sa customer"],
  security: ["الأمن", "सुरक्षा", "سیکیورٹی", "Seguridad"],
  driver: ["القيادة والتوصيل", "ड्राइविंग और डिलीवरी", "ڈرائیونگ اور ڈیلیوری", "Pagmamaneho at paghahatid"],
  warehouse: ["المستودعات ونقل البضائع", "गोदाम और माल की ढुलाई", "گودام اور سامان کی ترسیل", "Bodega at paghahatid ng mga produkto"],
  cleaning: ["التنظيف", "सफ़ाई", "صفائی", "Paglilinis"],
  healthcare: ["المساعدة في الرعاية الصحية", "स्वास्थ्य सेवा में सहायता", "صحت کی دیکھ بھال میں مدد", "Pagtulong sa pangangalaga ng pasyente"],
  construction: ["البناء والعمل في الموقع", "निर्माण और साइट का काम", "تعمیرات اور سائٹ کا کام", "Konstruksiyon at trabaho sa site"],
  finance: ["المالية والحسابات", "वित्त और खाते", "مالیات اور حسابات", "Pananalapi at accounting"],
  technology: ["التقنية", "तकनीक", "ٹیکنالوجی", "Teknolohiya"],
  general: ["أعمال عامة", "सामान्य काम", "عام کام", "Pangkalahatang trabaho"],
};
const titles: Record<string, Row> = {
  housekeeping: ["موظف تنظيف الغرف", "रूम अटेंडेंट", "روم اٹینڈنٹ", "Room Attendant"],
  "kitchen-steward": ["عامل تنظيف المطبخ", "किचन स्टीवर्ड", "کچن اسٹیورڈ", "Kitchen Steward"],
  "food-service": ["نادل", "वेटर", "ویٹر", "Waiter"],
  culinary: ["مساعد طاهٍ", "सहायक शेफ़", "معاون شیف", "Commis Chef"],
  "front-office": ["موظف استقبال", "फ़्रंट डेस्क एजेंट", "فرنٹ ڈیسک ایجنٹ", "Front Desk Agent"],
  hr: ["مساعد موارد بشرية", "एचआर सहायक", "ایچ آر اسسٹنٹ", "HR Assistant"],
  administration: ["مساعد مكتب", "दफ़्तर सहायक", "دفتر کا معاون", "Office Assistant"],
  security: ["حارس أمن", "सुरक्षा गार्ड", "سیکیورٹی گارڈ", "Security Guard"],
  driver: ["سائق", "ड्राइवर", "ڈرائیور", "Driver"],
  cleaning: ["عامل نظافة", "सफ़ाई कर्मचारी", "صفائی کا کارکن", "Cleaner"],
  "retail-sales": ["مساعد متجر", "दुकान सहायक", "دکان کا معاون", "Shop Assistant"],
  "customer-service": ["موظف خدمة عملاء", "ग्राहक सेवा कर्मचारी", "کسٹمر سروس کارکن", "Customer Service Agent"],
  warehouse: ["مساعد مستودع", "गोदाम सहायक", "گودام کا معاون", "Warehouse Assistant"],
  construction: ["عامل موقع", "साइट कर्मचारी", "سائٹ کا کارکن", "Site Worker"],
  healthcare: ["مساعد رعاية صحية", "स्वास्थ्य सेवा सहायक", "صحت کی دیکھ بھال کا معاون", "Healthcare Assistant"],
  finance: ["مساعد حسابات", "अकाउंट्स सहायक", "اکاؤنٹس کا معاون", "Accounts Assistant"],
  technology: ["مساعد دعم تقني", "आईटी सहायता कर्मचारी", "آئی ٹی مدد کا کارکن", "IT Support Assistant"],
  general: ["المسمى الوظيفي الخاص بك", "आपके पद का नाम", "آپ کے عہدے کا نام", "Pangalan ng trabaho mo"],
};
const workplaces: Record<string, Row> = {
  housekeeping: ["فندق خمس نجوم، دبي", "पाँच सितारा होटल, दुबई", "پانچ ستارہ ہوٹل، دبئی", "5-star hotel, Dubai"],
  "kitchen-steward": ["مطبخ فندق", "होटल की रसोई", "ہوٹل کا باورچی خانہ", "Kusina ng hotel"],
  "food-service": ["مطعم", "रेस्तराँ", "ریستوران", "Restawran"],
  culinary: ["مطبخ فندق", "होटल की रसोई", "ہوٹل کا باورچی خانہ", "Kusina ng hotel"],
  "front-office": ["فندق", "होटल", "ہوٹل", "Hotel"],
  hr: ["قسم الموارد البشرية", "एचआर विभाग", "ایچ آر کا شعبہ", "HR department"],
  administration: ["مكتب", "दफ़्तर", "دفتر", "Opisina"],
  security: ["شركة أمن", "सुरक्षा कंपनी", "سیکیورٹی کمپنی", "Kompanya ng seguridad"],
  driver: ["شركة نقل", "परिवहन कंपनी", "ٹرانسپورٹ کمپنی", "Kompanya ng transportasyon"],
  cleaning: ["شركة تنظيف", "सफ़ाई कंपनी", "صفائی کی کمپنی", "Kompanya ng paglilinis"],
  "retail-sales": ["متجر", "दुकान", "دکان", "Tindahan"],
  "customer-service": ["مركز خدمة", "सेवा केंद्र", "سروس سینٹر", "Sentro ng serbisyo"],
  warehouse: ["مستودع", "गोदाम", "گودام", "Bodega"],
  construction: ["شركة مقاولات", "निर्माण ठेकेदार", "تعمیراتی ٹھیکیدار", "Kontraktor sa konstruksiyon"],
  healthcare: ["عيادة", "क्लिनिक", "کلینک", "Klinika"],
  finance: ["مكتب حسابات", "अकाउंट्स का दफ़्तर", "اکاؤنٹس کا دفتر", "Opisina ng accounting"],
  technology: ["شركة تقنية", "आईटी कंपनी", "آئی ٹی کمپنی", "Kompanya ng IT"],
  general: ["مكان عملك", "आपका कार्यस्थल", "آپ کے کام کی جگہ", "Pinagtatrabahuhan mo"],
};
const sentences: Record<string, readonly Row[]> = {
  "retail-sales": [
    ["ساعدت العملاء في اختيار المنتجات حسب احتياجاتهم وميزانيتهم.", "ग्राहकों की ज़रूरत और बजट के अनुसार सामान चुनने में मदद की।", "گاہکوں کی ضرورت اور بجٹ کے مطابق سامان چننے میں مدد کی۔", "Tumulong sa customer na pumili ng produkto ayon sa pangangailangan at budget."],
    ["أنجزت المدفوعات النقدية وبالبطاقات وأصدرت الإيصالات.", "नकद और कार्ड भुगतान पूरे किए और रसीदें दीं।", "نقد اور کارڈ کی ادائیگیاں مکمل کیں اور رسیدیں دیں۔", "Pinroseso ang bayad na cash at card at nagbigay ng resibo."],
    ["أعدت تعبئة الرفوف وحافظت على نظافة عروض المنتجات ودقتها.", "शेल्फ़ भरे और उत्पादों का प्रदर्शन साफ़ और सही रखा।", "شیلف بھرے اور مصنوعات کی نمائش صاف اور درست رکھی۔", "Naglagay ng stock sa estante at pinanatiling malinis at tama ang display."],
    ["راجعت الأسعار والملصقات والمخزون وأبلغت عن الفروقات.", "कीमतें, लेबल और स्टॉक जाँचे और अंतर बताया।", "قیمتیں، لیبل اور اسٹاک جانچا اور فرق بتایا۔", "Sinuri ang presyo, label at stock at iniulat ang pagkakaiba."],
    ["تعاملت مع الإرجاع ومشكلات العملاء وفق سياسة المتجر.", "दुकान के नियमों के अनुसार वापसी और ग्राहक की समस्याएँ संभालीं।", "دکان کے اصولوں کے مطابق واپسی اور گاہک کے مسائل سنبھالے۔", "Inasikaso ang pagbabalik ng produkto at problema ng customer ayon sa patakaran ng tindahan."],
    ["قدّمت معلومات المنتجات والعروض الحالية للعملاء.", "ग्राहकों को उत्पादों और मौजूदा ऑफ़र की जानकारी दी।", "گاہکوں کو مصنوعات اور موجودہ آفر کی معلومات دیں۔", "Nagbigay ng impormasyon tungkol sa produkto at kasalukuyang alok sa customer."],
  ],
  "customer-service": [
    ["أجبت عن أسئلة العملاء وشرحت الخدمة المتاحة أو الخطوة التالية.", "ग्राहकों के सवालों के जवाब दिए और सेवा या अगला कदम समझाया।", "گاہکوں کے سوالوں کے جواب دیے اور خدمت یا اگلا قدم سمجھایا۔", "Sinagot ang tanong ng customer at ipinaliwanag ang serbisyo o susunod na hakbang."],
    ["سجّلت كل طلب وحافظت على دقة بيانات العملاء.", "हर अनुरोध दर्ज किया और ग्राहक की जानकारी सही रखी।", "ہر درخواست درج کی اور گاہک کی معلومات درست رکھیں۔", "Itinala ang bawat hiling at pinanatiling tama ang detalye ng customer."],
    ["تعاملت مع الشكاوى وفق قواعد الشركة وأحلت الصعب منها إلى المشرف.", "कंपनी के नियमों में शिकायतें संभालीं और कठिन मामले सुपरवाइज़र को भेजे।", "کمپنی کے اصولوں میں شکایات سنبھالیں اور مشکل معاملات سپروائزر کو بھیجے۔", "Inasikaso ang reklamo ayon sa tuntunin ng kompanya at ipinasa sa supervisor ang mahirap na kaso."],
    ["تابعت الطلبات المفتوحة وأطلعت العملاء على المستجدات.", "खुले अनुरोधों का फ़ॉलो-अप किया और ग्राहकों को जानकारी देते रहे।", "کھلی درخواستوں کا فالو اپ کیا اور گاہکوں کو معلومات دیتے رہے۔", "Sinubaybayan ang hindi pa tapos na hiling at nagbigay ng balita sa customer."],
    ["حدّثت الحالات والملاحظات والنتائج باستخدام نظام الشركة.", "कंपनी सिस्टम में मामलों, नोट्स और नतीजों को अपडेट किया।", "کمپنی کے نظام میں معاملات، نوٹس اور نتائج اپ ڈیٹ کیے۔", "Inayos ang mga kaso, tala at resulta gamit ang sistema ng kompanya."],
    ["عملت مع فرق أخرى لحل مشكلات العملاء.", "ग्राहकों की समस्याएँ हल करने के लिए अन्य टीमों के साथ काम किया।", "گاہکوں کے مسائل حل کرنے کے لیے دوسری ٹیموں کے ساتھ کام کیا۔", "Nakipagtulungan sa ibang team para malutas ang problema ng customer."],
  ],
  security: [
    ["راقبت المداخل وفحصت السماح بالدخول وفق قواعد الموقع.", "प्रवेश की जगहों पर नज़र रखी और साइट के नियमों के अनुसार आने वालों को जाँचा।", "داخلے کی جگہوں پر نظر رکھی اور سائٹ کے اصولوں کے مطابق آنے والوں کو جانچا۔", "Binantayan ang pasukan at sinuri ang pahintulot sa pagpasok ayon sa tuntunin ng site."],
    ["درت في المناطق المكلّف بها وسجّلت مخاوف السلامة والأمن.", "तय जगहों पर गश्त की और सुरक्षा की चिंताएँ दर्ज कीं।", "مقررہ جگہوں پر گشت کیا اور حفاظت کے خدشات درج کیے۔", "Nagpatrolya sa nakatalagang lugar at itinala ang problema sa kaligtasan o seguridad."],
    ["استجبت للحوادث واتصلت بالمشرف أو خدمات الطوارئ عند الحاجة.", "घटनाओं पर कार्रवाई की और ज़रूरत पर सुपरवाइज़र या आपात सेवा से संपर्क किया।", "واقعات پر کارروائی کی اور ضرورت پر سپروائزر یا ہنگامی خدمت سے رابطہ کیا۔", "Tumugon sa insidente at tumawag sa supervisor o emergency service kung kailangan."],
    ["أكملت تسليم الورديات وتقارير الحوادث بوضوح.", "शिफ़्ट सौंपने और घटनाओं की रिपोर्ट साफ़ तौर पर पूरी की।", "شفٹ حوالگی اور واقعات کی رپورٹ واضح طور پر مکمل کی۔", "Kinumpleto ang malinaw na handover at ulat ng insidente."],
    ["راقبت كاميرات المراقبة وأبلغت عن النشاط غير المعتاد.", "सीसीटीवी देखा और असामान्य गतिविधि बताई।", "سی سی ٹی وی دیکھا اور غیر معمولی سرگرمی بتائی۔", "Nagmonitor ng CCTV at iniulat ang kakaibang gawain."],
    ["ساعدت الزوار والموظفين على اتباع إجراءات السلامة في الموقع.", "आगंतुकों और कर्मचारियों को साइट की सुरक्षा प्रक्रिया मानने में मदद की।", "آنے والوں اور ملازمین کو سائٹ کے حفاظتی طریقے اپنانے میں مدد کی۔", "Tumulong sa bisita at empleyado na sundin ang mga hakbang sa kaligtasan ng site."],
  ],
  driver: [
    ["فحصت المركبة يومياً وأبلغت عن الأعطال قبل بدء العمل.", "रोज़ गाड़ी जाँची और काम शुरू होने से पहले ख़राबी बताई।", "روز گاڑی جانچی اور کام شروع ہونے سے پہلے خرابی بتائی۔", "Sinuri ang sasakyan araw-araw at iniulat ang sira bago magsimula."],
    ["خطّطت للمسارات وأكملت الرحلات ضمن الجدول المتفق عليه.", "रास्ते तय किए और सहमत समय के अनुसार यात्राएँ पूरी कीं।", "راستے طے کیے اور طے شدہ وقت کے مطابق سفر مکمل کیے۔", "Nagplano ng ruta at natapos ang biyahe sa napagkasunduang oras."],
    ["حمّلت البضائع وثبّتها وسلّمتها مع الوثائق المطلوبة.", "सामान लादा, सुरक्षित बाँधा और ज़रूरी दस्तावेज़ों के साथ पहुँचाया।", "سامان لادا، محفوظ باندھا اور ضروری دستاویزات کے ساتھ پہنچایا۔", "Ikinarga, siniguro at inihatid ang mga gamit kasama ang kailangang dokumento."],
    ["حافظت على نظافة المركبة وسجّلات الوقود والمسافة.", "गाड़ी साफ़ रखी और ईंधन और दूरी के रिकॉर्ड रखे।", "گاڑی صاف رکھی اور ایندھن اور فاصلے کے ریکارڈ رکھے۔", "Pinanatiling malinis ang sasakyan at itinala ang gasolina at kilometrahe."],
    ["اتبعت قواعد السلامة على الطريق وإجراءات القيادة في الشركة.", "सड़क सुरक्षा और कंपनी की ड्राइविंग प्रक्रिया का पालन किया।", "سڑک کی حفاظت اور کمپنی کے ڈرائیونگ طریقے اپنائے۔", "Sinunod ang kaligtasan sa kalsada at mga tuntunin ng kompanya sa pagmamaneho."],
    ["أكّدت التسليمات وأبلغت مسؤول التنسيق عن التأخير.", "डिलीवरी की पुष्टि की और डिस्पैचर को देरी बताई।", "ڈیلیوری کی تصدیق کی اور ڈسپیچر کو تاخیر بتائی۔", "Kinumpirma ang paghahatid at ipinaalam sa dispatcher ang pagkaantala."],
  ],
  warehouse: [
    ["استلمت البضائع وراجعت الكميات مقابل وثائق التسليم.", "सामान प्राप्त किया और डिलीवरी दस्तावेज़ों से मात्रा मिलाई।", "سامان وصول کیا اور ڈیلیوری کے دستاویزات سے مقدار ملائی۔", "Tumanggap ng produkto at sinuri ang dami laban sa dokumento ng paghahatid."],
    ["خزّنت البضائع في المكان الصحيح وأبقيت الممرات خالية وآمنة.", "सामान सही जगह रखा और रास्ते खुले और सुरक्षित रखे।", "سامان درست جگہ رکھا اور راستے کھلے اور محفوظ رکھے۔", "Inimbak ang gamit sa tamang lugar at pinanatiling maluwag at ligtas ang daanan."],
    ["جهّزت الطلبات وعبّأتها وفحصت كل صنف قبل الإرسال.", "ऑर्डर चुने और पैक किए और भेजने से पहले हर सामान जाँचा।", "آرڈر چنے اور پیک کیے اور بھیجنے سے پہلے ہر سامان جانچا۔", "Pumili at nagbalot ng order at sinuri ang bawat produkto bago ipadala."],
    ["حدّثت سجلات المخزون وأبلغت عن البضائع المفقودة أو التالفة.", "स्टॉक रिकॉर्ड अपडेट किए और गायब या ख़राब सामान बताया।", "اسٹاک کے ریکارڈ اپ ڈیٹ کیے اور غائب یا خراب سامان بتایا۔", "Inayos ang rekord ng stock at iniulat ang kulang o sirang produkto."],
    ["استخدمت معدات المناولة وفق إجراءات السلامة.", "सुरक्षा प्रक्रिया के अनुसार सामान उठाने के उपकरण इस्तेमाल किए।", "حفاظتی طریقے کے مطابق سامان اٹھانے کے آلات استعمال کیے۔", "Gumamit ng kagamitan sa pagbuhat ayon sa mga hakbang sa kaligtasan."],
    ["ساعدت في جرد المخزون وبحثت الفروقات مع الفريق.", "स्टॉक गिनने में मदद की और टीम के साथ अंतर की जाँच की।", "اسٹاک گننے میں مدد کی اور ٹیم کے ساتھ فرق کی جانچ کی۔", "Tumulong sa pagbilang ng stock at sinuri ang pagkakaiba kasama ang team."],
  ],
  cleaning: [
    ["نظّفت المناطق المكلّف بها وفق المعيار والجدول المطلوبين.", "तय जगहों की निर्धारित स्तर और समय के अनुसार सफ़ाई की।", "مقررہ جگہوں کی طے شدہ معیار اور وقت کے مطابق صفائی کی۔", "Nilinis ang nakatalagang lugar ayon sa pamantayan at iskedyul."],
    ["كنست ومسحت ونفضت الغبار وعقّمت الأسطح بالمعدات الصحيحة.", "सही उपकरणों से झाड़ू, पोछा, धूल की सफ़ाई और सतहों को कीटाणुरहित किया।", "درست آلات سے جھاڑو، پوچا، گرد کی صفائی اور سطحوں کو جراثیم سے پاک کیا۔", "Nagwalis, nagmop, nag-alis ng alikabok at nagsanitise ng ibabaw gamit ang tamang kagamitan."],
    ["استخدمت مواد التنظيف وفق الملصقات وتعليمات السلامة.", "लेबल और सुरक्षा निर्देशों के अनुसार सफ़ाई रसायन इस्तेमाल किए।", "لیبل اور حفاظتی ہدایات کے مطابق صفائی کے کیمیکلز استعمال کیے۔", "Gumamit ng panlinis ayon sa label at mga tagubilin sa kaligtasan."],
    ["أزلت النفايات وحافظت على نظافة الحاويات ومناطق الخدمة.", "कचरा हटाया और डिब्बे और सेवा की जगहें साफ़ रखीं।", "کچرا ہٹایا اور ڈبے اور خدمت کی جگہیں صاف رکھیں۔", "Nag-alis ng basura at pinanatiling malinis ang basurahan at lugar ng serbisyo."],
    ["أبلغت المشرف عن مشكلات الصيانة والتلف ونقص المخزون.", "सुपरवाइज़र को मरम्मत की समस्या, नुकसान और कम स्टॉक बताया।", "سپروائزر کو مرمت کے مسئلے، نقصان اور کم اسٹاک کی اطلاع دی۔", "Ipinaalam sa supervisor ang problema sa maintenance, pinsala at kulang na stock."],
    ["وضعت علامات التحذير وحافظت على سلامة مناطق العمل أثناء التنظيف.", "चेतावनी के संकेत लगाए और सफ़ाई के दौरान काम की जगह सुरक्षित रखी।", "انتباہی نشان لگائے اور صفائی کے دوران کام کی جگہ محفوظ رکھی۔", "Naglagay ng babala at pinanatiling ligtas ang lugar habang naglilinis."],
  ],
  healthcare: [
    ["ساعدت المرضى في الرعاية اليومية مع حماية خصوصيتهم وكرامتهم.", "मरीज़ों की निजता और गरिमा रखते हुए रोज़ की देखभाल में मदद की।", "مریضوں کی رازداری اور وقار رکھتے ہوئے روز کی دیکھ بھال میں مدد کی۔", "Tumulong sa araw-araw na pangangalaga ng pasyente habang iginagalang ang privacy at dignidad nila."],
    ["سجّلت الملاحظات وأبلغت المختص الطبي المسؤول عن التغيّرات.", "निरीक्षण दर्ज किए और ज़िम्मेदार चिकित्सक को बदलाव बताए।", "مشاہدات درج کیے اور ذمہ دار طبی ماہر کو تبدیلیاں بتائیں۔", "Itinala ang napansin at iniulat ang pagbabago sa namamahalang clinician."],
    ["اتبعت إجراءات منع العدوى ونظافة اليدين والتخلّص من النفايات.", "संक्रमण रोकने, हाथ साफ़ रखने और कचरा हटाने की प्रक्रिया अपनाई।", "انفیکشن روکنے، ہاتھ صاف رکھنے اور کچرا ہٹانے کے طریقے اپنائے۔", "Sinunod ang pag-iwas sa impeksiyon, kalinisan ng kamay at pagtatapon ng basura."],
    ["جهّزت الغرف والمعدات والمستلزمات لرعاية المرضى.", "मरीज़ों की देखभाल के लिए कमरे, उपकरण और सामग्री तैयार की।", "مریضوں کی دیکھ بھال کے لیے کمرے، آلات اور سامان تیار کیا۔", "Inihanda ang kuwarto, kagamitan at gamit para sa pangangalaga ng pasyente."],
    ["شرحت الخطوات المعتادة للمرضى وأجبت عن أسئلتهم بعناية.", "मरीज़ों को रोज़ के कदम समझाए और ध्यान से सवालों के जवाब दिए।", "مریضوں کو روز کے اقدامات سمجھائے اور توجہ سے سوالوں کے جواب دیے۔", "Ipinaliwanag ang karaniwang hakbang sa pasyente at sinagot ang tanong nang may pag-aalaga."],
    ["حافظت على دقة بيانات المرضى وسريتها.", "मरीज़ों की जानकारी सही और गोपनीय रखी।", "مریضوں کی معلومات درست اور راز میں رکھیں۔", "Pinanatiling tama at kumpidensiyal ang impormasyon ng pasyente."],
  ],
  construction: [
    ["أكملت العمل المكلّف به وفق الرسومات والتعليمات وجداول الموقع.", "चित्रों, निर्देशों और साइट के समय के अनुसार तय काम पूरा किया।", "نقشوں، ہدایات اور سائٹ کے اوقات کے مطابق مقررہ کام مکمل کیا۔", "Natapos ang gawain ayon sa drawing, tagubilin at iskedyul ng site."],
    ["فحصت الأدوات والمعدات قبل استخدامها وأبلغت عن الأعطال.", "इस्तेमाल से पहले औज़ार और उपकरण जाँचे और ख़राबी बताई।", "استعمال سے پہلے اوزار اور آلات جانچے اور خرابی بتائی۔", "Sinuri ang gamit at kagamitan bago gamitin at iniulat ang sira."],
    ["اتبعت قواعد السلامة في الموقع واستخدمت معدات الحماية المطلوبة.", "साइट के सुरक्षा नियम माने और ज़रूरी सुरक्षा उपकरण पहने।", "سائٹ کے حفاظتی اصول اپنائے اور ضروری حفاظتی آلات پہنے۔", "Sinunod ang kaligtasan sa site at gumamit ng kailangang protective equipment."],
    ["قست المواد وفحصت العمل المكتمل وفق المتطلبات.", "सामग्री मापी और पूरा काम ज़रूरतों के अनुसार जाँचा।", "سامان ناپا اور مکمل کام ضروریات کے مطابق جانچا۔", "Sinukat ang materyales at sinuri ang natapos na trabaho ayon sa kailangan."],
    ["حافظت على نظافة مكان العمل وخزّنت الأدوات والمواد بأمان.", "काम की जगह साफ़ रखी और औज़ार और सामग्री सुरक्षित रखे।", "کام کی جگہ صاف رکھی اور اوزار اور سامان محفوظ رکھے۔", "Pinanatiling malinis ang lugar at ligtas na itinabi ang gamit at materyales."],
    ["أبلغت المشرف عن التقدّم والتأخير ومخاوف السلامة.", "सुपरवाइज़र को प्रगति, देरी और सुरक्षा की चिंताएँ बताईं।", "سپروائزر کو پیش رفت، تاخیر اور حفاظت کے خدشات بتائے۔", "Ipinaalam sa supervisor ang progreso, pagkaantala at problema sa kaligtasan."],
  ],
  finance: [
    ["راجعت الفواتير والوثائق الداعمة قبل تسجيل المعاملات.", "लेन-देन दर्ज करने से पहले बिल और संबंधित दस्तावेज़ जाँचे।", "لین دین درج کرنے سے پہلے بل اور متعلقہ دستاویزات جانچے۔", "Sinuri ang invoice at kalakip na dokumento bago itala ang transaksiyon."],
    ["حدّثت السجلات المالية وصحّحت الفروقات بالوثائق الداعمة.", "वित्तीय रिकॉर्ड अपडेट किए और प्रमाण के साथ अंतर ठीक किए।", "مالی ریکارڈ اپ ڈیٹ کیے اور ثبوت کے ساتھ فرق درست کیے۔", "Inayos ang rekord ng pananalapi at itinama ang pagkakaiba gamit ang ebidensiya."],
    ["أعددت تقارير الحسابات أو المدفوعات أو المصروفات للمراجعة.", "समीक्षा के लिए खाते, भुगतान या ख़र्च की रिपोर्ट तैयार की।", "جائزے کے لیے حسابات، ادائیگی یا خرچ کی رپورٹ تیار کی۔", "Inihanda ang ulat ng account, bayad o gastos para suriin."],
    ["اتبعت خطوات الموافقة ونظّمت الوثائق المالية.", "मंज़ूरी के कदम माने और वित्तीय दस्तावेज़ व्यवस्थित रखे।", "منظوری کے اقدامات اپنائے اور مالی دستاویزات ترتیب میں رکھیں۔", "Sinunod ang pag-apruba at pinanatiling maayos ang dokumento ng pananalapi."],
    ["أجبت عن أسئلة الحسابات وعملت مع الزملاء لحل الفروقات.", "खातों के सवालों के जवाब दिए और सहकर्मियों के साथ अंतर हल किए।", "حسابات کے سوالوں کے جواب دیے اور ساتھیوں کے ساتھ فرق حل کیے۔", "Sinagot ang tanong sa account at nilutas ang pagkakaiba kasama ang mga katrabaho."],
    ["تعاملت مع المعلومات المالية بعناية واتبعت قواعد السرية.", "वित्तीय जानकारी सावधानी से संभाली और गोपनीयता के नियम माने।", "مالی معلومات احتیاط سے سنبھالیں اور رازداری کے اصول اپنائے۔", "Iningatan ang impormasyon sa pananalapi at sinunod ang pagiging kumpidensiyal."],
  ],
  technology: [
    ["بحثت مشكلات المستخدمين أو الأنظمة وسجّلت خطوات حلّها.", "उपयोगकर्ता या सिस्टम की समस्याएँ जाँचीं और हल के कदम दर्ज किए।", "صارف یا نظام کے مسائل جانچے اور حل کے اقدامات درج کیے۔", "Sinuri ang problema ng user o sistema at itinala ang mga hakbang sa paglutas."],
    ["اختبرت التغييرات قبل إصدارها وأبلغت عن العيوب بأدلة واضحة.", "रिलीज़ से पहले बदलाव जाँचे और साफ़ प्रमाण के साथ ख़राबियाँ बताईं।", "ریلیز سے پہلے تبدیلیاں جانچیں اور واضح ثبوت کے ساتھ خرابیاں بتائیں۔", "Sinubukan ang pagbabago bago ilabas at iniulat ang depekto na may malinaw na ebidensiya."],
    ["حدّثت السجلات التقنية أو طلبات الدعم أو أدلة المستخدم بعد إتمام العمل.", "काम पूरा होने पर तकनीकी रिकॉर्ड, टिकट या उपयोगकर्ता गाइड अपडेट किए।", "کام مکمل ہونے پر تکنیکی ریکارڈ، ٹکٹ یا صارف کی رہنمائی اپ ڈیٹ کی۔", "Inayos ang technical record, ticket o gabay ng user matapos ang trabaho."],
    ["عملت مع الزملاء لفهم المتطلبات والاتفاق على الخطوات التالية.", "ज़रूरतें समझने और अगले कदम तय करने के लिए सहकर्मियों के साथ काम किया।", "ضروریات سمجھنے اور اگلے اقدامات طے کرنے کے لیے ساتھیوں کے ساتھ کام کیا۔", "Nakipagtulungan sa mga katrabaho para maunawaan ang kailangan at susunod na hakbang."],
    ["حميت بيانات الدخول واتبعت إجراءات أمن البيانات في الشركة.", "प्रवेश की जानकारी सुरक्षित रखी और कंपनी की डेटा सुरक्षा प्रक्रिया अपनाई।", "داخلے کی معلومات محفوظ رکھیں اور کمپنی کے ڈیٹا کی حفاظت کے طریقے اپنائے۔", "Iningatan ang access details at sinunod ang seguridad ng data ng kompanya."],
    ["شرحت المشكلات التقنية للمستخدمين بلغة واضحة.", "उपयोगकर्ताओं को तकनीकी समस्याएँ साफ़ भाषा में समझाईं।", "صارفین کو تکنیکی مسائل واضح زبان میں سمجھائے۔", "Ipinaliwanag ang teknikal na problema sa user sa malinaw na salita."],
  ],
  general: [
    ["أكملت المهام المكلّف بها وفق إجراءات الشركة ومواعيدها.", "कंपनी की प्रक्रिया और समयसीमा के अनुसार तय काम पूरा किया।", "کمپنی کے طریقے اور مقررہ وقت کے مطابق طے شدہ کام مکمل کیا۔", "Natapos ang mga gawain ayon sa tuntunin at deadline ng kompanya."],
    ["ساعدت العملاء أو الزملاء وأحلت المشكلات الصعبة إلى المشرف.", "ग्राहकों या सहकर्मियों की मदद की और कठिन समस्याएँ सुपरवाइज़र को भेजीं।", "گاہکوں یا ساتھیوں کی مدد کی اور مشکل مسائل سپروائزر کو بھیجے۔", "Tumulong sa customer o katrabaho at ipinasa sa supervisor ang mahirap na problema."],
    ["حافظت على دقة سجلات العمل وأبلغت عن المشكلات دون تأخير.", "काम के रिकॉर्ड सही रखे और समस्याएँ बिना देरी बताईं।", "کام کے ریکارڈ درست رکھے اور مسائل بغیر تاخیر بتائے۔", "Pinanatiling tama ang rekord ng trabaho at agad na iniulat ang problema."],
    ["فحصت الأدوات أو المخزون أو الوثائق قبل كل مهمة.", "हर काम शुरू करने से पहले औज़ार, स्टॉक या दस्तावेज़ जाँचे।", "ہر کام شروع کرنے سے پہلے اوزار، اسٹاک یا دستاویزات جانچے۔", "Sinuri ang gamit, stock o dokumento bago simulan ang bawat gawain."],
    ["عملت مع الفريق لإتمام المهام اليومية في أوقات الازدحام.", "व्यस्त समय में रोज़ का काम पूरा करने के लिए टीम के साथ काम किया।", "مصروف وقت میں روز کا کام مکمل کرنے کے لیے ٹیم کے ساتھ کام کیا۔", "Nakipagtulungan sa team para matapos ang araw-araw na gawain sa abalang oras."],
    ["اتبعت قواعد السلامة وحافظت على نظافة مكان العمل وترتيبه.", "सुरक्षा के नियम माने और काम की जगह साफ़ और व्यवस्थित रखी।", "حفاظت کے اصول اپنائے اور کام کی جگہ صاف اور ترتیب میں رکھی۔", "Sinunod ang kaligtasan at pinanatiling malinis at maayos ang lugar ng trabaho."],
  ],
  "kitchen-steward": [
    ["نظّفت المطبخ ومناطق إعداد الطعام وتخزينه وفق معايير النظافة المطلوبة.", "रसोई, खाना तैयार करने और रखने की जगहों की तय नियमों के अनुसार सफ़ाई की।", "باورچی خانے، کھانا تیار کرنے اور رکھنے کی جگہوں کی مقررہ اصولوں کے مطابق صفائی کی۔", "Nilinis ang kusina, paghahandaan at imbakan ng pagkain ayon sa pamantayan ng kalinisan."],
    ["شغّلت غسالات الأطباق الصناعية وغسلت أواني الطهي والأدوات والأكواب وأطباق التقديم.", "औद्योगिक डिशवॉशर चलाए और खाना पकाने के बर्तन, उपकरण, गिलास और परोसने के बर्तन धोए।", "صنعتی ڈش واشر چلائے اور کھانا پکانے کے برتن، اوزار، گلاس اور پیش کرنے کے برتن دھوئے۔", "Gumamit ng industrial dishwasher at naghugas ng kaldero, kagamitan, baso at pinggan."],
    ["استخدمت مواد التنظيف والمعدات وفق تعليمات السلامة.", "सफ़ाई के रसायनों और उपकरणों का सुरक्षा निर्देशों के अनुसार इस्तेमाल किया।", "صفائی کے کیمیکلز اور آلات کا حفاظتی ہدایات کے مطابق استعمال کیا۔", "Gumamit ng panlinis at kagamitan ayon sa mga tagubilin sa kaligtasan."],
    ["أزلت النفايات وحافظت على نظافة الحاويات والأرضيات ومناطق العمل خلال أوقات الخدمة المزدحمة.", "व्यस्त सेवा के दौरान कचरा हटाया और डिब्बे, फ़र्श और काम की जगह साफ़ रखी।", "مصروف خدمت کے دوران کچرا ہٹایا اور ڈبے، فرش اور کام کی جگہ صاف رکھی۔", "Nag-alis ng basura at pinanatiling malinis ang basurahan, sahig at lugar ng trabaho habang abala ang serbisyo."],
    ["أبلغت المشرف عن المعدات التالفة ونقص مواد التنظيف.", "खराब उपकरण और कम सफ़ाई सामग्री की सूचना सुपरवाइज़र को दी।", "خراب آلات اور کم صفائی کے سامان کی اطلاع سپروائزر کو دی۔", "Ipinaalam sa supervisor ang sirang kagamitan at kulang na panlinis."],
    ["ساعدت فريق المطبخ في التحضير والخدمة وأعمال الإغلاق.", "तैयारी, सेवा और काम बंद करने के समय रसोई टीम की मदद की।", "تیاری، خدمت اور کام بند کرنے کے وقت باورچی خانے کی ٹیم کی مدد کی۔", "Tumulong sa kusina sa paghahanda, serbisyo at pagliligpit matapos ang trabaho."],
  ],
  housekeeping: [
    ["نظّفت غرف الضيوف والمناطق العامة وفق المعيار والجدول المطلوبين.", "मेहमानों के कमरे और सार्वजनिक जगहें तय स्तर और समय के अनुसार साफ़ कीं।", "مہمانوں کے کمرے اور عام جگہیں مقررہ معیار اور وقت کے مطابق صاف کیں۔", "Nilinis ang mga kuwarto at pampublikong lugar ayon sa pamantayan at iskedyul."],
    ["غيّرت أغطية الأسرّة والمناشف وأعدت تعبئة مستلزمات الضيوف.", "बिस्तर की चादरें और तौलिये बदले और मेहमानों का सामान भरा।", "بستر کی چادریں اور تولیے بدلے اور مہمانوں کا سامان پورا کیا۔", "Nagpalit ng sapin at tuwalya at nagdagdag ng mga gamit para sa bisita."],
    ["أبلغت عن أعطال الصيانة والتلف والمفقودات عبر الإجراء المعتمد.", "मरम्मत की समस्याओं, नुकसान और खोए सामान की सही प्रक्रिया से सूचना दी।", "مرمت کی خرابیوں، نقصان اور گم شدہ سامان کی درست طریقے سے اطلاع دی۔", "Iniulat ang sira, pinsala at nawawalang gamit gamit ang tamang proseso."],
    ["استخدمت مواد التنظيف والمعدات وفق تعليمات السلامة.", "सफ़ाई के रसायनों और उपकरणों का सुरक्षा निर्देशों के अनुसार इस्तेमाल किया।", "صفائی کے کیمیکلز اور آلات کا حفاظتی ہدایات کے مطابق استعمال کیا۔", "Gumamit ng panlinis at kagamitan ayon sa mga tagubilin sa kaligtasan."],
    ["استجبت لطلبات الضيوف بعناية وأبلغت المشرف بالمشكلات العاجلة.", "मेहमानों के अनुरोधों का ध्यान से जवाब दिया और ज़रूरी समस्याएँ सुपरवाइज़र को बताईं।", "مہمانوں کی درخواستوں کا توجہ سے جواب دیا اور ضروری مسائل سپروائزر کو بتائے۔", "Inasikaso ang mga hiling ng bisita at ipinaalam sa supervisor ang mga agarang problema."],
    ["فحصت الغرف المكتملة قبل تسليمها وصحّحت ما فاتني.", "तैयार कमरे देने से पहले जाँचे और छूटी चीज़ें ठीक कीं।", "تیار کمرے دینے سے پہلے جانچے اور رہ گئی چیزیں درست کیں۔", "Sinuri ang mga natapos na kuwarto bago ipagamit at inayos ang mga nakaligtaan."],
  ],
  "food-service": [
    ["رحّبت بالضيوف وشرحت أصناف القائمة وسجّلت الطلبات بعناية.", "मेहमानों का स्वागत किया, मेन्यू बताया और ऑर्डर ध्यान से लिखे।", "مہمانوں کا استقبال کیا، مینو بتایا اور آرڈر توجہ سے لکھے۔", "Sinalubong ang bisita, ipinaliwanag ang menu at itinala ang mga order."],
    ["قدّمت الطعام والمشروبات وفق معايير النظافة والتقديم.", "सफ़ाई और प्रस्तुति के नियमों के अनुसार खाना और पेय परोसे।", "صفائی اور پیش کرنے کے اصولوں کے مطابق کھانا اور مشروبات پیش کیے۔", "Naghain ng pagkain at inumin ayon sa pamantayan ng kalinisan at presentasyon."],
    ["تابعت احتياجات الضيوف أثناء الخدمة وتعاملت مع طلباتهم مع الفريق.", "सेवा के दौरान मेहमानों की ज़रूरतें पूछीं और टीम के साथ अनुरोध पूरे किए।", "خدمت کے دوران مہمانوں کی ضروریات پوچھیں اور ٹیم کے ساتھ درخواستیں پوری کیں۔", "Kinumusta ang bisita habang kumakain at inasikaso ang mga hiling kasama ang team."],
    ["جهّزت الطاولات وأعدت ترتيبها قبل الخدمة وأثناءها وبعدها.", "सेवा से पहले, दौरान और बाद में मेज़ें तैयार कीं और फिर सजाईं।", "خدمت سے پہلے، دوران اور بعد میں میزیں تیار کیں اور پھر ترتیب دیں۔", "Inihanda at inayos muli ang mga mesa bago, habang at pagkatapos ng serbisyo."],
    ["أنجزت الفواتير والمدفوعات باستخدام نظام الدفع في المطعم.", "रेस्तराँ के भुगतान सिस्टम से बिल और भुगतान पूरे किए।", "ریستوران کے ادائیگی کے نظام سے بل اور ادائیگیاں مکمل کیں۔", "Pinroseso ang mga bill at bayad gamit ang sistema ng restawran."],
    ["أبلغت المطبخ بالحساسيات والطلبات الخاصة قبل تقديم الطعام.", "खाना परोसने से पहले रसोई को एलर्जी और विशेष अनुरोध बताए।", "کھانا پیش کرنے سے پہلے باورچی خانے کو الرجی اور خاص درخواستیں بتائیں۔", "Ipinaalam sa kusina ang allergy at espesyal na hiling bago maghain."],
  ],
  culinary: [
    ["حضّرت المكوّنات والأطباق وفق الوصفات ومعايير الحصص.", "व्यंजनों और हिस्से के नियमों के अनुसार सामग्री और खाना तैयार किया।", "ترکیبوں اور حصے کے اصولوں کے مطابق اجزا اور کھانا تیار کیا۔", "Inihanda ang sangkap at pagkain ayon sa recipe at tamang bahagi."],
    ["فحصت جودة الطعام وحرارته وطريقة تقديمه قبل الخدمة.", "सेवा से पहले खाने की गुणवत्ता, तापमान और प्रस्तुति जाँची।", "خدمت سے پہلے کھانے کا معیار، درجہ حرارت اور پیش کرنے کا انداز جانچا۔", "Sinuri ang kalidad, temperatura at presentasyon ng pagkain bago ihain."],
    ["حافظت على نظافة مناطق التحضير والأدوات والمعدات وجاهزيتها.", "तैयारी की जगह, औज़ार और उपकरण साफ़ और तैयार रखे।", "تیاری کی جگہ، اوزار اور آلات صاف اور تیار رکھے۔", "Pinanatiling malinis at handa ang lugar ng paghahanda, mga gamit at kagamitan."],
    ["وضعت الملصقات وخزّنت الطعام وفق قواعد النظافة وتدوير المخزون.", "सफ़ाई और स्टॉक बदलने के नियमों के अनुसार खाने पर लेबल लगाए और रखा।", "صفائی اور اسٹاک بدلنے کے اصولوں کے مطابق کھانے پر لیبل لگائے اور رکھا۔", "Nilagyan ng label at inimbak ang pagkain ayon sa kalinisan at pag-ikot ng stock."],
    ["أبلغت عن نقص المخزون وساعدت في إعداد طلبات الخدمة التالية.", "कम स्टॉक बताया और अगली सेवा के ऑर्डर तैयार करने में मदद की।", "کم اسٹاک بتایا اور اگلی خدمت کے آرڈر تیار کرنے میں مدد کی۔", "Iniulat ang kulang na stock at tumulong sa paghahanda ng order para sa susunod na serbisyo."],
    ["عملت مع فريق المطبخ لإكمال الطلبات في أوقات الازدحام.", "व्यस्त समय में ऑर्डर पूरे करने के लिए रसोई टीम के साथ काम किया।", "مصروف وقت میں آرڈر مکمل کرنے کے لیے باورچی خانے کی ٹیم کے ساتھ کام کیا۔", "Nakipagtulungan sa kusina para matapos ang mga order sa abalang oras."],
  ],
  "front-office": [
    ["رحّبت بالضيوف وأتممت إجراءات الوصول والمغادرة.", "मेहमानों का स्वागत किया और चेक-इन और चेक-आउट पूरे किए।", "مہمانوں کا استقبال کیا اور چیک اِن اور چیک آؤٹ مکمل کیے۔", "Sinalubong ang bisita at inasikaso ang check-in at check-out."],
    ["أجبت عن أسئلة الضيوف وقدّمت معلومات دقيقة عن خدمات الفندق.", "मेहमानों के सवालों का जवाब दिया और होटल सेवाओं की सही जानकारी दी।", "مہمانوں کے سوالوں کے جواب دیے اور ہوٹل کی خدمات کی درست معلومات دیں۔", "Sinagot ang mga tanong at nagbigay ng tamang impormasyon tungkol sa serbisyo ng hotel."],
    ["حدّثت الحجوزات وبيانات الضيوف في نظام إدارة الفندق.", "होटल के प्रबंधन सिस्टम में बुकिंग और मेहमानों की जानकारी अपडेट की।", "ہوٹل کے انتظامی نظام میں بکنگ اور مہمانوں کی معلومات اپ ڈیٹ کیں۔", "Inayos ang mga booking at detalye ng bisita sa sistema ng hotel."],
    ["تعاملت مع مشكلات الضيوف وأحلت ما لم أستطع حله إلى المدير المختص.", "मेहमानों की समस्याएँ संभालीं और अनसुलझे मामले सही मैनेजर को भेजे।", "مہمانوں کے مسائل سنبھالے اور حل نہ ہونے والے معاملات درست مینیجر کو بھیجے۔", "Inasikaso ang mga problema ng bisita at ipinasa sa tamang manager ang hindi nalutas."],
    ["نسّقت مع التنظيف والأقسام الأخرى بشأن حالة الغرف وطلبات الضيوف.", "कमरों की स्थिति और मेहमानों के अनुरोधों पर हाउसकीपिंग और अन्य विभागों से तालमेल किया।", "کمروں کی حالت اور مہمانوں کی درخواستوں پر ہاؤس کیپنگ اور دوسرے شعبوں سے رابطہ کیا۔", "Nakipag-ugnayan sa housekeeping at ibang departamento tungkol sa kuwarto at hiling ng bisita."],
    ["راجعت المدفوعات وأكملت سجلات تسليم الوردية.", "भुगतान का मिलान किया और शिफ़्ट सौंपने के रिकॉर्ड पूरे किए।", "ادائیگیوں کا حساب ملایا اور شفٹ حوالگی کے ریکارڈ مکمل کیے۔", "Pinagtugma ang mga bayad at kinumpleto ang mga rekord ng handover."],
  ],
  hr: [
    ["حدّثت سجلات الموظفين وتحقّقت من اكتمال الوثائق المطلوبة.", "कर्मचारियों के रिकॉर्ड अपडेट किए और ज़रूरी दस्तावेज़ पूरे होने की जाँच की।", "ملازمین کے ریکارڈ اپ ڈیٹ کیے اور ضروری دستاویزات مکمل ہونے کی جانچ کی۔", "Inayos ang rekord ng empleyado at sinuring kumpleto ang mga dokumento."],
    ["حدّدت مواعيد المقابلات وأطلعت المرشحين على خطوات التوظيف.", "इंटरव्यू तय किए और उम्मीदवारों को भर्ती की जानकारी देते रहे।", "انٹرویو طے کیے اور امیدواروں کو بھرتی کی معلومات دیتے رہے۔", "Nagtakda ng interbyu at nagbigay ng balita sa kandidato habang nagha-hire."],
    ["جهّزت وثائق بدء العمل وساعدت الموظفين الجدد في أيامهم الأولى.", "नए कर्मचारियों के दस्तावेज़ तैयार किए और शुरुआती दिनों में मदद की।", "نئے ملازمین کے دستاویزات تیار کیے اور ابتدائی دنوں میں مدد کی۔", "Inihanda ang dokumento ng bagong empleyado at tumulong sa kanilang unang mga araw."],
    ["أجبت عن أسئلة الموظفين وأحلت الحالات الحساسة إلى زميل الموارد البشرية المختص.", "कर्मचारियों के सवालों के जवाब दिए और संवेदनशील मामले सही एचआर सहकर्मी को भेजे।", "ملازمین کے سوالوں کے جواب دیے اور حساس معاملات درست ایچ آر ساتھی کو بھیجے۔", "Sinagot ang tanong ng empleyado at ipinasa sa tamang HR colleague ang sensitibong kaso."],
    ["تابعت الإجازات والحضور أو سجلات التدريب عبر نظام الشركة.", "कंपनी सिस्टम में छुट्टी, उपस्थिति या प्रशिक्षण के रिकॉर्ड देखे।", "کمپنی کے نظام میں چھٹی، حاضری یا تربیت کے ریکارڈ دیکھے۔", "Sinubaybayan ang leave, attendance o training sa sistema ng kompanya."],
    ["تعاملت مع بيانات الموظفين بعناية واتبعت قواعد السرية.", "कर्मचारियों की जानकारी सावधानी से संभाली और गोपनीयता के नियम माने।", "ملازمین کی معلومات احتیاط سے سنبھالیں اور رازداری کے اصول اپنائے۔", "Iningatan ang impormasyon ng empleyado at sinunod ang mga tuntunin sa pagiging kumpidensiyal."],
  ],
  administration: [
    ["أجبت عن المكالمات والبريد ووجّهت كل طلب إلى الشخص المناسب.", "कॉल और ईमेल के जवाब दिए और हर अनुरोध सही व्यक्ति तक पहुँचाया।", "کال اور ای میل کے جواب دیے اور ہر درخواست درست شخص تک پہنچائی۔", "Sinagot ang tawag at email at ipinasa ang bawat hiling sa tamang tao."],
    ["جهّزت الوثائق وحدّثت السجلات ونظّمت الملفات الإلكترونية.", "दस्तावेज़ तैयार किए, रिकॉर्ड अपडेट किए और डिजिटल फ़ाइलें व्यवस्थित रखीं।", "دستاویزات تیار کیے، ریکارڈ اپ ڈیٹ کیے اور ڈیجیٹل فائلیں ترتیب میں رکھیں۔", "Inihanda ang dokumento, inayos ang rekord at pinanatiling maayos ang digital files."],
    ["حدّدت مواعيد الاجتماعات وساعدت الزملاء في تنظيم المواعيد والمهل.", "बैठकें तय कीं और सहकर्मियों को मुलाक़ातें और समयसीमा सँभालने में मदद की।", "ملاقاتیں طے کیں اور ساتھیوں کو ملاقاتیں اور مقررہ وقت سنبھالنے میں مدد کی۔", "Nagtakda ng pulong at tumulong sa mga katrabaho sa appointment at deadline."],
    ["رحّبت بالزوار واتبعت إجراءات تسجيل الدخول إلى المكتب.", "आगंतुकों का स्वागत किया और दफ़्तर की प्रवेश प्रक्रिया अपनाई।", "آنے والوں کا استقبال کیا اور دفتر کے داخلے کا طریقہ اپنایا۔", "Sinalubong ang mga bisita at sinunod ang proseso ng pagpasok sa opisina."],
    ["راجعت النماذج والوثائق الداعمة قبل تقديمها.", "फ़ॉर्म और संबंधित दस्तावेज़ जमा करने से पहले जाँचे।", "فارم اور متعلقہ دستاویزات جمع کرنے سے پہلے جانچے۔", "Sinuri ang form at mga kalakip na dokumento bago isumite."],
    ["طلبت مستلزمات المكتب وأبلغت عن النقص قبل نفادها.", "दफ़्तर का सामान मँगाया और ख़त्म होने से पहले कमी बताई।", "دفتر کا سامان منگوایا اور ختم ہونے سے پہلے کمی بتائی۔", "Umorder ng gamit sa opisina at iniulat ang kulang bago maubos."],
  ],
};

function pack(index?: number): Record<string, string> {
  const result: Record<string, string> = {};
  for (const family of getRoleFamilies()) {
    const example = getRoleExamplesForFamily(family.key);
    if (index === undefined) {
      result[`role.label.${family.key}`] = family.label;
      result[`example.title.${family.key}`] = example.title;
      result[`example.company.${family.key}`] = example.company;
      family.sentences.forEach((sentence, number) => { result[`role.sentence.${family.key}.${number}`] = sentence; });
    } else {
      if (labels[family.key]) result[`role.label.${family.key}`] = labels[family.key][index];
      if (titles[family.key]) result[`example.title.${family.key}`] = titles[family.key][index];
      if (workplaces[family.key]) result[`example.company.${family.key}`] = workplaces[family.key][index];
      const sources = translatedRoleSentenceSources[family.key] ?? [];
      family.sentences.forEach((sentence, number) => {
        const row = newRoleSentenceTranslations[family.key]?.find((item) => item[0] === sentence);
        const translation = row?.[index + 1] ?? sentences[family.key]?.[sources.indexOf(sentence)]?.[index];
        if (translation) result[`role.sentence.${family.key}.${number}`] = translation;
      });
    }
  }
  return result;
}
export const roleLibraryTranslations = {
  en: pack(),
  ar: { ...pack(0), ...roleLabelCompletion.ar },
  hi: { ...pack(1), ...roleLabelCompletion.hi },
  ur: { ...pack(2), ...roleLabelCompletion.ur },
  tl: { ...pack(3), ...roleLabelCompletion.tl },
};
