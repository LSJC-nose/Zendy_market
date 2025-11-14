import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../database/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function MetodoPagoAdmin() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMetodo = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.uid) {
          setSelectedMethod(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'usuario', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setSelectedMethod(data.metodoPago || null);
        } else {
          setSelectedMethod(null);
        }
      } catch (error) {
        console.error('Error cargando método de pago:', error);
        Alert.alert('Error', 'No se pudo cargar el método de pago');
      } finally {
        setLoading(false);
      }
    };

    cargarMetodo();
  }, []);

  const guardarMetodo = async (method) => {
    try {
      const user = auth.currentUser;
      if (!user || !user.uid) {
        Alert.alert('No autenticado', 'Inicia sesión para guardar el método de pago');
        return;
      }
      const userRef = doc(db, 'usuario', user.uid);
      await updateDoc(userRef, { metodoPago: method });
      setSelectedMethod(method);
      Alert.alert('Guardado', 'Método de pago actualizado');
    } catch (error) {
      console.error('Error guardando método:', error);
      Alert.alert('Error', 'No se pudo guardar el método de pago');
    }
  };

  const methods = [
    { key: 'credit', label: 'Tarjeta de crédito' },
    { key: 'gpay', label: 'Google Pay' },
    { key: 'paypal', label: 'PayPal' },
    { key: 'efectivo', label: 'Efectivo' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Método de Pago (Administrador)</Text>
      {!loading && (
        <Text style={styles.current}>
          Método actual: {selectedMethod ? methods.find(m => m.key === selectedMethod)?.label || selectedMethod : 'Por seleccionar'}
        </Text>
      )}

      <View style={styles.methods}>
        {methods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={m.key === selectedMethod ? styles.selected : styles.method}
            onPress={() => guardarMetodo(m.key)}
          >
            <Text style={styles.methodText}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  current: { marginBottom: 16, color: '#333' },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  method: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: '#eaf4ff',
    marginRight: 8,
    marginBottom: 8,
  },
  methodText: { color: '#111' },
});