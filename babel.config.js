// babel.config.js

//Ese plugin lee el archivo .env y convierte sus variables en importaciones JavaScript.
//abel transforma código moderno de JavaScript para que React Native lo entienda.
module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['module:react-native-dotenv', {
                moduleName: '@env',
                path: '.env',//
                safe: false,
                allowUndefined: false,
            }]
        ]
    };
};