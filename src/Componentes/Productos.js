// ../Componentes/Productos.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Producto({
  image,
  precio,
  descripcion,
  hora_mes,
  explora,
  fondoColor,
  isFavorito = false,
  onFavoritoPress = () => {},
}) {
  return (
    <View style={styles.tarjeta}>
      {/* IMAGEN CON BORDE REDONDEADO Y RECORTADA */}
      <View style={[styles.contenedorImagen, { backgroundColor: fondoColor }]}>
        <Image
          source={image}
          style={styles.imagen}
          resizeMode="cover"
        />
      </View>

      <View style={styles.info}>
        <View style={styles.precioYFavorito}>
          <Text style={styles.precio}>${precio}</Text>
          <TouchableOpacity onPress={onFavoritoPress}>
            <FontAwesome5
              name="heart"
              size={20}
              solid={isFavorito}
              color={isFavorito ? '#e74c3c' : '#6f6f77ff'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.descripcion} numberOfLines={2}>
          {descripcion}
        </Text>
        <Text style={styles.stock}>{hora_mes} en stock</Text>
        {explora ? <Text style={styles.explora}>{explora}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 230,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e4e0e0ff',
    overflow: 'hidden', // ← evita que la imagen se salga
  },
  contenedorImagen: {
    width: '100%',
    height: 128,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden', // ← RECORTA LA IMAGEN
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 10,
    flex: 1,
  },
  precioYFavorito: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  precio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  stock: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  explora: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 4,
  },
});