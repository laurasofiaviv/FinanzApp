package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class Producto(
    val nombre: String,
    val precio: Double
)

@Serializable
data class RespuestaProducto(
    val mensaje: String,
    val producto: Producto
)

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Bienvenido a FinanzApp Backend")
        }

        get("/productos") {
            val producto = Producto("Portátil", 1250000.0)
            call.respond(producto)
        }

        post("/producto") {
            val producto = call.receive<Producto>()
            val respuesta = RespuestaProducto(
                mensaje = "Producto recibido correctamente",
                producto = producto
            )
            call.respond(respuesta)
        }
    }
}