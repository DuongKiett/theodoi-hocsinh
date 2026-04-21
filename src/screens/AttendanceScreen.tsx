import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CheckIn {
  key: string;
  id: string;
  name: string;
  status: 'IN' | 'OUT';
  timestamp: string;
}

const AttendanceScreen: React.FC = () => {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref('/checkins');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const list: CheckIn[] = Object.entries(data)
          .map(([key, val]: any) => ({
            key: key,
            id: val.id,
            name: val.name,
            status: val.status,
            timestamp: val.timestamp,
          }))
          .sort((a, b) => {
            // Sắp xếp mới nhất lên đầu theo timestamp
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        setCheckins(list);
      } else {
        setCheckins([]);
      }
      setLoading(false);
    });
    return () => ref.off('value', onValueChange);
  }, []);

  // Tách ngày và giờ từ timestamp "2026-04-12 13:06:41"
  const formatDate = (timestamp: string) => {
    const date = timestamp?.split(' ')[0];
    if (!date) return '--/--/----';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatTime = (timestamp: string) => {
    const time = timestamp?.split(' ')[1];
    return time ? time.substring(0, 5) : '--:--';
  };

  const renderItem = ({ item }: { item: CheckIn }) => {
    const isIn = item.status === 'IN';
    const initials = item.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(-2)
      .toUpperCase();

    return (
      <View style={styles.card}>
        <View
          style={[styles.avatar, isIn ? styles.avatarIn : styles.avatarOut]}
        >
          <Text
            style={[styles.avatarText, isIn ? styles.textIn : styles.textOut]}
          >
            {initials}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.id}</Text>
          <Text style={styles.datetime}>
            {formatDate(item.timestamp)} - {formatTime(item.timestamp)}
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

  const filteredData = checkins.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Điểm Danh</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" color="#999" size={24} />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm học sinh..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#378ADD" />
          <Text style={styles.centerText}>Đang tải dữ liệu...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>Chưa có dữ liệu điểm danh</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.key || index.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  searchWrapper: { paddingHorizontal: 15, marginTop: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 3,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  labels: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 12 },
  label: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#D1D1D1',
  },
  labelActive: { backgroundColor: '#E6F1FB', borderColor: '#85B7EB' },
  labelText: { fontSize: 12, fontWeight: '500', color: '#444' },
  labelTextActive: { fontSize: 12, fontWeight: '500', color: '#185FA5' },
  list: { padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerText: { fontSize: 14, color: '#999', marginTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIn: { backgroundColor: '#E8F5E9' },
  avatarOut: { backgroundColor: '#F8D7DA' },
  avatarText: { fontWeight: 'bold', fontSize: 14 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  sub: { fontSize: 12, color: '#757575', marginTop: 2 },
  datetime: { fontSize: 11, color: '#9E9E9E', marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeIn: { backgroundColor: '#E8F5E9' },
  badgeOut: { backgroundColor: '#F8D7DA' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  textIn: { color: '#2E7D32' },
  textOut: { color: '#842029' },
});
