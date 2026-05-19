//src/main/kotlin/com/finanzapp/controllers/AuthController
package com.finanzapp.controllers

import com.finanzapp.models.ForgotPasswordRequest
import com.finanzapp.models.LoginRequest
import com.finanzapp.models.RegisterRequest
import com.finanzapp.services.AuthService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

object AuthController {

    suspend fun register(call: ApplicationCall) {
        try {
            val body = call.receive<RegisterRequest>()
            val response = AuthService.register(body)
            call.respond(HttpStatusCode.Created, response)
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "Error en el registro"))
            )
        }
    }

    suspend fun login(call: ApplicationCall) {
        try {
            val body = call.receive<LoginRequest>()
            val response = AuthService.login(body.idToken)
            call.respond(HttpStatusCode.OK, response)
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.Unauthorized,
                mapOf("error" to "Token inválido o expirado")
            )
        }
    }

    suspend fun forgotPassword(call: ApplicationCall) {
        try {
            val body = call.receive<ForgotPasswordRequest>()
            val msg = AuthService.forgotPassword(body.email)
            call.respond(HttpStatusCode.OK, mapOf("message" to msg))
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "No se pudo enviar el correo")
            )
        }
    }
}