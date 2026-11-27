// Draft translations for expanded duties in existing families. Native-speaker review is pending.
// Match the exact English source; never reuse a translation by list position.
// Order: English, Arabic, Hindi, Urdu, Tagalog.
type LocalisedDuty = readonly [string, string, string, string, string];

export const legacyRoleSentenceRows: Record<string, readonly LocalisedDuty[]> = {
  "kitchen-steward": [
    ["Logged dish machine checks on the cleaning sheet.", "دوّنت فحوص آلة غسل الأطباق في سجل التنظيف.", "बर्तन धोने की मशीन की जाँच सफ़ाई शीट पर दर्ज की।", "برتن دھونے کی مشین کی جانچ صفائی شیٹ پر درج کی۔", "Itinala sa cleaning sheet ang mga pagsusuri sa makinang panghugas ng pinggan."],
    ["Separated clean trays from dirty cookware during service.", "فصلت الصواني النظيفة عن أدوات الطهي المتسخة أثناء الخدمة.", "सेवा के दौरान साफ़ ट्रे को गंदे बर्तनों से अलग रखा।", "سروس کے دوران صاف ٹرے گندے برتنوں سے الگ رکھیں۔", "Inihiwalay ang malinis na tray sa maruruming lutuan habang may serbisyo."],
  ],
  housekeeping: [
    ["Recorded rooms that needed maintenance before the next shift.", "سجّلت الغرف التي تحتاج إلى صيانة قبل الوردية التالية.", "अगली शिफ़्ट से पहले रखरखाव की ज़रूरत वाले कमरे दर्ज किए।", "اگلی شفٹ سے پہلے مرمت یا دیکھ بھال والے کمروں کا اندراج کیا۔", "Itinala ang mga kuwartong kailangang ipaayos bago ang susunod na shift."],
    ["Checked spare linen and guest supplies at handover.", "فحصت البياضات الاحتياطية ومستلزمات الضيوف عند تسليم الوردية.", "शिफ़्ट सौंपते समय अतिरिक्त लिनेन और मेहमानों का सामान जाँचा।", "شفٹ حوالے کرتے وقت اضافی لینن اور مہمانوں کا سامان دیکھا۔", "Sinuri ang ekstrang linen at mga gamit ng bisita sa pagpapasa ng shift."],
  ],
  "food-service": [
    ["Issued takeaway orders after checking the ticket.", "سلّمت طلبات الطعام السفري بعد التحقق من قسيمة الطلب.", "टिकट जाँचने के बाद पैक किए गए ऑर्डर सौंपे।", "ٹکٹ دیکھنے کے بعد ساتھ لے جانے والے آرڈر دیے۔", "Ibinigay ang mga takeaway order matapos tingnan ang tiket ng order."],
    ["Cleared used plates and replaced cutlery before the next course.", "رفعت الأطباق المستعملة وبدّلت أدوات المائدة قبل تقديم الطبق التالي.", "अगला व्यंजन परोसने से पहले इस्तेमाल की हुई प्लेटें हटाईं और चम्मच-काँटे बदले।", "اگلی ڈش سے پہلے استعمال شدہ پلیٹیں ہٹائیں اور چھری کانٹے بدلے۔", "Inalis ang nagamit na mga plato at pinalitan ang kubyertos bago ang susunod na putahe."],
  ],
  culinary: [
    ["Prepared a list of ingredients needed for the next service.", "أعددت قائمة بالمكونات اللازمة للخدمة التالية.", "अगली सेवा के लिए ज़रूरी सामग्री की सूची बनाई।", "اگلی سروس کے لیے ضروری اجزا کی فہرست بنائی۔", "Naghanda ng listahan ng mga sangkap na kailangan sa susunod na serbisyo."],
    ["Checked allergy notes against order tickets before plating.", "طابقت ملاحظات الحساسية مع قسائم الطلبات قبل وضع الطعام في الأطباق.", "खाना प्लेट में लगाने से पहले एलर्जी के नोटों को ऑर्डर टिकट से मिलाया।", "کھانا پلیٹ میں ڈالنے سے پہلے الرجی کے نوٹس آرڈر ٹکٹ سے ملائے۔", "Itinugma ang mga tala sa allergy sa mga tiket ng order bago ilagay ang pagkain sa plato."],
  ],
  "front-office": [
    ["Recorded early arrivals and passed room requests to housekeeping.", "سجّلت الوصول المبكر وأحلت طلبات الغرف إلى قسم التدبير الفندقي.", "जल्दी आने वाले मेहमानों का रिकॉर्ड बनाया और कमरों के अनुरोध हाउसकीपिंग को भेजे।", "جلد آنے والے مہمانوں کا اندراج کیا اور کمروں سے متعلق درخواستیں ہاؤس کیپنگ کو بھیجیں۔", "Itinala ang mga maagang dumating at ipinasa sa housekeeping ang mga hiling tungkol sa kuwarto."],
    ["Prepared key cards after checking guest booking details.", "جهّزت بطاقات مفاتيح الغرف بعد التحقق من تفاصيل حجوزات الضيوف.", "मेहमान की बुकिंग की जानकारी देखकर चाबी के कार्ड तैयार किए।", "مہمان کی بکنگ کی تفصیل دیکھ کر چابی والے کارڈ تیار کیے۔", "Inihanda ang mga key card matapos suriin ang detalye ng booking ng bisita."],
  ],
  hr: [
    ["Checked training sign-in sheets against the course list.", "طابقت كشوف حضور التدريب مع قائمة الدورة.", "ट्रेनिंग की हाज़िरी शीट को कोर्स की सूची से मिलाया।", "تربیت کی حاضری کی شیٹ کورس کی فہرست سے ملائی۔", "Itinugma ang mga attendance sheet ng pagsasanay sa listahan ng kurso."],
    ["Filed signed employee forms in the correct staff records.", "حفظت استمارات الموظفين الموقعة في سجلات الموظفين الصحيحة.", "कर्मचारियों के हस्ताक्षर वाले फ़ॉर्म सही स्टाफ़ रिकॉर्ड में रखे।", "ملازمین کے دستخط شدہ فارم درست اسٹاف ریکارڈ میں رکھے۔", "Inilagay ang mga pirmadong form sa tamang rekord ng empleyado."],
  ],
  administration: [
    ["Prepared meeting papers and shared them before the meeting.", "أعددت وثائق الاجتماع وشاركتها قبل انعقاده.", "बैठक के कागज़ तैयार किए और बैठक से पहले साझा किए।", "میٹنگ کے کاغذات تیار کیے اور میٹنگ سے پہلے بانٹے۔", "Naghanda ng mga dokumento at ibinahagi ang mga ito bago ang pagpupulong."],
    ["Recorded incoming parcels and told recipients when they arrived.", "سجّلت الطرود الواردة وأبلغت المستلمين عند وصولها.", "आने वाले पार्सल दर्ज किए और पहुँचने पर पाने वालों को बताया।", "آنے والے پارسل درج کیے اور پہنچنے پر وصول کرنے والوں کو اطلاع دی۔", "Itinala ang mga dumarating na parcel at ipinaalam sa mga tatanggap kapag dumating na ang mga ito."],
  ],
  "retail-sales": [
    ["Prepared reserved items for collection after checking order numbers.", "جهّزت المنتجات المحجوزة للاستلام بعد التحقق من أرقام الطلبات.", "ऑर्डर नंबर देखकर बुक किया हुआ सामान लेने के लिए तैयार किया।", "آرڈر نمبر دیکھ کر مخصوص سامان وصولی کے لیے تیار کیا۔", "Inihanda ang nakareserbang produkto para kunin matapos suriin ang mga order number."],
    ["Removed damaged items from displays and logged the loss.", "أزلت المنتجات التالفة من أماكن العرض وسجّلت الخسارة.", "खराब सामान डिस्प्ले से हटाया और नुकसान दर्ज किया।", "خراب اشیا ڈسپلے سے ہٹائیں اور نقصان کا اندراج کیا۔", "Inalis sa display ang mga sirang produkto at itinala ang nalugi."],
  ],
  "customer-service": [
    ["Checked case notes before calling back about a request.", "راجعت ملاحظات الحالة قبل معاودة الاتصال بشأن الطلب.", "अनुरोध के बारे में दोबारा कॉल करने से पहले केस के नोट देखे।", "درخواست کے بارے میں دوبارہ کال کرنے سے پہلے کیس کے نوٹس دیکھے۔", "Sinuri ang mga tala ng kaso bago tumawag muli tungkol sa isang kahilingan."],
    ["Scheduled customer callbacks and recorded the outcome.", "حدّدت مواعيد لمعاودة الاتصال بالعملاء وسجّلت النتيجة.", "ग्राहकों को दोबारा कॉल करने का समय तय किया और नतीजा दर्ज किया।", "گاہکوں کو دوبارہ کال کرنے کا وقت مقرر کیا اور نتیجہ درج کیا۔", "Nagtakda ng oras para tawagan muli ang customer at itinala ang kinalabasan."],
  ],
  security: [
    ["Issued visitor passes after checking the approved list.", "أصدرت تصاريح دخول الزوار بعد مراجعة القائمة المعتمدة.", "मंज़ूर सूची देखकर विज़िटर पास जारी किए।", "منظور شدہ فہرست دیکھ کر مہمانوں کے پاس جاری کیے۔", "Nagbigay ng visitor pass matapos suriin ang aprubadong listahan."],
    ["Recorded the handover of radios and keys between shifts.", "سجّلت تسليم أجهزة اللاسلكي والمفاتيح بين الورديات.", "शिफ़्ट बदलते समय रेडियो और चाबियाँ सौंपने का रिकॉर्ड बनाया।", "شفٹوں کے درمیان ریڈیو اور چابیاں حوالے کرنے کا اندراج کیا۔", "Itinala ang pagpapasa ng mga radyo at susi sa pagitan ng mga shift."],
  ],
  driver: [
    ["Checked delivery addresses before loading the vehicle.", "تحققت من عناوين التوصيل قبل تحميل المركبة.", "गाड़ी में सामान रखने से पहले डिलीवरी के पते देखे।", "گاڑی لوڈ کرنے سے پہلے ڈیلیوری کے پتے دیکھے۔", "Sinuri ang mga address ng delivery bago magkarga sa sasakyan."],
    ["Recorded the reason for returned items on the route sheet.", "دوّنت سبب إرجاع المنتجات في ورقة خط السير.", "लौटाए गए सामान की वजह रूट शीट पर लिखी।", "واپس کیے گئے سامان کی وجہ روٹ شیٹ پر لکھی۔", "Itinala sa route sheet ang dahilan ng pagsauli ng mga produkto."],
  ],
  warehouse: [
    ["Checked shelf labels against the warehouse stock list.", "طابقت بطاقات الأرفف مع قائمة مخزون المستودع.", "शेल्फ़ के लेबल गोदाम की स्टॉक सूची से मिलाए।", "شیلف کے لیبل گودام کی اسٹاک فہرست سے ملائے۔", "Itinugma ang mga label sa estante sa listahan ng stock ng bodega."],
    ["Logged damaged pallets before moving them out of the aisle.", "سجّلت منصات التحميل التالفة قبل إخراجها من الممر.", "खराब पैलेट रास्ते से हटाने से पहले उनका रिकॉर्ड बनाया।", "خراب پیلٹس راستے سے ہٹانے سے پہلے ان کا اندراج کیا۔", "Itinala ang mga sirang pallet bago alisin sa pasilyo."],
  ],
  cleaning: [
    ["Refilled soap and paper supplies after cleaning washrooms.", "أعدت تزويد دورات المياه بالصابون والمستلزمات الورقية بعد تنظيفها.", "शौचालय साफ़ करने के बाद साबुन और कागज़ का सामान फिर भरा।", "بیت الخلا صاف کرنے کے بعد صابن اور کاغذ کا سامان دوبارہ بھرا۔", "Nagdagdag ng sabon at mga gamit na papel matapos linisin ang mga palikuran."],
    ["Returned cleaning equipment to its marked storage space.", "أعدت معدات التنظيف إلى مكان التخزين المخصص والمحدد بعلامة.", "सफ़ाई के उपकरण निशान लगी जगह पर वापस रखे।", "صفائی کا سامان نشان لگی جگہ پر واپس رکھا۔", "Ibinalik ang mga gamit sa paglilinis sa may markang lagayan."],
  ],
  healthcare: [
    ["Prepared clean linen and supplies before patient rounds.", "جهّزت البياضات النظيفة والمستلزمات قبل جولات المرور على المرضى.", "मरीज़ों के राउंड से पहले साफ़ लिनेन और सामान तैयार किया।", "مریضوں کے راؤنڈ سے پہلے صاف لینن اور سامان تیار کیا۔", "Inihanda ang malinis na linen at mga gamit bago ang pag-ikot sa mga pasyente."],
    ["Checked that used equipment reached the right cleaning area.", "تحققت من وصول المعدات المستعملة إلى منطقة التنظيف المناسبة.", "पक्का किया कि इस्तेमाल किए गए उपकरण सफ़ाई की सही जगह पर पहुँचे।", "دیکھا کہ استعمال شدہ آلات صفائی کی درست جگہ پر پہنچے۔", "Tiniyak na napunta sa tamang lugar ng paglilinis ang mga nagamit na kagamitan."],
  ],
  construction: [
    ["Marked work areas before materials arrived.", "وضعت علامات على مناطق العمل قبل وصول المواد.", "सामग्री पहुँचने से पहले काम की जगहों पर निशान लगाए।", "سامان پہنچنے سے پہلے کام کی جگہوں پر نشان لگائے۔", "Minarkahan ang mga lugar ng trabaho bago dumating ang materyales."],
    ["Logged checks on tools before returning them to stores.", "دوّنت فحوص الأدوات قبل إعادتها إلى المخزن.", "औज़ार स्टोर में वापस रखने से पहले उनकी जाँच दर्ज की।", "اوزار اسٹور میں واپس رکھنے سے پہلے ان کی جانچ درج کی۔", "Itinala ang mga pagsusuri sa kagamitan bago ibalik ang mga ito sa imbakan."],
  ],
  finance: [
    ["Matched receipts to expense entries before approval.", "طابقت الإيصالات مع قيود المصروفات قبل الموافقة.", "मंज़ूरी से पहले रसीदें खर्च की प्रविष्टियों से मिलाईं।", "منظوری سے پہلے رسیدوں کو اخراجات کے اندراجات سے ملایا۔", "Itinugma ang mga resibo sa mga tala ng gastos bago ang pag-apruba."],
    ["Filed paid invoices in the correct month.", "حفظت الفواتير المسددة في ملفات الشهر الصحيح.", "भुगतान किए गए बिल सही महीने की फ़ाइल में रखे।", "ادا شدہ بل درست مہینے کی فائل میں رکھے۔", "Inilagay ang mga bayad nang invoice sa file ng tamang buwan."],
  ],
  technology: [
    ["Confirmed ticket details with users before starting repairs.", "تحققت مع المستخدمين من تفاصيل طلبات الدعم قبل بدء الإصلاحات.", "मरम्मत शुरू करने से पहले टिकट की जानकारी उपयोगकर्ताओं से पक्की की।", "مرمت شروع کرنے سے پہلے صارفین سے ٹکٹ کی تفصیلات کی تصدیق کی۔", "Kinumpirma sa mga user ang detalye ng ticket bago simulan ang pagkukumpuni."],
    ["Recorded test outcomes in the work tracker.", "سجّلت نتائج الاختبارات في نظام متابعة العمل.", "जाँच के नतीजे काम के ट्रैकर में दर्ज किए।", "جانچ کے نتائج کام کے ٹریکر میں درج کیے۔", "Itinala ang mga resulta ng pagsubok sa tracker ng trabaho."],
  ],
};
