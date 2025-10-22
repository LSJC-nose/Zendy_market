import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';

// Importa tus componentes de pantalla
import Home from './src/Screens/HomeCliente';
import Settings from './src/Screens/Settings';
/*import Users from './src/Screens/Users';
import VistaProductos from './src/Screens/TodosProductos';
import AnotherHome from './src/Screens/AnotherHome';*/
import LoginTienda from './src/Componentes/LoginTienda';
import Suscripcion from './src/Screens/Suscripcion';
import Tienda from './src/Screens/Tienda';
import Pagos from './src/Screens/Pagos';
import LoadingScreen from './src/Screens/LoadingScreen';
import CRUDAdmon from './src/Screens/CRUDAdmon';
import Users from './src/Screens/Users'

// Declaración de navegadores
const Tab = createBottomTabNavigator();
const StackNav = createStackNavigator();
const DetailsHomeNavigator = createStackNavigator();

/*
// Stack para Home
function StackDetailHome() {
  return (
    <DetailsHomeNavigator.Navigator screenOptions={{ headerShown: false }}>
      <DetailsHomeNavigator.Screen name="Home" component={Home} />
      <DetailsHomeNavigator.Screen name="DetailHome" component={VistaProductos} />
      <DetailsHomeNavigator.Screen name="AnotherDetailsHome" component={AnotherHome} />
      <DetailsHomeNavigator.Screen name="LoginTienda" component={LoginTienda} />
    </DetailsHomeNavigator.Navigator>
  );
}
// Stack para Usuario
function StackUsers() {
  return (
    <DetailsHomeNavigator.Navigator screenOptions={{ headerShown: false }}>
      <DetailsHomeNavigator.Screen name="Users" component={Users} />
      <DetailsHomeNavigator.Screen name="LoginTienda" component={LoginTienda} />
      <DetailsHomeNavigator.Screen name="Suscripcion" component={Suscripcion} />
      <DetailsHomeNavigator.Screen name="Pagos" component={Pagos} />
      <DetailsHomeNavigator.Screen name="Tienda" component={Tienda} />
    </DetailsHomeNavigator.Navigator>
  );
}
*/
// Tabs para Cliente
function MyTabsCliente() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: 'purple' }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color }) => <AntDesign name="home" size={30} color={color} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Carrito"
                component={Settings}
                options={{
                    tabBarLabel: 'Carrito',
                    tabBarIcon: ({ color }) => <AntDesign name="shopping-cart" size={30} color={color} />,
                }}
            />

            <Tab.Screen
                name="Users"
                component={Users}
                options={{
                    tabBarLabel: 'Usuario',
                    tabBarIcon: ({ color }) => <AntDesign name="user" size={30} color={color} />,
                    headerShown: false,
                }}
            />

        </Tab.Navigator>
    );
}

// Tabs para Administrador
function MyTabsAdmon() {
    return (
        <Tab.Navigator initialRouteName="CRUDAdmon" screenOptions={{ tabBarActiveTintColor: 'purple' }}>
            <Tab.Screen
                name="CRUDAdmon"
                component={CRUDAdmon}
                options={{
                    tabBarLabel: 'CRUDAdmon',
                    tabBarIcon: ({ color }) => <AntDesign name="home" size={30} color={color} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Configuración"
                component={Settings}
                options={{
                    tabBarLabel: 'Configuración',
                    tabBarIcon: ({ color }) => <AntDesign name="setting" size={30} color={color} />,
                }}
            />

            <Tab.Screen
                name="Registra tu tienda"
                component={Tienda}
                options={{
                    tabBarLabel: 'Tienda',
                    tabBarIcon: ({ color }) => <AntDesign name="shop" size={30} color={color} />,
                }}
            />

        </Tab.Navigator>
    );
}

// Stack principal que incluye Login y Tabs
function StackLogin() {
  

    return (
        <StackNav.Navigator
          
            screenOptions={{ headerShown: false }}
        >
            <StackNav.Screen name="Login" component={LoginTienda} />
            <StackNav.Screen name="Suscripcion" component={Suscripcion} />
            <StackNav.Screen name="Pagos" component={Pagos} />
            <StackNav.Screen name="MyTabsCliente" component={MyTabsCliente} />
            <StackNav.Screen name="MyTabsAdmon" component={MyTabsAdmon} />
        </StackNav.Navigator>
    );
}

export default function Navegacion() {
    return (
        <NavigationContainer>
            <StackLogin />
        </NavigationContainer>
    )
}