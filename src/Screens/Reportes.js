import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../database/firebaseConfig.js';

const ProductChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const setupListener = async () => {
      try {
        // Obtener usuario actual
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setChartData({ labels: [], datasets: [{ data: [] }] });
          setLoading(false);
          return;
        }

        // Buscar documento en 'usuario' por correo para obtener tiendas asignadas
        const usuarioSnap = await getDocs(
          query(collection(db, 'usuario'), where('correo', '==', currentUser.email))
        );
        let tiendasAsignadas = [];
        usuarioSnap.forEach((d) => {
          const data = d.data();
          if (Array.isArray(data.tiendas)) tiendasAsignadas = data.tiendas;
        });

        // Si no hay tiendas asignadas, no hay productos que mostrar
        if (!Array.isArray(tiendasAsignadas) || tiendasAsignadas.length === 0) {
          setChartData({ labels: [], datasets: [{ data: [] }] });
          setLoading(false);
          return;
        }

        // Función para procesar productos y actualizar gráficos
        const procesarProductos = (querySnapshot) => {
          const acumulados = {};

          querySnapshot.forEach((doc) => {
            const data = doc.data() || {};
            const tiendaId = data.tiendaId;

            // Solo procesar productos que pertenezcan a las tiendas del administrador
            if (tiendaId && tiendasAsignadas.includes(tiendaId)) {
              const nombre = data.nombre || 'Sin nombre';
              const vendidos = Number(
                data.vendidos ?? data.ventas ?? data.cantidadVendida ?? 0
              );
              const stock = Number(data.stock ?? 0);

              // Usar vendidos si existe; si no, usar stock como métrica de referencia (>0)
              const valor = vendidos > 0 ? vendidos : stock > 0 ? stock : 0;
              if (valor > 0) {
                acumulados[nombre] = (acumulados[nombre] || 0) + valor;
              }
            }
          });

          const sorted = Object.entries(acumulados)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5

          if (sorted.length === 0) {
            setChartData({ labels: [], datasets: [{ data: [] }] });
          } else {
            setChartData({
              labels: sorted.map(([nombre]) => nombre),
              datasets: [{ data: sorted.map(([_, valor]) => valor) }],
            });
          }
          setLoading(false);
        };

        // Crear listener en tiempo real para escuchar cambios en productos
        unsubscribeRef.current = onSnapshot(
          collection(db, 'productos'),
          (querySnapshot) => {
            procesarProductos(querySnapshot);
          },
          (error) => {
            console.error('Error en listener de productos:', error);
            setChartData({ labels: [], datasets: [{ data: [] }] });
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error obteniendo productos:', error);
        setChartData({ labels: [], datasets: [{ data: [] }] });
        setLoading(false);
      }
    };

    setupListener();

    // Limpiar listener cuando el componente se desmonte
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: 'center' }}>Cargando...</Text>
      </View>
    );
  }

  if (chartData.labels.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>No hay datos que mostrar</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, textAlign: 'center', marginVertical: 10 }}>
        Top 5 Electrónica Vendida
      </Text>
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={320}
        yAxisLabel=""
        fromZero
        showValuesOnTopOfBars
        verticalLabelRotation={30}
        chartConfig={{
          backgroundColor: '#40ca69ff',
          backgroundGradientFrom: '#c4dbdfff',
          backgroundGradientTo: '#c5e3e7ff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />

      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={320}
        yAxisLabel=""
        fromZero
        showValuesOnTopOfBars
        verticalLabelRotation={30}
        chartConfig={{
          backgroundColor: '#40ca69ff',
          backgroundGradientFrom: '#c4dbdfff',
          backgroundGradientTo: '#c5e3e7ff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </ScrollView>
  );
};

export default ProductChart;
// ...existing code...