import {useState} from 'react';
import { Modal, View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FormularioRegistrarProducto from './FormularioRegistrarProducto';
import TablaProductos from './TablaProductos';
import Entypo from '@expo/vector-icons/Entypo';

const ModalProducto = ({
    visible,
    onClose,
    styles,
    isLoading,
    tiendaSeleccionada,
    productoForm,
    manejoCambio,
    abrirModalCategorias,
    seleccionarImagen,
    modoEdicion,
    onSubmit,
    productos,
    editarProducto,
    eliminarProducto
}) => {
    const [modalRegistroVisible, setModalVisibleRegistro] = useState(false);

    const ModalHeader = () => (
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
                {modoEdicion ? 'Actualizar Producto' : 'Registro de Productos'} en {tiendaSeleccionada?.nombre ?? 'Tienda'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    {isLoading && <ActivityIndicator size="large" color="#47acb9" style={styles.loadingIndicator} />}
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {tiendaSeleccionada && (
                            <>
                                <ModalHeader />
                                <FormularioRegistrarProducto
                                  onClose={() => setModalVisibleRegistro(false)}
                                    styles={styles}
                                    productoForm={productoForm}
                                    manejoCambio={manejoCambio}
                                    abrirModalCategorias={abrirModalCategorias}
                                    seleccionarImagen={seleccionarImagen}
                                    modoEdicion={modoEdicion}
                                    onSubmit={onSubmit}
                                />
                                <ScrollView>

                                
                                </ScrollView>
                            </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ModalProducto;
