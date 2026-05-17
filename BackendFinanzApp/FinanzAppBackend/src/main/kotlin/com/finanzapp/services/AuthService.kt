package com.finanzapp.services

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserRecord
import com.finanzapp.models.AuthResponse
import com.finanzapp.models.RegisterRequest
import com.finanzapp.models.User
import com.finanzapp.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object AuthService {

    suspend fun register(req: RegisterRequest): AuthResponse = withContext(Dispatchers.IO) {
        val createRequest = UserRecord.CreateRequest()
            .setEmail(req.email)
            .setPassword(req.password)
            .setDisplayName(req.nombre)
            .setEmailVerified(false)

        val userRecord = FirebaseAuth.getInstance()
            .createUserAsync(createRequest)
            .get()  // ApiFuture.get()

        FirebaseAuth.getInstance()
            .generateEmailVerificationLinkAsync(req.email)
            .get()

        val user = User(
            uid = userRecord.uid,
            nombre = req.nombre,
            email = req.email
        )
        UserRepository.guardarUsuario(user)

        AuthResponse(
            uid = userRecord.uid,
            email = userRecord.email ?: "",
            nombre = req.nombre,
            message = "Usuario creado. Revisa tu correo para verificar la cuenta."
        )
    }

    suspend fun login(idToken: String): AuthResponse = withContext(Dispatchers.IO) {
        val decoded = FirebaseAuth.getInstance()
            .verifyIdTokenAsync(idToken)
            .get()  // ApiFuture.get()

        val uid = decoded.uid
        val user = UserRepository.obtenerUsuario(uid)

        AuthResponse(
            uid = uid,
            email = decoded.email ?: "",
            nombre = user?.nombre ?: decoded.name ?: "",
            message = "Login exitoso"
        )
    }

    suspend fun forgotPassword(email: String): String = withContext(Dispatchers.IO) {
        FirebaseAuth.getInstance()
            .generatePasswordResetLinkAsync(email)
            .get()  // ApiFuture.get()

        "Correo de recuperación enviado a $email"
    }
    suspend fun verificarToken(idToken: String): String = withContext(Dispatchers.IO) {
        val decoded = FirebaseAuth.getInstance()
            .verifyIdTokenAsync(idToken)
            .get()
        decoded.uid
    }


}