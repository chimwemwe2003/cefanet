"use client";

// Firebase Storage only — used additively for file uploads.
// This does NOT introduce Firestore or Firebase Auth; it uses one Firebase
// product (Storage) the same way the blueprint uses AWS S3.
//
// If the NEXT_PUBLIC_FIREBASE_* env vars are absent, isStorageConfigured()
// returns false and the upload component runs in demo mode (local preview).

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isStorageConfigured(): boolean {
  return Boolean(config.apiKey && config.storageBucket && config.projectId);
}

let _app: FirebaseApp | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!isStorageConfigured()) return null;
  if (typeof window === "undefined") return null;
  if (_storage) return _storage;
  _app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  _storage = getStorage(_app);
  return _storage;
}
