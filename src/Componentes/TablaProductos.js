import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BotonEliminarProducto from '../Componentes/BotonEliminarProducto';

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Tabla de Productos</Text>

            <View style={[styles.fila, styles.encabezado]}>
                <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Precio</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Stock</Text>
        
                <Text style={[styles.celda, styles.textoEncabezado]}>Categoria</Text> 
                <Text style={[styles.celda, styles.textoEncabezado]}>Imagen</Text>   
                <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
            </View>

            {/* Lista de productos */}
            <ScrollView>
                {productos.map((item) => (
                    <View key={item.id} style={styles.fila}>
                        <Text style={styles.celda}>{item.nombre}</Text>
                        <Text style={styles.celda}>${item.precio}</Text>
                        <Text style={styles.celda}>{item.stock}</Text>
                        <Text style={styles.celda}>{item.Categoria}</Text>
                        <View style={styles.celda}>
                            {item.imagen ? (
                                <Image
                                    source={{ uri: item.imagen }}
                                    style={{ width: 50, height: 50, resizeMode: 'contain' }}
                                />
                            ) : (
                                <Text>No imagen</Text>
                            )}
                        </View>
                        <View style={styles.celdaAcciones}>
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
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft:-18,
        width:400,
        backgroundColor: "#ffffff",
        flex: 1,
        padding: 20,
        alignSelf: "stretch"
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10
    },
    fila: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 6,
        alignItems: "center"
    },
    encabezado: {
        backgroundColor: "#d48d7b"
    },
    celda: {
        flex: 1,
        fontSize: 16,
        textAlign: "center"
    },
    celdaAcciones: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    textoEncabezado: {
        fontWeight: "bold",
        fontSize: 17,
        textAlign: "center"
    },
    botonActualizar: {
        padding: 4,
        borderRadius: 5,
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#facf7f",
        marginLeft: 8
    }
});

export default TablaProductos;