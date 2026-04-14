import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import MainTabs from "./MainTabs";

import ProductsScreen from "../screens/ProductsScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import EditProductScreen from "../screens/EditProductScreen";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />

      <Stack.Screen
        name="Productos"
        component={ProductsScreen}
        options={{ presentation: "card" }}
      />

      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}