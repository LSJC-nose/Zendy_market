import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { db } from '../database/firebaseConfig';
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export default function ModalCalificacion({ visible, onClose, productoId, tiendaId = null, userId, initialRating = 0, onSaved }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [saving, setSaving] = useState(false);
  const [storeRating, setStoreRating] = useState(0);
  const [storeCount, setStoreCount] = useState(0);

  useEffect(() => {
    if (visible) setRating(initialRating || 0);
  }, [visible, initialRating]);

  useEffect(() => {
    const cargarRatingTienda = async () => {
      // Si no hay tiendaId no hacemos nada. El caller puede pasar tiendaId a través de props.
      if (!tiendaId) return;
      try {
        // Primero intentamos leer el documento de tienda para campos agregados (ratingSum, ratingCount o avgRating)
        const tiendaRef = doc(db, 'tienda', tiendaId);
        const tiendaSnap = await getDoc(tiendaRef);
        if (tiendaSnap.exists()) {
          const data = tiendaSnap.data();
          if (data.ratingSum != null && data.ratingCount != null && data.ratingCount > 0) {
            setStoreRating(data.ratingSum / data.ratingCount);
            setStoreCount(data.ratingCount);
            return;
          }
          if (data.avgRating != null && data.ratingCount != null) {
            setStoreRating(data.avgRating);
            setStoreCount(data.ratingCount);
            return;
          }
        }

        // Si no hay resumen en la tienda, calculamos desde la colección valoraciones
        const q = query(collection(db, 'valoraciones'), where('tiendaId', '==', tiendaId));
        const snapshot = await getDocs(q);
        const vals = snapshot.docs.map(d => d.data());
        if (vals.length === 0) {
          setStoreRating(0);
          setStoreCount(0);
          return;
        }
        const sum = vals.reduce((s, v) => s + (v.estrellas || 0), 0);
        setStoreRating(sum / vals.length);
        setStoreCount(vals.length);
      } catch (err) {
        console.error('Error cargando rating de tienda:', err);
      }
    };
    cargarRatingTienda();
  }, [tiendaId]);

  const GuardarCalificacion = async () => {
    if (!productoId && !tiendaId) {
      Alert.alert('Error', 'Producto o tienda inválida');
      return;
    }
    if (!rating || rating < 1) {
      Alert.alert('Atención', 'Selecciona al menos 1 estrella');
      return;
    }
    setSaving(true);
    try {
      // Guardamos la valoración (puede contener productoId y/o tiendaId si el caller la proporciona)
      const payload = {
        productoId: productoId || null,
        tiendaId: tiendaId || null,
        estrellas: rating,
        userId: userId || null,
        fecha: serverTimestamp(),
      };
      await addDoc(collection(db, 'valoraciones'), payload);

      // Si se proporcionó tiendaId, actualizamos resumen en el documento de la tienda (ratingSum, ratingCount)
      if (tiendaId) {
        try {
          const tiendaRef = doc(db, 'tienda', tiendaId);
          await updateDoc(tiendaRef, {
            ratingSum: increment(rating),
            ratingCount: increment(1),
          });
        } catch (err) {
          // Si falla updateDoc (p.ej. no existe doc), lo ignoramos pero logueamos
          console.warn('No se pudo actualizar resumen de tienda:', err);
        }
      }
      onSaved && onSaved(rating);
      Alert.alert('Gracias', `Tu calificación de ${rating} estrella(s) fue guardada.`);
      onClose && onClose();
    } catch (error) {
      console.error('Error guardando calificación:', error);
      Alert.alert('Error', 'No se pudo guardar la calificación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{tiendaId &&  'Calificar tienda'}</Text>
          {tiendaId && (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>Calificación de la tienda</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <FontAwesome5 key={i} name={i < Math.round(storeRating) ? 'star' : 'star-o'} size={16} color="#FFD700" style={{ marginHorizontal: 3 }} />
                ))}
                <Text style={{ marginLeft: 8, fontWeight: '600' }}>{storeRating ? storeRating.toFixed(1) : '0.0'}</Text>
              </View>
            </View>
          )}
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i + 1)} activeOpacity={0.8}>
                <FontAwesome5 name={i < rating ? 'star' : 'star-o'} size={32} color="#FFD700" style={{ marginHorizontal: 6 }} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setRating(initialRating || 0); onClose && onClose(); }} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={GuardarCalificacion} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  starsRow: { flexDirection: 'row', marginVertical: 12 },
  actions: { flexDirection: 'row', marginTop: 16, width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, marginRight: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: '600' },
  saveBtn: { flex: 1, marginLeft: 8, backgroundColor: '#FF6B35', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
