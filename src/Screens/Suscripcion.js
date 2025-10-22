import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';


const Suscripcion = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Suscripción</Text>

            <View style={styles.tarjetas}>
                <LinearGradient colors={['rgb(247, 252, 255)', 'rgb(208, 235, 247)']} style={styles.tarjeta}>
                    <Image source={require('../../IMAGENES/suscripcion1.png')} style={styles.image1} />
                    <Text style={styles.subtitulo}>Un mes de membresía</Text>
                    <View style={styles.beneficio}>
                        <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.beneficioTexto}>Acceso ilimitado a contenido premium</Text>
                    </View>
                    <View style={styles.beneficio}>
                        <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.beneficioTexto}>Soporte prioritario</Text>
                    </View>
                    <Text style={styles.precio}>$9.99</Text>
                    <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Pagos')}>
                        <Text style={styles.textoBoton}>comprar ahora</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Tarjeta 2 */}
                <LinearGradient colors={['rgb(247, 252, 255)', 'rgb(208, 235, 247)']} style={styles.tarjeta}>
                    <View style={styles.etiqueta}>
                        <Text style={styles.etiquetaTexto}>Popular</Text>
                    </View>
                    <Image source={require('../../IMAGENES/suscripcion2.png')} style={styles.image2} />
                    <Text style={styles.subtitulo}>Tres meses de membresía</Text>
                    <View style={styles.beneficio}>
                        <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.beneficioTexto}>Descuento exclusivo</Text>
                    </View>
                    <View style={styles.beneficio}>
                        <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.beneficioTexto}>Regalo sorpresa</Text>
                    </View>
                    <Text style={styles.precio}>$30.00</Text>
                    <TouchableOpacity style={styles.boton}>
                        <Text style={styles.textoBoton}>comprar ahora</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "rgba(250, 253, 252, 1)",
    },
    titulo: {
        fontSize: 29,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#273da1ff",
    },
    tarjetas: {
        gap: 20,
        alignItems: 'center',
    },
    tarjeta: {
        alignItems: "center",
        justifyContent: "center",
        width: 380,
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    image1: {
        width: 60,
        height: 80,
        marginBottom: 10,
    },
    image2: {
        width: 70,
        height: 80,
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
    beneficio: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    beneficioTexto: {
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
    },
    precio: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#546dddff",
        marginTop: 10,
    },
    boton: {
        borderWidth: 2,
        borderColor: "rgb(58, 98, 107)",
        marginTop: 10,
        backgroundColor: "rgb(255, 255, 255)",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    textoBoton: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    etiqueta: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#ff9800",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        zIndex: 1,
    },
    etiquetaTexto: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
});

export default Suscripcion;