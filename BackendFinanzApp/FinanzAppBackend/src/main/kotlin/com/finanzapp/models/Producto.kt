//models/Producto.kt
package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class Producto(
    val id: String = "",
    val uid: String = "",           // dueño del producto
    val tipo: String = "",          // credito | debito | efectivo
    val nombre: String = "",
    val banco: String = "",
    val franquicia: String? = null, // visa | mastercard | amex | null
    val cupoTotal: Double? = null,  // solo crédito
    val diaCorte: Int? = null,      // solo crédito
    val diaPago: Int? = null,       // solo crédito
    val saldoActual: Double = 0.0,  // débito y efectivo
    val saldoUsado: Double = 0.0,   // solo crédito
    val creadoEn: Long = System.currentTimeMillis(),
    val interesMensual: Double = 0.0,  // solo crédito, ej: 2.5 = 2.5% mensual
)

@Serializable
data class ProductoRequest(
    val tipo: String,
    val nombre: String,
    val banco: String = "",
    val franquicia: String? = null,
    val cupoTotal: Double? = null,
    val diaCorte: Int? = null,
    val diaPago: Int? = null,
    val saldoActual: Double = 0.0,
    val interesMensual: Double = 0.0,
)