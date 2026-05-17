package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class PerfilRequest(
    val nombre: String? = null,
    val email: String? = null
)

@Serializable
data class PasswordRequest(
    val nuevaPassword: String = ""
)