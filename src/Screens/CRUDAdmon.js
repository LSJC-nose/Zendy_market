import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../database/firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';

export default function CRUDAdmon() {
  const navigation = useNavigation();
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [stats, setStats] = useState([
    { id: '1', icon: '🛒', label: 'Órdenes', value: 0 },
    { id: '2', icon: '💸', label: 'Ganancias', value: '$0' },
    { id: '3', icon: '📉', label: 'Pérdidas Stock', value: 0 },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar nombre del usuario
  useEffect(() => {
    const obtenerNombreUsuario = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid) {
          const userDoc = await getDoc(doc(db, 'usuario', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setNombreUsuario(data.nombre || 'Administrador');
          }
        }
      } catch (error) {
        console.error('Error al obtener nombre:', error);
      }
    };
    obtenerNombreUsuario();
  }, []);

  // ESTADÍSTICAS EN TIEMPO REAL POR USUARIO (solo sus tiendas)
  useEffect(() => {
    let unsubVentas, unsubProductos, unsubOrdenes;

    const cargarStats = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        setLoadingStats(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'usuario', currentUser.uid));
        if (!userDoc.exists() || userDoc.data().rol !== 'Administrador') {
          setStats(prev => [
            { ...prev[0], value: 0 },
            { ...prev[1], value: '$0.00' },
            { ...prev[2], value: 0 },
          ]);
          setLoadingStats(false);
          return;
        }

        const tiendasUsuario = userDoc.data().tiendas || [];
        if (tiendasUsuario.length === 0) {
          setStats(prev => [
            { ...prev[0], value: 0 },
            { ...prev[1], value: '$0.00' },
            { ...prev[2], value: 0 },
          ]);
          setLoadingStats(false);
          return;
        }

        // 1. VENTAS (ganancias reales)
        const qVentas = query(
          collection(db, 'ventas'),
          where('tiendaId', 'in', tiendasUsuario)
        );

        unsubVentas = onSnapshot(qVentas, (snapshot) => {
          const ventas = snapshot.docs.map(d => d.data());
          // Calcular ganancias netas considerando precioCompra cuando exista
          const ganancias = ventas.reduce((sum, v) => {
            const precioVenta = parseFloat(v.precio) || 0;
            const precioCompra = parseFloat(v.precioCompra) || 0;
            const cantidad = parseFloat(v.cantidad) || 0;
            return sum + ((precioVenta - precioCompra) * cantidad);
          }, 0);

          setStats(prev => [
            prev[0],
            { ...prev[1], value: `C$${ganancias.toFixed(2)}` }, // En córdobas
            prev[2],
          ]);
        });

        // 2. PRODUCTOS SIN STOCK
        const qSinStock = query(
          collection(db, 'productos'),
          where('tiendaId', 'in', tiendasUsuario),
          where('stock', '<=', 0)
        );

        unsubProductos = onSnapshot(qSinStock, (snapshot) => {
          setStats(prev => [
            prev[0],
            prev[1],
            { ...prev[2], value: snapshot.size },
          ]);
        });

        // 3. ÓRDENES (que tienen productos de tus tiendas)
        unsubOrdenes = onSnapshot(collection(db, 'órdenes'), (snapshot) => {
          let ordenesTotales = 0;
          snapshot.docs.forEach(doc => {
            const productos = doc.data().productos || [];
            const tieneMiTienda = productos.some(p =>
              p.tiendaId && tiendasUsuario.includes(p.tiendaId)
            );
            if (tieneMiTienda) ordenesTotales++;
          });

          setStats(prev => [
            { ...prev[0], value: ordenesTotales },
            prev[1],
            prev[2],
          ]);
          setLoadingStats(false);
        });

      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        Alert.alert('Error', 'No se pudieron cargar tus datos');
        setLoadingStats(false);
      }
    };

    cargarStats();

    return () => {
      unsubVentas?.();
      unsubProductos?.();
      unsubOrdenes?.();
    };
  }, []);

  const quick = [
    { id: 'q1', icon: '🛍️', label: 'Mis Órdenes', key: 'orders' },
    { id: 'q2', icon: '💖', label: 'Favoritos', key: 'favorites' },
    { id: 'q3', icon: '📦', label: 'Gestión Órdenes', key: 'orders' },
    { id: 'q4', icon: '💳', label: 'Métodos de Pago', key: 'payments' },
  ];

  const recent = [
    { id: 'r1', title: 'Nueva venta en tu tienda', subtitle: 'Hace 3 min' },
    { id: 'r2', title: 'Producto agotado', subtitle: 'Hace 1 hora' },
    { id: 'r3', title: 'Orden entregada', subtitle: 'Hoy · 10:45' },
  ];

  const onQuick = (k) => {
    if (k === 'orders') {
      navigation.navigate('GestionÓrdenes');
    } else if (k === 'favorites') {
       navigation.navigate('MetodoPagoAdmin');
    } else if (k === 'favorites') {
      navigation.navigate('Favoritos');
    } else if (k === 'payments') {
      navigation.navigate('MetodoPagoAdmin');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
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
          <Text style={styles.greet}>¡Hola, {nombreUsuario}! </Text>
          <Text style={styles.welcome}>ZendyMarket Nicaragua</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Tu Actividad</Text>
          {loadingStats ? (
            <View style={styles.loadingStats}>
              <ActivityIndicator size="small" color="#007bff" />
              <Text style={styles.loadingText}>Cargando tus datos...</Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              {stats.map(s => (
                <View key={s.id} style={styles.statCard}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}
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
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
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
  container: { paddingBottom: 30 },
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
  cardSection: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    color: '#213a5a',
    fontWeight: '700',
    marginBottom: 10,
  },
  loadingStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  statIcon: { fontSize: 26, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0b2545' },
  statLabel: { fontSize: 12, color: '#6c7a89', marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 4,
  },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1fbf3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: 14, color: '#213a5a', fontWeight: '600', textAlign: 'center' },
  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  recentTitle: { fontSize: 14, fontWeight: '600', color: '#142b44' },
  recentSub: { fontSize: 12, color: '#7b8a98', marginTop: 4 },
  recentBtn: {
    backgroundColor: '#0b74ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  recentBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    elevation: 3,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});