import React, { useRef, useState, useEffect } from 'react';
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
  Alert,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Lưu ref từng dòng (theo key) + key của dòng đang mở, để tự đóng dòng cũ
  // khi người dùng vuốt mở một dòng khác.
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const openRowKey = useRef<string | null>(null);

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

  const filteredData = users.filter(
    u =>
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.key.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ── Xóa 1 thành viên khỏi Firebase (node 'users'), có xác nhận trước ──
  const handleDelete = (item: User) => {
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc muốn xóa "${item.name}" (${item.key}) khỏi danh sách?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            database()
              .ref(`/users/${item.key}`)
              .remove()
              .catch(err => {
                console.error('Lỗi xóa thành viên:', err);
                Alert.alert('Lỗi', 'Không thể xóa thành viên, vui lòng thử lại.');
              });
          },
        },
      ],
    );
  };

  // ── Nút Xóa hiện ra khi vuốt dòng sang trái ──
  const renderRightActions = (
    item: User,
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });
    const confirmDelete = () => {
      Alert.alert(
        'Xóa thành viên',
        `Bạn có chắc chắn muốn xóa "${item.name}" khỏi danh sách không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => handleDelete(item),
          },
        ],
        { cancelable: true },
      );
    };
    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDelete}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <Swipeable
      ref={ref => {
        swipeableRefs.current[item.key] = ref;
      }}
      renderRightActions={progress => renderRightActions(item, progress)}
      overshootRight={false}
      onSwipeableOpen={() => {
        // Đóng dòng đang mở trước đó (nếu khác dòng vừa mở)
        if (openRowKey.current && openRowKey.current !== item.key) {
          swipeableRefs.current[openRowKey.current]?.close();
        }
        openRowKey.current = item.key;
      }}
      onSwipeableClose={() => {
        if (openRowKey.current === item.key) {
          openRowKey.current = null;
        }
      }}
    >
      <View style={styles.card}>
        {/* Avatar dùng số thứ tự STT */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.stt}</Text>
        </View>

        {/* Thông tin */}
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.key} - {item.name}
          </Text>
          <Text style={styles.sub}>Phone: {item.parent_phone}</Text>
          <Text style={styles.date}>Ngày sinh: {item.dob}</Text>
        </View>
      </View>
    </Swipeable>
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
            placeholder="Tìm kiếm học sinh..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#207584" />
          <Text style={styles.centerText}>Đang tải dữ liệu...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="bus-clock" size={52} color="#ddd" />
          <Text style={styles.centerText}>
            {searchText ? 'Không tìm thấy kết quả' : 'Không có học sinh trên xe'}
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
  countText: { fontSize: 14, fontWeight: 'bold', color: '#1976D2' },

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
    backgroundColor: '#207584',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#207584',
  },
  avatarText: { fontWeight: 'bold', fontSize: 16, color: '#fff' },

  // Info
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  sub: { fontSize: 12, color: '#999', marginTop: 2 },
  date: { fontSize: 11, color: '#bbb', marginTop: 3 },

  // Badge
  badge: {
    backgroundColor: '#207584',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#1976D2' },

  // Nút xóa khi vuốt (swipe)
  deleteButton: {
    width: 80,
    height: '100%',
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 10,
  },
  deleteButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
});

export default StudentList;