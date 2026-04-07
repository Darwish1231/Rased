import * as admin from 'firebase-admin';
import * as path from 'path';

async function seedStations() {
  const serviceAccount = require(path.join(__dirname, 'firebase-admin-key.json'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  
  const stations = [
    { number: 'ST-001', name: 'محطة كهرباء الشارقة', region: 'Cairo', location: { lat: 30.0444, lng: 31.2357 }, status: 'active', createdAt: new Date().toISOString() },
    { number: 'ST-002', name: 'محطة غرب دمنهور', region: 'Delta', location: { lat: 31.0360, lng: 30.4687 }, status: 'active', createdAt: new Date().toISOString() },
    { number: 'ST-003', name: 'محطة كهرباء البرلس (سيمنز)', region: 'North', location: { lat: 31.5458, lng: 30.9822 }, status: 'active', createdAt: new Date().toISOString() },
    { number: 'ST-004', name: 'محطة العاصمة الإدارية الجديدة', region: 'Cairo', location: { lat: 30.0131, lng: 31.7314 }, status: 'active', createdAt: new Date().toISOString() },
    { number: 'ST-005', name: 'محطة كهرباء بني سويف', region: 'Upper Egypt', location: { lat: 29.0661, lng: 31.0994 }, status: 'active', createdAt: new Date().toISOString() },
    { number: 'ST-006', name: 'محطة جبل الزيت للرياح', region: 'Red Sea', location: { lat: 27.9158, lng: 33.5658 }, status: 'active', createdAt: new Date().toISOString() },
  ];

  const stationsRef = db.collection('stations');
  
  // delete existing for clean slate
  const existing = await stationsRef.get();
  for (const doc of existing.docs) {
    await doc.ref.delete();
  }

  for (const st of stations) {
    await stationsRef.add(st);
  }

  console.log('Stations seeded successfully!');
  process.exit(0);
}

seedStations().catch(console.error);
