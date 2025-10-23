import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function DetalleProductoScreen() {
  const route = useRoute();
  const { producto } = route.params; // Recibe el producto pasado desde Home/VistaProductos

  const estrellas = Array.from({ length: 5 }, (_, i) => (
    <FontAwesome5 key={i} name={i < Math.round(producto.rating || 4.5) ? 'star' : 'star-o'} size={16} color="#FFD700" />
  ));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen grande */}
        <Image source={producto.image} style={styles.imagenGrande} resizeMode="contain" />

        {/* Título */}
        <Text style={styles.titulo}>{producto.descripcion}</Text>

        {/* Descripción */}
        <Text style={styles.descripcion}>
          {producto.descripcion} es un dron ligero de menos de 249 gramos con video 4K y 31 minutos de vuelo.
        </Text>

        {/* Precio */}
        <View style={styles.precioBox}>
          <Text style={styles.precioTexto}>US ${producto.precio}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTexto}>Reseña</Text>
          <View style={styles.estrellas}>
            {estrellas}
            <Text style={styles.ratingNum}>4.5</Text>
          </View>
        </View>

        {/* Barra inferior */}
        <View style={styles.barraInferior}>
          <TouchableOpacity style={styles.botonTienda}>
            <FontAwesome name="shopping-bag" size={20} color="white" />
            <Text style={styles.textoTienda}>Tienda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(209, 230, 235, 1)',
  },
  imagenGrande: {
    width: '100%',
    height: 300,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 5,
    color: '#333',
  },
  descripcion: {
    fontSize: 16,
    marginHorizontal: 15,
    marginBottom: 15,
    color: '#555',
    lineHeight: 22,
  },
  precioBox: {
    backgroundColor: '#4CAF50',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  precioTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  ratingTexto: {
    fontSize: 16,
    color: '#333',
  },
  estrellas: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNum: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barraInferior: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 20,
  },
  botonTienda: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  textoTienda: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});