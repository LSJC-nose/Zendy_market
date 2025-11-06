import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const FormularioRegistrarProducto = ({
    styles,
    productoForm,
    manejoCambio,
    abrirModalCategorias,
    seleccionarImagen,
    modoEdicion,
    onSubmit
}) => {
    return (
        <>
            <View style={styles.tarjeta_input}>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre del producto"
                    value={productoForm.nombre}
                    onChangeText={(nombre) => manejoCambio('nombre', nombre)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Precio venta"
                    value={productoForm.precio}
                    onChangeText={(precio) => manejoCambio('precio', precio)}
                    keyboardType="numeric"
                />
                 <TextInput
                    style={styles.input}
                    placeholder="Precio compra"
                    value={productoForm.precioCompra}
                    onChangeText={(precioCompra) => manejoCambio('precioCompra', precioCompra)}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Stock"
                    value={productoForm.stock}
                    onChangeText={(stock) => manejoCambio('stock', stock)}
                    keyboardType="numeric"
                />
                <View style={styles.categoriaContainer}>
                    <Text style={styles.categoriaLabel}>Categoría:</Text>
                    <TouchableOpacity
                        style={styles.categoriaButton}
                        onPress={abrirModalCategorias}
                    >
                        <Text style={styles.categoriaButtonText}>
                            {productoForm.Categoria || 'Selecciona una categoría'}
                        </Text>
                        <AntDesign name="down" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tarjeta_input}>
                {productoForm.foto ? (
                    <Image
                        source={{ uri: productoForm.foto }}
                        style={styles.preview}
                        resizeMode="contain"
                        onError={() => Alert.alert('Error', 'No se pudo cargar la imagen')}
                    />
                ) : (
                    <Text style={styles.mensajePreview}>La imagen se mostrará aquí</Text>
                )}
                <TouchableOpacity style={styles.botonSeleccionar} onPress={seleccionarImagen}>
                    <Text style={styles.textoBoton}>Seleccionar Imagen</Text>
                </TouchableOpacity>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.accionBoton}
                        onPress={onSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.accionTexto}>
                            {modoEdicion ? 'Actualizar' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

export default FormularioRegistrarProducto;


