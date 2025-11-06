import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../database/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CategoriaSeleccionada = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { nombre } = route.params || {}; // ← SOLO NECESITAS EL NOMBRE

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
        style={styles.imagen}
        resizeMode="cover"
      />
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.precio}>{item.precio} $</Text>
    </View>
  );

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
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2c3e50' },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '48%',
    padding: 10,
    elevation: 4,
    alignItems: 'center',
  },
  imagen: { width: 100, height: 100, borderRadius: 12, marginBottom: 10 },
  nombre: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  precio: { fontSize: 18, fontWeight: 'bold', color: '#27ae60', marginTop: 5 },
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