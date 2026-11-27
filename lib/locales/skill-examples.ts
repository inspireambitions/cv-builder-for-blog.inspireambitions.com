// Machine-translated first pass. Native-speaker review pending for non-English packs.
// These are interface examples, never auto-inserted as candidate skills.
const examples: Record<string, readonly [string, string, string, string, string]> = {
  housekeeping: ["Housekeeping procedures", "إجراءات تنظيف الغرف", "कमरों की सफ़ाई के नियम", "کمروں کی صفائی کے اصول", "Paglilinis ng kuwarto ayon sa pamantayan"],
  "kitchen-steward": ["Kitchen cleaning", "تنظيف المطبخ", "रसोई की सफ़ाई", "باورچی خانے کی صفائی", "Paglilinis ng kusina"],
  "food-service": ["Guest service", "خدمة الضيوف", "मेहमानों की सेवा", "مہمانوں کی خدمت", "Pag-asikaso sa mga bisita"],
  culinary: ["Food preparation", "تحضير الطعام", "खाना तैयार करना", "کھانا تیار کرنا", "Paghahanda ng pagkain"],
  "front-office": ["Guest check-in", "تسجيل وصول الضيوف", "मेहमानों का चेक-इन", "مہمانوں کا چیک اِن", "Pag-check in ng mga bisita"],
  hr: ["Employee records", "سجلات الموظفين", "कर्मचारियों के रिकॉर्ड", "ملازمین کے ریکارڈ", "Mga rekord ng empleyado"],
  administration: ["Record keeping", "حفظ السجلات", "रिकॉर्ड रखना", "ریکارڈ رکھنا", "Pag-aayos ng mga rekord"],
  security: ["Safety checks", "فحوصات السلامة", "सुरक्षा की जाँच", "حفاظت کی جانچ", "Pagsusuri ng kaligtasan"],
  driver: ["Safe driving", "القيادة الآمنة", "सुरक्षित ड्राइविंग", "محفوظ ڈرائیونگ", "Ligtas na pagmamaneho"],
  cleaning: ["Safe chemical use", "الاستخدام الآمن للمواد الكيميائية", "रसायनों का सुरक्षित इस्तेमाल", "کیمیکلز کا محفوظ استعمال", "Ligtas na paggamit ng panlinis"],
  "retail-sales": ["Customer service", "خدمة العملاء", "ग्राहकों की सेवा", "گاہکوں کی خدمت", "Pag-asikaso sa mga customer"],
  "customer-service": ["Handling customer requests", "التعامل مع طلبات العملاء", "ग्राहकों के अनुरोध संभालना", "گاہکوں کی درخواستیں سنبھالنا", "Pagtugon sa mga hiling ng customer"],
  warehouse: ["Stock checks", "فحص المخزون", "स्टॉक की जाँच", "اسٹاک کی جانچ", "Pagbilang at pagsusuri ng stock"],
  construction: ["Site safety", "سلامة موقع العمل", "साइट की सुरक्षा", "سائٹ کی حفاظت", "Kaligtasan sa lugar ng trabaho"],
  healthcare: ["Patient care", "رعاية المرضى", "मरीज़ों की देखभाल", "مریضوں کی دیکھ بھال", "Pag-aalaga ng pasyente"],
  finance: ["Invoice checks", "مراجعة الفواتير", "बिलों की जाँच", "بلوں کی جانچ", "Pagsusuri ng mga invoice"],
  education: ["Classroom support", "المساعدة في الفصل", "कक्षा में सहायता", "کلاس میں مدد", "Pagtulong sa klase"],
  technology: ["Computer support", "الدعم الفني للحاسوب", "कंप्यूटर सहायता", "کمپیوٹر کی مدد", "Pag-aayos at pagtulong sa computer"],
  general: ["A skill you use at work", "مهارة تستخدمها في عملك", "काम में इस्तेमाल होने वाला कौशल", "کام میں استعمال ہونے والی مہارت", "Kasanayang ginagamit mo sa trabaho"],
};
function pack(index: number): Record<string, string> {
  return Object.fromEntries(Object.entries(examples).map(([family, values]) => [`example.skill.${family}`, values[index]]));
}
export const skillExampleTranslations = { en: pack(0), ar: pack(1), hi: pack(2), ur: pack(3), tl: pack(4) };
