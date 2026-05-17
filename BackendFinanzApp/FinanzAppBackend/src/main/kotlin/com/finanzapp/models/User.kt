//src/main/kotlin/com/finanzapp/models/User.kt
package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val uid: String = "",
    val nombre: String = "",
    val email: String = "",
    val creadoEn: Long = System.currentTimeMillis()
)