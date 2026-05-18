//routes/UsuarioRoutes.kt
package com.finanzapp.routes

import com.finanzapp.controllers.UsuarioController
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.usuarioRoutes() {
    routing {
        route("/usuarios") {
            // GET /usuarios/perfil
            get("/perfil") {
                UsuarioController.obtenerPerfil(call)
            }

            // PUT /usuarios/perfil
            put("/perfil") {
                UsuarioController.actualizarPerfil(call)
            }

            // POST /usuarios/cambiar-password
            post("/cambiar-password") {
                UsuarioController.cambiarPassword(call)
            }
        }
    }
}