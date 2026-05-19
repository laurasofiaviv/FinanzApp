//MovimientoRoutes.kt
package com.finanzapp.routes

import com.finanzapp.controllers.MovimientoController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.movimientoRoutes() {
    routing {
        route("/movimientos") {
            post("/")       { MovimientoController.crear(call) }
            get("/")        { MovimientoController.listar(call) }
            delete("/{id}") { MovimientoController.eliminar(call) }
        }
    }
}