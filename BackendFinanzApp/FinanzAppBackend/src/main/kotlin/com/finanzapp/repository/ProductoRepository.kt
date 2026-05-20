//src/main/kotlin/com/finanzapp/repository/ProductoRepository.kt

package com.finanzapp.repository

import com.google.firebase.cloud.FirestoreClient
import com.finanzapp.models.Producto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object ProductoRepository {

    private val db get() = FirestoreClient.getFirestore()

    // Ruta: usuarios/{uid}/productos/{productoId}
    private fun coleccion(uid: String) =
        db.collection("usuarios").document(uid).collection("productos")

    suspend fun guardar(producto: Producto): Producto = withContext(Dispatchers.IO) {
        val ref = coleccion(producto.uid).document(producto.id)
        ref.set(producto).get()
        producto
    }

    suspend fun obtenerTodos(uid: String): List<Producto> = withContext(Dispatchers.IO) {
        coleccion(uid).get().get()
            .documents
            .mapNotNull { it.toObject(Producto::class.java) }

    }

    suspend fun eliminar(uid: String, productoId: String) = withContext(Dispatchers.IO) {
        coleccion(uid).document(productoId).delete().get()
    }

    // ProductoRepository.kt — replace the entire actualizar function
    suspend fun actualizar(uid: String, id: String, datos: Map<String, Any?>): Producto =
        withContext(Dispatchers.IO) {
            val ref = coleccion(uid).document(id)

            // 1. Verify the document exists and belongs to this user
            val snap = ref.get().get()
            if (!snap.exists()) throw Exception("Producto no encontrado")

            // 2. Filter nulls and update
            val updates = datos.filterValues { it != null }
            if (updates.isNotEmpty()) ref.update(updates).get()

            // 3. Read back and return the updated document
            val updated = ref.get().get()
            Producto(
                id = updated.id,
                uid = updated.getString("uid") ?: "",
                tipo = updated.getString("tipo") ?: "",
                nombre = updated.getString("nombre") ?: "",
                banco = updated.getString("banco") ?: "",
                franquicia = updated.getString("franquicia"),
                cupoTotal = updated.getDouble("cupoTotal"),
                diaCorte = updated.getLong("diaCorte")?.toInt(),
                diaPago = updated.getLong("diaPago")?.toInt(),
                saldoActual = updated.getDouble("saldoActual") ?: 0.0,
                saldoUsado = updated.getDouble("saldoUsado") ?: 0.0,
                creadoEn = updated.getLong("creadoEn") ?: System.currentTimeMillis(),
                interesMensual = updated.getDouble("interesMensual") ?: 0.0,
            )
        }

    suspend fun obtenerPorId(uid: String, id: String): Producto? = withContext(Dispatchers.IO) {
        val doc = coleccion(uid).document(id).get().get()
        if (!doc.exists()) return@withContext null
        Producto(
            id = doc.id,
            uid = doc.getString("uid") ?: "",
            tipo = doc.getString("tipo") ?: "",
            nombre = doc.getString("nombre") ?: "",
            banco = doc.getString("banco") ?: "",
            franquicia = doc.getString("franquicia"),
            cupoTotal = doc.getDouble("cupoTotal"),
            // obtenerPorId en ProductoRepository construye el objeto manualmente
            // en vez de usar toObject(), porque Firestore guarda diaCorte como Long
            // y el modelo espera Int; sin esta conversión el campo llegaría como null
            diaCorte = doc.getLong("diaCorte")?.toInt(),
            diaPago = doc.getLong("diaPago")?.toInt(),
            saldoActual = doc.getDouble("saldoActual") ?: 0.0,
            saldoUsado = doc.getDouble("saldoUsado") ?: 0.0,
            creadoEn = doc.getLong("creadoEn") ?: System.currentTimeMillis(),
            interesMensual = doc.getDouble("interesMensual") ?: 0.0,
        )
    }
}