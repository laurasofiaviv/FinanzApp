//repository/DeudaRepository

package com.finanzapp.repository

import com.google.firebase.cloud.FirestoreClient
import com.finanzapp.models.Deuda
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object  DeudaRepository {

    private val db get() = FirestoreClient.getFirestore()

    // La ruta usuarios/{uid}/coleccion/{id} aísla los datos por usuario a nivel de Firestore,
    // de forma que las reglas de seguridad pueden reforzar que cada uid solo acceda a los suyos
    private fun coleccion(uid: String) =
        db.collection("usuarios").document(uid).collection("deudas")

    // withContext(Dispatchers.IO) mueve la coroutine al thread pool de I/O,
    // liberando el thread principal de Ktor durante la espera de Firestore
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
            // filterValues { it != null } descarta campos nulos para no sobreescribir
            // datos existentes en Firestore con null en actualizaciones parciales
            val updates = datos.filterValues { it != null }
            if (updates.isNotEmpty()) ref.update(updates).get()
            // Después de actualizar, re-lee el documento para devolver el estado real en Firestore,
            // no el objeto local que podría tener datos desactualizados
            ref.get().get().toObject(Deuda::class.java)!!
        }

    suspend fun eliminar(uid: String, id: String) = withContext(Dispatchers.IO) {
        coleccion(uid).document(id).delete().get()
    }
}