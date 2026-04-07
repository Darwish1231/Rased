/**
 * سكربت التمهيد والحقن (Seed Script).
 * يُستخدم لمرة واحدة لضخ محطات كهربائية حقيقية داخل قاعدة البيانات لتمهيد النظام وبيئة العمل.
 */
const stations = [
  { name: "محطة العاصمة الإدارية الكبرى", type: "توليد مركبة", capacity: "4800 MW" },
  { name: "محطة بنبان للطاقة الشمسية", type: "طاقة متجددة", capacity: "1650 MW" },
  { name: "محطة توليد البرلس", type: "توليد مركبة", capacity: "4800 MW" },
  { name: "محطة السد العالي", type: "كهرومائية", capacity: "2100 MW" },
  { name: "محطة توليد غياضة (بني سويف)", type: "توليد مركبة", capacity: "4800 MW" },
  { name: "محطة 6 أكتوبر غرب للتوزيع", type: "توزيع رئيسية", capacity: "600 MW" },
  { name: "محطة أبو قير الحرارية", type: "بخارية", capacity: "2000 MW" }
];

async function seedStations() {
  console.log("Seeding stations...");
  for (const st of stations) {
    try {
      const res = await fetch("http://localhost:4000/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(st)
      });
      console.log(`Added: ${st.name}`);
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Done!");
}
seedStations();
