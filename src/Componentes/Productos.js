// ../Componentes/Productos.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useCart } from './Carrito';

export default function Producto({
  image,
  precio,
  descripcion,
  hora_mes,
  explora,
  oferta,
  fondoColor,
  cora,
  nombreTienda,
  isFavorito = false,
  onFavoritoPress = () => { },
  onPress = () => { },
  producto = null,
}) {
  const { addToCart } = useCart();
  const stockText = hora_mes || (producto && (producto.stock !== undefined && producto.stock !== null) ? `Stock: ${producto.stock}` : null);
  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.contenedor_imagen, { backgroundColor: fondoColor }]}>
        <Image source={image} style={styles.imagen} />
        {/* Corazón como overlay sobre la imagen */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onFavoritoPress();
          }}
          style={styles.favoritoOverlay}
          activeOpacity={0.8}
        >
          <FontAwesome5 name={cora} size={18} color={isFavorito ? '#ed3946' : '#ffffff'} solid={isFavorito} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <View style={styles.cora_pre}>
          <View style={styles.precioContainer}>
            {oferta ? (
              <>
                <Text style={styles.precioOriginal}>${oferta.original}</Text>
                <Text style={styles.precioDescuento}>${precio}</Text>
              </>
            ) : (
              <Text style={styles.precio}>${precio}</Text>
            )}
          </View>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            try {
              const payload = producto || { id: null, precio, descripcion, image };
              if (!payload.id && descripcion) {
                // intentar inferir un id único si no existe (no ideal)
                payload.id = descripcion + '_' + (precio || '0');
              }
              addToCart(payload);
              Alert.alert('¡Listo!', 'Producto agregado al carrito');
            } catch (err) {
              console.error('Error al agregar al carrito:', err);
              Alert.alert('Error', 'No se pudo agregar al carrito');
            }
          }} style={styles.iconoCarrito}>
            <FontAwesome5 name="shopping-cart" size={18} color="#2a2c2eff" />
          </TouchableOpacity>
        </View>
        {oferta && (
          <View style={styles.badgeOferta}>
            <Text style={styles.textoBadge}>¡Oferta! {oferta.descuento}% OFF</Text>
          </View>
        )}
        <Text style={styles.descripcion} numberOfLines={2}>{descripcion}</Text>
        {nombreTienda && (
          <Text style={styles.nombreTienda}>Tienda: {nombreTienda}</Text>
        )}

        {/* Mostrar stock si viene en hora_mes o en el objeto producto */}
        {stockText ? <Text style={styles.explora}>{stockText}</Text> : <Text style={styles.explora}>{explora}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#ffffffff',
    borderRadius: 14,
    minHeight: 260,
    borderWidth: 1,
    borderColor: '#e4e0e0ff',
    overflow: 'hidden',
    width: '100%',
    padding: 8,
    marginBottom: 12,
  },

  contenedor_imagen: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    height: 140,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  info: {
    paddingHorizontal: 6,
    paddingBottom: 6,
    flex: 1,
    justifyContent: 'space-between',
  },
  precio: {
    marginTop: -10,
    marginLeft: 10,
    margin: -2,
    fontSize: 20,
    fontWeight: 'bold',
  },
  descripcion: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  mes_hora: {
    marginLeft: 10,
    fontSize: 11, fontFamily: "Merriweather",
    color: '#999',
  },
  nombreTienda: {
    marginLeft: 10,
    fontSize: 12,
    fontFamily: "Merriweather",
    color: '#4A90E2',
    fontWeight: '600',
  },
  cora_pre: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 6,
  },
  precioContainer: {
    marginLeft: 3,
    margin: 6,
  },
  precioOriginal: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: 'normal',
    textDecorationLine: 'line-through',
    color: '#999',
  },
  precioDescuento: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  badgeOferta: {
    backgroundColor: '#ed3946',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
  },
  textoBadge: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconoFavorito: {
    padding: 4,
  },
  iconoCarrito: {
    padding: 4,
    marginLeft: 6,
  },
  favoritoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});