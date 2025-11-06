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
  getDoc,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { db } from '../database/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import CategoriaItem from '../Componentes/CategoriaItem.js';
import Producto from '../Componentes/Productos';
import Notificaciones from '../Componentes/Notificaciones.js';

const { width } = Dimensions.get('window');

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [ventasPorTienda, setVentasPorTienda] = useState([]);
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

  const toggleFavorito = (productoId) => {
    setFavoritos((prev) => ({
      ...prev,
      [productoId]: !prev[productoId],
    }));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // CATEGORÍAS
        const catSnapshot = await getDocs(collection(db, 'categoria'));
        const cats = catSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategorias(cats);

        // PRODUCTOS
        const prodSnapshot = await getDocs(collection(db, 'productos'));
        const prods = prodSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProductos(prods);

        // TIENDAS
        const tiendaSnapshot = await getDocs(collection(db, 'tienda'));
        const tiendasData = tiendaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTiendas(tiendasData);

        // VENTAS → MÁS VENDIDOS POR TIENDA
        const ventasSnapshot = await getDocs(collection(db, 'ventas'));
        const ventas = ventasSnapshot.docs.map(doc => doc.data());

        const ventasMap = {};
        ventas.forEach(v => {
          const tiendaId = v.tiendaId;
          const nombreProd = v.nombreProducto;
          const cant = v.cantidad || 1;
          const precio = v.precio || 0;
          const imagen = v.imagen?.uri || v.imagen;

          if (!ventasMap[tiendaId]) ventasMap[tiendaId] = {};
          if (!ventasMap[tiendaId][nombreProd]) {
            ventasMap[tiendaId][nombreProd] = { cantidad: 0, precio, imagen };
          }
          ventasMap[tiendaId][nombreProd].cantidad += cant;
        });

        const topPorTienda = Object.entries(ventasMap).map(([tiendaId, productos]) => {
          const lista = Object.entries(productos).map(([nombre, data]) => ({
            nombre,
            ...data,
          }));
          const ordenados = lista.sort((a, b) => b.cantidad - a.cantidad).slice(0, 3);
          return { tiendaId, productos: ordenados };
        });

        setVentasPorTienda(topPorTienda);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    return productos.filter((p) =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  const categoriasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return categorias;
    return categorias.filter((c) =>
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [categorias, busqueda]);

  const navigation = useNavigation();

  const obtenerNombreTienda = (tiendaId) => {
    const tienda = tiendas.find(t => t.id === tiendaId);
    return tienda ? tienda.nombre : '';
  };

  const obtenerProductoPorNombre = (nombre) => {
    return productos.find(p => p.nombre === nombre) || {};
  };

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
            <Text style={styles.textoBoton}>Explorar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cuadro}>
          <Text style={styles.tituloCuadro}>Ver ofertas ¡quizás te interesen!</Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Ofertas')}>
            <Text style={styles.textoBoton}>Ver</Text>
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

        {/* CATEGORÍAS */}
        <View style={styles.contenedorCategoria}>
          {categoriasFiltradas.length > 0 ? (
            <FlatList
              data={categoriasFiltradas}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigation.navigate('CategoriaSeleccionada', { nombre: item.nombre })}>
                  <CategoriaItem imagen={item.foto} texto={item.nombre} />
                </TouchableOpacity>
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

        {/* PRODUCTOS MÁS VENDIDOS POR TIENDA */}
        <Text style={styles.produc_dest}>Productos más vendidos por tienda</Text>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
          ) : ventasPorTienda.length === 0 ? (
            <Text style={styles.sinProductos}>No hay ventas aún</Text>
          ) : (
            <View style={styles.productosContainer}>
              {ventasPorTienda.map(({ tiendaId, productos }) => {
                const nombreTienda = obtenerNombreTienda(tiendaId);
                return productos.map((p, i) => {
                  const prod = obtenerProductoPorNombre(p.nombre);
                  return (
                    <View key={`${tiendaId}-${i}`} style={styles.tarjeta}>
                      <Producto
                        image={{ uri: p.imagen || prod.imagen || 'https://via.placeholder.com/150' }}
                        precio={p.precio}
                        descripcion={p.nombre}
                        hora_mes={`Vendidos: ${p.cantidad}`}
                        explora=""
                        fondoColor="#f8f9fa"
                        nombreTienda={nombreTienda}
                        isFavorito={!!favoritos[prod.id]}
                        onFavoritoPress={() => toggleFavorito(prod.id)}
                        onPress={() => navigation.navigate('DetalleProducto', {
                          producto: {
                            ...prod,
                            image: { uri: p.imagen || prod.imagen },
                            descripcion: p.nombre,
                            precio: p.precio,
                            rating: prod.rating || 4.5,
                          }
                        })}
                      />
                    </View>
                  );
                });
              })}
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
    paddingHorizontal: 20,
    marginTop: 8,
  },
  tarjeta: {
    width: (width - 49) / 2,
    marginBottom: 16,
    overflow: 'hidden',
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