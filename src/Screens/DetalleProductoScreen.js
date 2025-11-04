import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../database/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/Carrito.js';

const { width } = Dimensions.get('window');

export default function DetalleProductoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { producto } = route.params || {};
  const { addToCart } = useCart();
  const [selectedTab, setSelectedTab] = useState('Description');
  const [selectedSize, setSelectedSize] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [tiendas, setTiendas] = useState([]);
  const [tiendaInfo, setTiendaInfo] = useState(null);

  // Cargar tiendas y buscar la tienda del producto
  useEffect(() => {
    const cargarTiendas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tienda'));
        const tiendasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTiendas(tiendasData);

        // Buscar la tienda del producto
        if (producto?.tiendaId) {
          const tienda = tiendasData.find((t) => t.id === producto.tiendaId);
          setTiendaInfo(tienda || null);
        }
      } catch (error) {
        console.error('Error al cargar las tiendas:', error);
      }
    };

    cargarTiendas();
  }, [producto?.tiendaId]);

  const getImagen = () => {
    if (producto.image) return producto.image;
  };

  const getNombre = () => {
    if (!producto) return 'Producto';
    return producto.descripcion || producto.nombre || 'Producto';
  };

  const getPrecio = () => {
    if (!producto) return '0';
    return producto.precio?.toString() || '0';
  };

  const getRating = () => {
    if (!producto) return 4.8;
    return producto.rating || 4.8;
  };

  const rating = getRating();
  const estrellas = Array.from({ length: 5 }, (_, i) => (
    <FontAwesome5 key={i} name={i < Math.round(rating) ? 'star' : 'star-o'} size={16} color="#FFD700" />
  ));




  const nombre = getNombre();
  const precio = getPrecio();
  const imageSource = getImagen();

  const getDescription = () => {
    const desc = producto?.descripcion || producto?.nombre || "Created for the hardwood but taken to the streets, the Nike LeBron brings the comfort and cushioning of one of the best basketball shoes to your everyday style. The full-length Air Max unit provides lightweight cushioning, while the leather upper delivers durability and support. The shoe breaks in even better. helps bring the comfort itury.....";
    return desc;
  };

  const fullDescription = getDescription();
  const shortDescription = fullDescription.length > 100 ? fullDescription.substring(0, 100) + "..." : fullDescription;



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
         {tiendaInfo && (
          <View>
          <View style={styles.tiendaContainer}>
            <Image 
              source={{ uri: tiendaInfo.foto}} 
              style={styles.tiendaImagen} 
            />
            <Text style={styles.tiendaNombre}>{tiendaInfo.nombre || 'Tienda sin nombre'}</Text>
          </View>
          </View>
        )}

      </View>
      

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.imageCard}>
            <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
          </View>

        </View>

        <View style={styles.sizeRatingRow}>
          <View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {estrellas}
            </View>
            <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.namePriceRow}>
          <Text style={styles.productName}>{nombre}</Text>
          <Text style={styles.productPrice}>{precio}$</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {showFullDescription ? fullDescription : shortDescription}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text style={styles.readMore}>{showFullDescription ? 'Read Less' : 'Read More'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra inferior fija */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => {
            if (!producto || !producto.id) {
              Alert.alert('Error', 'No se puede agregar el producto al carrito');
              return;
            }
            addToCart(producto);
            Alert.alert('Éxito', 'Producto agregado al carrito', [
              { text: 'OK' },
              { text: 'Ver carrito', onPress: () => navigation.navigate('Carrito') }
            ]);
          }}
        >
          <FontAwesome name="shopping-cart" size={20} color="#000" />
          <AntDesign name="plus" size={12} color="#000" style={styles.plusIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={() => {
            if (!producto || !producto.id) {
              Alert.alert('Error', 'No se puede agregar el producto al carrito');
              return;
            }
            addToCart(producto);
            navigation.navigate('Carrito');
          }}
        >
          <Text style={styles.buyNowText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:"rgba(213, 235, 231, 1)",
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  imageCard: {
    width: width - 40,
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  sizeRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  ratingNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  namePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  tiendaContainer: {
   marginLeft:-3
  },
  tiendaImagen: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 5,
    backgroundColor: '#E0E0E0',
  },
  tiendaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 10,
  },
  readMore: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 15,
  },
  plusIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  buyNowButton: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#0288D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});