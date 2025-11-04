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
  oferta,
  fondoColor,
  cora,
  nombreTienda,
  isFavorito = false,
  onFavoritoPress = () => {},
  onPress = () => {},
}) {
  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.contenedor_imagen, { backgroundColor: fondoColor }]}>
        <Image source={image} style={styles.imagen} />
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
            onFavoritoPress();
          }} style={styles.iconoFavorito}>
            <FontAwesome5 name={cora} size={20} color={isFavorito ? "#ed3946" : "#6f6f77ff"} solid={isFavorito} />
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
       
        <Text style={styles.explora}>{explora}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#ffffffff",
    borderRadius: 16,
    height: 250,
    borderWidth: 2,
    borderColor: '#e4e0e0ff',
  },
  
  contenedor_imagen: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 18,
    width: 183,
    height: 160,
    marginBottom: 10,
    alignItems: "center",
    overflow: 'hidden',
  },
  imagen: {
    marginLeft:-12,
    width: '96%',
    height: '100%',
  },
  precio: {
    marginTop: -10,
    marginLeft: 10,
    margin: -2,
    fontSize: 24,
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
    justifyContent: "space-between",
    marginRight: 14,
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
});