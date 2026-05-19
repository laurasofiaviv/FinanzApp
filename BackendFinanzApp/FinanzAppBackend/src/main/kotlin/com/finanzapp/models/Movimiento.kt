//Movimiento.kt
package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class Movimiento(
    val id: String = "",
    val uid: String = "",
    val tipo: String = "",           // gasto | ingreso
    val monto: Double = 0.0,
    val montoDisplay: String = "",
    val categoria: String? = null,
    val descripcion: String = "",
    val fecha: String = "",
    val productoId: String? = null,  // tarjeta o cuenta vinculada
    val pagoConTarjeta: String? = null,
    val recurrente: RecurrenteData? = null,
    val creadoEn: Long = System.currentTimeMillis()
)

@Serializable
data class RecurrenteData(
    val frecuencia: String = "",     // mensual | quincenal
    val modo: String = "",           // auto | preguntar
    val proximoCobro: String? = null
)

@Serializable
data class MovimientoRequest(
    val tipo: String,
    val monto: Double,
    val montoDisplay: String = "",
    val categoria: String? = null,
    val descripcion: String = "",
    val fecha: String = "",
    val productoId: String? = null,
    val pagoConTarjeta: String? = null,
    val recurrente: RecurrenteData? = null,
)