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

// ── Configura con tus datos de Firebase Console ───────────────────────────────
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

// URL de tu backend Ktor (en desarrollo usa tu IP local, no localhost)

// ── REGISTRO ──────────────────────────────────────────────────────────────────
export async function registerUser({ nombre, email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error en el registro');
  }
  return res.json(); // { uid, email, nombre, message }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  // 1. Firebase SDK hace el login y nos da el idToken
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();

  // 2. Mandamos el token al backend para verificar y obtener datos del usuario
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Error al verificar sesión');
  return res.json(); // { uid, email, nombre, message }
}

// ── RECUPERAR CONTRASEÑA ──────────────────────────────────────────────────────
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('No se pudo enviar el correo');
  return res.json();
}