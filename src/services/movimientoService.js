// src/services/movimientoService.js
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.48:8080';

async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

// ── CREAR MOVIMIENTO (gasto o ingreso) ────────────────────────────────────
export async function crearMovimiento(movimiento) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/movimientos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(movimiento),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al guardar movimiento');
  }
  return res.json();
}

// ── OBTENER MOVIMIENTOS ───────────────────────────────────────────────────
export async function obtenerMovimientos(tipo = null) {
  const token = await getToken();
  const url = tipo
    ? `${API_URL}/movimientos/?tipo=${tipo}`
    : `${API_URL}/movimientos/`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener movimientos');
  return res.json();
}

// ── ELIMINAR MOVIMIENTO ───────────────────────────────────────────────────
export async function eliminarMovimiento(movimientoId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/movimientos/${movimientoId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar movimiento');
  return res.json();
}