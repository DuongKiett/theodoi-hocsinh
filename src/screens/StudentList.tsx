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
  TouchableOpacity,
} from 'react-native';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

interface User {
  key: string;
  stt: number;
  folder_name: string;
  name: string;
  dob: string;
  parent_phone: string;
  current_status: 'IN' | 'OUT';
  last_seen: string;
  last_photo?: string;
}
const StudentList = () => {
  const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const ref = database().ref('/users');
    const onVal = ref.on('value', snap => {
      const data = snap.val();
      if (data) {
        const list: User[] = Object.entries(data)
          .map(([key, val]: any) => ({
            key,
            stt: val.stt || 0,
            folder_name: val.folder_name || '',
            name: val.name || '',
            dob: val.dob || '',
            parent_phone: val.parent_phone || '',
            current_status: val.current_status || 'OUT',
            last_seen: val.last_seen || '',
            last_photo: val.last_photo || null,
          }))
                   
          // ── Sắp xếp theo stt ──
          .sort((a, b) => a.stt - b.stt);

        setUsers(list);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => ref.off('value', onVal);
  }, []);
const formatTime = (ts: string) => {
    if (!ts) return '--:--';
    const parts = ts.split(' ');
    const date = parts[0] ? parts[0].split('-').reverse().join('/') : '';
    const time = parts[1] ? parts[1].substring(0, 5) : '';
    return `${date}  ${time}`;
  };
  const filteredData = users.filter(
    u =>
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.key.toLowerCase().includes(searchText.toLowerCase()),
  );
  const renderItem = ({ item }: { item: User }) => (
      <View style={styles.card}>
        {/* Avatar dùng số thứ tự STT */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.stt}</Text>
        </View>
  
        {/* Thông tin */}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.key}</Text>
          <Text style={styles.time}>
            <MaterialCommunityIcons name="clock-outline" size={11} color="#999" />
            {'  '}
            {formatTime(item.last_seen)}
          </Text>
        </View>
  
        {/* Badge IN */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>IN</Text>
        </View>
      </View>
    );
  
  return (
    <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    
          {/* SEARCH */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" color="#999" size={22} />
              <TextInput
                style={styles.input}
                placeholder="Tim kiem hoc sinh..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color="#ccc"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
    
          {/* CONTENT */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#A94442" />
              <Text style={styles.centerText}>Dang tai du lieu...</Text>
            </View>
          ) : filteredData.length === 0 ? (
            <View style={styles.center}>
              <MaterialCommunityIcons name="bus-clock" size={52} color="#ddd" />
              <Text style={styles.centerText}>
                {searchText
                  ? 'Khong tim thay ket qua'
                  : 'Khong co hoc sinh tren xe'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={item => item.key}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // Header
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', flex: 1 },
  countBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: { fontSize: 14, fontWeight: 'bold', color: '#27500A' },

  // Search
  searchWrapper: { paddingHorizontal: 15, marginTop: 15, marginBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 3,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#212121' },

  // List
  list: { paddingHorizontal: 15, paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  centerText: { fontSize: 14, color: '#999' },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  // Avatar STT
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF3DE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3B6D11',
  },
  avatarText: { fontWeight: 'bold', fontSize: 16, color: '#27500A' },

  // Info
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  sub: { fontSize: 12, color: '#999', marginTop: 2 },
  time: { fontSize: 11, color: '#bbb', marginTop: 3 },

  // Badge
  badge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#27500A' },
  text: { fontSize: 20, fontWeight: 'bold' }
});

// Bắt buộc phải có dòng này!


export default StudentList;
