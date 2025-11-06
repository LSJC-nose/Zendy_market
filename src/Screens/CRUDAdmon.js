import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  Alert,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native'

import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../database/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function CRUDAdmon() {
  const navigation = useNavigation();
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');

  useEffect(() => {
    const obtenerNombreUsuario = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
          const q = query(
            collection(db, 'usuario'),
            where('correo', '==', currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre) {
              setNombreUsuario(data.nombre);
            }
          });
        }
      } catch (error) {
        console.error('Error al obtener nombre de usuario:', error);
      }
    };

    obtenerNombreUsuario();
  }, []);

  const stats = [
    { id: '1', icon: '🛒', label: 'Órdenes', value: 12 },
    { id: '2', icon: '💸', label: 'Gastado', value: '$450' },
    { id: '3', icon: '⭐', label: 'Categorías', value: 3 },
  ]

  // ← Cambiado: Tercer quick a "Órdenes" (icon 📦, key 'orders')
  const quick = [
    { id: 'q1', icon: '🛍️', label: 'Mis Órdenes', key: 'orders' },
    { id: 'q2', icon: '💖', label: 'Favoritos', key: 'favorites' },
    { id: 'q3', icon: '📦', label: 'Órdenes', key: 'orders' },  // ← Nuevo: Órdenes para admin
    { id: 'q4', icon: '💳', label: 'Métodos de Pago', key: 'payments' },
  ]

  const recent = [
    { id: 'r1', title: 'Pedido #452 - Entregado', subtitle: 'Hoy · 09:12' },
    { id: 'r2', title: 'Nuevo producto: Camisa X', subtitle: 'Ayer · 18:03' },
    { id: 'r3', title: 'Usuario registrado', subtitle: 'Ayer · 11:45' },
  ]

  // ← Actualizado: Navega a 'GestionÓrdenes' si key 'orders'
  const onQuick = (k) => {
    console.log('Ir a', k);
    if (k === 'orders') {
      navigation.navigate('GestionÓrdenes');
    }
    // ← Agrega más navegación según necesites (e.g., if k === 'favorites' ...)
  }

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2fb26b" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greet}>¡Hola, {nombreUsuario}! 👋</Text>
          <Text style={styles.welcome}>Bienvenido a ZendyMarket</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Tu Actividad</Text>
          <View style={styles.statsRow}>
            {stats.map(s => (
              <View key={s.id} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickGrid}>
            {quick.map(q => (
              <TouchableOpacity
                key={q.id}
                style={styles.quickCard}
                activeOpacity={0.8}
                onPress={() => onQuick(q.key)}
              >
                <View style={styles.quickIconWrap}>
                  <Text style={styles.quickIcon}>{q.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
          <FlatList
            data={recent}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <View>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentSub}>{item.subtitle}</Text>
                </View>
                <TouchableOpacity style={styles.recentBtn}>
                  <Text style={styles.recentBtnText}>Ver</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f4f6' },
  container: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#26cdd3ff',
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 12,
  },
  greet: { color: '#fff', fontSize: 26, fontWeight: '700' },
  welcome: { color: '#e9f7ee', fontSize: 14, marginTop: 6 },

  cardSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#213a5a',
    fontWeight: '700',
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0b2545' },
  statLabel: { fontSize: 12, color: '#6c7a89', marginTop: 4 },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1fbf3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickIcon: { fontSize: 24 },
  quickLabel: { fontSize: 14, color: '#213a5a', fontWeight: '600', textAlign: 'center' },

  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  recentTitle: { fontSize: 14, fontWeight: '600', color: '#142b44' },
  recentSub: { fontSize: 12, color: '#7b8a98', marginTop: 4 },

  recentBtn: {
    backgroundColor: '#0b74ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  recentBtnText: { color: '#fff', fontWeight: '600' },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: { color: '#fff', fontWeight: '600' },
});