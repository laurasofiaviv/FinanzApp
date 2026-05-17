//controllers/DeudaController
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
import com.finanzapp.models.AbonoResponse

object DeudaController {

    private suspend fun getUid(call: ApplicationCall): String? {
        val token = call.request.headers["Authorization"]
            ?.removePrefix("Bearer ") ?: return null
        return try {
            AuthService.verificarToken(token)
        } catch (e: Exception) {
            null
        }
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

            val producto = ProductoRepository.obtenerPorId(uid, body.productoPagoId)
                ?: throw Exception("Producto no encontrado")

            val interes = deuda.interes.toDoubleOrNull() ?: 0.0
            val cuotas = deuda.cuotas.toIntOrNull() ?: 1
            val saldoPendiente = deuda.monto - deuda.montoPagado

            // ── Calcular montoPago según tipo de deuda ────────────────────
            val montoPago: Double = when (deuda.tipo) {

                // ── INTERÉS SIMPLE (Deuda personal) ───────────────────────
                // Interés se calculó una vez al crear: monto ya incluye interés
                // El abono descuenta del saldo pendiente directamente
                "Deuda personal" -> {
                    if (cuotas <= 1) {
                        // Pago total con interés simple acumulado
                        val montoConInteres = deuda.monto * (1 + interes / 100)
                        montoConInteres - deuda.montoPagado
                    } else {
                        // Cuota fija = (monto + interés total) / cuotas
                        val montoConInteres = deuda.monto * (1 + interes / 100)
                        montoConInteres / cuotas
                    }
                }

                // ── INTERÉS ROTATIVO (Tarjeta de crédito) ─────────────────
                // El interés se recalcula cada mes sobre el saldo pendiente
                "Tarjeta de crédito" -> {
                    val interesDelMes = saldoPendiente * (interes / 100)
                    val pagoMinimo = deuda.pagoMinimo
                    // El pago mínimo cubre primero el interés del mes
                    // Si no hay pago mínimo definido, cobra solo el interés + 5% del capital
                    if (pagoMinimo > 0) pagoMinimo
                    else interesDelMes + (saldoPendiente * 0.05)
                }

                // ── CUOTAS AMORTIZADAS (Préstamo bancario) ────────────────
                // Fórmula: cuota = P * (r * (1+r)^n) / ((1+r)^n - 1)
                // donde P=capital, r=tasa mensual, n=cuotas totales
                "Préstamo bancario" -> {
                    if (interes <= 0 || cuotas <= 1) {
                        deuda.monto / cuotas
                    } else {
                        val r = interes / 100
                        val n = cuotas.toDouble()
                        deuda.monto * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
                    }
                }

                // ── OTROS TIPOS: sin interés, cuota fija ──────────────────
                else -> {
                    if (cuotas <= 1) saldoPendiente
                    else deuda.monto / cuotas
                }
            }

            if (montoPago <= 0) throw Exception("No hay saldo pendiente")

            // ── Validar saldo del producto ────────────────────────────────
            if (producto.saldoActual < montoPago)
                throw Exception("Saldo insuficiente en ${producto.nombre}. Necesitas $${montoPago.toLong()}")

            // ── Descontar saldo del producto ──────────────────────────────
            ProductoRepository.actualizar(
                uid, body.productoPagoId, mapOf(
                    "saldoActual" to (producto.saldoActual - montoPago)
                )
            )

            // ── Actualizar deuda ──────────────────────────────────────────
            // Para tarjeta rotatoria: el montoPagado acumula los pagos
            // Para los demás: reduce el saldo pendiente normalmente
            val nuevasCuotasPagadas = deuda.cuotasPagadas + 1

            val nuevoMontoPagado = when (deuda.tipo) {
                "Tarjeta de crédito" -> {
                    // Solo la parte que va a capital (montoPago - interés del mes)
                    val interesDelMes = saldoPendiente * (interes / 100)
                    val abonoCapital = montoPago - interesDelMes
                    deuda.montoPagado + maxOf(abonoCapital, 0.0)
                }

                else -> deuda.montoPagado + montoPago
            }

            val nuevoEstado = if (nuevoMontoPagado >= deuda.monto) "pagada" else "pendiente"

            val deudaActualizada = DeudaRepository.actualizar(
                uid, deudaId, mapOf(
                    "montoPagado" to nuevoMontoPagado,
                    "cuotasPagadas" to nuevasCuotasPagadas,
                    "estado" to nuevoEstado,
                )
            )

            call.respond(
                HttpStatusCode.OK, AbonoResponse(
                    deuda = deudaActualizada,
                    montoPago = montoPago
                )
            )

        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }
}