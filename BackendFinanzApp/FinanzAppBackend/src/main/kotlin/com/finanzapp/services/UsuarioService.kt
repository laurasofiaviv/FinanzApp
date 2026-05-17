package com.finanzapp.services

import com.finanzapp.models.PerfilRequest
import com.finanzapp.models.User
import com.finanzapp.repository.UserRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object UsuarioService {

    // ── GET /usuarios/perfil ──────────────────────────────────────────────

    suspend fun obtenerPerfil(uid: String): User = withContext(Dispatchers.IO) {
        // Primero intenta desde Firestore (fuente principal de datos propios)
        val enFirestore = UserRepository.obtenerUsuario(uid)
        if (enFirestore != null) return@withContext enFirestore

        // Fallback: lee desde Firebase Auth si por alguna razón no está en Firestore
        val record = FirebaseAuth.getInstance().getUserAsync(uid).get()
        User(
            uid    = record.uid,
            nombre = record.displayName ?: "",
            email  = record.email ?: ""
        )
    }

    // ── PUT /usuarios/perfil ──────────────────────────────────────────────

    suspend fun actualizarPerfil(uid: String, req: PerfilRequest): User = withContext(Dispatchers.IO) {
        // 1. Actualizar en Firebase Auth (mantiene el token sincronizado)
        val updateRequest = UserRecord.UpdateRequest(uid).apply {
            req.nombre?.let { setDisplayName(it) }
            req.email?.let  { setEmail(it) }
        }
        FirebaseAuth.getInstance().updateUserAsync(updateRequest).get()

        // 2. Leer datos actuales de Firestore para no pisar campos que no cambiaron
        val actual = UserRepository.obtenerUsuario(uid)
            ?: User(uid = uid, nombre = "", email = "")

        val actualizado = actual.copy(
            nombre = req.nombre ?: actual.nombre,
            email  = req.email  ?: actual.email
        )

        // 3. Guardar en Firestore
        UserRepository.guardarUsuario(actualizado)

        actualizado
    }

    // ── POST /usuarios/cambiar-password ───────────────────────────────────

    suspend fun cambiarPassword(uid: String, nuevaPassword: String): String = withContext(Dispatchers.IO) {
        if (nuevaPassword.length < 6) {
            throw IllegalArgumentException("La contraseña debe tener al menos 6 caracteres")
        }

        // Firebase hashea la contraseña internamente — nunca se guarda en Firestore
        val updateRequest = UserRecord.UpdateRequest(uid)
            .setPassword(nuevaPassword)
        FirebaseAuth.getInstance().updateUserAsync(updateRequest).get()

        "Contraseña actualizada correctamente"
    }
}