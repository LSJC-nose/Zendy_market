import React, { useState } from 'react';
import { useCart } from '../Componentes/Carrito';
import { db } from '../database/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';

export default function PagosClientes() {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('credit');
    const navigation = useNavigation();
    const { cartItems, clearCart } = useCart();

    // GUARDAR COMPRA EN FIRESTORE (todos los productos del carrito)
    const guardarventas = async () => {
        if (!cartItems || cartItems.length === 0) {
            Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de pagar');
            return;
        }
        try {
            // Guardar cada producto del carrito como una compra individual
            for (const item of cartItems) {
                await addDoc(collection(db, 'ventas'), {
                    metodoPago: selectedMethod,
                    nombreProducto: item.name,
                    precio: item.price,
                    cantidad: item.quantity,
                    tiendaId: item.tiendaId,
                    fecha: new Date(),
                    imagen: item.image || null
                });
            }
            clearCart();
            Alert.alert('La compra se realizo con', 'Exito');
            navigation.navigate('MyTabsCliente');
        } catch (error) {
            console.error('Error al guardar compra:', error);
            Alert.alert('Error', 'No se pudo guardar la compra');
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.section}>Métodos de pago</Text>
            <View style={styles.methods}>
                <TouchableOpacity onPress={() => setSelectedMethod('credit')} style={selectedMethod === 'credit' ? styles.selected : styles.method}>
                    <FontAwesome name="cc-visa" size={24} color="black" />
                    <Text>Tarjeta de crédito</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMethod('gpay')} style={selectedMethod === 'gpay' ? styles.selected : styles.method}>
                    <FontAwesome6 name="google-pay" size={24} color="black" />
                    <Text>Google Pay</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMethod('paypal')} style={selectedMethod === 'paypal' ? styles.selected : styles.method}>
                    <Fontisto name="paypal" size={24} color="black" />
                    <Text>PayPal</Text>
                </TouchableOpacity>
            </View>

            {selectedMethod === 'gpay' && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image
                        source={{ uri: 'https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fthvnext.bing.com%2Fth%2Fid%2FOIP.rlMfpFS85-TDG7yEstZzHwHaHa%3Fcb%3D12%26pid%3DApi&sp=1760822742T09b67c29ba91971fc806d7a38f546938797c1f11cbb99e745e4d3dd1ff34e0ce' }}
                        style={styles.icon}
                    />
                    <Text style={styles.texto}>
                        Serás redirigido a Google Pay para completar tu pago de forma segura.
                    </Text>
                    <Text style={styles.total}>Total a pagar $9.99</Text>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#000',
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginTop: 10
                        }}
                        onPress={guardarventas}
                    >

                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continuar con Google Pay</Text>
                    </TouchableOpacity>

                    <View style={styles.pagar}>

                    </View>
                    <Text style={{ fontSize: 12, color: 'gray', marginTop: 8 }}>
                        🔒 Pago cifrado y protegido por Google
                    </Text>
                </View>
            )}

            {selectedMethod === 'credit' && (
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Número de tarjeta"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Como aparece en la tarjeta"
                        value={cardName}
                        onChangeText={setCardName}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.half]}
                            placeholder="Expira (MM/AA)"
                            value={expiry}
                            onChangeText={setExpiry}
                        />
                        <TextInput
                            style={[styles.input, styles.half]}
                            placeholder="CVV"
                            keyboardType="numeric"
                            value={cvv}
                            onChangeText={setCvv}
                        />
                    </View>
                    <View style={styles.pagar}>
                        <Text style={styles.total}>Total $9.99</Text>
                        <TouchableOpacity style={styles.payButton} onPress={guardarventas}>
                            <Text style={styles.payText}>Pagar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20
    },
    section: {
        fontSize: 16,
        marginBottom: 10
    },
    methods: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    method: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        width: '30%'
    },
    selected: {
        padding: 10,
        borderWidth: 2,
        borderColor: '#007bff',
        borderRadius: 8,
        alignItems: 'center',
        width: '30%'
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 5
    },
    form: {
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    half: {
        width: '48%'
    },
    total: {
        fontSize: 23,
        fontWeight: 'bold',
        marginBottom: 10
    },
    payButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        width: 130
    },
    payText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    pagar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 240
    },
    icon: {
        width: 150,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 10
    },
    texto: {
        fontSize: 16,
        textAlign: 'center',
    }
});
