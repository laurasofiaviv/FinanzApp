// src/main/kotlin/com/finanzapp/routes/userRoutes.kt
package com.finanzapp.routes

import com.finanzapp.repository.UserRepository
import com.finanzapp.services.AuthService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull

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

fun Application.userRoutes() {
    routing {
        route("/usuarios") {

            get("/me") {
                val uid = getUid(call) ?: run {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
                    return@get
                }
                val perfil = UserRepository.obtenerPerfil(uid)
                call.respond(HttpStatusCode.OK, perfil)
            }

            put("/me") {
                val uid = getUid(call) ?: run {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
                    return@put
                }
                val body = call.receive<Map<String, JsonElement>>()
                val nombre = body["nombre"]?.jsonPrimitive?.contentOrNull ?: run {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "nombre requerido"))
                    return@put
                }
                val actualizado = UserRepository.actualizarNombre(uid, nombre)
                call.respond(HttpStatusCode.OK, actualizado)
            }
        }
    }
}