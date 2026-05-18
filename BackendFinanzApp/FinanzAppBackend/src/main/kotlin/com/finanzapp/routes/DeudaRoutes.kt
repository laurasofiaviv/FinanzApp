//routes/DeudaRoutes.kt
package com.finanzapp.routes

import com.finanzapp.controllers.DeudaController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.deudaRoutes() {
    routing {
        route("/deudas") {
            post("/")         { DeudaController.crear(call) }
            get("/")          { DeudaController.listar(call) }
            delete("/{id}")   { DeudaController.eliminar(call) }
            post("/{id}/abonar") { DeudaController.abonar(call) }
            put("/{id}") { DeudaController.actualizar(call) }
        }
    }
}