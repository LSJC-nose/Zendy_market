import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const BotonEliminarTienda = ({ id, eliminarTienda }) => {
    const [Visible, setVisible] = useState(false);

    const confirmarEliminar = () => {
        setVisible(false);
        eliminarTienda(id);
    };

    return (
        <View>
            {/* Botón pequeño */}
            <TouchableOpacity
                style={styles.boton}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.textoBoton}>
                    <AntDesign name="delete" size={24} color="#f82727ff" />
                </Text>
            </TouchableOpacity>

            {/* Modal de confirmación */}
            <Modal
                visible={Visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.texto}>¿Desea eliminar esta tienda?</Text>
                        <View style={styles.filaBoton}>
                            <TouchableOpacity
                                style={[styles.botonAccion, styles.cancelar]}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.textoAccion}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botonAccion, styles.confirmar]}
                                onPress={confirmarEliminar}
                            >
                                <Text style={styles.textoAccion}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    filaBoton: {
        padding: 4,
        borderRadius: 5,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    textoBoton: {
        color: "white",
        fontSize: 14,
    },
    overlay: {

        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {

        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    texto: {
        fontSize: 18,
        marginBottom: 20,
    },
    fila: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelar: {
        flex: 1,
        marginRight: 10,
        borderRadius: 5,
        backgroundColor: "#ccc",
    },
    botonAccion: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 10,
        alignItems: "center"
    },
    cancelar: {
        backgroundColor: "#96bb2fff"
    },
    confirmar: {
        backgroundColor: "#ed3946",
        flex: 1,
        borderRadius: 5,
    },
    textoAccion: {
        color: "white",
        fontWeight: "bold",
    },
});

export default BotonEliminarTienda;