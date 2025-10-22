import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Categoria({ nombre, texto }) {
  return (
    <View style={styles.conatainer_text}>
      <FontAwesome5 name={nombre} size={39} color="#1f1a1aff" />
      <Text style={styles.text}>{texto}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  
  text: {
    fontWeight: 'bold',
    color: "#0a0a1aff"
  },
  conatainer_text: {
    marginRight: 38,
  }

})