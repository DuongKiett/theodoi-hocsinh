import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert, // Bổ sung thư viện Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Hàm hỗ trợ format thời gian ---
const formatDate = (timestamp: string) => {
  if (!timestamp) return '--/--/----';
  const parts = timestamp.split(' ');
  if (parts.length > 0) {
    const dateParts = parts[0].split('-');
    return dateParts.length === 3
      ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
      : parts[0];
  }
  return '--/--/----';
};

const formatTime = (timestamp: string) => {
  if (!timestamp) return '--:--';
  const parts = timestamp.split(' ');
  return parts.length > 1 ? parts[1].substring(0, 5) : '--:--';
};

const StrangerWarningScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [strangers, setStrangers] = useState<any[]>([]);
  // Thêm state để chặn thao tác khi đang xử lý dữ liệu
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkinsRef = database().ref('checkins');

    const onValueChange = checkinsRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        // Chuyển đổi Object thành Array và giữ lại node key
        const unknownList = Object.entries(data)
          .map(([key, value]: [string, any]) => ({ key, ...value }))
          .filter(
            (item: any) =>
              item.name?.toLowerCase() === 'unknown' ||
              item.id?.toLowerCase() === 'unknown',
          );

        unknownList.sort((a: any, b: any) => {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });

        setStrangers(unknownList);
      } else {
        setStrangers([]);
      }
    });

    return () => checkinsRef.off('value', onValueChange);
  }, []);

  // --- LOGIC GỬI LOG VÀ XÓA DỮ LIỆU ---
  const processResolve = async () => {
    if (strangers.length === 0) {
      navigation.goBack();
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Lưu lịch sử cảnh báo vào node 'alerts'
      await database().ref('alerts').push({
        type: 'stranger_detected',
        students: strangers,
        timestamp: new Date().toISOString(),
        resolved: true,
      });

      // 2. Gom các key của người lạ để tiến hành xóa hàng loạt
      const updates: any = {};
      strangers.forEach(stranger => {
        if (stranger.key) {
          updates[`/${stranger.key}`] = null; // Gán null để Firebase hiểu là lệnh xóa
        }
      });

      // 3. Thực thi update lên node 'checkins'
      await database().ref('checkins').update(updates);

      // Hoàn tất quá trình
      setIsProcessing(false);
      navigation.goBack();
    } catch (error) {
      setIsProcessing(false);
      console.error('Lỗi khi cập nhật database: ', error);
      Alert.alert('Lỗi', 'Không thể xử lý dữ liệu. Vui lòng thử lại!');
    }
  };

  // --- HIỂN THỊ HỘP THOẠI XÁC NHẬN TRƯỚC KHI XÓA ---
  const handleResolved = () => {
    Alert.alert(
      'Xác nhận xử lý',
      'Bạn đã kiểm tra và chắc chắc thực hiện hành động này?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        { text: 'Tiếp tục', style: 'destructive', onPress: processResolve },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.hero}>
          <MaterialCommunityIcons
            name="alert-outline"
            size={60}
            color="#A32D2D"
          />
          <Text style={styles.heroTitle}>CẢNH BÁO!</Text>
          <Text style={styles.heroSub}>
            Phát hiện {strangers.length} người lạ chưa xác định.
          </Text>
        </View>
      </View>
      <View style={styles.listBoxContainer}>
        <View style={styles.listBox}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {strangers.length === 0 ? (
              <Text
                style={{ textAlign: 'center', marginTop: 20, color: '#666' }}
              >
                Không có dữ liệu người lạ.
              </Text>
            ) : (
              strangers.map((item, i) => {
                const nameStr = item.name || 'Unknown';
                const initials = nameStr
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(-2)
                  .toUpperCase();

                // Xác định trạng thái IN/OUT (giả định dựa trên item.status)
                const isIn = item.status === 'IN';

                return (
                  <TouchableOpacity
                    key={item.key || i}
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('CheckInDetail', {
                        key: item.key,
                        id: item.id,
                        name: item.name,
                        status: item.status,
                        timestamp: item.timestamp,
                        photo: item.photo,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.avatar,
                        isIn ? styles.avatarIn : styles.avatarOut,
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          isIn ? styles.textIn : styles.textOut,
                        ]}
                      >
                        {initials}
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{nameStr}</Text>
                      <Text style={styles.sub}>{item.id || 'N/A'}</Text>
                      <Text style={styles.datetime}>
                        {formatDate(item.timestamp)} -{' '}
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        isIn ? styles.badgeIn : styles.badgeOut,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          isIn ? styles.textIn : styles.textOut,
                        ]}
                      >
                        {item.status || 'UNKNOWN'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={[
            styles.btnGreen,
            (isProcessing || strangers.length === 0) && { opacity: 0.6 },
          ]}
          onPress={handleResolved}
          disabled={isProcessing || strangers.length === 0}
        >
          <Text style={styles.btnText}>
            {isProcessing ? 'ĐANG XỬ LÝ...' : 'ĐÃ XỬ LÝ XONG'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerSection: { paddingHorizontal: 16, paddingTop: 16 },
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
  heroSub: { fontSize: 14, color: '#A32D2D', marginTop: 6, fontWeight: '500' },
  listBoxContainer: { flex: 1, paddingHorizontal: 16, marginVertical: 5 },
  listBox: { flex: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#EEE',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIn: { backgroundColor: '#E8F5E9' },
  avatarOut: { backgroundColor: '#FFEBEE' },
  textIn: { color: '#2E7D32' },
  textOut: { color: '#C62828' },
  avatarText: { fontWeight: 'bold', fontSize: 14 },

  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sub: { fontSize: 13, color: '#666', marginTop: 2 },
  datetime: { fontSize: 12, color: '#888', marginTop: 2 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIn: { backgroundColor: '#E8F5E9' },
  badgeOut: { backgroundColor: '#FFEBEE' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },

  footerSection: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btnGreen: {
    backgroundColor: '#2E7D32',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StrangerWarningScreen;
