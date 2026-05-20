// src/main/kotlin/com/finanzapp/controllers/ProductoController.kt
package com.finanzapp.controllers

import com.finanzapp.models.ProductoRequest
import com.finanzapp.repository.ProductoRepository
import com.finanzapp.services.ProductoService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import com.finanzapp.utils.getUid

object ProductoController {



    suspend fun crear(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        try {
            val body = call.receive<ProductoRequest>()
            val producto = ProductoService.crear(uid, body)
            call.respond(HttpStatusCode.Created, producto)
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
            val productos = ProductoService.listar(uid)
            call.respond(HttpStatusCode.OK, productos)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }

    suspend fun eliminar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val productoId = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            ProductoService.eliminar(uid, productoId)
            call.respond(HttpStatusCode.OK, mapOf("message" to "Producto eliminado"))
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }

    // ── ACTUALIZAR ────────────────────────────────────────────────────────
    suspend fun actualizar(call: ApplicationCall) {
        val uid = getUid(call) ?: run {              // ← getUid(), no verifyToken()
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }
        val id = call.parameters["id"] ?: run {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID requerido"))
            return
        }
        try {
            // Recibe el body como Map<String, JsonElement> en vez de ProductoRequest
            // para hacer un PATCH parcial: solo actualiza los campos que llegaron,
            // ignora los que no se enviaron
            val body = call.receive<Map<String, JsonElement>>()
            // Cada campo se extrae con el tipo correcto usando las extensiones de kotlinx:
            // jsonPrimitive convierte el JsonElement a primitivo, luego se castea al tipo esperado
            val datos = buildMap<String, Any?> {
                body["nombre"]?.jsonPrimitive?.contentOrNull?.let { put("nombre", it) }
                body["cupoTotal"]?.jsonPrimitive?.doubleOrNull?.let { put("cupoTotal", it) }
                body["diaCorte"]?.jsonPrimitive?.longOrNull?.toInt()?.let { put("diaCorte", it) }
                body["diaPago"]?.jsonPrimitive?.longOrNull?.toInt()?.let { put("diaPago", it) }
                body["saldoActual"]?.jsonPrimitive?.doubleOrNull?.let { put("saldoActual", it) }
                body["interesMensual"]?.jsonPrimitive?.doubleOrNull?.let { put("interesMensual", it) }
            }
            val actualizado = ProductoRepository.actualizar(uid, id, datos)  // ← import resuelto
            call.respond(HttpStatusCode.OK, actualizado)
        } catch (e: Exception) {
            e.printStackTrace()   // ← prints full stack to your Ktor console
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error")))
        }
    }


}