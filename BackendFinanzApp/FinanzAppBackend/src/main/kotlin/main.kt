// src/main/kotlin/com/finanzapp/main.kt
package com.finanzapp

import com.finanzapp.firebase.FirebaseConfig
import com.finanzapp.routes.authRoutes
import com.finanzapp.routes.productRoutes
import com.finanzapp.routes.userRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import com.finanzapp.routes.movimientoRoutes
import kotlinx.serialization.json.Json
import com.finanzapp.routes.deudaRoutes
import com.finanzapp.routes.reporteRoutes
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import com.finanzapp.routes.usuarioRoutes


fun main(args: Array<String>) {
    embeddedServer(
        Netty,
        port = 8080,
        host = "0.0.0.0"   // ← escucha en todas las interfaces
    ) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    FirebaseConfig.initialize()

    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            isLenient = true
        })
    }

    install(CORS) {
        anyHost()
        allowNonSimpleContentTypes = true
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        // ← Sin allowCredentials = true
    }

    authRoutes()
    productRoutes()
    movimientoRoutes()
    userRoutes()
    deudaRoutes()
    reporteRoutes()
    usuarioRoutes()
}
