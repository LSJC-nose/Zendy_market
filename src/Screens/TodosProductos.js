import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Producto from '../Componentes/Productos';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { db } from '../database/firebaseConfig.js';
import {
  collection,
  getDocs,
} from 'firebase/firestore';

export default function vistaProductos() {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);  // ← Estado para productos de Firebase
  const [productosValidos, setProductosValidos] = useState([]);  // ← Nuevo: Solo productos validados
  const [loading, setLoading] = useState(true);  // ← Estado para loading
  const [busqueda, setBusqueda] = useState('');  // ← Estado para filtro de búsqueda

  // CARGAR PRODUCTOS
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),  // ← Mapea todos los campos (incluyendo imagen base64)
      }));

      // ← Validación nueva: Filtra y valida cada producto
      const productosFiltrados = data.filter((item) => validarProducto(item));
      if (productosFiltrados.length < data.length) {
        console.warn(`Productos inválidos filtrados: ${data.length - productosFiltrados.length}`);
        // Opcional: Alert.alert('Advertencia', 'Algunos productos tienen datos inválidos y fueron omitidos.');
      }
      setProductos(data);  // ← Mantiene todos para logs
      setProductosValidos(productosFiltrados);  // ← Solo válidos para render
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos.');
      setProductosValidos([]);  // ← Fallback vacío
    } finally {
      setLoading(false);  // ← Siempre oculta loading
    }
  };

  // ← Validación nueva: Función para validar un producto individual
  const validarProducto = (item) => {
    if (!item.id || !item.descripcion || !item.precio) {
      console.warn(`Producto inválido (falta campos básicos): ${item.id}`);
      return false;
    }
    if (typeof item.precio !== 'number' && isNaN(parseFloat(item.precio))) {
      console.warn(`Precio inválido en producto: ${item.id}`);
      return false;
    }
    if (item.imagen && !item.imagen.startsWith('data:image/')) {
      console.warn(`Imagen inválida (no base64) en producto: ${item.id}`);
      // No filtra, usa fallback en render
    }
    if (item.descripcion.trim().length === 0) {
      console.warn(`Descripción vacía en producto: ${item.id}`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    cargarDatos();  // ← Carga inicial al montar la pantalla
  }, []);

  // ← Validación nueva en filtro: Solo filtra si búsqueda es válida
  const productosFiltrados = busqueda.trim() === '' 
    ? productosValidos 
    : productosValidos.filter((item) =>
        item.descripcion?.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        item.nombre?.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        item.precio?.toString().includes(busqueda.trim())
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

  // ← Validación nueva: Si no hay productos válidos, muestra mensaje
  if (productosValidos.length === 0 && !loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No hay productos válidos disponibles. Verifica la base de datos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* BUSCADOR ← Actualizado: Valida búsqueda en onChange */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar"
            placeholderTextColor="#753c3cff"
            value={busqueda}
            onChangeText={(texto) => {
              if (texto.trim().length > 50) {  // ← Validación: Límite de longitud
                Alert.alert('Advertencia', 'La búsqueda no puede exceder 50 caracteres.');
                return;
              }
              setBusqueda(texto);  // ← Actualiza el filtro
            }}
          />
        </View>
      </View>

      {/* SCROLL VERTICAL DE PRODUCTOS ← Actualizado: Usa productosFiltrados con validación en render */}
      <ScrollView style={styles.productosContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Explora una gran variedad de productos</Text>
        <FlatList
          data={productosFiltrados}  // ← Datos dinámicos filtrados y validados
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}  // ← Usa id real de Firebase
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => {
            // ← Validación nueva en render: Verifica props antes de pasar a Producto
            if (!validarProducto(item)) {
              console.warn(`Producto omitido en render: ${item.id}`);
              return null;  // ← No renderiza si inválido
            }
            return (
              <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
                <Producto
                  image={item.imagen || 'https://via.placeholder.com/150?text=No+Imagen'}  // ← Fallback URI válida
                  precio={item.precio?.toString() || '0'}  // ← Asegura string numérico
                  descripcion={item.descripcion?.trim() || item.nombre?.trim() || 'Sin descripción'}  // ← Trim y fallback
                  hora_mes={item.hora_mes?.trim() || 'Reciente'}  // ← Trim
                  fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}  // ← Fallback
                  cora={item.cora || 'heart'}  // ← Fallback
                  oferta={item.oferta}  // ← Si existe en DB
                />
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.titulo}>Consigue los equipos más destacados</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => {
            if (!validarProducto(item)) {
              console.warn(`Producto omitido en render: ${item.id}`);
              return null;
            }
            return (
              <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
                <Producto
                  image={item.imagen || 'https://via.placeholder.com/150?text=No+Imagen'}
                  precio={item.precio?.toString() || '0'}
                  descripcion={item.descripcion?.trim() || item.nombre?.trim() || 'Sin descripción'}
                  hora_mes={item.hora_mes?.trim() || 'Reciente'}
                  fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                  cora={item.cora || 'heart'}
                  oferta={item.oferta}
                />
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.titulo}>Lo más popular esta semana</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => {
            if (!validarProducto(item)) {
              console.warn(`Producto omitido en render: ${item.id}`);
              return null;
            }
            return (
              <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
                <Producto
                  image={item.imagen || 'https://via.placeholder.com/150?text=No+Imagen'}
                  precio={item.precio?.toString() || '0'}
                  descripcion={item.descripcion?.trim() || item.nombre?.trim() || 'Sin descripción'}
                  hora_mes={item.hora_mes?.trim() || 'Reciente'}
                  fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                  cora={item.cora || 'heart'}
                  oferta={item.oferta}
                />
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.titulo}>Novedades para el hogar</Text>
        <FlatList
          data={productosFiltrados}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => {
            if (!validarProducto(item)) {
              console.warn(`Producto omitido en render: ${item.id}`);
              return null;
            }
            return (
              <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
                <Producto
                  image={item.imagen || 'https://via.placeholder.com/150?text=No+Imagen'}
                  precio={item.precio?.toString() || '0'}
                  descripcion={item.descripcion?.trim() || item.nombre?.trim() || 'Sin descripción'}
                  hora_mes={item.hora_mes?.trim() || 'Reciente'}
                  fondoColor={item.fondoColor || 'rgb(125, 183, 219)'}
                  cora={item.cora || 'heart'}
                  oferta={item.oferta}
                />
              </TouchableOpacity>
            );
          }}
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
  // cargar
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