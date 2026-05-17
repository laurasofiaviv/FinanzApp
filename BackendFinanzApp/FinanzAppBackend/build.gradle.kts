//FinanzAppBackend/build.graddle-kts
val kotlin_version: String by project
val logback_version: String by project

plugins {
    kotlin("jvm") version "2.3.0"
    id("io.ktor.plugin") version "3.4.2"
    kotlin("plugin.serialization") version "2.3.0"  // misma versión que kotlin
}

group = "com.finanzapp"   // ← cambiado de com.example
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}

repositories {
    mavenCentral()
    google()   // ← necesario para Firebase
}

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty")
    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-server-config-yaml")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")

    // CORS ← nuevo
    implementation("io.ktor:ktor-server-cors")

    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")

    // Firebase Admin SDK ← nuevo
    implementation("com.google.firebase:firebase-admin:9.2.0")

    // Coroutines para usar .await() con Firebase ← nuevo
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-guava:1.7.3")

    // Coroutines para usar .await() con Firebase ← reemplaza las dos anteriores
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-guava:1.7.3")

    // ESTA ES LA QUE FALTA — .await() para Tasks de Firebase/Google
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    // Tests
    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
}