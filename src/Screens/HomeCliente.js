import {  Text, Animated, PanResponder, StyleSheet, View, TextInput, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Categoria from '../Componentes/Categoria';
import Producto from '../Componentes/Productos';
import Notificaciones from '../Componentes/Notificaciones';

import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const translateY = useRef(new Animated.Value(300)).current;
  const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10, // más sensible
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

  const Categorias = [
    { id: 1, nombre: 'book', texto: 'Book' },
    { id: 2, nombre: 'baby-carriage', texto: 'Baby' },
    { id: 3, nombre: 'bicycle', texto: 'Sport' },
    { id: 4, nombre: 'gamepad', texto: 'Game' },
    { id: 5, nombre: 'camera', texto: 'Camera' },
    { id: 6, nombre: 'laptop', texto: 'Laptop' },
    { id: 7, nombre: 'apple', texto: 'Apple' },
  ];

  const Productos = [
    {
      id: 1,
      image: require('../../IMAGENES/ows.png'),
      precio: '12',
      descripcion: "A Room of One's Own",
      hora_mes: '5 hours ago',
      fondoColor: 'rgb(125, 183, 219)',
      cora: 'heart',
    },
    {
      id: 2,
      image: require('../../IMAGENES/wireless.png'),
      precio: '50',
      descripcion: 'Wireless headphones',
      hora_mes: '8 hours ago',
      fondoColor: 'rgb(163, 227, 255)',
      cora: 'heart',
    },
    {
      id: 3,
      image: require('../../IMAGENES/zapa.png'),
      precio: '10',
      descripcion: 'White sneakers',
      hora_mes: '3 hours ago',
      fondoColor: 'rgb(255, 194, 203)',
      cora: 'heart',
    },
    {
      id: 4,
      image: require('../../IMAGENES/camera.png'),
      precio: '12',
      descripcion: 'Camera-Video & photo',
      hora_mes: '6 hours ago',
      fondoColor: 'rgb(165, 143, 255)',
      cora: 'heart',
    },
    {
      id: 5,
      image: require('../../IMAGENES/oso.png'),
      precio: '15',
      descripcion: 'Teddy',
      hora_mes: '10 hours ago',
      fondoColor: 'rgb(189, 226, 242)',
      cora: 'heart',
    },
    {
      id: 6,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 7,
      image: require('../../IMAGENES/gaseosa.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 8,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 9,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 10,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 11,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
    {
      id: 12,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
  ];

  const navigation = useNavigation();
  return (
    <View style={styles.container}>

      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar"
            placeholderTextColor="#753c3cff"
          />
        </View>
      </View>


      <Text style={styles.produc_dest}>¡Hola! sea Bienvenido</Text>

      <View style={styles.contenedorCuadros}>
        <View style={styles.cuadro}>
          <Text style={styles.tituloCuadro}>¡Explore una gran variedad de productos!</Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('DetailHome')}>
            <Text style={styles.textoBoton}>Explorar →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cuadro}>
          <Text style={styles.tituloCuadro}>Ver ofertas ¡quizás te interesen!</Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('DetailHome')}>
            <Text style={styles.textoBoton}>Ver →</Text>
          </TouchableOpacity>
        </View>
      </View>

      

      <Animated.View
        style={[styles.panel, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>🛒 Mas de 250 productos en stock</Text>
        {/* Categorías */}
        <View style={styles.contenedorCategoria}>
          <FlatList
            data={Categorias}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Categoria nombre={item.nombre} texto={item.texto} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriasLista}
          />
        </View>
        <Text style={styles.produc_dest}>Productos destacados</Text>

        {/* Productos en dos columnas */}
        <View style={styles.productosContainer}>
          <FlatList
            data={Productos}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.filaTarjetas}
            renderItem={({ item }) => (
              <View style={styles.tarjeta}>
                <Producto
                  image={item.image}
                  precio={item.precio}
                  descripcion={item.descripcion}
                  hora_mes={item.hora_mes}
                  fondoColor={item.fondoColor}
                  cora={item.cora}
                />
              </View>
            )}
            contentContainerStyle={styles.container_tarjetas}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Animated.View>
      <Notificaciones />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(209, 230, 235, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedor_buscador: {
    width: "100%",
    height: 130,
    backgroundColor: "rgba(209, 230, 235, 1)",
    marginTop: -470,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBuscador: {
    flex: 1,
    height: 45,
    color: '#2b0fc7ff',
    fontSize: 16,
    paddingLeft: 15,
  },
  buscador: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginTop: 60,
    padding: 15,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    marginRight: 90,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    height: 700,
    width: '100%',
    backgroundColor: '#e7f3f5ff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#1f1a1aff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 6,
    shadowRadius: 10,
    elevation: 30,
  },
  contenedorCategoria: {
    height: 85,
    backgroundColor: '#e7f3f5ff',
  },
  categoriasLista: {
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 40,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#999',
    marginTop: 10,
    marginBottom: 15,
  },
  produc_dest: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 6,
  },
  productosContainer: {
    margin: 20,
    flex: 1,
    width: '100%',
  },
  filaTarjetas: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tarjeta: {
    flex: 1,
    marginHorizontal: 8,
  },

  contenedorCuadros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    marginTop: 38,
    width: '100%',
  },
  cuadro: {
    height: 140,
    flex: 1,
    backgroundColor: '#d3f0eeff',
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },


  tituloCuadro: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    flexWrap: 'wrap',
  },

  boton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  textoBoton: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  descri: {
    marginTop: 40,
    marginLeft: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  cart: {
    alignContent: "space-evenly"

  }

});