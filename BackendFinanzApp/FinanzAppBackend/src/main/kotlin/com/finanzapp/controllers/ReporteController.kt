//src/main/kotlin/com/finanzapp/controllers/ReporteController
package com.finanzapp.controllers


import com.finanzapp.services.ReporteService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import com.finanzapp.utils.getUid

object ReporteController {



    // ── GET /reportes/resumen?mes=5&año=2026 ──────────────────────────────

    suspend fun resumen(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }

        val mesParam  = call.request.queryParameters["mes"]?.toIntOrNull()
        val anioParam = call.request.queryParameters["año"]?.toIntOrNull()
            ?: call.request.queryParameters["anio"]?.toIntOrNull()   // alternativa sin tilde

        if (mesParam == null || anioParam == null) {
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "Parámetros requeridos: mes y año (ej. ?mes=5&año=2026)")
            )
            return
        }

        if (mesParam !in 1..12) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "mes debe estar entre 1 y 12"))
            return
        }

        try {
            val reporte = ReporteService.generarResumen(uid, mesParam, anioParam)
            call.respond(HttpStatusCode.OK, reporte)
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (e.message ?: "Error generando reporte"))
            )
        }
    }

    // ── GET /reportes/exportar ────────────────────────────────────────────

    suspend fun exportarCsv(call: ApplicationCall) {
        val uid = getUid(call) ?: run {
            call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Token requerido"))
            return
        }

        try {
            val csv = ReporteService.exportarCsv(uid)

            call.response.header(
                HttpHeaders.ContentDisposition,
                "attachment; filename=\"movimientos.csv\""
            )
            call.respondText(
                text        = csv,
                contentType = ContentType.Text.CSV,
                status      = HttpStatusCode.OK
            )
        } catch (e: Exception) {
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (e.message ?: "Error exportando CSV"))
            )
        }
    }
}