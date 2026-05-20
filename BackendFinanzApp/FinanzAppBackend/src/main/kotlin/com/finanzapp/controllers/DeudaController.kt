//controllers/DeudaController
package com.finanzapp.controllers

import com.finanzapp.models.AbonoRequest
import com.finanzapp.models.Deuda
import com.finanzapp.repository.DeudaRepository
import com.finanzapp.repository.ProductoRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import java.util.UUID
import com.finanzapp.models.AbonoResponse
import com.finanzapp.utils.getUid
import com.finanzapp.services.DeudaService

object DeudaController {


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
            // Obtiene la deuda y el producto de pago, lanzando excepción si alguno no existe.
// El throw detiene la ejecución y cae al catch, que responde con 400 + mensaje
            val deuda = DeudaRepository.obtenerPorId(uid, deudaId) ?: throw Exception("Deuda no encontrada")
            val producto =
                ProductoRepository.obtenerPorId(uid, body.productoPagoId) ?: throw Exception("Producto no encontrado")

            val saldoPendiente = deuda.monto - deuda.montoPagado

// ── Calcular montos ───────────────────────────────────────────────────
            val montoPago: Double
            val interesDelMes: Double
            val totalDebitado: Double

            // Tarjeta de crédito: el usuario elige cuánto abona y se cobra interés sobre
            // el saldo pendiente completo (no sobre el abono)
            if (deuda.tipo == "Tarjeta de crédito") {
                if (body.montoAbono <= 0) throw Exception("El monto del abono debe ser mayor a cero")
                if (body.montoAbono > saldoPendiente) throw Exception("El abono supera el saldo pendiente")
                montoPago = body.montoAbono
                interesDelMes = saldoPendiente * (producto.interesMensual / 100)
                totalDebitado = montoPago + interesDelMes // lo que realmente sale del bolsillo
            } else {
                // Otros tipos de deuda: el service calcula la cuota fija automáticamente
                montoPago = DeudaService.calcularMontoCuota(deuda)
                interesDelMes = 0.0
                totalDebitado = montoPago // sin interés adicional
                if (montoPago <= 0) throw Exception("No hay saldo pendiente")
            }

// ── Validar saldo del producto de pago ────────────────────────────────
            // Valida saldo antes de hacer cualquier escritura en Firestore,
            // el mensaje incluye el desglose abono + interés para que el usuario entienda
            if (producto.saldoActual < totalDebitado) throw Exception(
                "Saldo insuficiente en ${producto.nombre}. " + "Necesitas $${totalDebitado.toLong()} " + "(abono $${montoPago.toLong()} + interés $${interesDelMes.toLong()})"
            )

// ── Descontar del producto de pago ────────────────────────────────────
            // Tres escrituras en Firestore en secuencia:
            // 1. Descuenta del producto de pago (cuenta/efectivo desde donde sale el dinero)
            ProductoRepository.actualizar(
                uid, body.productoPagoId, mapOf(
                    "saldoActual" to (producto.saldoActual - totalDebitado)
                )
            )

// ── Si es tarjeta de crédito, reducir saldoUsado del producto vinculado ──
            // 2. Si la deuda era de tarjeta de crédito, libera cupo en la tarjeta vinculada.
            //    maxOf(..., 0.0) evita que saldoUsado quede negativo por redondeos
            if (deuda.tipo == "Tarjeta de crédito" && deuda.productoId != null) {
                val productoTarjeta = ProductoRepository.obtenerPorId(uid, deuda.productoId)
                if (productoTarjeta != null) {
                    ProductoRepository.actualizar(
                        uid, deuda.productoId, mapOf(
                            "saldoUsado" to maxOf((productoTarjeta.saldoUsado) - montoPago, 0.0)
                        )
                    )
                }
            }

// ── Actualizar deuda ──────────────────────────────────────────────────
            val nuevasCuotasPagadas = deuda.cuotasPagadas + 1
            val nuevoMontoPagado = deuda.montoPagado + montoPago
            // 3. Actualiza la deuda: acumula lo pagado y cambia estado a "pagada"
            //    si el total pagado ya cubre el monto original
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
                    deuda = deudaActualizada, montoPago = totalDebitado   // lo que realmente salió del bolsillo
                )
            )

        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun actualizar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val id = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            // Recibir como Deuda parcial — más simple que JsonElement
            val body = call.receive<Deuda>()
            val datos = mutableMapOf<String, Any?>()
            if (body.monto > 0) datos["monto"] = body.monto
            if (body.montoPagado > 0) datos["montoPagado"] = body.montoPagado
            if (body.estado.isNotEmpty()) datos["estado"] = body.estado

            val actualizada = DeudaRepository.actualizar(uid, id, datos)
            call.respond(HttpStatusCode.OK, actualizada)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }


}