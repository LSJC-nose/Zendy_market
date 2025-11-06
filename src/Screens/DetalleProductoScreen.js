import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, FlatList } from 'react-native';  // Agrego Modal/FlatList para direcciones
import { useRoute, useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db, auth } from '../database/firebaseConfig.js';  // Agrego auth para userId
import { collection, getDocs, addDoc, updateDoc, doc, writeBatch } from 'firebase/firestore';  // Para orden/stock
import { useCart } from '../Componentes/Carrito.js';

const { width } = Dimensions.get('window');

export default function DetalleProductoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { producto } = route.params || {};
  const { cartItems, addToCart, clearCart } = useCart();  // Asume clearCart; agrega si no tienes
  const [selectedTab, setSelectedTab] = useState('Description');
  const [selectedSize, setSelectedSize] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [tiendas, setTiendas] = useState([]);
  const [tiendaInfo, setTiendaInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);  // Nuevo: Lista de direcciones del user
  const [selectedAddress, setSelectedAddress] = useState(null);  // Nuevo: Dirección seleccionada
  const [showAddressModal, setShowAddressModal] = useState(false);  // Nuevo: Modal direcciones
  const [loading, setLoading] = useState(false);  // Nuevo: Loading para compra

  const currentUser = auth.currentUser;  // User logueado para userId

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

  // ← Nuevo: Cargar direcciones del user
  useEffect(() => {
    if (currentUser) {
      const cargarDirecciones = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'direcciones'));
          const data = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((dir) => dir.userId === currentUser.uid);  // ← Filtra por userId
          setAddresses(data);
          if (data.length > 0) setSelectedAddress(data[0]);  // ← Selecciona primera por default
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          Alert.alert('Error', 'No se pudieron cargar las direcciones.');
        }
      };
      cargarDirecciones();
    }
  }, [currentUser]);

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

  // ← Nueva: Lógica de compra simulada (integra con cart y direcciones)
  const realizarCompra = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para comprar.');
      navigation.navigate('Login');  // ← Redirige a login
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'El carrito está vacío. Agrega productos primero.');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Selecciona una dirección de envío.');
      setShowAddressModal(true);  // ← Abre modal direcciones
      return;
    }

    setLoading(true);  // ← Inicia loading

    try {
      // ← Validación stock para items en cart
      const batch = writeBatch(db);  // ← Batch para updates atómicos
      let total = 0;
      const productosOrden = [];

      for (const item of cartItems) {
        const productoRef = doc(db, 'productos', item.id);
        const productoSnap = await getDoc(productoRef);
        if (!productoSnap.exists() || (productoSnap.data().stock || 0) < item.cantidad) {
          Alert.alert('Error', `Producto "${item.descripcion}" sin stock suficiente.`);
          setLoading(false);
          return;
        }

        // ← Agrega a array productosOrden
        productosOrden.push({
          idProducto: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        });

        total += item.precio * item.cantidad;  // ← Calcula total

        // ← Prepara update stock
        batch.update(productoRef, {
          stock: productoSnap.data().stock - item.cantidad,
        });
      }

      // ← Crea orden en Firebase
      const nuevaOrden = {
        userId: currentUser.uid,
        productos: productosOrden,  // ← Array del cart
        estado: 'Procesando',  // ← Inicial
        métodoEnvio: 'Por seleccionar',  // ← Admin lo actualiza después
        total: total,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        direccionEnvio: selectedAddress.id,  // ← ID de la dirección seleccionada
        notas: '',  // ← Opcional, agrega input si quieres
      };

      const docRef = await addDoc(collection(db, 'órdenes'), nuevaOrden);
      await batch.commit();  // ← Ejecuta updates de stock

      clearCart();  // ← Limpia carrito post-compra (asumiendo función en useCart)

      Alert.alert(
        '¡Compra simulada exitosa! 🎉',
        `Orden creada con ID: ${docRef.id}\nTotal: $${total}\nEstado: Procesando\nDirección: ${selectedAddress.calle || 'Por verificar'}\n\n(En producción, aquí iría el pago real.)`,
        [{ text: 'OK', onPress: () => navigation.navigate('MisÓrdenes' || 'Carrito') }]  // ← Navega a órdenes o carrito
      );
    } catch (error) {
      console.error('Error en compra:', error);
      Alert.alert('Error', 'No se pudo procesar la compra. Intenta de nuevo.');
    } finally {
      setLoading(false);  // ← Fin loading
    }
  };

  // ← Nuevo: Render item para modal direcciones (card bonito)
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        selectedAddress?.id === item.id && styles.selectedAddressCard,
      ]}
      onPress={() => {
        setSelectedAddress(item);
        setShowAddressModal(false);
      }}
    >
      <FontAwesome name="map-marker" size={20} color="#007bff" style={styles.addressIcon} />
      <View style={styles.addressInfo}>
        <Text style={styles.addressName}>{item.nombre || 'Dirección sin nombre'}</Text>
        <Text style={styles.addressDetails}>{`${item.calle || ''}, ${item.ciudad || ''}, ${item.codigoPostal || ''}`}</Text>
      </View>
      {selectedAddress?.id === item.id && <AntDesign name="checkcircle" size={20} color="#4CAF50" />}
    </TouchableOpacity>
  );

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
              source={{ uri: tiendaInfo.foto }} 
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
        <View></View>
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

      {/* ← MOVIDO AQUÍ: Indicador de dirección, debajo de Read More (estilo Amazon) */}
      <View style={styles.addressSection}>
        <Text style={styles.sectionTitle}>Dirección de envío</Text>
        <TouchableOpacity 
          style={styles.addressCard} 
          onPress={() => setShowAddressModal(true)}
        >
          <FontAwesome name="map-marker" size={20} color="#007bff" style={styles.addressIcon} />
          <View style={styles.addressPreview}>
            <Text style={styles.addressLabel}>
              {selectedAddress 
                ? `${selectedAddress.calle || ''}, ${selectedAddress.ciudad || ''}`.trim() || 'Dirección seleccionada' 
                : 'Seleccionar dirección de envío'
              }
            </Text>
            <Text style={styles.addressSubtext}>
              {selectedAddress ? 'Cambiar dirección' : '+ Agregar nueva'}
            </Text>
          </View>
          <AntDesign name="down" size={16} color="#007bff" style={styles.addressArrow} />
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* Barra inferior fija (intacta, con loading en buy) */}
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
        style={[styles.buyNowButton, loading && styles.buyNowDisabled]}
        onPress={realizarCompra}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buyNowText}>Comprar</Text>
        )}
      </TouchableOpacity>
    </View>

    {/* ← Modal direcciones (intacto, abre al tap en card) */}
    <Modal
      visible={showAddressModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Dirección</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.addressCardModal,
                  selectedAddress?.id === item.id && styles.selectedAddressCardModal,
                ]}
                onPress={() => {
                  setSelectedAddress(item);
                  setShowAddressModal(false);
                }}
              >
                <FontAwesome name="map-marker" size={20} color="#007bff" style={styles.addressIconModal} />
                <View style={styles.addressInfoModal}>
                  <Text style={styles.addressNameModal}>{item.nombre || 'Dirección sin nombre'}</Text>
                  <Text style={styles.addressDetailsModal}>{`${item.calle || ''}, ${item.ciudad || ''}, ${item.codigoPostal || ''}`}</Text>
                </View>
                {selectedAddress?.id === item.id && <AntDesign name="checkcircle" size={20} color="#4CAF50" />}
              </TouchableOpacity>
            )}
            style={styles.addressListModal}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity 
            style={styles.addAddressButtonModal}
            onPress={() => {
              setShowAddressModal(false);
              navigation.navigate('Direcciones');
            }}
          >
            <Text style={styles.addAddressTextModal}>+ Agregar nueva dirección</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
}

