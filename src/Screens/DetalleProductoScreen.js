import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, 
  Dimensions, Alert, Modal, FlatList, ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db, auth } from '../database/firebaseConfig.js';
import { collection, getDocs, addDoc, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';
import { useCart } from '../Componentes/Carrito.js';
import CheckoutScreen from './CheckoutScreen'; 

const { width } = Dimensions.get('window');

export default function DetalleProductoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { producto } = route.params || {};
  const { cartItems, addToCart, clearCart } = useCart();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [tiendas, setTiendas] = useState([]);
  const [tiendaInfo, setTiendaInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const cargarTiendas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tienda'));
        const tiendasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTiendas(tiendasData);
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

  useEffect(() => {
    if (currentUser) {
const cargarDirecciones = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'direcciones'));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // ← Temporal para simulación: omitir filter para mostrar TODAS (10+). Re-activa después: .filter((dir) => dir.userId === currentUser.uid)
      // const data = querySnapshot.docs
      //   .map((doc) => ({ id: doc.id, ...doc.data() }))
      //   .filter((dir) => dir.userId === currentUser.uid);
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0]);
      console.log(`Direcciones cargadas: ${data.length}`);  // ← Debug: Ver en console cuántas carga
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las direcciones.');
    }
  };
  cargarDirecciones();
    }
  }, [currentUser]);

  const getImagen = () => producto?.image || { uri: 'https://via.placeholder.com/300' };
  const getNombre = () => producto?.descripcion || producto?.nombre || 'Producto';
  const getPrecio = () => producto?.precio?.toString() || '0';
  const getRating = () => producto?.rating || 4.8;

  const rating = getRating();
  const estrellas = Array.from({ length: 5 }, (_, i) => (
    <FontAwesome5 key={i} name={i < Math.round(rating) ? 'star' : 'star-o'} size={18} color="#FFD700" />
  ));

  const nombre = getNombre();
  const precio = getPrecio();
  const imageSource = getImagen();
  const fullDescription = producto?.descripcion || "Creado para la cancha pero llevado a las calles. Estilo urbano con rendimiento profesional.";
  const shortDescription = fullDescription.length > 120 ? fullDescription.substring(0, 120) + "..." : fullDescription;

