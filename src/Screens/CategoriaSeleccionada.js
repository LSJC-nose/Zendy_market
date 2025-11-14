import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../database/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Producto from '../Componentes/Productos';

const CategoriaSeleccionada = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { nombre } = route.params || {}; // ← SOLO NECESITAS EL NOMBRE

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = (width - 60) / 2;

  useEffect(() => {
    const cargarProductos = async () => {
      if (!nombre) return;

      setLoading(true);
      try {
        // BUSCA POR EL NOMBRE DE LA CATEGORÍA
        const q = query(
          collection(db, 'productos'),
          where('Categoria', '==', nombre)
        );
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(lista);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [nombre]);

  const renderProducto = ({ item }) => {
    const imageSource = item.imagen?.startsWith('data:image/') || item.imagen?.startsWith('http')
      ? { uri: item.imagen }
      : { uri: 'https://via.placeholder.com/150?text=No+Imagen' };

    return (
      <View style={[styles.tarjeta, { width: CARD_WIDTH }]}
      >
        <Producto
          image={imageSource}
          precio={parseFloat(item.precio || 0).toFixed(2)}
          descripcion={item.nombre || 'Sin nombre'}
          hora_mes={item.stock ? `Stock: ${item.stock}` : 'Disponible'}
          fondoColor="#f8f9fa"
          cora="heart"
          producto={{ ...item }}
          onFavoritoPress={() => {}}
          onPress={() => navigation.navigate('DetalleProducto', { producto: { ...item, image: imageSource, descripcion: item.descripcion || item.nombre, precio: parseFloat(item.precio) } })}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Categoría: {nombre}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : productos.length === 0 ? (
        <Text style={styles.vacio}>No hay productos en "{nombre}"</Text>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}

      <TouchableOpacity style={styles.volver} onPress={() => navigation.goBack()}>
        <Text style={styles.textoVolver}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E9F3F5', padding: 15 },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2c3e50' },
  row: { justifyContent: 'flex-start', marginBottom: 15, paddingHorizontal: 0 },
  tarjeta: {
    marginRight: 15,
    marginBottom: 16,
    overflow: 'hidden',
  },
  vacio: { textAlign: 'center', fontSize: 18, color: '#95a5a6', marginTop: 50 },
  volver: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  textoVolver: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default CategoriaSeleccionada;