// ← Tus funciones getImagen/etc. intactas
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

const getDescription = () => {
  const desc = producto?.descripcion || producto?.nombre || "Created for the hardwood but taken to the streets, the Nike LeBron brings the comfort and cushioning of one of the best basketball shoes to your everyday style. The full-length Air Max unit provides lightweight cushioning, while the leather upper delivers durability and support. The shoe breaks in even better. helps bring the comfort itury.....";
  return desc;
};

// ← Tus estilos intactos, agrego nuevos para address/modal
const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(213, 235, 231, 1)",
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
    marginLeft: -3,
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
    marginBottom: 10,  // ← Espacio para separar de address
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
  buyNowDisabled: {
    backgroundColor: '#ccc',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // ← Ajustado para address: A la derecha (flex-end), línea gris sutil (borderTop/bottom)
  addressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    borderTopWidth: 1,  // ← Línea gris sutil arriba (separar de Read More)
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'flex-end',  // ← Alinear todo a la derecha
    borderBottomWidth: 1,  // ← Línea gris sutil abajo (cierre visual)
    borderBottomColor: '#E0E0E0',
  },
  addressIcon: {
    marginLeft: 8,  // ← Icono a la derecha (invierte de marginRight para flex-end)
  },
  addressPreview: {
    flex: 1,
    alignItems: 'flex-end',  // ← Contenido alineado a la derecha
  },
  addressLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',  // ← Texto a la derecha
    marginBottom: 2,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',  // ← Texto a la derecha
  },
  addressArrow: {
    marginRight: 4,  // ← Arrow cerca del texto (derecha)
  },
  // ← Modal estilos intactos (no cambian)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressList: {
    maxHeight: 300,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAddressCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  addressIcon: {
    marginRight: 10,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
  },
  addAddressButton: {
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  addAddressText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});