# Archivos de Configuración Necesarios

Este documento describe los archivos de configuración utilizados en el proyecto frontend desarrollado con React Native y Expo para gestionar variables de entorno y conexión con el backend.

---

# 1. Archivo `.env`

El archivo `.env` permite almacenar variables de entorno globales utilizadas en la aplicación, como la URL de la API.

## Ejemplo

```env
API_URL=http://192.168.1.10:3000
```

## Función

- Centralizar configuraciones importantes del proyecto.
- Facilitar el cambio entre entornos de desarrollo y producción.
- Evitar repetir direcciones URL en múltiples archivos.
- Mejorar la mantenibilidad y escalabilidad del sistema.

---

# 2. Archivo `babel.config.js`

Este archivo configura Babel para permitir el uso de variables de entorno mediante el paquete `react-native-dotenv`.

## Código

```javascript
module.exports = function(api) {
    api.cache(true);

    return {
        presets: ['babel-preset-expo'],

        plugins: [
            [
                'module:react-native-dotenv',
                {
                    moduleName: '@env',
                    path: '.env',
                    safe: false,
                    allowUndefined: false,
                },
            ],
        ],
    };
};
```

## Función

- Configurar Babel para interpretar variables del archivo `.env`.
- Permitir importar variables de entorno usando `@env`.
- Integrar correctamente el manejo de configuraciones externas en React Native.

## Importación habilitada

```javascript
import { API_URL } from '@env';
```

---

# 3. Archivo `src/api.js`

Este archivo centraliza la exportación de la URL principal del backend.

## Código

```javascript
import { API_URL } from '@env';

export default API_URL;
```

## Función

- Reutilizar la URL de la API en todo el proyecto.
- Evitar duplicación de código.
- Facilitar cambios futuros en la dirección del backend.

---

# 4. Dependencia necesaria

Para utilizar variables de entorno es necesario instalar la dependencia:

## Instalación con npm

```bash
npm install react-native-dotenv
```

## Instalación con yarn

```bash
yarn add react-native-dotenv
```

---

# 5. Uso de la configuración en servicios

Ejemplo de consumo de la API utilizando la variable configurada.

## Ejemplo

```javascript
import API_URL from '../api';

export async function obtenerProductos() {
    const response = await fetch(`${API_URL}/productos`);
    return await response.json();
}
```

---

# 6. Recomendación importante

Después de modificar el archivo `.env` o `babel.config.js`, es necesario reiniciar Expo limpiando caché para aplicar los cambios correctamente.

## Comando

```bash
npx expo start -c
```

---

# Conclusión

La implementación de archivos de configuración permite administrar de forma centralizada las variables globales del sistema, facilitando el mantenimiento, la seguridad y la escalabilidad de la aplicación frontend.
