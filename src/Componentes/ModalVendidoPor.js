import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../database/firebaseConfig.js';
import TablaProductos from './TablaProductos';
import TablaProductosSuperAdmon from './TablaProdSupAdmon.js';

export default function ModalVendidoPor({
    visible,
    modalVisible,
    onClose,
    setModalVisible,
    tiendaId,
}) {
    const isVisible = visible ?? modalVisible ?? false;
    const handleClose = onClose ?? (() => setModalVisible?.(false));
    const [nombreTienda, setNombreTienda] = useState('');
    const [tiendaImage, setTiendaImage] = useState(null);

    const [usuarioDueño, setUsuarioDueño] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productos, setProductos] = useState([]);

    const cargarUsers = async () => {
        try {
            if (!tiendaId) {
                setUsuarioDueño([]);
                return;
            }

            // Buscar usuarios relacionados a la tienda por array-contains en campo `tiendas`
            const usuariosRef = collection(db, 'usuario');
            const q = query(usuariosRef, where('tiendas', 'array-contains', tiendaId));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Si existe campo rol, priorizar mostrar dueños
            const propietarios = data.filter((u) => (u.rol || '').toLowerCase() === 'dueño');
            setUsuarioDueño(propietarios.length > 0 ? propietarios : data);
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const cargarNombreTienda = async () => {
        try {
            if (!tiendaId) return;

            const tiendaRef = collection(db, 'tienda');
            const q = query(tiendaRef, where('__name__', '==', tiendaId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const tiendaData = querySnapshot.docs[0].data();
                setNombreTienda(tiendaData.nombre || 'Tienda sin nombre');
                // Intentar leer varios nombres posibles para el campo de imagen/foto
                const posibleImagen = tiendaData.foto || tiendaData.imagen || tiendaData.imagenUrl || tiendaData.image || null;
                setTiendaImage(posibleImagen);
            } else {
                setNombreTienda('Tienda no encontrada');
            }
        } catch (error) {
            console.error('Error al obtener la tienda:', error);
            setNombreTienda('Error al cargar la tienda');
        }
    };

    useEffect(() => {
        if (isVisible) {
            cargarDatos();
            cargarUsers();
            cargarNombreTienda();
        }
    }, [isVisible, tiendaId]);

    const cargarDatos = async () => {
        if (!tiendaId) {
            setProductos([]);
            return;
        }
        setLoading(true);
        try {
            // Consultar solo los productos que pertenecen a la tienda indicada
            const productosRef = collection(db, 'productos');
            const q = query(productosRef,
                where('tiendaId', '==', tiendaId));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setProductos(data);
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            Alert.alert('Error', 'No se pudieron cargar los productos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Image source={tiendaImage ? { uri: tiendaImage } : require('../../assets/icon.png')} style={styles.logo} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.storeName}>{nombreTienda || 'Tienda'}</Text>
                                <Text style={styles.storeSubtitle}>Productos y propietario</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeCircle}>
                            <AntDesign name="close" size={20} color="#075985" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {loading && <ActivityIndicator size="large" color="#0ea5a4" />}

                        {usuarioDueño.length === 0 && !loading && (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No se encontraron propietarios para esta tienda.</Text>
                            </View>
                        )}

                        {usuarioDueño.map((item) => (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.ownerName}>{item.nombre}</Text>
                                    <Text style={styles.ownerEmail}>{item.correo}</Text>
                                    {item.telefono ? <Text style={styles.ownerPhone}>{item.telefono}</Text> : null}
                                </View>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{(item.rol || 'Propietario').toUpperCase()}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={styles.productsSection}>
                            <Text style={styles.sectionTitle}>Productos ({productos.length})</Text>
                            {loading ? (
                                <ActivityIndicator size="small" color="#0ea5a4" />
                            ) : productos.length === 0 ? (
                                <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                                    {productos.map((p) => (
                                        <View key={p.id} style={styles.productCard}>
                                            <Image
                                                source={p.imagen ? { uri: p.imagen } : require('../../assets/icon.png')}
                                                style={styles.productImage}
                                            />
                                            <Text numberOfLines={2} style={styles.productTitle}>{p.nombre || 'Sin nombre'}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingTop: 0,
        paddingBottom: 16,
        paddingHorizontal: 0,
        maxHeight: '85%',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 14,
        backgroundColor: '#ecfeff',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logo: {
        width: 52,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#075985',
    },
    storeSubtitle: {
        fontSize: 12,
        color: '#375a66',
        marginTop: 2,
    },
    closeCircle: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 4,
    },
    content: {
        padding: 14,
        paddingBottom: 36,
    },
    emptyBox: {
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 12,
        backgroundColor: '#e2fdfb',
    },
    cardInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    ownerEmail: {
        fontSize: 13,
        color: '#475569',
        marginTop: 4,
    },
    ownerPhone: {
        fontSize: 13,
        color: '#475569',
        marginTop: 2,
    },
    roleBadge: {
        backgroundColor: '#e0f2fe',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#075985',
    },
    productsSection: {
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
    },
    productsScroll: {
        paddingVertical: 6,
    },
    productCard: {
        width: 120,
        marginRight: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    productImage: {
        width: 100,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
    },
    productTitle: {
        fontSize: 12,
        color: '#0f172a',
        textAlign: 'center',
    },
});