//src/main/kotlin/com/finanzapp/utils/AuthUtils.kt
package com.finanzapp.utils

import com.finanzapp.services.AuthService
import io.ktor.server.application.*

suspend fun getUid(call: ApplicationCall): String? {
    val token = call.request.headers["Authorization"]
        ?.removePrefix("Bearer ") ?: return null
    return try {
        AuthService.verificarToken(token)
    } catch (e: Exception) {
        null
    }
}