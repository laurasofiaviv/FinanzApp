package com.finanzapp.services

import com.finanzapp.models.Deuda

object DeudaService {

    fun calcularMontoCuota(deuda: Deuda): Double {
        val interes = deuda.interes.toDoubleOrNull() ?: 0.0
        val cuotas = deuda.cuotas.toIntOrNull() ?: 1
        val saldoPendiente = deuda.monto - deuda.montoPagado

        return when (deuda.tipo) {
            "Deuda personal" -> {
                if (cuotas <= 1) {
                    val montoConInteres = deuda.monto * (1 + interes / 100)
                    montoConInteres - deuda.montoPagado
                } else {
                    val montoConInteres = deuda.monto * (1 + interes / 100)
                    montoConInteres / cuotas
                }
            }

            "Préstamo bancario" -> {
                if (interes <= 0 || cuotas <= 1) {
                    deuda.monto / cuotas
                } else {
                    val r = interes / 100
                    val n = cuotas.toDouble()
                    deuda.monto * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
                }
            }
            else -> {
                if (cuotas <= 1) saldoPendiente
                else deuda.monto / cuotas
            }
        }
    }
}