package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class CategoriaSummary(
    val categoria: String = "",
    val total: Double = 0.0,
    val porcentaje: Double = 0.0
)

@Serializable
data class EvolucionSemanal(
    val semana: Int = 0,
    val gastos: Double = 0.0,
    val ingresos: Double = 0.0
)

@Serializable
data class ReporteResumen(
    val totalGastos: Double = 0.0,
    val totalIngresos: Double = 0.0,
    val balance: Double = 0.0,
    val porCategoria: List<CategoriaSummary> = emptyList(),
    val evolucionSemanal: List<EvolucionSemanal> = emptyList()
)