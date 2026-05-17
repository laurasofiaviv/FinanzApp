//repository/DeudaRepository

package com.finanzapp.repository

import com.google.firebase.cloud.FirestoreClient
import com.finanzapp.models.Deuda
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object  DeudaRepository {

    private val db get() = FirestoreClient.getFirestore()

    private fun coleccion(uid: String) =
        db.collection("usuarios").document(uid).collection("deudas")

    suspend fun guardar(deuda: Deuda): Deuda = withContext(Dispatchers.IO) {
        coleccion(deuda.uid).document(deuda.id).set(deuda).get()
        deuda
    }

    suspend fun obtenerTodas(uid: String): List<Deuda> = withContext(Dispatchers.IO) {
        coleccion(uid).get().get()
            .documents
            .mapNotNull { it.toObject(Deuda::class.java) }
            .sortedByDescending { it.creadoEn }
    }

    suspend fun obtenerPorId(uid: String, id: String): Deuda? = withContext(Dispatchers.IO) {
        val doc = coleccion(uid).document(id).get().get()
        if (doc.exists()) doc.toObject(Deuda::class.java) else null
    }

    suspend fun actualizar(uid: String, id: String, datos: Map<String, Any?>): Deuda =
        withContext(Dispatchers.IO) {
            val ref = coleccion(uid).document(id)
            val updates = datos.filterValues { it != null }
            if (updates.isNotEmpty()) ref.update(updates).get()
            ref.get().get().toObject(Deuda::class.java)!!
        }

    suspend fun eliminar(uid: String, id: String) = withContext(Dispatchers.IO) {
        coleccion(uid).document(id).delete().get()
    }
}