import React, { useState, useRef } from 'react';
import {
  Animated, PanResponder, TouchableOpacity, View, Text, TextInput, StyleSheet, Alert, Image
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginTienda = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const acceder = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingrese su correo y contraseña.');
      return;
    }

    //Autenticación básica 
    if (email === 'cliente@gmail.com' && password === '12345') {
      Alert.alert('Bienvenido', 'Inicio de sesión exitoso');
      navigation.replace('MyTabsCliente') // ir a la nav del cliente
    } else if (email === 'admin@gmail.com' && password === '12345') {
      Alert.alert('Sea bienvenido', 'Admin');
      navigation.replace('MyTabsAdmon'); // ir a la nav del administrador

    }
    else {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    }
  };

  const translateY = useRef(new Animated.Value(300)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 20, // más sensible
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -30) {
          // Deslizó hacia arriba → mostrar
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        } else if (gesture.dy > 30) {
          // Deslizó hacia abajo → ocultar
          Animated.spring(translateY, {
            toValue: 300,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Image source={require('../../IMAGENES/logo_zendy.png')} style={styles.logo} />

      <Animated.View
        style={[styles.panel, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <Text style={styles.titulo}>Iniciar Sesión</Text>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text>Olvidé mi contraseña</Text>
        </View>

        <TouchableOpacity style={styles.boton} onPress={acceder} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={styles.textoBoton}>Iniciar sesion</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.textoCrearCuenta}>Si no tienes una cuenta, ¡crea una!</Text>

        <View style={styles.handle1} />
        <Text style={styles.textoSeguirCon}>O seguin con</Text>
        <View style={styles.handle2} />

        <View style={styles.row}>
          <View style={styles.botonautenticacion}>
            <FontAwesome5 name="google" size={28} color="black" />
          </View>

          <View style={styles.botonautenticacion}>
            <FontAwesome5 name="facebook" size={28} color="black" />
          </View>

          <View style={styles.botonautenticacion}>
            <FontAwesome5 name="apple" size={28} color="black" />
          </View>
        </View>

        <Text style={styles.textoServiciosCuenta}>Al crear una cuenta, acepto los Términos y la Política de privacidad.</Text>
      </Animated.View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgb(215, 245, 237)",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 45,
    borderWidth: 1,
    borderColor: "#1b1717ff",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: "rgb(215, 245, 237)",
  },
  boton: {
    width: 200,
    borderWidth: 1,
    backgroundColor: "rgb(215, 245, 237)",
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    height: 640,
    width: '111%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgb(125, 204, 232)',
    shadowColor: 'rgb(125, 204, 232)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 6,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 240,
    height: 130,
    marginTop: -240,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#b8f3f3ff',
    marginTop: 10,
    marginBottom: 15,
  },
  handle1: {
    width: 90,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#e1f3b8ff',
    marginTop: 40,
    marginLeft: 250,
    marginBottom: 15,
  },
  handle2: {
    width: 90,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#e1f3b8ff',
    marginTop: -8,
    marginRight: 250,
    marginBottom: 15,
  },
  textoCrearCuenta: {
    marginTop: 15,
    color: '#1b1717ff',
    fontSize: 16,
  },
  textoServiciosCuenta: {
    marginTop: 120,
    marginRight: 20,
    marginLeft: 20,
    fontSize: 12,
    textAlign: 'center',
    color: '#850b0bff',
  },
  textoSeguirCon: {
    marginTop: -30,
    fontSize: 16,
    color: '#1b1717ff',
  },
  botonautenticacion: {
    marginTop: 20,
    width: 80,
    height: 45,
    borderRadius: 30,
    backgroundColor: 'rgb(215, 245, 237)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    justifyContent: 'space-around',
  },
});

export default LoginTienda;