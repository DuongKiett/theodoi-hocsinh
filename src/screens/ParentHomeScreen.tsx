import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import database from '@react-native-firebase/database';

interface CheckIn {
  key: string;
  id: string;
  name: string;
  status: 'IN' | 'OUT';
  timestamp: string;
}

interface Student {
  name: string;
  current_status: 'IN' | 'OUT';
  last_seen: string;
}

const ParentHomeScreen: React.FC = () => {
  const route = useRoute<any>();
  const studentId: string = route.params?.studentId || '';
  const studentName: string = route.params?.studentName || '';

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy trạng thái hiện tại của học sinh
  useEffect(() => {
    const ref = database().ref(`/students/${studentId}`);
    const onVal = ref.on('value', snap => {
      const data = snap.val();
      if (data) setStudent(data);
    });
    return () => ref.off('value', onVal);
  }, [studentId]);

  // Lấy lịch sử checkin của học sinh theo studentId
  useEffect(() => {
    const ref = database().ref('/checkins');
    const onVal = ref.on('value', snap => {
      const data = snap.val();
      if (data) {
        const list: CheckIn[] = Object.entries(data)
          .map(([key, val]: any) => ({
            key: key,
            id: val.id,
            name: val.name,
            status: val.status,
            timestamp: val.timestamp,
          }))
          // Chỉ lấy checkin của học sinh này
          .filter(item => item.id === studentId)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
        setCheckins(list);
      } else {
        setCheckins([]);
      }
      setLoading(false);
    });
    return () => ref.off('value', onVal);
  }, [studentId]);

  const formatDate = (ts: string) => {
    const date = ts?.split(' ')[0];
    if (!date) return '--/--/----';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatTime = (ts: string) => {
    const time = ts?.split(' ')[1];
    return time ? time.substring(0, 5) : '--:--';
  };

  const isOnBus = student?.current_status === 'IN';
  const initials = studentName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(-2)
    .toUpperCase();

  const renderItem = ({ item }: { item: CheckIn }) => {
    const isIn = item.status === 'IN';
    return (
      <View style={styles.card}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isIn ? '#3B6D11' : '#E24B4A' },
          ]}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardStatus}>{isIn ? 'Lên xe' : 'Xuống xe'}</Text>
          <Text style={styles.cardTime}>
            {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
          </Text>
        </View>
        <View style={[styles.badge, isIn ? styles.badgeIn : styles.badgeOut]}>
          <Text
            style={[styles.badgeText, isIn ? styles.textIn : styles.textOut]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* PROFILE HỌC SINH */}
      <View style={styles.profileCard}>
        <View
          style={[styles.avatar, isOnBus ? styles.avatarIn : styles.avatarOut]}
        >
          <Text
            style={[
              styles.avatarText,
              isOnBus ? styles.textIn : styles.textOut,
            ]}
          >
            {initials}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{studentName}</Text>
          <Text style={styles.profileId}>{studentId}</Text>
        </View>
        {/* Trạng thái hiện tại */}
        <View
          style={[
            styles.statusCard,
            isOnBus ? styles.statusCardIn : styles.statusCardOut,
          ]}
        >
          <MaterialCommunityIcons
            name={isOnBus ? 'bus' : 'home'}
            size={16}
            color={isOnBus ? '#3B6D11' : '#185FA5'}
          />
          <Text
            style={[
              styles.statusCardText,
              isOnBus ? styles.textIn : { color: '#185FA5' },
            ]}
          >
            {isOnBus ? 'Trên xe' : 'Đã về'}
          </Text>
        </View>
      </View>

      {/* THỐNG KÊ */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#3B6D11' }]}>
            {checkins.filter(c => c.status === 'IN').length}
          </Text>
          <Text style={styles.statLabel}>Lần lên xe</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#E24B4A' }]}>
            {checkins.filter(c => c.status === 'OUT').length}
          </Text>
          <Text style={styles.statLabel}>Lần xuống xe</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#185FA5' }]}>
            {checkins.length}
          </Text>
          <Text style={styles.statLabel}>Tổng lượt</Text>
        </View>
      </View>

      {/* LỊCH SỬ */}
      <Text style={styles.sectionTitle}>LỊCH SỬ ĐI LẠI</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A94442" />
          <Text style={styles.centerText}>Đang tải dữ liệu...</Text>
        </View>
      ) : checkins.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="bus-clock" size={48} color="#ddd" />
          <Text style={styles.centerText}>Chưa có lịch sử đi lại</Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          renderItem={renderItem}
          keyExtractor={(item, idx) => item.key || idx.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIn: { backgroundColor: '#EAF3DE' },
  avatarOut: { backgroundColor: '#E6F1FB' },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  profileId: { fontSize: 12, color: '#999', marginTop: 2 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusCardIn: { backgroundColor: '#EAF3DE' },
  statusCardOut: { backgroundColor: '#E6F1FB' },
  statusCardText: { fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 3 },
  statDivider: { width: 0.5, backgroundColor: '#EEE' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardStatus: { fontSize: 14, fontWeight: '600', color: '#212121' },
  cardTime: { fontSize: 12, color: '#999', marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeIn: { backgroundColor: '#EAF3DE' },
  badgeOut: { backgroundColor: '#FCEBEB' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  textIn: { color: '#27500A' },
  textOut: { color: '#791F1F' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  centerText: { fontSize: 14, color: '#999' },
});

export default ParentHomeScreen;
