// Draft translations for display only. Native-speaker review is pending.
// Source order: English, Arabic, Hindi, Urdu, Tagalog. Keep CV values canonical.
type Row = readonly [string, string, string, string, string];

const roleRows = {
  reservations: ["Reservations", "الحجوزات", "बुकिंग", "بکنگ کا کام", "Pag-aasikaso ng reserbasyon"],
  cashier: ["Cashiering", "العمل على صندوق الدفع", "कैश काउंटर का काम", "کیش کاؤنٹر کا کام", "Pag-asikaso ng bayad"],
  barista: ["Coffee service", "تحضير القهوة وتقديمها", "कॉफ़ी बनाना और परोसना", "کافی بنانا اور پیش کرنا", "Paghahanda at paghahain ng kape"],
  receptionist: ["Reception", "الاستقبال", "रिसेप्शन का काम", "استقبالیہ کا کام", "Pagtanggap sa mga bisita"],
  "call-centre": ["Call centre", "مركز الاتصالات", "कॉल सेंटर का काम", "کال سینٹر کا کام", "Pagsagot sa mga tawag sa call center"],
  "sales-assistant": ["Shop floor sales", "البيع داخل المتجر", "दुकान में बिक्री", "دکان میں فروخت", "Pagbebenta sa tindahan"],
  concierge: ["Concierge and bell desk", "خدمات الضيوف والأمتعة في الفندق", "होटल मेहमानों और उनके सामान की मदद", "ہوٹل میں مہمانوں اور ان کے سامان کی مدد", "Pagtulong sa mga bisita at pag-asikaso ng bagahe"],
  laundry: ["Laundry", "غسيل الملابس والمفروشات", "कपड़े धोने का काम", "کپڑے دھونے کا کام", "Paglalaba"],
  "kitchen-helper": ["Kitchen support", "المساعدة في المطبخ", "रसोई में मदद", "باورچی خانے میں مدد", "Pagtulong sa kusina"],
  "delivery-rider": ["Motorbike delivery", "التوصيل بالدراجة النارية", "मोटरसाइकिल से डिलीवरी", "موٹر سائیکل سے سامان پہنچانا", "Paghahatid gamit ang motorsiklo"],
  "heavy-driver": ["Bus and heavy vehicle driving", "قيادة الحافلات والمركبات الثقيلة", "बस और भारी वाहन चलाना", "بس اور بھاری گاڑیاں چلانا", "Pagmamaneho ng bus at mabibigat na sasakyan"],
  storekeeper: ["Stores and stock", "إدارة المخزن والمخزون", "भंडार और स्टॉक का काम", "گودام اور اسٹاک کا کام", "Pag-asikaso ng imbakan at mga stock"],
  domestic: ["Childcare and domestic work", "رعاية الأطفال والعمل المنزلي", "बच्चों की देखभाल और घरेलू काम", "بچوں کی دیکھ بھال اور گھریلو کام", "Pag-aalaga ng bata at gawaing bahay"],
  beautician: ["Beauty and salon", "التجميل والعمل في الصالون", "ब्यूटी और सैलून का काम", "بیوٹی اور سیلون کا کام", "Pagpapaganda at trabaho sa salon"],
  "gym-lifeguard": ["Fitness and pool safety", "اللياقة البدنية والسلامة في المسبح", "फ़िटनेस और स्विमिंग पूल की सुरक्षा", "تندرستی اور سوئمنگ پول کی حفاظت", "Pag-eehersisyo at kaligtasan sa swimming pool"],
  labourer: ["Site labour", "الأعمال اليدوية في موقع العمل", "साइट पर मज़दूरी", "سائٹ پر مزدوری", "Manwal na trabaho sa site"],
  mason: ["Masonry", "أعمال البناء بالطوب والحجر", "ईंट और पत्थर की चिनाई", "اینٹ اور پتھر کی چنائی", "Pagtatayo gamit ang ladrilyo at bato"],
  electrician: ["Electrical work", "الأعمال الكهربائية", "बिजली का काम", "بجلی کا کام", "Trabahong elektrikal"],
  plumber: ["Plumbing", "السباكة", "पानी की पाइप का काम", "پانی اور نکاسی کے پائپوں کا کام", "Pagkabit at pag-aayos ng tubo ng tubig"],
  "ac-technician": ["Air conditioning", "تكييف الهواء", "एयर कंडीशनिंग का काम", "ایئر کنڈیشننگ کا کام", "Pagkabit at pag-aayos ng aircon"],
  "accounts-clerk": ["Accounts support", "المساعدة في الحسابات", "लेखा-जोखा में मदद", "حساب کتاب میں مدد", "Pagtulong sa pagtatala ng mga account"],
  "data-entry": ["Data entry", "إدخال البيانات", "जानकारी दर्ज करना", "معلومات درج کرنا", "Paglalagay ng datos"],
  "teacher-assistant": ["Classroom support", "المساعدة في الصف", "कक्षा में मदद", "کلاس میں مدد", "Pagtulong sa silid-aralan"],
  "nurse-assistant": ["Nursing support", "المساعدة في التمريض", "नर्सिंग में मदद", "نرسنگ میں مدد", "Pagtulong sa mga nars"],
} satisfies Record<string, Row>;

// The English role-examples fallback has the same two placeholders for these
// families. Translate the placeholders without suggesting any unentered facts.
const title: Row = ["Your job title", "المسمى الوظيفي", "आपके पद का नाम", "آپ کے عہدے کا نام", "Posisyon mo sa trabaho"];
const workplace: Row = ["Your workplace", "مكان عملك", "आपके काम की जगह", "آپ کے کام کی جگہ", "Pinagtatrabahuhan mo"];

function pack(index: 0 | 1 | 2 | 3 | 4): Record<string, string> {
  return Object.fromEntries(Object.entries(roleRows).flatMap(([key, label]) => [
    [`role.label.${key}`, label[index]],
    [`example.title.${key}`, title[index]],
    [`example.company.${key}`, workplace[index]],
  ]));
}

export const roleLabelCompletion = {
  en: pack(0),
  ar: pack(1),
  hi: pack(2),
  ur: pack(3),
  tl: pack(4),
};
