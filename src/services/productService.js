// src/services/productService.js
import { getAuth } from 'firebase/auth';

import API_URL from '../config/api';

// Obtiene el token del usuario logueado para enviarlo al backend
async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

// ── CREAR PRODUCTO ────────────────────────────────────────────────────────
export async function crearProducto(producto) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/productos/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear producto');
  }
  return res.json();
}

// ── OBTENER PRODUCTOS ─────────────────────────────────────────────────────
export async function obtenerProductos() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/productos/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

// ── ELIMINAR PRODUCTO ─────────────────────────────────────────────────────
export async function eliminarProducto(productoId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar producto');
  return res.json();
}

// ── EDITAR PRODUCTO ───────────────────────────────────────────────────────
export async function editarProducto(productoId, datos) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error('Error al editar producto');
  return res.json();
}