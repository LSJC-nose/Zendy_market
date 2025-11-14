import React, { useEffect, useState, useMemo } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { db } from '../database/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import Producto from '../Componentes/Productos';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columnas con margen

export default function VistaProductos() {
  const [productosValidos, setProductosValidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState({});
  const navigation = useNavigation();

  const toggleFavorito = (productoId) => {
    setFavoritos((prev) => ({
      ...prev,
      [productoId]: !prev[productoId],
    }));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtrados = data.filter(
          (item) =>
            item.id &&
            item.nombre &&
            item.nombre.trim() !== '' &&
            !isNaN(parseFloat(item.precio))
        );
        setProductosValidos(filtrados);
      } catch (error) {
        console.error('Error:', error);
        setProductosValidos([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productosValidos;
    return productosValidos.filter(
      (item) =>
        item.nombre?.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        item.precio?.toString().includes(busqueda.trim())
    );
  }, [productosValidos, busqueda]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (productosValidos.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No hay productos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER BUSCADOR */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="#444" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar productos..."
            placeholderTextColor="#888"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <Text style={styles.produc_dest}>Todos los productos</Text>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {productosFiltrados.length === 0 ? (
          <Text style={styles.sinProductos}>No se encontraron productos</Text>
        ) : (
          <View style={styles.grid}>
            {productosFiltrados.map((item) => {
              const imageSource =
                item.imagen?.startsWith('data:image/') || item.imagen?.startsWith('http')
                  ? { uri: item.imagen }
                  : { uri: 'https://via.placeholder.com/150?text=No+Imagen' };

              return (
                <View key={item.id} style={styles.tarjeta}>
                  <Producto
                    image={imageSource}
                    precio={parseFloat(item.precio).toFixed(2)}
                    descripcion={item.nombre.trim()}
                    hora_mes={item.stock ? `Stock: ${item.stock}` : 'Disponible'}
                    explora=""
                    fondoColor="#f8f9fa"
                    cora="heart"
                    isFavorito={!!favoritos[item.id]}
                    onFavoritoPress={() => toggleFavorito(item.id)}
                    onPress={() =>
                      navigation.navigate('DetalleProducto', {
                        producto: {
                          ...item,
                          image: imageSource,
                          nombre: item.nombre.trim(),
                          descripcion: item.descripcion ,
                          precio: parseFloat(item.precio),
                          rating: item.rating || 4.5,
                        },
                      })
                    }
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F3F5',
    alignItems: 'center',
    paddingTop: 40,
  },
  contenedor_buscador: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buscador: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  textoBuscador: {
    flex: 1,
    height: 45,
    color: '#333',
    fontSize: 16,
    paddingLeft: 10,
  },
  produc_dest: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
    marginVertical: 10,
    alignSelf: 'flex-start',
    marginLeft: '6%',
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // ← Alinea a la izquierda
    paddingHorizontal: 15,
  },
  tarjeta: {
    width: CARD_WIDTH,
    marginRight: 15,
    marginBottom: 16,
    overflow: 'hidden',
  },
  // Ajuste para el último de cada fila
  sinProductos: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
    fontStyle: 'italic',
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9F3F5',
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3498db',
  },
});