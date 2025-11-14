// ../Componentes/Productos.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useCart } from './Carrito';

export default function hasProducto({
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
  const displayTitle = (producto && (producto.nombre || producto.descripcion)) || descripcion || '';
  const stockText = hora_mes || (producto && (producto.stock !== undefined && producto.stock !== null) ? `Stock: ${producto.stock}` : null);
  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.contenedor_imagen, { backgroundColor: fondoColor }]}>
        <Image source={image} style={styles.imagen} />
        {/* Stock badge sobre la imagen */}
        { (producto && (producto.stock !== undefined && producto.stock !== null)) || (typeof hora_mes === 'string' && hora_mes.match(/\d+/)) ? (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{
              (producto && (producto.stock !== undefined && producto.stock !== null))
                ? (producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado')
                : (hora_mes && hora_mes.match(/\d+/) ? `Stock: ${hora_mes.match(/\d+/)[0]}` : '')
            }</Text>
          </View>
        ) : null}
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
        <Text style={styles.descripcion} numberOfLines={2}>{displayTitle}</Text>
        {nombreTienda && (
          <Text style={styles.nombreTienda}>Tienda: {nombreTienda}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    minHeight: 260,
    borderWidth: 0,
    // softer shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    width: '100%',
    padding: 0,
    marginBottom: 14,
  },

  contenedor_imagen: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    height: 160,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f4f6f6',
  },
  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  info: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'flex-start',
  },
  precio: {
    marginTop: 4,
    marginLeft: 0,
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },
  descripcion: {
    marginTop: 6,
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  mes_hora: {
    marginLeft: 10,
    fontSize: 11, fontFamily: "Merriweather",
    color: '#999',
  },
  nombreTienda: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Merriweather',
    color: '#2563eb',
    fontWeight: '700',
  },
  cora_pre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  precioContainer: {
    marginLeft: 3,
    margin: 6,
    alignItems: 'flex-start',
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
    fontSize: 20,
    fontWeight: '900',
    color: '#16a34a',
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
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 11,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});