import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Producto from '../Componentes/Productos';
import { useNavigation } from '@react-navigation/native';

export default function vistaProductos() {
  const navigation = useNavigation();
  const Productos = [
    {
      id: 1,
      image: require('../../IMAGENES/ows.png'),
      precio: '12',
      descripcion: "A Room of One's Own",
      hora_mes: '5 hours ago',
      fondoColor: 'rgb(125, 183, 219)',
      cora: 'heart',
    },
    {
      id: 2,
      image: require('../../IMAGENES/wireless.png'),
      precio: '50',
      descripcion: 'Wireless headphones',
      hora_mes: '8 hours ago',
      fondoColor: 'rgb(163, 227, 255)',
      cora: 'heart',
    },
    {
      id: 3,
      image: require('../../IMAGENES/zapa.png'),
      precio: '10',
      descripcion: 'White sneakers',
      hora_mes: '3 hours ago',
      fondoColor: 'rgb(255, 194, 203)',
      cora: 'heart',
    },
    {
      id: 4,
      image: require('../../IMAGENES/camera.png'),
      precio: '12',
      descripcion: 'Camera-Video & photo',
      hora_mes: '6 hours ago',
      fondoColor: 'rgb(165, 143, 255)',
      cora: 'heart',
    },
    {
      id: 5,
      image: require('../../IMAGENES/oso.png'),
      precio: '15',
      descripcion: 'Teddy',
      hora_mes: '10 hours ago',
      fondoColor: 'rgb(189, 226, 242)',
      cora: 'heart',
    },
    {
      id: 6,
      image: require('../../IMAGENES/cartera.png'),
      precio: '50',
      descripcion: 'Makeup travel bag',
      hora_mes: '12 hours ago',
      fondoColor: 'rgb(255, 236, 166)',
      cora: 'heart',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Buscador */}
      <View style={styles.contenedor_buscador}>
        <View style={styles.buscador}>
          <FontAwesome name="search" size={20} color="black" />
          <TextInput
            style={styles.textoBuscador}
            placeholder="Buscar"
            placeholderTextColor="#753c3cff"
          />
        </View>
      </View>

      {/* Scroll vertical de productos */}
      <ScrollView style={styles.productosContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Explora una gran variedad de productos</Text>
        <FlatList
          data={Productos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.image}
                precio={item.precio}
                descripcion={item.descripcion}
                hora_mes={item.hora_mes}
                fondoColor={item.fondoColor}
                cora={item.cora}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Consigue los equipos más destacados</Text>
        <FlatList
          data={Productos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.image}
                precio={item.precio}
                descripcion={item.descripcion}
                hora_mes={item.hora_mes}
                fondoColor={item.fondoColor}
                cora={item.cora}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Lo más popular esta semana</Text>
        <FlatList
          data={Productos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.image}
                precio={item.precio}
                descripcion={item.descripcion}
                hora_mes={item.hora_mes}
                fondoColor={item.fondoColor}
                cora={item.cora}
                oferta={item.oferta}
              />
            </TouchableOpacity>
          )}
        />

        <Text style={styles.titulo}>Novedades para el hogar</Text>
        <FlatList
          data={Productos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DetalleProducto', { producto: item })}>
              <Producto
                image={item.image}
                precio={item.precio}
                descripcion={item.descripcion}
                hora_mes={item.hora_mes}
                fondoColor={item.fondoColor}
                cora={item.cora}
                oferta={item.oferta}
              />
            </TouchableOpacity>
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