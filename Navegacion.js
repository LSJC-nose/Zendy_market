import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons'; // 
import { createStackNavigator } from '@react-navigation/stack';

// Importa tus componentes de pantalla
import Home from './src/Screens/Home';
import Settings from './src/Screens/Settings';
import Users from './src/Screens/Users';
import vistaProductos from './src/Screens/TodosProductos';
import AnotherHome from './src/Screens/AnotherHome';
import LoginTienda from './src/Componentes/LoginTienda';
import Suscripcion from './src/Screens/Suscripcion';
import Tienda from './src/Screens/Tienda';
import Pagos from './src/Screens/Pagos';

const Tab = createBottomTabNavigator();
const DetailsHomeNavigator = createStackNavigator();
//const Drawer = createDrawerNavigator();

{/*function DrawerNavigate() {
    return (
        <Drawer.Navigator initialRouteName="User">
            <Drawer.Screen name="User" component={Users} />
            <Drawer.Screen name="DetailHome" component={DetailHome} />
            <Drawer.Screen name="OtroDetalle" component={AnotherHome} />
        </Drawer.Navigator>
    );
}
*/}

function StackDetailHome() {
    return (
        <DetailsHomeNavigator.Navigator initialRouteName="Home">
            <DetailsHomeNavigator.Screen name="Home" component={Home} />
            <DetailsHomeNavigator.Screen name="DetailHome" component={vistaProductos} />
            <DetailsHomeNavigator.Screen name="AnotherDetailsHome" component={AnotherHome} />
            <DetailsHomeNavigator.Screen name="LoginTienda" component={LoginTienda} />
        </DetailsHomeNavigator.Navigator>
    );
}

function StackUsers() {
    return (
        <DetailsHomeNavigator.Navigator initialRouteName="Users">
            <DetailsHomeNavigator.Screen name="Users" component={Users} />
            <DetailsHomeNavigator.Screen name="LoginTienda" component={LoginTienda} />
            <DetailsHomeNavigator.Screen name="Suscripcion" component={Suscripcion} />
            <DetailsHomeNavigator.Screen name="Pagos" component={Pagos} />
           <DetailsHomeNavigator.Screen name="Tienda" component={Tienda} />
        </DetailsHomeNavigator.Navigator>
    );
}

export default function MyTabs() {
    return (
        <Tab.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                tabBarActiveTintColor: 'purple',

            }}

        >
            <Tab.Screen
                name="HomeScreen" component={StackDetailHome}
                options={{
                    tabBarLabel: 'HomeScreen',
                    tabBarIcon: ({ color }) => (
                        <AntDesign name="home" size={30} color={color} />

                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="carrito"
                component={Settings}
                options={{
                    tabBarLabel: 'carrito',
                    tabBarIcon: ({ color }) => (
                        <AntDesign name="setting" size={30} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Usuario"
                component={StackUsers}
                options={{

                    tabBarLabel: 'Users',
                    tabBarIcon: ({ color }) => (
                        <AntDesign name="user" size={30} color={color} />
                    ),

                    headerShown: false,
                }}
            />

        </Tab.Navigator>
    );
}