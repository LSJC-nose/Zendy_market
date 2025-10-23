// src/Screens/Home.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Categoria from '../Componentes/Categoria';
import Producto from '../Componentes/Productos';

import { useNavigation } from '@react-navigation/native';

// Firebase
import { db } from '../database/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

// Componentes
import CategoriaItem from '../Componentes/CategoriaItem.js';
import Producto from '../Componentes/Productos';

const { width } = Dimensions.get('window');

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [productos,  setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState({});

  const translateY = useRef(new Animated.Value(300)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -30) {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        } else if (gesture.dy > 30) {
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
    { id: 5, nombre: 'laptop', texto: 'Laptop' },
    { id: 5, nombre: 'apple', texto: 'Apple' },
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
      id: 8,
      image: require('../../IMAGENES/cartera.png'),
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
      id: 8,
      image: require('../../IMAGENES/cartera.png'),
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
  ];

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* HEADER BUSCADOR */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar"
            placeholderTextColor="#753c3cff"
            value={busqueda}
            onChangeText={setBusqueda}
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

      {/* PANEL DESLIZABLE */}
      <Animated.View
        style={[styles.panel, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Más de 250 productos en stock</Text>

        <View style={styles.contenedorCategoria}>
          {categoriasFiltradas.length > 0 ? (
            <FlatList
              data={categoriasFiltradas}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoriaItem
                  icon={item.icon || 'question-circle'}
                  imagen={item.foto}
                  texto={item.nombre}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriasLista}
            />
          ) : (
            <Text style={styles.sinProductos}>
              {loading ? 'Cargando categorías...' : 'No hay categorías disponibles'}
            </Text>
          )}
        </View>

        <Text style={styles.produc_dest}>Productos destacados</Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
          ) : productosFiltrados.length === 0 ? (
            <Text style={styles.sinProductos}>
              {busqueda ? 'No se encontraron productos' : 'No hay productos'}
            </Text>
          ) : (
            <View style={styles.productosContainer}>
              {productosFiltrados.map((item) => (
                <View key={item.id} style={styles.tarjeta}>
                  <Producto
                    image={{ uri: item.imagen }}
                    precio={item.precio}
                    descripcion={item.nombre}
                    hora_mes={item.stock}
                    explora=""
                    fondoColor="#f8f9fa"
                    isFavorito={!!favoritos[item.id]}
                    onFavoritoPress={() => toggleFavorito(item.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
      <Notificaciones />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(209, 230, 235, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedor_buscador: {
    width: '100%',
    height: 130,
    backgroundColor: 'rgba(209, 230, 235, 1)',
    marginTop: -470,
    alignItems: 'center',
    marginBottom: 20,
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
  textoBuscador: {
    flex: 1,
    height: 45,
    color: '#2b0fc7ff',
    fontSize: 16,
    paddingLeft: 15,
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
    paddingTop: 10,
  },
  handle: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#999',
    marginTop: 10,
    marginBottom: 15,
  },
  contenedorCategoria: {
    height: 100,
    backgroundColor: '#e7f3f5ff',
    marginBottom: 10,
    width: '100%',
  },
  categoriasLista: {
    paddingHorizontal: 16,
  },
  produc_dest: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 6,
  },
  productosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tarjeta: {
    width: (width - 48) / 2, // 2 columnas con margen
    marginBottom: 16,
    overflow: 'hidden', // ← evita que la imagen se salga
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
  sinProductos: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});