const realizarCompra = async () => {
  console.log('Iniciando compra...');  // ← Debug

  // ← Simulación: Usa userId fijo si no auth (para test)
  const userId = currentUser ? currentUser.uid : 'testUser123';

  // ← Fallback: Si cart vacío, usa el producto actual con cantidad 1
  const items = cartItems.length > 0 ? cartItems : [producto];
  const total = items.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);

  // ← Productos array: Mapea a estructura de base (idProducto, cantidad 1, precioUnitario)
  const productosOrden = items.map((item) => ({
    idProducto: item.id,  // ← Como en tu base
    cantidad: 1,  // ← Predeterminado 1
    precioUnitario: item.precio,  // ← Precio del producto
  }));

  // ← Dirección: Concatena como string completo (calle + ciudad + referencias)
  const direccionEnvio = selectedAddress ? `${selectedAddress.calle || ''}, ${selectedAddress.ciudad || ''}${selectedAddress.referencias ? ` (${selectedAddress.referencias})` : ''}`.trim() : 'Por seleccionar';

  const nuevaOrden = {
    userId: userId,  // ← De auth o test
    productos: productosOrden,  // ← Array como en base
    estado: 'Procesando',  // ← Predeterminado
    metodoEnvio: 'Por seleccionar',  // ← Predeterminado hasta admin
    total: total,  // ← Precio * 1 o suma cart
    fechaCreacion: new Date(),  // ← Actual
    fechaActualizacion: new Date(),  // ← Actual
    direccionEnvio: direccionEnvio,  // ← String completo de seleccionada
    notas: selectedAddress ? selectedAddress.referencias || '' : '',  // ← Referencias como notas
  };

  console.log('Creando orden:', nuevaOrden);  // ← Debug: Ver datos

  setLoading(true);
  try {
    const docRef = await addDoc(collection(db, 'órdenes'), nuevaOrden);
    console.log('Orden agregada con ID:', docRef.id);  // ← Confirmar éxito

    if (cartItems.length > 0) clearCart();  // ← Limpia si había cart

    Alert.alert(
      '¡Compra simulada exitosa!',
      `Orden #${docRef.id.substring(0, 8)}...\nTotal: $${total}\nEstado: Procesando\nDirección: ${direccionEnvio}\n¡Revisa en Firebase!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    console.error('Error:', error);  // ← Debug completo
    Alert.alert('Error', `No se pudo agregar: ${error.message}. Chequea rules/auth.`);
  } finally {
    setLoading(false);
  }
};

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.addressCardModal, selectedAddress?.id === item.id && styles.selectedAddressCardModal]}
      onPress={() => { setSelectedAddress(item); setShowAddressModal(false); }}
    >
      <FontAwesome name="map-marker" size={22} color="#007bff" style={styles.addressIconModal} />
      <View style={styles.addressInfoModal}>
        <Text style={styles.addressNameModal}>{item.nombre || 'Mi casa'}</Text>
        <Text style={styles.addressDetailsModal}>{`${item.calle}, ${item.ciudad}`}</Text>
      </View>
      {selectedAddress?.id === item.id && <AntDesign name="checkcircle" size={22} color="#4CAF50" />}
    </TouchableOpacity>
  );

return (
    <View style={styles.container}>
      {/* HEADER ELEGANTE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Producto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* IMAGEN HERO */}
        <View style={styles.heroImageContainer}>
          <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.overlayGradient} />
        </View>

        {/* INFO SUPERIOR */}
        <View style={styles.infoCard}>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{estrellas}</View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>

          <Text style={styles.productName}>{nombre}</Text>
          <Text style={styles.productPrice}>${precio}</Text>

          {/* TIENDA */}
          {tiendaInfo && (
            <TouchableOpacity style={styles.tiendaCard}>
              <Image source={{ uri: tiendaInfo.foto }} style={styles.tiendaLogo} />
              <View>
                <Text style={styles.tiendaLabel}>Vendido por</Text>
                <Text style={styles.tiendaName}>{tiendaInfo.nombre}</Text>
              </View>
              <AntDesign name="right" size={18} color="#666" />
            </TouchableOpacity>
          )}

          {/* DESCRIPCIÓN */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {showFullDescription ? fullDescription : shortDescription}
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Mostrar menos' : 'Leer más'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DIRECCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entrega a</Text>
            <TouchableOpacity style={styles.addressCard} onPress={() => setShowAddressModal(true)}>
              <FontAwesome name="map-marker" size={18} color="#FF6B35" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressMain}>
                  {selectedAddress ? `${selectedAddress.calle}, ${selectedAddress.ciudad}` : 'Selecciona dirección'}
                </Text>
                <Text style={styles.addressChange}>
                  {selectedAddress ? 'Cambiar' : 'Agregar dirección'}
                </Text>
              </View>
              <AntDesign name="down" size={18} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BARRA INFERIOR FIJA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.cartBtn}
          onPress={() => {
            if (!producto || !producto.id) {
              Alert.alert('Error', 'No se puede agregar el producto al carrito');
              return;
            }
            addToCart(producto);
            Alert.alert('¡Listo!', 'Producto agregado al carrito', [
              { text: 'Ver carrito', onPress: () => navigation.navigate('Carrito') }
            ]);
          }}
        >
          <FontAwesome name="shopping-cart" size={22} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyBtn}
          onPress={() => navigation.navigate('Checkout', { selectedAddress, cartItems, producto })}
        >
          <Text style={styles.buyBtnText}>Comprar Ahora</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DIRECCIONES */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar dirección</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <AntDesign name="close" size={26} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={renderAddressItem}
              showsVerticalScrollIndicator={false}
              style={{ marginVertical: 10 }}
            />
            <TouchableOpacity 
              style={styles.addAddressBtn}
              onPress={() => {
                setShowAddressModal(false);
                navigation.navigate('Direcciones');
              }}
            >
              <AntDesign name="plus" size={20} color="#FF6B35" />
              <Text style={styles.addAddressText}>Agregar nueva dirección</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#4195e9ff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  scrollContent: { flex: 1 },

  // HERO IMAGE
  heroImageContainer: {
    height: width * 0.9,
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: -60,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroImage: { width: '100%', height: '100%' },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // CARD PRINCIPAL
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 28,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stars: { flexDirection: 'row', marginRight: 8 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#333' },

  productName: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  productPrice: { fontSize: 28, fontWeight: 'bold', color: '#FF6B35', marginBottom: 20 },

  tiendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  tiendaLogo: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  tiendaLabel: { fontSize: 13, color: '#666' },
  tiendaName: { fontSize: 16, fontWeight: '600', color: '#333' },

  descriptionCard: { marginBottom: 20 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  descriptionText: { fontSize: 15, color: '#555', lineHeight: 23 },
  readMoreText: { fontSize: 15, color: '#FF6B35', fontWeight: '600', marginTop: 8 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9f5',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ffe0d6',
  },
  addressInfo: { flex: 1, marginLeft: 12 },
  addressMain: { fontSize: 16, fontWeight: '600', color: '#333' },
  addressChange: { fontSize: 14, color: '#FF6B35', marginTop: 2 },

  // BARRA INFERIOR
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 35,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 20,
  },
  cartBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  cartBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#FF6B35' },
  buyBtn: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnDisabled: { backgroundColor: '#aaa' },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  addressCardModal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  selectedAddressCardModal: {
    backgroundColor: '#fff0e6',
    borderWidth: 2,
    borderColor: '#35bcffff',
  },
  addressIconModal: { marginRight: 14 },
  addressInfoModal: { flex: 1 },
  addressNameModal: { fontSize: 16, fontWeight: '600', color: '#333' },
  addressDetailsModal: { fontSize: 14, color: '#666', marginTop: 2 },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff9f5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffe0d6',
    marginTop: 8,
  },
  addAddressText: { marginLeft: 8, fontSize: 16, color: '#FF6B35', fontWeight: '600' },
});