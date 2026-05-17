// src/main/kotlin/com/finanzapp/repository/UserRepository.kt
package com.finanzapp.repository

import com.google.firebase.cloud.FirestoreClient
import com.finanzapp.models.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object UserRepository {

    private val db get() = FirestoreClient.getFirestore()

    suspend fun guardarUsuario(user: User) = withContext(Dispatchers.IO) {
        db.collection("usuarios")
            .document(user.uid)
            .set(user)
            .get()
    }

    // Devuelve el objeto User (para authRoutes, igual que antes)
    suspend fun obtenerUsuario(uid: String): User? = withContext(Dispatchers.IO) {
        val doc = db.collection("usuarios").document(uid).get().get()
        if (doc.exists()) doc.toObject(User::class.java) else null
    }

    // ── NUEVOS ────────────────────────────────────────────────────────────

    suspend fun obtenerPerfil(uid: String): Map<String, Any?> = withContext(Dispatchers.IO) {
        val doc = db.collection("usuarios").document(uid).get().get()
        if (!doc.exists()) throw Exception("Usuario no encontrado")
        mapOf(
            "uid"      to uid,
            "nombre"   to doc.getString("nombre"),
            "email"    to doc.getString("email"),
            "creadoEn" to doc.getString("creadoEn"),
        )
    }

    suspend fun actualizarNombre(uid: String, nombre: String): Map<String, Any?> =
        withContext(Dispatchers.IO) {
            val docRef = db.collection("usuarios").document(uid)
            docRef.update("nombre", nombre).get()
            val doc = docRef.get().get()
            mapOf(
                "uid"    to uid,
                "nombre" to doc.getString("nombre"),
                "email"  to doc.getString("email"),
            )
        }
}