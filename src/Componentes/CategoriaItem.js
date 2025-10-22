import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CategoriaItem = ({ icon, imagen, texto }) => {
  return (
    <View style={styles.container}>
      {imagen ? (
        <Image source={{ uri: imagen }} style={styles.imagen} />
      ) : (
        <View style={styles.iconCircle}>
          <FontAwesome name={icon} color="#4a6da7" size={30} />
        </View>
      )}
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  texto: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});

export default CategoriaItem;
