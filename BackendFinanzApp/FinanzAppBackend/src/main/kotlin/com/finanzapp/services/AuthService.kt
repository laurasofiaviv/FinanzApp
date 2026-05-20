//AuthService
package com.finanzapp.services

import com.google.firebase.auth.FirebaseAuth
import com.finanzapp.models.AuthResponse
import com.finanzapp.models.RegisterRequest
import com.finanzapp.models.User
import com.finanzapp.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object AuthService {

    // ── REGISTRO ──────────────────────────────────────────────────────────
    // El cliente ya creó la cuenta en Firebase y envió el correo de verificación.
    // El backend solo verifica el token y guarda los datos en Firestore.
    suspend fun register(req: RegisterRequest): AuthResponse = withContext(Dispatchers.IO) {
        val idToken = req.idToken
            ?: throw IllegalArgumentException("idToken es requerido")

        // Verificar que el token sea válido y obtener el uid real
        val decoded = FirebaseAuth.getInstance()
            .verifyIdTokenAsync(idToken)
            .get()

        val user = User(
            uid    = decoded.uid,
            nombre = req.nombre,
            email  = req.email
        )
        UserRepository.guardarUsuario(user)

        AuthResponse(
            uid     = decoded.uid,
            email   = req.email,
            nombre  = req.nombre,
            message = "Usuario registrado. Revisa tu correo para verificar la cuenta."
        )
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────
    suspend fun login(idToken: String): AuthResponse = withContext(Dispatchers.IO) {
        val decoded = FirebaseAuth.getInstance()
            .verifyIdTokenAsync(idToken)
            .get()

        val uid  = decoded.uid
        val user = UserRepository.obtenerUsuario(uid)

        AuthResponse(
            uid     = uid,
            email   = decoded.email ?: "",
            nombre  = user?.nombre ?: decoded.name ?: "",
            message = "Login exitoso"
        )
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────
    // Ya no se usa desde el backend — el cliente llama sendPasswordResetEmail()
    // directamente. Se mantiene por compatibilidad.
    suspend fun forgotPassword(email: String): String = withContext(Dispatchers.IO) {
        FirebaseAuth.getInstance()
            .generatePasswordResetLinkAsync(email)
            .get()
        "Correo de recuperación enviado a $email"
    }

    // ── VERIFICAR TOKEN ───────────────────────────────────────────────────
    suspend fun verificarToken(idToken: String): String = withContext(Dispatchers.IO) {
        // AuthService: verifica el idToken con Firebase Admin para obtener el uid real.
        // Esto garantiza que el uid del usuario en Firestore es el mismo que Firebase Auth asignó,
        // y que el token no fue manipulado por el cliente
        val decoded = FirebaseAuth.getInstance()
            .verifyIdTokenAsync(idToken)
            .get()
        decoded.uid
    }
}