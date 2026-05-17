package com.finanzapp.controllers

import com.finanzapp.models.MovimientoRequest
import com.finanzapp.services.AuthService
import com.finanzapp.services.MovimientoService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

object MovimientoController {

    private suspend fun getUid(call: ApplicationCall): String? {
        val token = call.request.headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return null
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
            val body = call.receive<MovimientoRequest>()
            val movimiento = MovimientoService.crear(uid, body)
            call.respond(HttpStatusCode.Created, movimiento)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun listar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            // Filtra por tipo si viene el query param ?tipo=gasto o ?tipo=ingreso
            val tipo = call.request.queryParameters["tipo"]
            val movimientos = if (tipo != null)
                MovimientoService.listarPorTipo(uid, tipo)
            else
                MovimientoService.listar(uid)
            call.respond(HttpStatusCode.OK, movimientos)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun eliminar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val movimientoId = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            MovimientoService.eliminar(uid, movimientoId)
            call.respond(HttpStatusCode.OK, mapOf("message" to "Movimiento eliminado"))
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }
}