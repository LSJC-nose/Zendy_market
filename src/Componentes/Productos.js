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
  isFavorito = false,
  onFavoritoPress = () => {},
}) {
  return (
    <View style={styles.tarjeta}>
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
          <FontAwesome5 name={cora} size={20} color="#6f6f77ff" />
        </View>
        {oferta && (
          <View style={styles.badgeOferta}>
            <Text style={styles.textoBadge}>¡Oferta! {oferta.descuento}% OFF</Text>
          </View>
        )}
        <Text style={styles.descripcion}>{descripcion}</Text>
        <Text style={styles.mes_hora}>{hora_mes}</Text>
        <Text style={styles.explora}>{explora}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#ffffffff",
    borderRadius: 16,
    height: 230,
    borderWidth: 2,
    borderColor: '#e4e0e0ff',
  },
  contenedor_imagen: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: 186,
    height: 128,
    marginBottom: 10,
    alignItems: "center",

    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },

  precio: {
    marginTop: 2,
    marginLeft: 10,
    margin: 6,
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
  cora_pre: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 14,
  },
  precioContainer: {
  marginLeft: 10,
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
});