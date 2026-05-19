import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ProductProvider } from './src/context/ProductContext';
import { DeudaProvider } from './src/context/DeudaContext';
import { FinanzProvider } from './src/context/FinanzContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useProductos } from './src/context/ProductContext';

function Providers({ children }) {
  const [deudas, setDeudas] = useState([]);

  return (
    <ProductProvider
      deudas={deudas}
      setDeudas={setDeudas}
      onDeudaEspejoCreada={(d) => setDeudas(prev => [d, ...prev])}
      onDeudaEspejoEliminada={(id) => setDeudas(prev => prev.filter(d => d.id !== id))}
    >
      <DeudaProvider>
        <FinanzConProductos>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </FinanzConProductos>
      </DeudaProvider>
    </ProductProvider>
  );
}
function FinanzConProductos({ children }) {
  const { productos, setProductos, cargarGastoATarjeta } = useProductos();
  return (
    <FinanzProvider
      productos={productos}
      setProductos={setProductos}
      cargarGastoATarjeta={cargarGastoATarjeta}
    >
      {children}
    </FinanzProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Providers>
        <AppNavigator />
      </Providers>
    </AuthProvider>
  );
}