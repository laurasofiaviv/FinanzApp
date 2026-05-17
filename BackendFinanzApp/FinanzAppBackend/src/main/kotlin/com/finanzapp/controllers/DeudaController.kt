package com.finanzapp.controllers

import com.finanzapp.models.AbonoRequest
import com.finanzapp.models.Deuda
import com.finanzapp.repository.DeudaRepository
import com.finanzapp.repository.ProductoRepository
import com.finanzapp.services.AuthService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import java.util.UUID

object DeudaController {

    private suspend fun getUid(call: ApplicationCall): String? {
        val token = call.request.headers["Authorization"]
            ?.removePrefix("Bearer ") ?: return null
        return try { AuthService.verificarToken(token) } catch (e: Exception) { null }
    }

    suspend fun crear(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val body = call.receive<Deuda>()
            val deuda = body.copy(
                id = UUID.randomUUID().toString(),
                uid = uid,
                montoPagado = 0.0,
                cuotasPagadas = 0,
                estado = "pendiente",
                creadoEn = System.currentTimeMillis()
            )
            val guardada = DeudaRepository.guardar(deuda)
            call.respond(HttpStatusCode.Created, guardada)
        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun listar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val deudas = DeudaRepository.obtenerTodas(uid)
            call.respond(HttpStatusCode.OK, deudas)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun eliminar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val id = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            DeudaRepository.eliminar(uid, id)
            call.respond(HttpStatusCode.OK, mapOf("message" to "Deuda eliminada"))
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }

    // ── ABONAR: descuenta saldo del producto y actualiza la deuda ─────────
    suspend fun abonar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val deudaId = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            val body = call.receive<AbonoRequest>()
            val deuda = DeudaRepository.obtenerPorId(uid, deudaId)
                ?: throw Exception("Deuda no encontrada")

            // Calcular monto a pagar
            val cuotas = deuda.cuotas.toIntOrNull() ?: 1
            val montoPago = if (cuotas <= 1)
                deuda.monto - deuda.montoPagado
            else
                deuda.monto / cuotas

            if (montoPago <= 0) throw Exception("No hay saldo pendiente")

            // Verificar y descontar saldo del producto
            val producto = ProductoRepository.obtenerPorId(uid, body.productoPagoId)
                ?: throw Exception("Producto no encontrado")
            if ((producto.saldoActual) < montoPago)
                throw Exception("Saldo insuficiente en ${producto.nombre}")

            ProductoRepository.actualizar(uid, body.productoPagoId, mapOf(
                "saldoActual" to (producto.saldoActual - montoPago)
            ))

            // Actualizar deuda
            val nuevasCuotasPagadas = deuda.cuotasPagadas + 1
            val nuevoMontoPagado = deuda.montoPagado + montoPago
            val nuevoEstado = if (nuevoMontoPagado >= deuda.monto) "pagada" else "pendiente"

            val deudaActualizada = DeudaRepository.actualizar(uid, deudaId, mapOf(
                "montoPagado"   to nuevoMontoPagado,
                "cuotasPagadas" to nuevasCuotasPagadas,
                "estado"        to nuevoEstado,
            ))

            call.respond(HttpStatusCode.OK, mapOf(
                "deuda"    to deudaActualizada,
                "montoPago" to montoPago
            ))
        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }
}