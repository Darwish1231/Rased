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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
let FirebaseService = class FirebaseService {
    defaultApp;
    onModuleInit() {
        if (!admin.apps.length) {
            try {
                let credential;
                if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
                    let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
                    privateKey = privateKey.replace(/\\n/g, '\n');
                    if (!privateKey.includes('\n')) {
                        privateKey = privateKey
                            .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
                            .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
                    }
                    credential = admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
                        privateKey: privateKey,
                    });
                }
                else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
                    const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
                    if (config.private_key) {
                        config.private_key = config.private_key.replace(/\\n/g, '\n');
                    }
                    credential = admin.credential.cert(config);
                }
                else {
                    const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
                    credential = admin.credential.cert(require(serviceAccountPath));
                }
                this.defaultApp = admin.initializeApp({ credential });
                console.log('Firebase Admin Connected Successfully! 🔥');
            }
            catch (error) {
                throw new Error(`Failed to initialize Firebase: ${error.message}`);
            }
        }
        else {
            this.defaultApp = admin.app();
        }
    }
    getAuth() {
        return this.defaultApp.auth();
    }
    getFirestore() {
        return this.defaultApp.firestore();
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map