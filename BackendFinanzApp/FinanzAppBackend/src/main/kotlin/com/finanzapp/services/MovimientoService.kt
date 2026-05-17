package com.finanzapp.services

import com.finanzapp.models.Movimiento
import com.finanzapp.models.MovimientoRequest
import com.finanzapp.repository.MovimientoRepository
import java.util.UUID

object MovimientoService {

    suspend fun crear(uid: String, req: MovimientoRequest): Movimiento {
        val movimiento = Movimiento(
            id            = UUID.randomUUID().toString(),
            uid           = uid,
            tipo          = req.tipo,
            monto         = req.monto,
            montoDisplay  = req.montoDisplay,
            categoria     = req.categoria,
            descripcion   = req.descripcion,
            fecha         = req.fecha,
            productoId    = req.productoId,
            pagoConTarjeta = req.pagoConTarjeta,
            recurrente    = req.recurrente,
        )
        return MovimientoRepository.guardar(movimiento)
    }

    suspend fun listar(uid: String): List<Movimiento> =
        MovimientoRepository.obtenerTodos(uid)

    suspend fun listarPorTipo(uid: String, tipo: String): List<Movimiento> =
        MovimientoRepository.obtenerPorTipo(uid, tipo)

    suspend fun eliminar(uid: String, movimientoId: String) =
        MovimientoRepository.eliminar(uid, movimientoId)
}