//routes/ReporteRoutes
package com.finanzapp.routes

import com.finanzapp.controllers.ReporteController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.reporteRoutes() {
    routing {
        route("/reportes") {
            // GET /reportes/resumen?mes=5&año=2026
            get("/resumen") {
                ReporteController.resumen(call)
            }

            // GET /reportes/exportar
            get("/exportar") {
                ReporteController.exportarCsv(call)
            }
        }
    }
}