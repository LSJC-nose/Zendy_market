import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,  // ← Para loading
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Producto from '../Componentes/Productos';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';  // ← Hooks para estado y fetch
import { db } from '../database/firebaseConfig.js';  // ← Import de Firebase
import {
  collection,
  getDocs,
} from 'firebase/firestore';  // ← Solo getDocs para lectura

export default function vistaProductos() {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);  // ← Estado para productos de Firebase
  const [loading, setLoading] = useState(true);  // ← Estado para loading
  const [busqueda, setBusqueda] = useState('');  // ← Estado para filtro de búsqueda

  // CARGAR PRODUCTOS
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),  // ← Mapea todos los campos (incluyendo imagen base64)
      }));
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Opcional: Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);  // ← Siempre oculta loading
    }
  };

  useEffect(() => {
    cargarDatos();  // ← Carga inicial al montar la pantalla
  }, []);

  // FILTRAR PRODUCTOS POR BÚSQUEDA
  const productosFiltrados = productos.filter((item) =>
    item.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.precio?.toString().includes(busqueda)
  );

  // MOSTRAR LOADING SI NO HAY DATOS
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#529c6bff" />
        <Text style={styles.loadingText}>Cargando productos desde Firebase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* BUSCADOR ← Actualizado: Ahora filtra en tiempo real */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar"
            placeholderTextColor="#753c3cff"
            value={busqueda}
            onChangeText={setBusqueda}  // ← Actualiza el filtro
          />
        </View>
      </View>

      {/* SCROLL VERTICAL DE PRODUCTOS ← Actualizado: Usa productosFiltrados */}
      <ScrollView style={styles.productosContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Explora una gran variedad de productos</Text>
        <FlatList
          data={productosFiltrados}  // ← Datos dinámicos filtrados
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}  // ← Usa id real de Firebase
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.imagen}  // ← Base64/URL de Firebase
                precio={item.precio?.toString() || 'N/A'}  // ← Fallback
                descripcion={item.descripcion || item.nombre || 'Sin descripción'}  // ← Fallback
                hora_mes={item.hora_mes || 'Reciente'}  // ← Fallback
                fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}  // ← Fallback
                cora={item.cora || 'heart'}  // ← Fallback
                oferta={item.oferta}  // ← Si existe en DB
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Consigue los equipos más destacados</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.imagen}
                precio={item.precio?.toString() || 'N/A'}
                descripcion={item.descripcion || item.nombre || 'Sin descripción'}
                hora_mes={item.hora_mes || 'Reciente'}
                fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                cora={item.cora || 'heart'}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Lo más popular esta semana</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.imagen}
                precio={item.precio?.toString() || 'N/A'}
                descripcion={item.descripcion || item.nombre || 'Sin descripción'}
                hora_mes={item.hora_mes || 'Reciente'}
                fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                cora={item.cora || 'heart'}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Novedades para el hogar</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.imagen}
                precio={item.precio?.toString() || 'N/A'}
                descripcion={item.descripcion || item.nombre || 'Sin descripción'}
                hora_mes={item.hora_mes || 'Reciente'}
                fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                cora={item.cora || 'heart'}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(197, 230, 232)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contenedor_buscador: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -30,
  },
  buscador: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 255)',
    marginTop: 60,
    padding: 15,
    borderRadius: 10,
  },
  textoBuscador: {
    flex: 1,
    height: 45,
    color: '#529c6bff',
    fontSize: 15,
    paddingLeft: 15,
  },
  titulo: {
    marginLeft: 19,
    fontSize: 19,
    marginTop: 29,
    marginBottom: 10,
  },
  productosContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  //nuevos estilos para cargar
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#529c6bff',
    textAlign: 'center',
  },
});