// src/services/userService.js
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.48:8080';

async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

export async function obtenerPerfil() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/usuarios/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
}

export async function actualizarPerfil(nombre) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/usuarios/me`, {
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