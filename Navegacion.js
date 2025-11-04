import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Importa tus componentes de pantalla
import Home from './src/Screens/HomeCliente';
import Settings from './src/Screens/Settings';
import LoginTienda from './src/Componentes/LoginTienda';
import Suscripcion from './src/Screens/Suscripcion';
import Tienda from './src/Screens/Tienda';
import Pagos from './src/Screens/Pagos';
import CRUDAdmon from './src/Screens/CRUDAdmon';
import Users from './src/Screens/Users'
import Categoria from './src/Screens/Categoria';
import Ofertas from './src/Screens/OfertasScreen.js';
import DetalleProductoScreen from './src/Screens/DetalleProductoScreen.js';
import VistaProductos from './src/Screens/TodosProductos';  // ← Asegúrate de que este path sea exacto (ajusta si el archivo es 'vistaProductos.js')
import Usuarios from './src/Screens/Usuarios.js';
import TodasTiendasSuper from './src/Screens/TodasTiendasSuper.js';
import SuperAdmon from './src/Screens/SuperAdmon.js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CategoriaSeleccionada from './src/Screens/CategoriaSeleccionada.js';

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
// Stack para Home Cliente (incluye sub-navegación para Ofertas, DetailHome y DetalleProducto)
function StackHomeCliente() {
    return (
        <StackNav.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <StackNav.Screen name="Home" component={Home} />
            <StackNav.Screen name="DetailHome" component={VistaProductos} />
            <StackNav.Screen name="Ofertas" component={Ofertas} />
            <StackNav.Screen name="DetalleProducto" component={DetalleProductoScreen} />
             <StackNav.Screen name="CategoriaSeleccionada" component={CategoriaSeleccionada} />

        </StackNav.Navigator>
    );
}

// Tabs para Cliente
function MyTabsCliente() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: 'purple' }}>
            <Tab.Screen
                name="Home"
                component={StackHomeCliente}
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
                name="Registra tu tienda"
                component={Tienda}
                options={{
                    tabBarLabel: 'Tienda',
                    tabBarIcon: ({ color }) => <AntDesign name="shop" size={30} color={color} />,
                }}
            />


            <Tab.Screen
                name="Registra tu categoria"
                component={Categoria}
                options={{
                    tabBarLabel: 'categorias',
                    tabBarIcon: ({ color }) => <MaterialIcons name="category" size={24} color="black" />,
                }}
            />

        </Tab.Navigator>
    );
}

// Tabs para Administrador
function MyTabsSuperAdmon() {
    return (
        <Tab.Navigator initialRouteName="SuperAdmon" screenOptions={{ tabBarActiveTintColor: 'purple' }}>
            <Tab.Screen
                name="SuperAdmon"
                component={SuperAdmon}
                options={{
                    tabBarLabel: 'SUPERdAmon',
                    tabBarIcon: ({ color }) => <AntDesign name="home" size={30} color={color} />,
                    headerShown: false,
                }}
            />

            <Tab.Screen
                name="Usuarios"
                component={Usuarios}
                options={{
                    tabBarLabel: 'Usuarios',
                    tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color="black" />,
                }}
            />

            <Tab.Screen
                name="Tiendas Disponibles"
                component={TodasTiendasSuper}
                options={{
                    tabBarLabel: 'Tiendas Disponibles',
                    tabBarIcon: ({ color }) => <FontAwesome6 name="shop" size={24} color="black" />,
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
            <StackNav.Screen name="MyTabsSuperAdmon" component={MyTabsSuperAdmon} />
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