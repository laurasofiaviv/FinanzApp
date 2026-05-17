package com.finanzapp.controllers

import com.finanzapp.models.PasswordRequest
import com.finanzapp.models.PerfilRequest
import com.finanzapp.services.AuthService
import com.finanzapp.services.UsuarioService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

object UsuarioController {

    // ── Helper (mismo patrón que Movimiento y Reporte) ────────────────────

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

    // ── GET /usuarios/perfil ──────────────────────────────────────────────

    suspend fun obtenerPerfil(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val perfil = UsuarioService.obtenerPerfil(uid)
            call.respond(HttpStatusCode.OK, perfil)
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (e.message ?: "Error obteniendo perfil"))
            )
        }
    }

    // ── PUT /usuarios/perfil ──────────────────────────────────────────────

    suspend fun actualizarPerfil(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val body = call.receive<PerfilRequest>()

            if (body.nombre == null && body.email == null) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "Debes enviar al menos nombre o email")
                )
                return
            }

            val actualizado = UsuarioService.actualizarPerfil(uid, body)
            call.respond(HttpStatusCode.OK, actualizado)
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Datos inválidos")))
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (e.message ?: "Error actualizando perfil"))
            )
        }
    }

    // ── POST /usuarios/cambiar-password ───────────────────────────────────

    suspend fun cambiarPassword(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val body = call.receive<PasswordRequest>()

            if (body.nuevaPassword.isBlank()) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "nuevaPassword es requerida")
                )
                return
            }

            val mensaje = UsuarioService.cambiarPassword(uid, body.nuevaPassword)
            call.respond(HttpStatusCode.OK, mapOf("message" to mensaje))
        } catch (e: IllegalArgumentException) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Datos inválidos")))
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (e.message ?: "Error cambiando contraseña"))
            )
        }
    }
}