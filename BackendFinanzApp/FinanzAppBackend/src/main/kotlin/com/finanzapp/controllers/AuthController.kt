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

    // El controller no maneja lógica de negocio, solo recibe la petición,
// la delega al Service y responde con el código HTTP apropiado
    suspend fun register(call: ApplicationCall) {
        try {
            val body = call.receive<RegisterRequest>()// deserializa el JSON del body automáticamente
            val response = AuthService.register(body)
            call.respond(HttpStatusCode.Created, response)// 201: recurso creado exitosamente

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
            // catch responde 401 Unauthorized, no 400, porque el error es de credenciales
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