import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const WarningScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const forgotten: any[] = route.params?.forgotten || [];

  const handleResolved = async () => {
    try {
      await database().ref('alerts').push({
        type: 'forgotten_students',
        students: forgotten,
        timestamp: new Date().toISOString(),
        resolved: true,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi cập nhật database: ', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* PHẦN TRÊN: Thông tin cảnh báo */}
      <View style={styles.headerSection}>
        <View style={styles.hero}>
          <MaterialCommunityIcons
            name="alert-outline"
            size={60}
            color="#A32D2D"
          />
          <Text style={styles.heroTitle}>Phát hiện học sinh bị bỏ quên!</Text>
          <Text style={styles.heroSub}>
            Xe đã dừng - Còn {forgotten.length} học sinh trên xe
          </Text>
        </View>
        <Text style={styles.sec}>DANH SÁCH HỌC SINH CÒN TRÊN XE</Text>
      </View>

      {/* PHẦN GIỮA: Box danh sách có thể cuộn */}
      <View style={styles.listBoxContainer}>
        <View style={styles.listBox}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {forgotten.map((s, i) => {
              const initials = s.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(-2)
                .toUpperCase();
              return (
                <View key={s.id || i} style={styles.studentCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentSub}>
                      ID: {s.id} • Lên lúc:{' '}
                      {s.last_seen?.split(' ')[1]?.substring(0, 5) || '--:--'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* PHẦN DƯỚI: Thông tin chuyến & Nút bấm cố định */}
      <View style={styles.footerSection}>
        <Text style={styles.sec}>THÔNG TIN CHUYẾN</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng số học sinh bị bỏ quên</Text>
            <Text style={[styles.infoValue, { color: '#A32D2D' }]}>
              {forgotten.length}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Trạng Thái</Text>
            <Text style={[styles.infoValue, { color: '#A32D2D' }]}>
              Chưa xử lý
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnGreen} onPress={handleResolved}>
          <Text style={styles.btnText}>ĐÃ XỬ LÝ XONG</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hero: {
    backgroundColor: '#FCEBEB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7C1C1',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#791F1F',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: '#A32D2D',
    marginTop: 6,
    fontWeight: '500',
  },
  sec: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  listBoxContainer: {
    flex: 1, // Chiếm toàn bộ khoảng trống còn lại ở giữa
    paddingHorizontal: 16,
    marginVertical: 5,
  },
  listBox: {
    flex: 1, // Đảm bảo box co giãn theo container
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#EEE',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7C1C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontWeight: 'bold', fontSize: 14, color: '#791F1F' },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  studentSub: { fontSize: 13, color: '#666', marginTop: 2 },
  footerSection: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 14, color: '#555' },
  infoValue: { fontSize: 14, fontWeight: 'bold' },
  btnGreen: {
    backgroundColor: '#2E7D32',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  btnOutline: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBB',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnOutlineText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
});

export default WarningScreen;
