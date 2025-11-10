import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useCart } from '../Componentes/Carrito';
import { db } from '../database/firebaseConfig';
import { addDoc, collection, doc, runTransaction } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigation = useNavigation();

  // Si carrito vacío, redirige o muestra mensaje
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="shopping-cart" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No hay items en el carrito</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Volver al Carrito</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Función para calcular total
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Mock de direcciones (simulación; sin botón para agregar)
  const [addresses] = useState([
    { id: 1, fullAddress: 'Calle Falsa 123, Ciudad Ejemplo, CP 12345', isDefault: true },
    { id: 2, fullAddress: 'Avenida Siempre Viva 742, Springfield, CP 54321', isDefault: false },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);

  // Estados para pagos (adaptado de PagosClientes)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('credit');
  

  // GUARDAR ORDEN EN FIRESTORE (usando estructura de ejemplo: colección 'órdenes')
  const guardarVenta = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Por favor, selecciona una dirección de envío.');
      return;
    }
    if (!selectedMethod) {
      Alert.alert('Error', 'Por favor, selecciona un método de pago.');
      return;
    }
    if (selectedMethod === 'credit' && (!cardNumber || !cardName || !expiry || !cvv)) {
      Alert.alert('Error', 'Por favor, completa los datos de la tarjeta.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
                Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de pagar');
                return;
            }

    try {
      // Primero: verificar y actualizar stock de todos los productos en una sola transacción
      const productRefs = cartItems.map((item) => doc(db, 'productos', item.id));

      await runTransaction(db, async (transaction) => {
        for (let i = 0; i < cartItems.length; i++) {
          const item = cartItems[i];
          const prodRef = productRefs[i];
          const prodSnap = await transaction.get(prodRef);

          if (!prodSnap.exists()) {
            throw new Error(`Producto no encontrado: ${item.name}`);
          }

          const stock = prodSnap.data().stock ?? 0;
          if (stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name}`);
          }

          // Actualizar stock
          transaction.update(prodRef, { stock: stock - item.quantity });
        }
      });

      // Si llegamos aquí, la transacción de stock fue exitosa. Guardar ventas individuales (histórico) y la orden.
      for (const item of cartItems) {
        await addDoc(collection(db, 'ventas'), {
          metodoPago: selectedMethod,
          nombreProducto: item.name,
          precio: item.price,
          cantidad: item.quantity,
          tiendaId: item.tiendaId,
          fecha: new Date(),
          imagen: item.image || null,
        });
      }

      // Preparar array de productos basado en estructura de ejemplo
      const productosArray = cartItems.map((item) => ({
        cantidad: item.quantity.toString(),
        idProducto: item.id, // Asumiendo que item.id es el idProducto
        precioUnitario: item.price.toString(),
        tiendaId: item.tiendaId || 'xSXGtL2rPnjK74FK', // Usa el del ejemplo o del item si existe
      }));

      await addDoc(collection(db, 'órdenes'), {
        direccionEnvio: selectedAddress.fullAddress,
        estado: 'Procesando',
        fechaActualizacion: new Date(),
        fechaCreacion: new Date(),
        metodoEnvio: 'Por seleccionar',
        notas: 'Al lado de una casa amarilla',
        productos: productosArray,
        total: getTotalPrice().toString(),
      });

      clearCart();
      Alert.alert('Tu compra se ha procesado con éxito');
      navigation.navigate('MyTabsCliente'); // O ajusta a tu navegación
    } catch (error) {
     
      // Mensajes más específicos para casos comunes
      if (error.message && error.message.toLowerCase().includes('stock insuficiente')) {
        Alert.alert('Stock insuficiente', error.message);
        return;
      }

      Alert.alert('Error', 'No se pudo guardar la orden. Verifica tu conexión.');
    }
  };

  // Renderizar item en resumen del pedido
  const renderOrderItem = ({ item }) => {
    const imageSource = typeof item.image === 'string' 
      ? { uri: item.image } 
      : item.image || require('../../IMAGENES/ows.png');
    
    return (
      <View style={styles.orderItem}>
        <Image source={imageSource} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
          <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          <Text style={styles.orderItemQty}>Cant: {item.quantity}</Text>
        </View>
      </View>
    );
  };

  // Renderizar selector de direcciones
  const renderAddressOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.addressOption, selectedAddress.id === item.id && styles.selectedAddress]}
      onPress={() => setSelectedAddress(item)}
    >
      <Text style={styles.addressText}>{item.fullAddress}</Text>
      {selectedAddress.id === item.id && <AntDesign name="checkcircle" size={20} color="#007bff" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <Text style={styles.subheader}>Revisa tu pedido</Text>
      </View>

      {/* Sección: Resumen del Pedido */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          scrollEnabled={false}
          style={styles.orderList}
        />
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal ({getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'}):</Text>
          <Text style={styles.subtotalPrice}>${getTotalPrice().toFixed(2)}</Text>
        </View>
      </View>

      {/* Sección: Dirección de Envío (sin botón agregar) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección de Envío</Text>
        <Text style={styles.selectedAddressText}>
          Seleccionada: {selectedAddress.fullAddress}
        </Text>
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAddressOption}
          scrollEnabled={false}
          style={styles.addressList}
        />
      </View>

      {/* Sección: Método de Pago (integrado de PagosClientes, adaptado) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de Pago</Text>
        <View style={styles.methods}>
          <TouchableOpacity 
            onPress={() => setSelectedMethod('credit')} 
            style={selectedMethod === 'credit' ? styles.selected : styles.method}
          >
            <FontAwesome name="cc-visa" size={24} color="black" />
            <Text>Tarjeta de crédito</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedMethod('gpay')} 
            style={selectedMethod === 'gpay' ? styles.selected : styles.method}
          >
            <FontAwesome6 name="google-pay" size={24} color="black" />
            <Text>Google Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedMethod('paypal')} 
            style={selectedMethod === 'paypal' ? styles.selected : styles.method}
          >
            <Fontisto name="paypal" size={24} color="black" />
            <Text>PayPal</Text>
          </TouchableOpacity>
        </View>

        {selectedMethod === 'gpay' && (
          <View style={styles.gpaySection}>
            <Image
              source={{ uri: 'https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fthvnext.bing.com%2Fth%2Fid%2FOIP.rlMfpFS85-TDG7yEstZzHwHaHa%3Fcb%3D12%26pid%3DApi&sp=1760822742T09b67c29ba91971fc806d7a38f546938797c1f11cbb99e745e4d3dd1ff34e0ce' }}
              style={styles.icon}
            />
            <Text style={styles.texto}>
              Serás redirigido a Google Pay para completar tu pago de forma segura.
            </Text>
            <Text style={styles.total}>Total a pagar ${getTotalPrice().toFixed(2)}</Text>
            <TouchableOpacity style={styles.gpayButton} onPress={guardarVenta}>
              <Text style={styles.gpayButtonText}>Continuar con Google Pay</Text>
            </TouchableOpacity>
            <Text style={styles.securityText}>
              🔒 Pago cifrado y protegido por Google
            </Text>
          </View>
        )}

        {selectedMethod === 'paypal' && (
          <View style={styles.paypalSection}>
            <Text style={styles.texto}>Serás redirigido a PayPal para completar tu pago.</Text>
            <Text style={styles.total}>Total a pagar ${getTotalPrice().toFixed(2)}</Text>
            <TouchableOpacity style={styles.paypalButton} onPress={guardarVenta}>
              <Text style={styles.paypalButtonText}>Pagar con PayPal</Text>
            </TouchableOpacity>
            <Text style={styles.securityText}>🔒 Pago seguro con PayPal</Text>
          </View>
        )}

        {selectedMethod === 'credit' && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Como aparece en la tarjeta"
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Expira (MM/AA)"
                value={expiry}
                onChangeText={setExpiry}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="CVV"
                keyboardType="numeric"
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
            <View style={styles.pagar}>
              <Text style={styles.total}>Total ${getTotalPrice().toFixed(2)}</Text>
              <TouchableOpacity style={styles.payButton} onPress={guardarVenta}>
                <Text style={styles.payText}>Pagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Total final (visible siempre, pero botón de pago arriba) */}
      {!['credit', 'gpay', 'paypal'].includes(selectedMethod) && (
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderList: {
    maxHeight: 200,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#666',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subtotalLabel: {
    fontSize: 16,
    color: '#333',
  },
  subtotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  addressList: {
    maxHeight: 150,
  },
  addressOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAddress: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  // Estilos de pagos (de PagosClientes, adaptados)
  methods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  method: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
  },
  selected: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
  },
  gpaySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paypalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  total: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gpayButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  gpayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paypalButton: {
    backgroundColor: '#003087',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  paypalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  securityText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 8,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  pagar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: 130,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Resto de estilos para total (si no hay método seleccionado)
  totalSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default Checkout;