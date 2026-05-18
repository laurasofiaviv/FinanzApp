// src/services/authService.js
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import API_URL from '../config/api';

const firebaseConfig = {
  apiKey: "AIzaSyBoZBFHeyWj_vkQfsF-otA_0y6N28yMgQw",
  authDomain: "finanzapp-8def8.firebaseapp.com",
  projectId: "finanzapp-8def8",
  storageBucket: "finanzapp-8def8.firebasestorage.app",
  messagingSenderId: "94184381399",
  appId: "1:94184381399:web:d51f12e8832842c1620992",
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();

// ── REGISTRO ──────────────────────────────────────────────────────────────────
export async function registerUser({ nombre, email, password }) {
  // 1. Firebase cliente crea la cuenta
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Envía el correo de verificación
  await sendEmailVerification(credential.user);

  // 3. Guarda en Firestore via backend
  const idToken = await credential.user.getIdToken();
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, idToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error en el registro');
  }

  // Sin signOut — AppNavigator detecta emailVerified=false y muestra EmailSent
  return await res.json();
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Error al verificar sesión');
  return res.json();
}

// ── RECUPERAR CONTRASEÑA ──────────────────────────────────────────────────────
export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
  return { message: `Correo de recuperación enviado a ${email}` };
}