import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebaseConfig.js';

const screenWidth = Dimensions.get('window').width - 32;

// Muestra un gráfico de pastel con las tiendas que tienen más productos (conteo de productos por tienda).
// Nota: Esto usa la colección 'productos' y la colección 'tienda' para obtener nombres.
export default function ReporteSuperAdmin() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let mounted = true;

    const cargarDatos = async () => {
      try {
        // Obtener todos los productos
        const prodSnap = await getDocs(collection(db, 'productos'));
        const productos = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Contar por tiendaId
        const counts = {};
        productos.forEach(p => {
          const tiendaId = p.tiendaId || p.tienda || 'sin_tienda';
          counts[tiendaId] = (counts[tiendaId] || 0) + 1;
        });

        // Obtener datos de tiendas para resolver nombres
        const tiendaSnap = await getDocs(collection(db, 'tienda'));
        const tiendas = tiendaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const tiendasMap = {};
        tiendas.forEach(t => { tiendasMap[t.id] = t; });

        // Transformar a array usable por PieChart
        const entries = Object.entries(counts).map(([tiendaId, count]) => ({ tiendaId, count }));
        // Ordenar desc y tomar top 6
        entries.sort((a, b) => b.count - a.count);
        const top = entries.slice(0, 6);

        // Colores predefinidos (si hacen falta se reutilizan)
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#9C27B0', '#FF7043', '#4DB6AC', '#9575CD'
        ];

        const dataForChart = top.map((e, idx) => {
          const tienda = tiendasMap[e.tiendaId];
          const name = tienda ? (tienda.nombre || tienda.nombreTienda || `Tienda ${e.tiendaId}`) : `Tienda ${e.tiendaId}`;
          return {
            name,
            population: e.count,
            color: colors[idx % colors.length],
            legendFontColor: '#333',
            legendFontSize: 13,
          };
        });

        if (mounted) {
          setChartData(dataForChart);
        }
      } catch (error) {
        console.error('Error cargando datos para reportes:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargarDatos();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 8 }}>Cargando reportes...</Text>
      </View>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No hay datos suficientes para mostrar el reporte.</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tiendas con más productos</Text>
      <PieChart
        data={chartData}
        width={screenWidth}
        height={260}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});