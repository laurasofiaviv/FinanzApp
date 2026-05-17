//src/main/kotlin/com/finanzapp/routes/AuthRoutes.kt
package com.finanzapp.routes

import com.finanzapp.controllers.AuthController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.authRoutes() {
    routing {
        route("/auth") {
            post("/register")         { AuthController.register(call) }
            post("/login")            { AuthController.login(call) }
            post("/forgot-password")  { AuthController.forgotPassword(call) }
        }
    }
}