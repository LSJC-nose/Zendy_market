import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const ModalSeleccionarCategoria = ({
    visible,
    categorias,
    onClose,
    onSeleccionar
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.categoriaModalContainer}>
                <View style={styles.categoriaModalContent}>
                    <View style={styles.categoriaModalHeader}>
                        <Text style={styles.categoriaModalTitle}>Seleccionar Categoría</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.categoriaModalCloseButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.categoriaList}>
                        {categorias.length === 0 ? (
                            <Text style={styles.categoriaEmptyText}>
                                No hay categorías disponibles. Crea una categoría primero.
                            </Text>
                        ) : (
                            categorias.map((categoria) => (
                                <TouchableOpacity
                                    key={categoria.id}
                                    style={styles.categoriaItem}
                                    onPress={() => onSeleccionar(categoria)}
                                >
                                    <Text style={styles.categoriaItemText}>{categoria.nombre}</Text>
                                    <AntDesign name="right" size={16} color="#666" />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    categoriaModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(234, 243, 245, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriaModalContent: {
        backgroundColor: "#e5f3f5ff",
        borderRadius: 12,
        width: '90%',
        maxHeight: '70%',
        padding: 16,
    },
    categoriaModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1f3ed',
        paddingBottom: 12,
    },
    categoriaModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    categoriaModalCloseButton: {
        padding: 4,
    },
    categoriaList: {
        maxHeight: 300,
    },
    categoriaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoriaItemText: {
        fontSize: 16,
        color: '#2c3e50',
        flex: 1,
    },
    categoriaEmptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        padding: 20,
        fontStyle: 'italic',
    }
});

export default ModalSeleccionarCategoria;

