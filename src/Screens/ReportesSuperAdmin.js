import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
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
        const top = entries.slice(0, 5); // top 5 tiendas

        // Colores predefinidos (si hacen falta se reutilizan)
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#9C27B0', '#FF7043', '#4DB6AC', '#9575CD'
        ];

        const totalProducts = entries.reduce((sum, entry) => sum + entry.count, 0);

        const dataForChart = top.map((e, idx) => {
          const tienda = tiendasMap[e.tiendaId];
          const name = tienda ? (tienda.nombre || tienda.nombreTienda || `Tienda ${e.tiendaId}`) : `Tienda ${e.tiendaId}`;
          return {
            name: name,
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
      <Text style={styles.title}>Top 5 - Tiendas con más productos</Text>
      {/* Pie custom con porcentajes dentro de las porciones (usa react-native-svg) */}
      <View style={{ width: screenWidth, height: 320 }}>
        <Svg width={screenWidth} height={320}>
          <G>
            {(() => {
              const w = screenWidth;
              const h = 320;
              const cx = w / 2;
              const cy = h / 2;
              const r = Math.min(w, h) * 0.45; // radio aumentado
              const total = chartData.reduce((s, d) => s + (d.population || 0), 0);
              let startAngle = -Math.PI / 2; // iniciar en la parte superior

              return chartData.map((d, i) => {
                const value = d.population || 0;
                const angle = total > 0 ? (value / total) * Math.PI * 2 : 0;
                const endAngle = startAngle + angle;

                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);

                const largeArc = angle > Math.PI ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                // posición para etiqueta (porcentaje y nombre) dentro de la porción
                const midAngle = startAngle + angle / 2;
                const labelR = r * 0.65;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);

                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                const nameShort = (d.name || '').length > 14 ? (d.name || '').substring(0, 12) + '…' : (d.name || '');

                // decidir color de texto (claro u oscuro) según la porción
                const hex = d.color || '#000';
                const c = hex.replace('#', '');
                const rCol = parseInt(c.substring(0, 2), 16);
                const gCol = parseInt(c.substring(2, 4), 16);
                const bCol = parseInt(c.substring(4, 6), 16);
                const luminance = (0.299 * rCol + 0.587 * gCol + 0.114 * bCol) / 255;
                const textColor = luminance > 0.6 ? '#000' : '#fff';

                startAngle = endAngle; // avanzar para próxima

                return (
                  <G key={`slice-${i}`}>
                    <Path d={path} fill={d.color} />
                    <SvgText
                      x={lx}
                      y={ly - 8}
                      fill={textColor}
                      fontSize={13}
                      fontWeight="700"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {`${percentage}%`}
                    </SvgText>
                    <SvgText
                      x={lx}
                      y={ly + 10}
                      fill={textColor}
                      fontSize={11}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {nameShort}
                    </SvgText>
                  </G>
                );
              });
            })()}
          </G>
        </Svg>
        {/* Leyenda compacta debajo del gráfico */}
        
        <View style={styles.legendContainer}>
          {chartData.map((d, i) => {
            const total = chartData.reduce((s, dd) => s + (dd.population || 0), 0);
            const pct = total > 0 ? ((d.population / total) * 100).toFixed(1) : '0.0';
            return (
              <View key={`legend-${i}`} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: d.color }]} />
                <Text style={styles.legendText}>{`${d.name} (${pct}%)`}</Text>
              </View>
            );
          })}
        </View>
      </View>
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
  ,
  legendContainer: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333'
  },
});