//services/deudaService
import { getAuth } from 'firebase/auth';
import API_URL from '../config/api';


async function getToken() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

export async function crearDeuda(deuda) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/deudas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(deuda),
  });
  if (!res.ok) throw new Error('Error al crear deuda');
  return res.json();
}

export async function obtenerDeudas() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/deudas/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener deudas');
  return res.json();
}

export async function eliminarDeuda(id) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/deudas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar deuda');
  return res.json();
}

export async function abonarDeuda(deudaId, productoPagoId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/deudas/${deudaId}/abonar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productoPagoId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al abonar');
  }
  return res.json();
}