// src/main/kotlin/com/finanzapp/models/AuthRequest.kt
package com.finanzapp.models

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(
    val nombre: String = "",
    val email: String = "",
    val password: String = "",
    val idToken: String? = null   // ← el cliente ya creó la cuenta en Firebase
)

@Serializable
data class LoginRequest(
    val idToken: String      // Firebase hace el login; el front manda el token
)

@Serializable
data class ForgotPasswordRequest(
    val email: String
)

@Serializable
data class AuthResponse(
    val uid: String,
    val email: String,
    val nombre: String,
    val message: String
)