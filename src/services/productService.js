// src/services/productService.js
import { getAuth } from 'firebase/auth';

import API_URL from '../config/api';

// Obtiene el token del usuario logueado para enviarlo al backend
async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');

  // Obtiene el token JWT de Firebase del usuario actual para autenticar cada request.
  // Se llama en cada función porque el token puede expirar y getIdToken() lo renueva
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
    // Si el backend responde con error HTTP, extrae el mensaje del JSON de respuesta
    // antes de lanzar la excepción, para mostrar mensajes descriptivos al usuario
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
      // El token se envía como Bearer en el header Authorization,
      // que el backend Kotlin valida en cada endpoint protegido
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error('Error al editar producto');
  return res.json();
}