//src/main/kotlin/com/finanzapp/firebase/FirebaseConfig.kt
package com.finanzapp.firebase

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import java.io.FileInputStream

object FirebaseConfig {
    fun initialize() {
        // Guarda contra doble inicialización (ej: hot reload en desarrollo o tests).
        // Firebase lanza excepción si se inicializa dos veces
        if (FirebaseApp.getApps().isNotEmpty()) return

        // Lee las credenciales del service account desde el sistema de archivos,
        // nunca hardcodeadas en el código fuente
        val serviceAccount = FileInputStream(
            "src/main/resources/firebase-service-account.json"
        )
        // GoogleCredentials.fromStream interpreta el JSON del service account
        // y genera los tokens OAuth2 que Firebase Admin SDK necesita para operar
        val options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build()

        FirebaseApp.initializeApp(options)
        println("Firebase inicializado")
    }
}