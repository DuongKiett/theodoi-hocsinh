import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';

const EndTripScreen: React.FC = () => {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const totalCount = route.params?.totalCount || 0;
  const now        = new Date();
  const timeStr    = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} · ${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;

  const handleConfirm = async () => {
    await database().ref('trip_status').set({
      status:    'completed',
      timestamp: new Date().toISOString(),
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Hero an toàn */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 28 }}>✅</Text>
          </View>
          <Text style={styles.heroTitle}>Tat ca an toan!</Text>
          <Text style={styles.heroSub}>{totalCount}/{totalCount} hoc sinh da xuong xe</Text>
        </View>

        {/* Thông tin */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tong hoc sinh</Text>
            <Text style={styles.infoValue}>{totalCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Da xuong xe</Text>
            <Text style={[styles.infoValue, { color: '#3B6D11' }]}>{totalCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bo quen</Text>
            <Text style={[styles.infoValue, { color: '#3B6D11' }]}>0</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Thoi gian</Text>
            <Text style={styles.infoValue}>{timeStr}</Text>
          </View>
        </View>

        {/* Nút xác nhận */}
        <TouchableOpacity style={styles.btnGreen} onPress={handleConfirm}>
          <Text style={styles.btnText}>Xac nhan ket thuc chuyen</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F8F9FA' },
  content:    { flex: 1, padding: 16, justifyContent: 'center' },
  hero:       { backgroundColor: '#EAF3DE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  heroIcon:   { width: 56, height: 56, borderRadius: 28, backgroundColor: '#C0DD97', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  heroTitle:  { fontSize: 18, fontWeight: 'bold', color: '#27500A' },
  heroSub:    { fontSize: 13, color: '#3B6D11', marginTop: 4 },
  infoCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 20, elevation: 2 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  infoLabel:  { fontSize: 14, color: '#888' },
  infoValue:  { fontSize: 14, fontWeight: '600', color: '#212121' },
  btnGreen:   { backgroundColor: '#3B6D11', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
  btnText:    { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EndTripScreen;