import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Producto from '../Componentes/Productos';

export default function OfertasScreen() {
  const ProductosConOfertas = [
    {
      id: 1,
      image: require('../../IMAGENES/ows.png'),
      precio: '8',
      descripcion: "A Room of One's Own (Oferta)",
      hora_mes: '5 hours ago',
      fondoColor: 'rgb(125, 183, 219)',
      cora: 'heart',
      oferta: { original: '12', descuento: 33 },
    },
    {
      id: 2,
      image: require('../../IMAGENES/wireless.png'),
      precio: '35',
      descripcion: 'Wireless headphones (Oferta)',
      hora_mes: '8 hours ago',
      fondoColor: 'rgb(163, 227, 255)',
      cora: 'heart',
      oferta: { original: '50', descuento: 30 },
    },
    {
      id: 3,
      image: require('../../IMAGENES/zapa.png'),
      precio: '7',
      descripcion: 'White sneakers (Oferta)',
      hora_mes: '3 hours ago',
      fondoColor: 'rgb(255, 194, 203)',
      cora: 'heart',
      oferta: { original: '10', descuento: 30 },
    },
    {
      id: 4,
      image: require('../../IMAGENES/camera.png'),
      precio: '9',
      descripcion: 'Camera-Video & photo (Oferta)',
      hora_mes: '6 hours ago',
      fondoColor: 'rgb(165, 143, 255)',
      cora: 'heart',
      oferta: { original: '12', descuento: 25 },
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar ofertas"
            placeholderTextColor="#753c3cff"
          />
        </View>
      </View>
      <ScrollView style={styles.productosContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>¡Ofertas especiales del día! 🔥</Text>
        <FlatList
          data={ProductosConOfertas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <Producto
              image={item.image}
              precio={item.precio}
              descripcion={item.descripcion}
              hora_mes={item.hora_mes}
              fondoColor={item.fondoColor}
              cora={item.cora}
              oferta={item.oferta}
            />
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(197, 230, 232)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contenedor_buscador: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -30,
  },
  buscador: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 245, 255)',
    marginTop: 60,
    padding: 15,
    borderRadius: 10,
  },
  textoBuscador: {
    flex: 1,
    height: 45,
    color: '#529c6bff',
    fontSize: 15,
    paddingLeft: 15,
  },
  titulo: {
    marginLeft: 19,
    fontSize: 19,
    marginTop: 29,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#ed3946',
  },
  productosContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
});