// src/services/userService.js
import { getAuth } from 'firebase/auth';
import API_URL from '../config/api';

async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

// ── GET /usuarios/perfil ──────────────────────────────────────────────────────
export async function obtenerPerfil() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/usuarios/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
}

// ── PUT /usuarios/perfil ──────────────────────────────────────────────────────
export async function actualizarPerfil(nombre) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/usuarios/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
}

// ── GET /reportes/exportar → descarga el CSV ──────────────────────────────────
export async function exportarExcel() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/reportes/exportar`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al exportar datos');

  // Convertir la respuesta a texto CSV
  const csv = await res.text();

  // En web: crear un enlace temporal y forzar la descarga
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = 'movimientos.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}