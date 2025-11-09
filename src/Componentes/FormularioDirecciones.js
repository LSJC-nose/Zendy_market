import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { db, auth } from '../database/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function FormularioDirecciones({ onSave = () => { }, saveToFirestore = true }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [referencias, setReferencias] = useState('');
  const [tipoCasa, setTipoCasa] = useState(true); // true = Casa, false = Trabajo
  const [guardar, setGuardar] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del destinatario');
      return false;
    }
    if (!telefono.trim() || telefono.trim().length < 7) {
      Alert.alert('Teléfono inválido', 'Ingresa un teléfono válido');
      return false;
    }
    if (!calle.trim()) {
      Alert.alert('Dirección requerida', 'Ingresa la calle y número');
      return false;
    }
    if (!ciudad.trim()) {
      Alert.alert('Ciudad requerida', 'Ingresa la ciudad');
      return false;
    }
    if (!codigoPostal.trim()) {
      Alert.alert('Código postal', 'Ingresa el código postal');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validar()) return;

    const direccion = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      calle: calle.trim(),
      colonia: colonia.trim(),
      ciudad: ciudad.trim(),
      estado: estado.trim(),
      codigoPostal: codigoPostal.trim(),
      referencias: referencias.trim(),
      tipo: tipoCasa ? 'Trabajo' : 'Casa',
      creadaEn: new Date(),
    };

    // Llamada local para que la pantalla de pago pueda usar la dirección
    onSave(direccion);
    navigation.navigate('PagosClientes');

    if (!saveToFirestore) return;

    // Guardar en Firestore si el usuario está autenticado
    try {
      setLoading(true);
      const user = auth.currentUser;
      const payload = { ...direccion };
      if (user && user.uid) {
        payload.userId = user.uid;
      }
      if (guardar) {
        await addDoc(collection(db, 'direcciones'), payload);
        Alert.alert('Guardado', 'La dirección se guardó correctamente');
      }
    } catch (error) {
      console.error('Error guardando dirección:', error);
      Alert.alert('Error', 'No se pudo guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Agregar dirección</Text>

      <Text style={styles.label}>Nombre destinatario *</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre completo" />

      <Text style={styles.label}>Teléfono *</Text>
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="8888-8888" keyboardType="phone-pad" />

      <Text style={styles.label}>Calle y número *</Text>
      <TextInput style={styles.input} value={calle} onChangeText={setCalle} placeholder="Direccion de la calle" />

      <Text style={styles.label}>Colonia / Barrio</Text>
      <TextInput style={styles.input} value={colonia} onChangeText={setColonia} placeholder="Colonia" />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Ciudad *</Text>
          <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} placeholder="Ciudad" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Estado / Provincia</Text>
          <TextInput style={styles.input} value={estado} onChangeText={setEstado} placeholder="Estado" />
        </View>
      </View>

      <Text style={styles.label}>Código postal *</Text>
      <TextInput style={styles.input} value={codigoPostal} onChangeText={setCodigoPostal} placeholder="CP" keyboardType="numeric" />

      <Text style={styles.label}>Referencias</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={referencias} onChangeText={setReferencias} placeholder="P. ej. junto al parque" multiline />

      <View style={styles.rowMiddle}>
        <Text style={styles.label}>Tipo: {tipoCasa ? 'Casa' : 'Trabajo'}</Text>
        <View style={styles.switchRow}>
          <Text>Casa</Text>
          <Switch value={tipoCasa} onValueChange={setTipoCasa} />
          <Text style={{ marginLeft: 8 }}>Trabajo</Text>
        </View>
      </View>

      <View style={styles.rowMiddle}>
        <Text style={styles.label}>Guardar esta dirección</Text>
        <Switch value={guardar} onValueChange={setGuardar} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Usar y guardar dirección</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.useOnlyButton} onPress={() => onSave({ nombre, telefono, calle, colonia, ciudad, estado, codigoPostal, referencias, tipo: tipoCasa ? 'Casa' : 'Trabajo' })}>
        <Text style={styles.useOnlyText}>Usar solo para este pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  useOnlyButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  useOnlyText: {
    color: '#007bff',
    fontWeight: '600',
  },
});