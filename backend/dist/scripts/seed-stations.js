"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                let value = valueParts.join('=').trim();
                if (value.startsWith('"') && value.endsWith('"'))
                    value = value.slice(1, -1);
                process.env[key.trim()] = value;
            }
        });
    }
}
async function seed() {
    loadEnv();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ Error: Firebase environment variables are missing in .env');
        process.exit(1);
    }
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
    const db = admin.firestore();
    const stationsCollection = db.collection('stations');
    const sampleStations = [
        {
            stationNumber: 'ST-HALFA',
            name: 'Wadi Halfa Solar Power',
            region: 'Northern Province',
            location: { lat: 21.8000, lng: 31.3500 },
            address: 'Near Lake Nubia, Wadi Halfa',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            stationNumber: 'ST-PORT',
            name: 'Port Sudan Thermal',
            region: 'Red Sea State',
            location: { lat: 19.6175, lng: 37.2164 },
            address: 'Main Port Industrial Area',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            stationNumber: 'ST-ROSEIRES',
            name: 'Roseires Hydroelectric Dam',
            region: 'Blue Nile',
            location: { lat: 11.8547, lng: 34.3853 },
            address: 'Ad-Damazin, Blue Nile River',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            stationNumber: 'ST-MARAWI',
            name: 'Merowe Hydro Station',
            region: 'Northern State',
            location: { lat: 18.6681, lng: 31.8156 },
            address: 'Merowe Dam, 4th Cataract',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    console.log('🚀 Starting Seeding Process...');
    for (const station of sampleStations) {
        const existing = await stationsCollection.where('stationNumber', '==', station.stationNumber).get();
        if (existing.empty) {
            await stationsCollection.add(station);
            console.log(`✅ Added: ${station.name} (${station.stationNumber})`);
        }
        else {
            console.log(`⚠️ Skipped: ${station.name} (Already exists)`);
        }
    }
    console.log('✨ Seeding Completed Successfully!');
    process.exit(0);
}
seed().catch(err => {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-stations.js.map