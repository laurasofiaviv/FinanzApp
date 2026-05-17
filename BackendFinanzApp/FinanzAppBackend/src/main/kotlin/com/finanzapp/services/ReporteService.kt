package com.finanzapp.services

import com.finanzapp.models.CategoriaSummary
import com.finanzapp.models.EvolucionSemanal
import com.finanzapp.models.Movimiento
import com.finanzapp.models.ReporteResumen
import com.finanzapp.repository.MovimientoRepository
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

object ReporteService {

    /**
     * Genera el resumen financiero de un mes/año para un usuario.
     * Filtra los movimientos por mes y año usando el campo creadoEn (epoch ms).
     */
    suspend fun generarResumen(uid: String, mes: Int, anio: Int): ReporteResumen {
        val todos = MovimientoRepository.obtenerTodos(uid)

        // Filtrar por mes y año
        val filtrados = todos.filter { mov ->
            val fecha = Instant.ofEpochMilli(mov.creadoEn)
                .atZone(ZoneId.of("America/Bogota"))
            fecha.monthValue == mes && fecha.year == anio
        }

        val gastos   = filtrados.filter { it.tipo == "gasto" }
        val ingresos = filtrados.filter { it.tipo == "ingreso" }

        val totalGastos   = gastos.sumOf { it.monto }
        val totalIngresos = ingresos.sumOf { it.monto }
        val balance       = totalIngresos - totalGastos

        // --- Por categoría (solo gastos) ---
        val porCategoria: List<CategoriaSummary> = gastos
            .groupBy { it.categoria.ifBlank { "Sin categoría" } }
            .map { (cat, movs) ->
                val subtotal = movs.sumOf { it.monto }
                val pct = if (totalGastos > 0) (subtotal / totalGastos) * 100 else 0.0
                CategoriaSummary(
                    categoria   = cat,
                    total       = subtotal,
                    porcentaje  = Math.round(pct * 100.0) / 100.0
                )
            }
            .sortedByDescending { it.total }

        // --- Evolución semanal (semanas 1-5 del mes) ---
        val evolucionSemanal: List<EvolucionSemanal> = (1..5).mapNotNull { semana ->
            val movsEnSemana = filtrados.filter { mov ->
                val fecha = Instant.ofEpochMilli(mov.creadoEn)
                    .atZone(ZoneId.of("America/Bogota"))
                semanaDelMes(fecha) == semana
            }
            if (movsEnSemana.isEmpty()) return@mapNotNull null
            EvolucionSemanal(
                semana   = semana,
                gastos   = movsEnSemana.filter { it.tipo == "gasto"   }.sumOf { it.monto },
                ingresos = movsEnSemana.filter { it.tipo == "ingreso" }.sumOf { it.monto }
            )
        }

        return ReporteResumen(
            totalGastos      = totalGastos,
            totalIngresos    = totalIngresos,
            balance          = balance,
            porCategoria     = porCategoria,
            evolucionSemanal = evolucionSemanal
        )
    }

    /**
     * Devuelve un CSV con todos los movimientos del usuario.
     * Columnas: id, tipo, monto, categoria, descripcion, fecha
     */
    suspend fun exportarCsv(uid: String): String {
        val todos = MovimientoRepository.obtenerTodos(uid)
        val sb = StringBuilder()
        sb.appendLine("id,tipo,monto,categoria,descripcion,fecha")
        todos.forEach { mov ->
            val fecha = Instant.ofEpochMilli(mov.creadoEn)
                .atZone(ZoneId.of("America/Bogota"))
                .toLocalDate()
            // Escapar comas en descripción y categoría
            val desc = mov.descripcion.replace(",", ";")
            val cat  = mov.categoria.replace(",", ";")
            sb.appendLine("${mov.id},${mov.tipo},${mov.monto},$cat,$desc,$fecha")
        }
        return sb.toString()
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Semana dentro del mes: día 1-7 → 1, 8-14 → 2, 15-21 → 3, 22-28 → 4, 29+ → 5 */
    private fun semanaDelMes(fecha: ZonedDateTime): Int {
        return when (fecha.dayOfMonth) {
            in 1..7   -> 1
            in 8..14  -> 2
            in 15..21 -> 3
            in 22..28 -> 4
            else      -> 5
        }
    }
}