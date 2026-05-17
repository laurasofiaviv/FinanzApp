//src/main/kotlin/com/finanzapp/routes/ProductRoutes.kt

package com.finanzapp.routes

import com.finanzapp.controllers.ProductoController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.productRoutes() {
    routing {
        route("/productos") {
            post("/")          { ProductoController.crear(call) }
            get("/")           { ProductoController.listar(call) }
            delete("/{id}")    { ProductoController.eliminar(call) }
            put("/{id}")    { ProductoController.actualizar(call) }
        }
    }
}