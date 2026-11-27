type Row = readonly [en: string, ar: string, hi: string, ur: string, tl: string];

// Display text only. Keep the English source value when a candidate chooses a label.
// Rows only contain authored choices from the three Talk Mode lists.
const rows: readonly Row[] = [
  ["Room Attendant", "عامل تنظيف الغرف", "कमरों की देखभाल करने वाला", "کمروں کی صفائی کا کارکن", "Room attendant"],
  ["Housekeeping Supervisor", "مشرف التدبير الفندقي", "हाउसकीपिंग सुपरवाइज़र", "ہاؤس کیپنگ سپروائزر", "Supervisor sa housekeeping"],
  ["Executive Housekeeper", "رئيس قسم التدبير الفندقي", "हाउसकीपिंग विभाग प्रमुख", "ہاؤس کیپنگ شعبے کا سربراہ", "Pinuno ng housekeeping"],
  ["Kitchen Steward", "عامل تنظيف المطبخ والأواني", "रसोई और बर्तन की सफ़ाई करने वाला", "باورچی خانے اور برتنوں کی صفائی کا کارکن", "Tagalinis ng kusina at mga kagamitan"],
  ["Galley Steward", "عامل تنظيف مطبخ السفينة", "जहाज़ की रसोई की सफ़ाई करने वाला", "جہاز کے باورچی خانے کی صفائی کا کارکن", "Tagalinis ng kusina sa barko"],
  ["Stewarding Supervisor", "مشرف تنظيف المطبخ والأواني", "रसोई की सफ़ाई टीम का सुपरवाइज़र", "باورچی خانے کی صفائی کی ٹیم کا سپروائزر", "Supervisor ng pangkat sa paglilinis ng kusina"],
  ["Waiter", "نادل", "वेटर", "ویٹر", "Waiter"],
  ["F&B Captain", "قائد فريق خدمة الطعام والشراب", "खान-पान सेवा टीम का कप्तान", "کھانے پینے کی خدمت کی ٹیم کا کیپٹن", "Kapitan ng pangkat sa serbisyo ng pagkain at inumin"],
  ["Restaurant Supervisor", "مشرف المطعم", "रेस्तराँ सुपरवाइज़र", "ریستوران کا سپروائزر", "Supervisor sa restawran"],
  ["Commis Chef", "طاهٍ مبتدئ", "जूनियर शेफ़", "جونیئر شیف", "Junior chef"],
  ["Cook", "طباخ", "रसोइया", "باورچی", "Kusinero"],
  ["Chef de Partie", "طاهٍ مسؤول عن قسم في المطبخ", "रसोई के एक सेक्शन का शेफ़", "باورچی خانے کے ایک حصے کا شیف", "Chef na namamahala sa isang seksyon ng kusina"],
  ["HR Assistant", "مساعد الموارد البشرية", "मानव संसाधन सहायक", "انسانی وسائل کا معاون", "Assistant sa HR"],
  ["HR Officer", "مسؤول الموارد البشرية", "मानव संसाधन अधिकारी", "انسانی وسائل کا افسر", "Opisyal sa HR"],
  ["HR Manager", "مدير الموارد البشرية", "मानव संसाधन प्रबंधक", "انسانی وسائل کا مینیجر", "Manager sa HR"],
  ["Driver", "سائق", "ड्राइवर", "ڈرائیور", "Drayber"],
  ["Delivery Driver", "سائق توصيل", "डिलीवरी ड्राइवर", "ڈیلیوری ڈرائیور", "Drayber sa delivery"],
  ["Bus Driver", "سائق حافلة", "बस ड्राइवर", "بس ڈرائیور", "Drayber ng bus"],
  ["Security Guard", "حارس أمن", "सुरक्षा गार्ड", "سیکیورٹی گارڈ", "Guwardiya"],
  ["Security Officer", "مسؤول الأمن", "सुरक्षा अधिकारी", "سیکیورٹی افسر", "Opisyal sa seguridad"],
  ["Security Supervisor", "مشرف الأمن", "सुरक्षा सुपरवाइज़र", "سیکیورٹی سپروائزر", "Supervisor sa seguridad"],
  ["Cleaner", "عامل نظافة", "सफ़ाई कर्मचारी", "صفائی کا کارکن", "Tagalinis"],
  ["Cleaning Supervisor", "مشرف النظافة", "सफ़ाई सुपरवाइज़र", "صفائی کا سپروائزر", "Supervisor sa paglilinis"],
  ["Front Desk Agent", "موظف مكتب الاستقبال", "फ़्रंट डेस्क कर्मचारी", "فرنٹ ڈیسک کا کارکن", "Kawani sa front desk"],
  ["Receptionist", "موظف استقبال", "रिसेप्शनिस्ट", "ریسپشنسٹ", "Resepsiyonista"],
  ["Front Office Supervisor", "مشرف المكتب الأمامي", "फ़्रंट ऑफ़िस सुपरवाइज़र", "فرنٹ آفس کا سپروائزر", "Supervisor sa front office"],
  ["Office Assistant", "مساعد مكتب", "दफ़्तर सहायक", "دفتر کا معاون", "Assistant sa opisina"],
  ["Administrator", "مسؤول إداري", "प्रशासक", "انتظامی افسر", "Administrador"],
  ["Shop Assistant", "مساعد متجر", "दुकान सहायक", "دکان کا معاون", "Assistant sa tindahan"],
  ["Cashier", "أمين صندوق", "कैशियर", "کیشئر", "Kahera o kahero"],
  ["Sales Assistant", "مساعد مبيعات", "बिक्री सहायक", "فروخت کا معاون", "Assistant sa pagbebenta"],
  ["Customer Service Agent", "موظف خدمة العملاء", "ग्राहक सेवा कर्मचारी", "گاہکوں کی خدمت کا کارکن", "Kawani sa serbisyo sa customer"],
  ["Call Centre Agent", "موظف مركز الاتصال", "कॉल सेंटर कर्मचारी", "کال سینٹر کا کارکن", "Kawani sa call centre"],
  ["Warehouse Assistant", "مساعد مستودع", "गोदाम सहायक", "گودام کا معاون", "Assistant sa bodega"],
  ["Storekeeper", "أمين مخزن", "भंडार का प्रभारी", "اسٹور کیپر", "Tagapangasiwa ng stockroom"],
  ["Site Worker", "عامل موقع", "निर्माण स्थल का कामगार", "تعمیراتی مقام کا کارکن", "Manggagawa sa construction site"],
  ["Electrician", "فني كهرباء", "इलेक्ट्रीशियन", "الیکٹریشن", "Elektrisyan"],
  ["Plumber", "سبّاك", "प्लंबर", "پلمبر", "Tubero"],
  ["Healthcare Assistant", "مساعد رعاية صحية", "स्वास्थ्य सेवा सहायक", "صحت کی دیکھ بھال کا معاون", "Assistant sa pangangalagang pangkalusugan"],
  ["Nurse", "ممرض", "नर्स", "نرس", "Nars"],
  ["Accounts Assistant", "مساعد محاسب", "लेखा सहायक", "حساب کتاب کا معاون", "Assistant sa accounting"],
  ["Accountant", "محاسب", "अकाउंटेंट", "اکاؤنٹنٹ", "Accountant"],
  ["Teaching Assistant", "مساعد تدريس", "शिक्षण सहायक", "تدریسی معاون", "Assistant sa pagtuturo"],
  ["Teacher", "معلم", "शिक्षक", "استاد", "Guro"],
  ["IT Support Assistant", "مساعد دعم تقنية المعلومات", "आईटी सहायता सहायक", "آئی ٹی سپورٹ معاون", "Assistant sa IT support"],
  ["Software Developer", "مطوّر برمجيات", "सॉफ़्टवेयर डेवलपर", "سافٹ ویئر ڈویلپر", "Software developer"],

  ["International hotel", "فندق دولي", "अंतरराष्ट्रीय होटल", "بین الاقوامی ہوٹل", "Internasyonal na hotel"],
  ["Local hotel", "فندق محلي", "स्थानीय होटल", "مقامی ہوٹل", "Lokal na hotel"],
  ["Restaurant", "مطعم", "रेस्तराँ", "ریستوران", "Restawran"],
  ["Resort", "منتجع", "रिसॉर्ट", "ریزورٹ", "Resort"],
  ["Other workplace", "مكان عمل آخر", "काम की कोई और जगह", "کام کی کوئی اور جگہ", "Ibang lugar ng trabaho"],
  ["Hospital", "مستشفى", "अस्पताल", "ہسپتال", "Ospital"],
  ["Clinic", "عيادة", "क्लिनिक", "کلینک", "Klinika"],
  ["Care home", "دار رعاية", "देखभाल गृह", "دیکھ بھال کا مرکز", "Tahanan para sa mga inaalagaan"],
  ["Building company", "شركة بناء", "निर्माण कंपनी", "تعمیراتی کمپنی", "Kompanya sa konstruksiyon"],
  ["Construction site", "موقع بناء", "निर्माण स्थल", "تعمیراتی مقام", "Lugar ng konstruksiyon"],
  ["Maintenance company", "شركة صيانة", "रखरखाव कंपनी", "دیکھ بھال اور مرمت کی کمپنی", "Kompanya sa maintenance"],
  ["Warehouse", "مستودع", "गोदाम", "گودام", "Bodega"],
  ["Distribution centre", "مركز توزيع", "वितरण केंद्र", "تقسیم کا مرکز", "Sentro ng pamamahagi"],
  ["Factory", "مصنع", "कारख़ाना", "کارخانہ", "Pabrika"],
  ["Transport company", "شركة نقل", "परिवहन कंपनी", "ٹرانسپورٹ کمپنی", "Kompanya sa transportasyon"],
  ["Delivery company", "شركة توصيل", "डिलीवरी कंपनी", "ڈیلیوری کمپنی", "Kompanya sa delivery"],
  ["Private employer", "جهة عمل خاصة", "निजी नियोक्ता", "نجی آجر", "Pribadong employer"],
  ["Security company", "شركة أمن", "सुरक्षा कंपनी", "سیکیورٹی کمپنی", "Kompanya sa seguridad"],
  ["Hotel", "فندق", "होटल", "ہوٹل", "Hotel"],
  ["Office building", "مبنى مكاتب", "दफ़्तर की इमारत", "دفتر کی عمارت", "Gusali ng mga opisina"],
  ["Cleaning company", "شركة تنظيف", "सफ़ाई कंपनी", "صفائی کی کمپنی", "Kompanya sa paglilinis"],
  ["Private home", "منزل خاص", "निजी घर", "نجی گھر", "Pribadong tahanan"],
  ["Shop", "متجر", "दुकान", "دکان", "Tindahan"],
  ["Supermarket", "سوبرماركت", "सुपरमार्केट", "سپر مارکیٹ", "Supermarket"],
  ["Sales office", "مكتب مبيعات", "बिक्री का दफ़्तर", "فروخت کا دفتر", "Opisina ng pagbebenta"],
  ["Local company", "شركة محلية", "स्थानीय कंपनी", "مقامی کمپنی", "Lokal na kompanya"],
  ["International company", "شركة دولية", "अंतरराष्ट्रीय कंपनी", "بین الاقوامی کمپنی", "Internasyonal na kompanya"],
  ["Office", "مكتب", "दफ़्तर", "دفتر", "Opisina"],

  ["Trained new staff", "درّبت موظفين جددًا", "नए कर्मचारियों को प्रशिक्षण दिया", "نئے عملے کو تربیت دی", "Nagsanay ng mga bagong kawani"],
  ["Employee of the month", "موظف الشهر", "महीने का कर्मचारी पुरस्कार", "ماہ کے بہترین ملازم کا اعزاز", "Empleyado ng buwan"],
  ["Good guest reviews", "تقييمات جيدة من الضيوف", "मेहमानों से अच्छी समीक्षाएँ", "مہمانوں کی اچھی آرا", "Magagandang review mula sa mga bisita"],
  ["Helped during busy service", "ساعدت أثناء ازدحام الخدمة", "काम ज़्यादा होने पर सेवा में मदद की", "زیادہ رش کے دوران خدمت میں مدد کی", "Tumulong noong abala ang serbisyo"],
  ["Good patient feedback", "آراء جيدة من المرضى", "मरीज़ों से अच्छी प्रतिक्रिया", "مریضوں کی اچھی رائے", "Magandang puna mula sa mga pasyente"],
  ["Good customer feedback", "آراء جيدة من العملاء", "ग्राहकों से अच्छी प्रतिक्रिया", "گاہکوں کی اچھی رائے", "Magandang puna mula sa mga customer"],
  ["Helped with stock checks", "ساعدت في التحقق من المخزون", "स्टॉक की जाँच में मदद की", "اسٹاک کی جانچ میں مدد کی", "Tumulong sa pag-check ng stock"],
  ["Reported a safety risk", "أبلغت عن خطر على السلامة", "सुरक्षा के खतरे की सूचना दी", "حفاظتی خطرے کی اطلاع دی", "Nag-ulat ng panganib sa kaligtasan"],
  ["Good feedback", "آراء جيدة", "अच्छी प्रतिक्रिया", "اچھی رائے", "Magandang puna"],
];

function keyForAuthoredChoice(english: string) {
  return `talk.workChoice.${english.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const choiceKeys = new Map(rows.map(([english]) => [english, keyForAuthoredChoice(english)] as const));

export function talkWorkChoiceKey(english: string): string | undefined {
  return choiceKeys.get(english);
}

function pack(index: 0 | 1 | 2 | 3 | 4): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [keyForAuthoredChoice(row[0]), row[index]]));
}

export const talkWorkChoices = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };
