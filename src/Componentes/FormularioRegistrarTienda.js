import React from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet
} from 'react-native';

const FormularioRegistrarTienda = ({
    foto,
    nombre,
    onFotoChange,
    onNombreChange,
    onSeleccionarImagen
}) => {
    return (
        <>
            <View style={styles.encabezadoIcono}>
                <Text style={styles.iconoEmoji}>🛍️</Text>
                <Text style={styles.iconoSub}>Crea y administra tus tiendas</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Foto</Text>
                <TextInput
                    style={styles.input}
                    placeholder="URL o nombre del archivo"
                    placeholderTextColor="#999"
                    value={foto}
                    onChangeText={onFotoChange}
                    keyboardType="default"
                />
                {foto ? (
                    <Image
                        source={{ uri: foto }}
                        style={styles.preview}
                        resizeMode="contain"
                        onError={() => Alert.alert('Error', 'No se pudo cargar la imagen')}
                    />
                ) : (
                    <Text style={styles.mensajePreview}>La imagen se mostrará aquí</Text>
                )}
                <TouchableOpacity style={styles.botonSeleccionar} onPress={onSeleccionarImagen}>
                    <Text style={styles.textoBoton}>Seleccionar Imagen</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Nombre de la tienda</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de la tienda"
                    value={nombre}
                    onChangeText={onNombreChange}
                />
            </View>

            <View style={styles.spacer} />
        </>
    );
};

const styles = StyleSheet.create({
    encabezadoIcono: {
        alignItems: 'center',
        marginVertical: 6,
        padding: 6,
        borderRadius: 12,
        backgroundColor: '#e6f7f0',
        borderWidth: 1,
        borderColor: '#c7f0e0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    iconoEmoji: {
        fontSize: 20,
        marginRight: 6,
    },
    iconoSub: {
        fontSize: 14,
        color: '#2a7a62',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#f9fffe',
        borderRadius: 14,
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: '#e1f3ed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#2b5d4e',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: "#25c510ff",
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    preview: {
        width: 180,
        height: 180,
        marginTop: 8,
        alignSelf: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d6f3ea',
    },
    mensajePreview: {
        textAlign: 'center',
        color: '#777',
        fontSize: 12,
        marginTop: 6,
    },
    botonSeleccionar: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 6,
        alignItems: 'center',
    },
    textoBoton: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
    spacer: {
        height: 8,
    },
});

export default FormularioRegistrarTienda;
