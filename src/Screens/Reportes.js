import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../database/firebaseConfig.js';

const screenWidth = Dimensions.get('window').width - 32;

// Muestra un BarChart por cada tienda con los productos más vendidos (por cantidad)
export default function ProductChart() {
  const [loading, setLoading] = useState(true);
  const [ventasPorTienda, setVentasPorTienda] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // función que carga los datos (solo para admin). Recibe un array opcional `tiendasPermitidas`
    const cargarDatos = async (tiendasPermitidas = null) => {
      try {
        // Obtener tiendas
        const tiendaSnapshot = await getDocs(collection(db, 'tienda'));
        let tiendasData = tiendaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Si se pasan tiendasPermitidas (IDs), filtrar solo esas tiendas
        if (Array.isArray(tiendasPermitidas) && tiendasPermitidas.length > 0) {
          tiendasData = tiendasData.filter(t => tiendasPermitidas.includes(t.id));
        }
        setTiendas(tiendasData);

        // Obtener ventas
        const ventasSnapshot = await getDocs(collection(db, 'ventas'));
        const ventas = ventasSnapshot.docs.map(doc => doc.data());

        // Agrupar por tienda y por nombre de producto
        const ventasMap = {};
        ventas.forEach(v => {
          const tiendaId = v.tiendaId;
          // Si hay un filtro de tiendas, ignorar ventas de otras tiendas
          if (Array.isArray(tiendasPermitidas) && tiendasPermitidas.length > 0 && !tiendasPermitidas.includes(tiendaId)) return;
          const nombreProd = v.nombreProducto || v.nombre || v.producto || 'Producto';
          const cant = Number(v.cantidad) || 1;
          const precio = v.precio || 0;
          const imagen = v.imagen?.uri || v.imagen;

          if (!ventasMap[tiendaId]) ventasMap[tiendaId] = {};
          if (!ventasMap[tiendaId][nombreProd]) {
            ventasMap[tiendaId][nombreProd] = { cantidad: 0, precio, imagen };
          }
          ventasMap[tiendaId][nombreProd].cantidad += cant;
        });

        // Convertir a array y tomar top 5 por tienda
        const topPorTienda = Object.entries(ventasMap).map(([tiendaId, productos]) => {
          const lista = Object.entries(productos).map(([nombre, data]) => ({ nombre, ...data }));
          const ordenados = lista.sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
          return { tiendaId, productos: ordenados };
        });

        setVentasPorTienda(topPorTienda);
        // Cargar productos para reporte de bajo stock
        try {
          const prodSnap = await getDocs(collection(db, 'productos'));
          let productos = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          // Si hay filtro de tiendas, mantener solo productos de esas tiendas
          if (Array.isArray(tiendasPermitidas) && tiendasPermitidas.length > 0) {
            productos = productos.filter(p => tiendasPermitidas.includes(p.tiendaId || p.tienda));
          }

          // Normalizar stock y ordenar ascendente (menos stock primero)
          const productosConStock = productos.map(p => ({
            id: p.id,
            nombre: p.nombre || p.name || p.nombreProducto || `Producto ${p.id}`,
            stock: Number(p.stock ?? p.Stock ?? 0),
            tiendaId: p.tiendaId || p.tienda || null,
          }));
          productosConStock.sort((a, b) => a.stock - b.stock);
          const topBajos = productosConStock.slice(0, 10);
          setLowStockProducts(topBajos);
        } catch (errProd) {
          console.error('Error cargando productos para bajo stock:', errProd);
        }
      } catch (error) {
        console.error('Error cargando reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Por defecto no permitir hasta comprobar
      if (!user) {
        setIsAdmin(false);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'usuario', user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : null;
        const rol = userData?.rol || '';

        if (rol === 'Administrador') {
          setIsAdmin(true);
          const tiendasDelUsuario = Array.isArray(userData?.tiendas) ? userData.tiendas : [];
          await cargarDatos(tiendasDelUsuario);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verificando rol del usuario:', err);
        setIsAdmin(false);
        setLoading(false);
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const obtenerNombreTienda = (tiendaId) => {
    const t = tiendas.find(x => x.id === tiendaId);
    return t ? t.nombre : (tiendaId || 'Tienda');
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 139, 230, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
    style: { borderRadius: 8 },
  };

  // Preparar un único gráfico: etiquetas "Tienda - Producto" y valores (cantidad)
  const flattenedLabels = [];
  const flattenedData = [];

  // orden: por tienda en el orden de ventasPorTienda y por producto (top N ya calculado)
  ventasPorTienda.forEach(({ tiendaId, productos }) => {
    const nombreTienda = obtenerNombreTienda(tiendaId);
    productos.forEach(p => {
      const labelFull = `${nombreTienda} - ${p.nombre}`;
      // Truncar para que no rompa el eje X; rotación alta para mejorar legibilidad
      const label = labelFull.length > 20 ? labelFull.slice(0, 20) + '...' : labelFull;
      flattenedLabels.push(label);
      flattenedData.push(Number(p.cantidad) || 0);
    });
  });

  const chartDataSingle = {
    labels: flattenedLabels.length ? flattenedLabels : ['Sin datos'],
    datasets: [{ data: flattenedData.length ? flattenedData : [0] }],
  };

  // Preparar datos para gráfico de bajo stock
  const lowLabels = [];
  const lowData = [];
  lowStockProducts.forEach(p => {
    const tiendaNombre = obtenerNombreTienda(p.tiendaId);
    const labelFull = `${tiendaNombre} - ${p.nombre}`;
    const label = labelFull.length > 20 ? labelFull.slice(0, 20) + '...' : labelFull;
    lowLabels.push(label);
    lowData.push(Number(p.stock) || 0);
  });

  const chartDataLow = {
    labels: lowLabels.length ? lowLabels : ['Sin datos'],
    datasets: [{ data: lowData.length ? lowData : [0] }],
  };

  const chartConfigLow = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // rojo
    labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
  };

  // Calculos para superponer una etiqueta dentro de la barra con menor stock (aproximado)
  const lowChartHeight = 257;
  const lowChartWidth = Math.max(screenWidth, lowLabels.length * 55);
  const lowMaxValue = lowData.length ? Math.max(...lowData) : 1;
  const lowMinValue = lowData.length ? Math.min(...lowData) : 0;
  const lowMinIndex = lowData.length ? lowData.indexOf(lowMinValue) : -1;
  const lowInnerHeight = lowChartHeight - 49; // espacio estimado para labels/titles
  const lowBarWidth = lowLabels.length ? (lowChartWidth / lowLabels.length) : 1;
  const lowBarHeightPx = (lowMaxValue > 0 && lowMinValue >= 0) ? (lowMinValue / lowMaxValue) * lowInnerHeight : 0;
  // Badge width dinámico: no mayor a 220, no menor a 110
  const lowBadgeWidth = Math.max(110, Math.min(220, Math.floor(lowBarWidth - 9)));
  // Calcular left centrado respecto a la barra
  const lowBadgeLeft = lowMinIndex >= 0 ? (8 + (lowMinIndex * lowBarWidth) + Math.max(0, (lowBarWidth - lowBadgeWidth) / 2)) : 8;
  // Colocar el badge justo encima de la barra (con un pequeño margen)
  const lowBadgeBottom = 1 + lowBarHeightPx;

  return (
    <ScrollView style={styles.container} >

      {/* Esperando a verificar auth/rol */}
      {!authChecked ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 28 }} />
      ) : !isAdmin ? (
        <View style={{ padding: 20 }}>
          <Text style={[styles.sinProductos, { fontWeight: '600' }]}>Acceso restringido</Text>
          <Text style={styles.sinProductos}>Solo los usuarios con rol Administrador pueden ver este reporte. Por favor inicie sesión con una cuenta de administrador.</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
      ) : flattenedData.length === 0 ? (
        <Text style={styles.sinProductos}>No hay datos de ventas aún.</Text>
      ) : (
        
        <View style={styles.chartCard}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 1, textAlign: 'left' }]}>Tiendas con mas ventas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingHorizontal: 8 }}>
            <BarChart
              data={chartDataSingle}
              width={Math.max(screenWidth, flattenedLabels.length * 45)} // dar más ancho si hay muchas barras
              height={270}
              yAxisLabel=""
              chartConfig={chartConfig}
              verticalLabelRotation={75}
              fromZero
              showValuesOnTopOfBars
              style={{ marginVertical: 8, borderRadius: 8 }}
            />
          </ScrollView>
        </View>
      )}
    
        {/* Gráfico de productos con bajo stock */}
        {isAdmin && !loading && (
          <View style={styles.chartCard}>
            <Text style={[styles.title, { fontSize: 16, marginBottom: 6, textAlign: 'left' }]}>Productos con bajo stock</Text>
            {lowData.length === 0 ? (
              <Text style={styles.sinProductos}>No se encontraron productos con stock registrado.</Text>
            ) : (
              <View style={{ position: 'relative', height: lowChartHeight }}>
                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingHorizontal: 8 }}>
                  <View style={{ width: lowChartWidth }}>
                    <BarChart
                      data={chartDataLow}
                      width={lowChartWidth}
                      height={lowChartHeight}
                      yAxisLabel=""
                      chartConfig={chartConfigLow}
                      verticalLabelRotation={60}
                      fromZero
                      showValuesOnTopOfBars
                      style={{ marginVertical: 8, borderRadius: 8 }}
                    />
                  </View>
                </ScrollView>

                {/* Badge superpuesto dentro/aproximado sobre la barra con menor stock */}
                {lowMinIndex >= 0 && (
                  <View pointerEvents="none" style={{ position: 'absolute', left: lowBadgeLeft, bottom: lowBadgeBottom, width: lowBadgeWidth }}>
                    <View style={{ backgroundColor: 'rgba(192,57,43,0.95)', paddingHorizontal: 8, paddingVertical: 10, borderRadius: 6 }}>
                      <Text numberOfLines={2} ellipsizeMode="tail" style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{`${lowLabels[lowMinIndex]}`}</Text>
                      <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>{`Stock: ${lowMinValue}`}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
           
          </View>
          
        )}
      </ScrollView>
      );
}

      const styles = StyleSheet.create({
        container: {flex: 1, backgroundColor: '#f5f7fb'},
      title: {fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
      chartCard: {backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 16, elevation: 2 , height: 340, marginTop:28 },
      tiendaTitle: {fontSize: 16, fontWeight: '600', marginBottom: 6 },
      sinProductos: {textAlign: 'center', fontSize: 14, color: '#666', paddingVertical: 12 },
});