//src/main/kotlin/com/finanzapp/firebase/FirebaseConfig.kt
package com.finanzapp.firebase

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import java.io.FileInputStream

object FirebaseConfig {
    fun initialize() {
        if (FirebaseApp.getApps().isNotEmpty()) return

        val serviceAccount = FileInputStream(
            "src/main/resources/firebase-service-account.json"
        )
        val options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build()

        FirebaseApp.initializeApp(options)
        println("Firebase inicializado")
    }
}