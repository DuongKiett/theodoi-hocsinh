import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Student, CheckIn } from '../types';
import database from '@react-native-firebase/database';
import WarningScreen from '../screens/WarningScreen';
import EndTripScreen from '../screens/EndTripScreen';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [students, setStudents] = useState<Student[]>([]);
  const [recentCheckins, setRecent] = useState<CheckIn[]>([]);
  const [checking, setChecking] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // Số lượng in/out
  const [stats, setStats] = useState({ inCount: 0, outCount: 0 });

  useEffect(() => {
    const studentsRef = database().ref('/students');

    // Lắng nghe sự thay đổi dữ liệu học sinh
    const onValueChange = studentsRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        let inTotal = 0;
        let outTotal = 0;

        // Duyệt qua các ID học sinh (ID001, ID002,...)
        Object.values(data).forEach((student: any) => {
          if (student.current_status === 'IN') {
            inTotal++;
          } else if (student.current_status === 'OUT') {
            outTotal++;
          }
        });

        setStats({ inCount: inTotal, outCount: outTotal });
      }
    });

    // Cleanup: Hủy lắng nghe khi component unmount
    return () => studentsRef.off('value', onValueChange);
  }, []);
  // Lấy 2 checkin gần nhất
  useEffect(() => {
    const ref = database().ref('/checkins');
    const onVal = ref.on('value', snap => {
      const data = snap.val();
      if (data) {
        const list: CheckIn[] = Object.entries(data)
          .map(([key, val]: any) => ({
            id: val.id,
            name: val.name,
            status: val.status,
            timestamp: val.timestamp,
          }))
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 4);
        setRecent(list);
      }
    });
    return () => ref.off('value', onVal);
  }, []);
  // ── Xử lý kết thúc chuyến ──
  const handleEndTrip = async () => {
    setChecking(true);
    try {
      const snap = await database().ref('/students').once('value');
      const data = snap.val();
      const totalCount = data ? Object.keys(data).length : 0;

      if (!data) {
        // Không có data → an toàn
        navigation.navigate('EndTrip', {
          forgotten: [],
          allSafe: true,
          totalCount,
        });
        setChecking(false);
        return;
      }

      const forgotten: Student[] = Object.entries(data)
        .filter(([, val]: any) => val.current_status === 'IN')
        .map(([key, val]: any) => ({
          id: key,
          name: val.name,
          current_status: val.current_status,
          last_seen: val.last_seen,
        }));

      if (forgotten.length > 0) {
        // Có học sinh chưa OUT → chuyển sang Warning
        navigation.navigate('Warning', { forgotten });
      } else {
        // Tất cả đã OUT → chuyển sang EndTrip an toàn
        navigation.navigate('EndTrip', {
          forgotten: [],
          allSafe: true,
          totalCount,
        });
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    }
    setChecking(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Học Sinh</Text>
      </View>

      <View style={{ flex: 1 }}>
        {/* --- DASHBOARD --- */}
        {/* --- DASHBOARD --- */}
        <View style={styles.dashboard}>
          <View style={styles.card}>
            <Text style={[styles.cardNumber, { color: '#1E90FF' }]}>
              {stats.inCount < 10 ? `0${stats.inCount}` : stats.inCount}
            </Text>
            <Text style={styles.cardLabel}>IN</Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardNumber, { color: '#43A047' }]}>
              {stats.outCount < 10 ? `0${stats.outCount}` : stats.outCount}
            </Text>
            <Text style={styles.cardLabel}>OUT</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
            {/* Ví dụ Cảnh báo có thể tính bằng số lượng "IN" khi xe đã dừng */}
            <Text style={[styles.cardNumber, { color: '#B71C1C' }]}>
              {stats.inCount > 0 ? `0${stats.inCount}` : '00'}
            </Text>
            <Text style={[styles.cardLabel, { color: '#B71C1C' }]}>
              Cảnh báo
            </Text>
          </View>
        </View>

        {/* --- BOX CẢNH BÁO (NHẤN ĐỂ CHUYỂN MÀN HÌNH) --- */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.warningBox}
          onPress={() => navigation.navigate('Warning', { forgotten: [] })}
        >
          <View style={styles.redBar} />
          <View style={styles.warningContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
              CẢNH BÁO !!!
            </Text>
            <View style={styles.warningHeaderRow}>
              <Text style={styles.warningTitle}>Phát hiện người lạ mặt</Text>
              <Text style={{ fontSize: 22, color: '#800000' }}>›</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* --- BOX ĐIỂM DANH GẦN NHẤT --- */}
        <View style={styles.attendanceSection}>
          <Text style={styles.sectionTitle}>ĐIỂM DANH GẦN NHẤT</Text>
          <View style={styles.attendanceCard}>
            {recentCheckins.length === 0 ? (
              <Text style={{ color: '#999', textAlign: 'center', padding: 10 }}>
                Chua co du lieu
              </Text>
            ) : (
              recentCheckins.map((item, idx) => {
                const isIn = item.status === 'IN';
                const initials = item.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(-2)
                  .toUpperCase();
                return (
                  <View key={idx}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.attendanceItem}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: isIn ? '#E8F5E9' : '#F8D7DA' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: isIn ? '#2E7D32' : '#C62828' },
                          ]}
                        >
                          {initials}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentDetail}>
                          {formatTime(item.timestamp)} • {item.id}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: isIn ? '#E8F5E9' : '#FFEBEE' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: isIn ? '#2E7D32' : '#C62828' },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.endTripButton, checking && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleEndTrip}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.endTripText}>KẾT THÚC CHUYẾN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  dashboard: { flexDirection: 'row', padding: 10, marginTop: 5 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  cardNumber: { fontSize: 24, fontWeight: '800' },
  cardLabel: { marginTop: 4, fontSize: 12, color: '#666', fontWeight: '600' },

  // WARNING BOX
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  redBar: { width: 6, backgroundColor: '#B71C1C' },
  warningContent: { flex: 1, padding: 23 },
  warningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningTitle: { color: '#800000', fontWeight: 'bold', fontSize: 18 },
  warningSubText: { color: '#A52A2A', fontSize: 13, marginTop: 4 },

  // ATTENDANCE SECTION
  attendanceSection: { marginTop: 15, paddingHorizontal: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    marginLeft: 5,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    elevation: 3,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontWeight: 'bold', fontSize: 15 },
  studentInfo: { flex: 1, marginLeft: 15 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  studentDetail: { fontSize: 12, color: '#757575', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 10 },
  // FOOTER & END TRIP BUTTON
  footer: {
    marginTop: 18,
    paddingHorizontal: 20,
    marginBottom: 10, // Tạo khoảng cách với cạnh dưới màn hình
  },
  endTripButton: {
    backgroundColor: '#A94442', // Màu xanh dương đồng bộ với Dashboard
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    borderRadius: 10, // Bo tròn cạnh (Capsule style)
    elevation: 5,
    shadowColor: '#A94442',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  endTripText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;
