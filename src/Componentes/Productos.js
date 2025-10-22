import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Producto({explora, image, precio, descripcion, hora_mes, fondoColor, cora }) {
  return (
    <View style={styles.tarjeta}>
      <View style={[styles.contenedor_imagen, { backgroundColor: fondoColor }]}>
        <Image source={image} style={styles.imagen} />
      </View>
      <View style={styles.info}>
        <View style={styles.cora_pre}>
        <Text style={styles.precio}>${precio}</Text>
        <FontAwesome5 name={cora} size={20} color="#6f6f77ff"/>
        </View>
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
  cora_pre:{
flexDirection:"row",
justifyContent:"space-between",
marginRight:14,
  }
});