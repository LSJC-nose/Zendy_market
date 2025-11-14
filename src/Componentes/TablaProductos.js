import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BotonEliminarProducto from '../Componentes/BotonEliminarProducto';

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
    const productosList = Array.isArray(productos) ? productos : [];

    const formatPrice = (v) => {
        if (v === undefined || v === null || v === '') return '-';
        const num = Number(v);
        if (Number.isNaN(num)) return v;
        return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Tabla de Productos</Text>

            <ScrollView horizontal>
                <View>
                    {/* Encabezado */}
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colNombre]}>Nombre</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colDescripcion]}>Descripción</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colPrecio]}>Venta</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colPrecio]}>Compra</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colStock]}>Stock</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colCategoria]}>Categoría</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colImagen]}>Imagen</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colAcciones]}>Acciones</Text>
                    </View>

                    {/* Lista de productos */}
                    <ScrollView style={{ maxHeight: 420 }}>
                        {productosList.length === 0 ? (
                            <View style={styles.emptyRow}>
                                <Text style={styles.emptyText}>No hay productos</Text>
                            </View>
                        ) : (
                            productosList.map((item, idx) => (
                                <View key={item.id} style={[styles.fila, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                                    <Text style={[styles.celda, styles.colNombre]} numberOfLines={1}>{item.nombre || '-'}</Text>
                                    <Text style={[styles.celda, styles.colDescripcion]} numberOfLines={2} ellipsizeMode="tail">{item.descripcion || '-'}</Text>
                                    <Text style={[styles.celda, styles.colPrecio]}>{formatPrice(item.precio)}</Text>
                                    <Text style={[styles.celda, styles.colPrecio]}>{formatPrice(item.precioCompra)}</Text>
                                    <Text style={[styles.celda, styles.colStock]}>{item.stock === 0 ? 'Agotado' : (item.stock ?? '-')}</Text>
                                    <Text style={[styles.celda, styles.colCategoria]}>{item.Categoria || item.categoria || '-'}</Text>
                                    <View style={[styles.celda, styles.colImagen]}>
                                        {item.imagen ? (
                                            <Image
                                                source={{ uri: item.imagen }}
                                                style={styles.imagen}
                                            />
                                        ) : (
                                            <Image source={require('../../assets/icon.png')} style={styles.imagen} />
                                        )}
                                    </View>
                                    <View style={[styles.celdaAcciones, styles.colAcciones]}>
                                        <BotonEliminarProducto
                                            id={item.id}
                                            eliminarProducto={eliminarProducto}
                                        />
                                        <TouchableOpacity
                                            style={styles.botonActualizar}
                                            onPress={() => editarProducto(item)}
                                        >
                                            <Text>🖊️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

        flex: 1,
        backgroundColor: "#ffffff",
        padding: 20
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center"
    },
    fila: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 8,
        alignItems: "center"
    },
    encabezado: {
        backgroundColor: "#d5f5f5ff"
    },
    celda: {
        fontSize: 16,
        textAlign: "center",
        paddingHorizontal: 6
    },
    textoEncabezado: {
        fontWeight: "bold",
        fontSize: 17
    },
    celdaAcciones: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    botonActualizar: {
        padding: 6,
        borderRadius: 5,
        backgroundColor: "#facf7f",
        marginLeft: 8
    },
    imagen: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        alignSelf: 'center'
    },

    colDescripcion: { width: 200 },
    rowEven: { backgroundColor: '#ffffff' },
    rowOdd: { backgroundColor: '#fbfdfe' },
    emptyRow: { padding: 23, alignItems: 'center' },
    emptyText: { color: '#6b7280' },

    // Column widths
    colNombre: { width: 120 },
    colPrecio: { width: 89 },
    colStock: { width: 80 },
    colCategoria: { width: 100 },
    colImagen: { width: 80 },
    colAcciones: { width: 100 }
});

export default TablaProductos;