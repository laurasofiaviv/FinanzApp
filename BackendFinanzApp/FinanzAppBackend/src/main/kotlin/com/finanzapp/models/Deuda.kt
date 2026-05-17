//models/Deuda.kt
package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class Deuda(
    val id: String = "",
    val uid: String = "",
    val tipo: String = "",
    val descripcion: String = "",
    val monto: Double = 0.0,
    val montoDisplay: String = "",
    val montoPagado: Double = 0.0,
    val cuotasPagadas: Int = 0,
    val cuotas: String = "1",
    val interes: String = "0",
    val fechaVencimiento: String = "",
    val fechaInicio: String = "",
    val diaPago: String = "",
    val tarjetaId: String? = null,
    val tarjetaNombre: String? = null,
    val pagoMinimo: Double = 0.0,
    val estado: String = "pendiente",
    val creadoEn: Long = System.currentTimeMillis()
)

@Serializable
data class AbonoRequest(
    val productoPagoId: String,

    )

@Serializable
data class AbonoResponse(
    val deuda: Deuda,
    val montoPago: Double
)
