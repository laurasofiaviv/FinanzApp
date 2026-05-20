//src/main/kotlin/com/finanzapp/utils/AuthUtils.kt
package com.finanzapp.utils

import com.finanzapp.services.AuthService
import io.ktor.server.application.*

// getUid extrae y verifica el Bearer token en una sola función reutilizable.
// Retorna null (en vez de lanzar excepción) para que cada controller decida
// cómo responder al 401, manteniendo el controller en control del HTTP
suspend fun getUid(call: ApplicationCall): String? {
    val token = call.request.headers["Authorization"]
        ?.removePrefix("Bearer ") ?: return null
    return try {
        AuthService.verificarToken(token)
    } catch (e: Exception) {
        null
    }
}