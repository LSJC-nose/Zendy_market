import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';  // ← Instala si no: expo install @react-native-picker/picker
import { db, auth } from '../database/firebaseConfig.js';
import { collection, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function GestionÓrdenes() {
  const navigation = useNavigation();
  const [órdenes, setÓrdenes] = useState([]);  // ← Lista de órdenes
  const [tiendasUsuario, setTiendasUsuario] = useState([]); // tiendas del admin autenticado
  const [loading, setLoading] = useState(true);  // ← Loading
  const [showModal, setShowModal] = useState(false);  // ← Modal para update
  const [selectedOrder, setSelectedOrder] = useState(null);  // ← Orden seleccionada
  const [nuevoEstado, setNuevoEstado] = useState('');  // ← Estado nuevo
  const [nuevoMétodoEnvio, setNuevoMétodoEnvio] = useState('');  // ← Envío nuevo

  // ← Cargar órdenes en tiempo real (onSnapshot para updates live)
  useEffect(() => {
    let unsubscribe = null;

    const cargarOrdenesFiltradas = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser?.uid) {
          setÓrdenes([]);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'usuario', currentUser.uid));
        if (!userDoc.exists() || userDoc.data().rol !== 'Administrador') {
          // Si no es administrador, no mostramos órdenes aquí
          setÓrdenes([]);
          setLoading(false);
          return;
        }

        const tiendas = userDoc.data().tiendas || [];
        setTiendasUsuario(tiendas);
        if (tiendasUsuario.length === 0) {
          setÓrdenes([]);
          setLoading(false);
          return;
        }

        unsubscribe = onSnapshot(collection(db, 'órdenes'), (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          // Filtrar sólo órdenes que contienen productos de las tiendas del admin
          const filtradas = data.filter(order => {
            const productos = order.productos || [];
            return productos.some(p => p.tiendaId && tiendas.includes(p.tiendaId));
          });

          setÓrdenes(filtradas);
          setLoading(false);
        }, (error) => {
          console.error('Error al cargar órdenes:', error);
          Alert.alert('Error', 'No se pudieron cargar las órdenes.');
          setÓrdenes([]);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error al cargar órdenes filtradas:', error);
        Alert.alert('Error', 'No se pudieron cargar las órdenes.');
        setÓrdenes([]);
        setLoading(false);
      }
    };

    cargarOrdenesFiltradas();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ← Abrir modal para editar orden
  const abrirEditar = (order) => {
    setSelectedOrder(order);
    setNuevoEstado(order.estado || 'Procesando');
    setNuevoMétodoEnvio(order.metodoEnvio || 'Por seleccionar');
    setShowModal(true);
  };

  // ← Actualizar orden
  const actualizarOrden = async () => {
    if (!nuevoEstado.trim() || !nuevoMétodoEnvio.trim()) {
      Alert.alert('Error', 'Estado y método de envío son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      // ← Corregido: usar updateDoc en lugar de addDoc para actualizar doc existente
      await updateDoc(doc(db, 'órdenes', selectedOrder.id), {
        estado: nuevoEstado,
        metodoEnvio: nuevoMétodoEnvio,
        fechaActualizacion: new Date(),  // ← Sin tilde para coincidir con DB
      });

      setShowModal(false);
      setSelectedOrder(null);
      Alert.alert('Éxito', 'Orden actualizada correctamente.');
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar la orden.');
    } finally {
      setLoading(false);
    }
  };

  // ← Render item para FlatList (card de orden)
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => abrirEditar(item)}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}># {item.id.substring(0, 8)}...</Text>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          {item.estado || 'Procesando'}
        </Text>
      </View>
      {/* ← Removido userId ya que no existe en el esquema de DB */}
      {/* Mostrar sólo los productos pertenecientes a las tiendas del admin y su subtotal */}
      {(() => {
        const productos = item.productos || [];
        const misProductos = productos.filter(p => p.tiendaId && tiendasUsuario.includes(p.tiendaId));
        const subtotal = misProductos.reduce((s, p) => {
          const precio = parseFloat(p.precioUnitario ?? p.precio ?? 0) || 0;
          const cantidad = parseFloat(p.cantidad ?? p.quantity ?? 0) || 0;
          return s + (precio * cantidad);
        }, 0);

        return (
          <>
            <Text style={styles.orderTotal}>Tu parte: ${subtotal.toFixed(2)}</Text>
            <Text style={styles.orderEnvio}>Envío: {item.metodoEnvio || 'Por seleccionar'}</Text>
            <Text style={styles.orderSubNote}>Orden total: ${parseFloat(item.total || 0).toFixed(2)}</Text>
            <Text style={styles.orderDate}>Fecha: {item.fechaCreacion?.toDate().toLocaleDateString('es-ES') || 'Reciente'}</Text>
          </>
        );
      })()}
    </TouchableOpacity>
  );

  // ← Función auxiliar para color de badge por estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Procesando': return '#FFC107';
      case 'Enviado': return '#2196F3';
      case 'Entregado': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Órdenes</Text>
      <FlatList
        data={órdenes}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* ← Modal para editar estado/envío */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Actualizar Orden #{selectedOrder?.id?.substring(0, 8)}...</Text>
            <Text style={styles.modalLabel}>Estado:</Text>
            <Picker
              selectedValue={nuevoEstado}
              onValueChange={setNuevoEstado}
              style={styles.picker}
            >
              <Picker.Item label="Procesando" value="Procesando" />
              <Picker.Item label="Enviado" value="Enviado" />
              <Picker.Item label="Entregado" value="Entregado" />
            </Picker>
            <Text style={styles.modalLabel}>Método de Envío:</Text>
            <TextInput
              style={styles.input}
              value={nuevoMétodoEnvio}
              onChangeText={setNuevoMétodoEnvio}
              placeholder="Ej. Mandaditos"
            />
            <TouchableOpacity style={styles.modalButton} onPress={actualizarOrden} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Actualizar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  orderEnvio: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // ← Modal estilos (simple, centrado)
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
});