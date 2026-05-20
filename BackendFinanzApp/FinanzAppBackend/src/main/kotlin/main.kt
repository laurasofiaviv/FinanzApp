package com.finanzapp

import com.finanzapp.firebase.FirebaseConfig
import com.finanzapp.routes.authRoutes
import com.finanzapp.routes.productRoutes
import com.finanzapp.routes.movimientoRoutes
import com.finanzapp.routes.deudaRoutes
import com.finanzapp.routes.reporteRoutes
import com.finanzapp.routes.usuarioRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import kotlinx.serialization.json.Json

fun main(args: Array<String>) {
    embeddedServer(
        Netty,
        port = 8080,
        host = "0.0.0.0"
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

    // CORS con anyHost() permite peticiones desde cualquier origen.
    // Adecuado para desarrollo; en producción debería restringirse al dominio del cliente
    install(CORS) {
        anyHost()
        allowNonSimpleContentTypes = true
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)// necesario para el Bearer token
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)// Ktor no incluye PUT en CORS por defecto
        allowMethod(HttpMethod.Delete)
    }

    authRoutes()
    productRoutes()
    movimientoRoutes()
    deudaRoutes()
    reporteRoutes()
    usuarioRoutes()
}