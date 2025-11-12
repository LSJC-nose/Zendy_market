import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Producto from '../Componentes/Productos';
import { db } from '../database/firebaseConfig';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function OfertasScreen() {
  const navigation = useNavigation();
  const [productosOferta, setProductosOferta] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const cargarTodos = async () => {
      const snapshot = await getDocs(collection(db, 'productos'));
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodosProductos(prods);
    };
    cargarTodos();

    const unsubscribe = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const ofertas = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        if (!data.nombre || !data.precio || !data.stock) return;

        const precioOriginal = parseFloat(data.precio);
        const stockActual = data.stock;
//formyla de oferta 25% para stock >30
        if (stockActual > 30) {
          ofertas.push({
            id,
            nombre: data.nombre,
            precio: (precioOriginal * 0.75).toFixed(2),
            precioOriginal: precioOriginal.toFixed(2),
            imagen: data.imagen,
            stock: stockActual,
            rating: data.rating || 4.5,
          });
        }
      });

      setProductosOferta(ofertas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const productosFiltrados = productosOferta.filter(p =>
    p.nombre?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalOfertas = productosOferta.length;

  const obtenerProductoCompleto = (nombre) => {
    return todosProductos.find(p => p.nombre === nombre) || {};
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.titulo}>OFERTAS POR ALTO INVENTARIO</Text>
      <Text style={styles.subtitulo}>
        {totalOfertas > 0 
          ? `${totalOfertas} productos con 25% OFF automático`
          : 'No hay ofertas activas'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../IMAGENES/ows.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>Sin ofertas</Text>
      <Text style={styles.emptyText}>
        {searchText 
          ? 'No se encontraron ofertas'
          : 'Ningún producto supera las 30 unidades en stock'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Cargando ofertas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* BUSCADOR */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={22} color="#ff4d4d" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar ofertas..."
            placeholderTextColor="#ff6b81"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* PRODUCTOS EN OFERTA */}
      <FlatList
        data={productosFiltrados}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const p = item;
          const prod = obtenerProductoCompleto(p.nombre);

          return (
            <View style={styles.tarjeta}>
              {/* Cinta decorativa 25% OFF */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>25% OFF</Text>
              </View>

              <Producto
                image={{ uri: p.imagen } || require('../../IMAGENES/ows.png')}
                precio={
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: 13,
                      color: '#999',
                      textDecorationLine: 'line-through',
                      marginBottom: 2
                    }}>
                      C${p.precioOriginal}
                    </Text>
                    <Text style={{
                      fontSize: 19,
                      fontWeight: 'bold',
                      color: '#ff4d4d'
                    }}>
                      C${p.precio}
                    </Text>
                  </View>
                }
                descripcion={p.nombre}
                hora_mes={`${p.stock} und en stock`}
                fondoColor="#ff4d4d"
                onPress={() => navigation.navigate('DetalleProducto', {
                  producto: {
                    ...prod,
                    image: { uri: p.imagen || prod.imagen },
                    descripcion: p.nombre,
                    precio: p.precio,
                    rating: prod.rating || 4.5,
                  }
                })}
                producto={{
                  ...prod,
                  id: prod.id || p.id,
                  precio: p.precio,
                  descripcion: p.nombre,
                  image: { uri: p.imagen || prod.imagen }
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },

  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fb' 
  },
  loadingText: { 
    marginTop: 20, 
    fontSize: 18, 
    color: '#ff4d4d', 
    fontWeight: '700' 
  },

  contenedor_buscador: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fb',
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    borderRadius: 25,
    height: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textoBuscador: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    paddingLeft: 12,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 15,
    color: '#fff',
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    fontWeight: 'bold',
  },

  contentContainer: {
    paddingBottom: 30,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },

  tarjeta: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },

  // Cinta de oferta
  badge: {
    position: 'absolute',
    top: 10,
    left: -25,
    zIndex: 2,
    backgroundColor: '#ff4d4d',
    paddingVertical: 5,
    paddingHorizontal: 40,
    transform: [{ rotate: '-25deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
    backgroundColor: '#f8f9fb',
  },
  emptyImage: { 
    width: 130, 
    height: 130, 
    marginBottom: 20, 
    opacity: 0.8 
  },
  emptyTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#ff6b81', 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: 15, 
    color: '#888', 
    textAlign: 'center', 
    lineHeight: 22 
  },
});
