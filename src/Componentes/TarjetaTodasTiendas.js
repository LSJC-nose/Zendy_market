import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ModalUsuarioDueño from './ModalUsuarioDueño';

export default function TarjetaTodasTiendas({ tienda }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTiendaId, setSelectedTiendaId] = useState(null);

    /*
    const colores = [
        ['#dcf1f1', '#B5FFFC'],
        ['#d3f0ce', '#a8e0d9'],
        ['#c5e9ebff', '#d3f3f0'],
        ['#c6d6f0ff', '#C2E9FB'],
        ['#ddd8f3', '#ebf3de']
    ];
    */
    return (
        <View style={styles.container}>
            <ModalUsuarioDueño
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                tiendaId={selectedTiendaId}
            />
            <ScrollView contentContainerStyle={styles.container}>
                {tienda.map((item) => (
                    <View key={item.id} style={styles.tarjeta}>
                        <Image source={{ uri: item.foto }} style={styles.imagen} />
                        <View style={styles.info}>
                            <Text style={styles.nombre}>{item.nombre}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.btn_usuario}
                            onPress={() => { setSelectedTiendaId(item.id); setModalVisible(true); }}
                        >
                            <Text>Propietario</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    tarjeta: {
        justifyContent: "space-between",
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#eb6a6aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    imagen: {
        width: 80,
        height: 80,
        borderRadius: 50,
    },
    info: {
        marginLeft: 12,
        justifyContent: 'center',
        flexShrink: 1,
    },
    nombre: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    descripcion: {
        fontSize: 14,
        color: '#73c0c5ff',
    },
    btn_usuario: {
        borderRadius: 25,
        justifyContent: "center",
        alignSelf: "center",
        alignItems: "center",
        backgroundColor: "#a6ece3ff",
        width: 100,
        height: 45,
        shadowColor: '#d43434ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
    }
});