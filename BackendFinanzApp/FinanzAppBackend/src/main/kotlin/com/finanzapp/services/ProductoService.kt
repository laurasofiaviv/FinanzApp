//services/ProductoService
package com.finanzapp.services

import com.finanzapp.models.Producto
import com.finanzapp.models.ProductoRequest
import com.finanzapp.repository.ProductoRepository
import java.util.UUID

object ProductoService {

    suspend fun crear(uid: String, req: ProductoRequest): Producto {
        val producto = Producto(
            id         = UUID.randomUUID().toString(),
            uid        = uid,
            tipo       = req.tipo,
            nombre     = req.nombre,
            banco      = req.banco,
            franquicia = req.franquicia,
            cupoTotal  = req.cupoTotal,
            diaCorte   = req.diaCorte,
            diaPago    = req.diaPago,
            saldoActual = req.saldoActual,
            interesMensual = req.interesMensual,
        )
        return ProductoRepository.guardar(producto)
    }

    suspend fun listar(uid: String): List<Producto> =
        ProductoRepository.obtenerTodos(uid)

    suspend fun eliminar(uid: String, productoId: String) =
        ProductoRepository.eliminar(uid, productoId)
}