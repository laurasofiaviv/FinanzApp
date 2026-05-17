package com.finanzapp.repository

import com.google.firebase.cloud.FirestoreClient
import com.finanzapp.models.Movimiento
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object MovimientoRepository {

    private val db get() = FirestoreClient.getFirestore()

    // usuarios/{uid}/movimientos/{movimientoId}
    private fun coleccion(uid: String) =
        db.collection("usuarios").document(uid).collection("movimientos")

    suspend fun guardar(movimiento: Movimiento): Movimiento = withContext(Dispatchers.IO) {
        coleccion(movimiento.uid).document(movimiento.id).set(movimiento).get()
        movimiento
    }

    suspend fun obtenerTodos(uid: String): List<Movimiento> = withContext(Dispatchers.IO) {
        coleccion(uid).get().get()
            .documents
            .mapNotNull { it.toObject(Movimiento::class.java) }
            .sortedByDescending { it.creadoEn }
    }

    suspend fun obtenerPorTipo(uid: String, tipo: String): List<Movimiento> = withContext(Dispatchers.IO) {
        coleccion(uid)
            .whereEqualTo("tipo", tipo)
            .get().get()
            .documents
            .mapNotNull { it.toObject(Movimiento::class.java) }
            .sortedByDescending { it.creadoEn }
    }

    suspend fun eliminar(uid: String, movimientoId: String) = withContext(Dispatchers.IO) {
        coleccion(uid).document(movimientoId).delete().get()
    }
}