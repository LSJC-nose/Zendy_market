import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BotonEliminarProducto from '../Componentes/BotonEliminarProducto';

const TablaProductosSuperAdmon = ({ productos, eliminarProducto, editarProducto }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Productos del propietario</Text>

            <ScrollView horizontal>
                <View>
                    {/* Encabezado */}
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colNombre]}>Nombre</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colPrecio]}>Precio</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colStock]}>Stock</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colCategoria]}>Categoría</Text>
                        <Text style={[styles.celda, styles.textoEncabezado, styles.colImagen]}>Imagen</Text>
                    </View>

                    {/* Lista de productos */}
                    <ScrollView style={{ maxHeight: 400 }}>
                        {productos.map((item) => (
                            <View key={item.id} style={styles.fila}>
                                <Text style={[styles.celda, styles.colNombre]}>{item.nombre}</Text>
                                <Text style={[styles.celda, styles.colPrecio]}>${item.precio}</Text>
                                <Text style={[styles.celda, styles.colStock]}>{item.stock}</Text>
                                <Text style={[styles.celda, styles.colCategoria]}>{item.Categoria}</Text>
                                <View style={[styles.celda, styles.colImagen]}>
                                    {item.imagen ? (
                                        <Image
                                            source={{ uri: item.imagen }}
                                            style={styles.imagen}
                                        />
                                    ) : (
                                        <Text>No imagen</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        
        flex: 1,
        backgroundColor: "#dcedeeff",
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
        backgroundColor: "#b7e9ecff"
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

    // Column widths
    colNombre: { width: 120 },
    colPrecio: { width: 80 },
    colStock: { width: 80 },
    colCategoria: { width: 100 },
    colImagen: { width: 80 },
    colAcciones: { width: 100 }
});

export default TablaProductosSuperAdmon;