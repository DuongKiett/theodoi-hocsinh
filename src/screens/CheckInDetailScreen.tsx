import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = StackScreenProps<RootStackParamList, 'CheckInDetail'>;

const CheckInDetailScreen: React.FC<Props> = ({ route }) => {
  const { name, id, status, timestamp, photo } = route.params;

  const isIn = status === 'IN';
  const isUnknown = id === 'N/A';

  // Tách ngày giờ
  const date = timestamp?.split(' ')[0];
  const time = timestamp?.split(' ')[1];
  const [y, m, d] = date?.split('-') || [];
  const formattedDate = `${d}/${m}/${y}`;

  // Chữ viết tắt nếu không có ảnh
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(-2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Ảnh khuôn mặt ── */}
        <View style={styles.photoWrapper}>
          {photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${photo}` }}
              style={styles.photo}
            />
          ) : (
            <View
              style={[
                styles.photo,
                styles.photoPlaceholder,
                isUnknown
                  ? styles.unknownBg
                  : isIn
                  ? styles.inBg
                  : styles.outBg,
              ]}
            >
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}

          {/* Badge IN/OUT góc phải ảnh */}
          <View
            style={[
              styles.statusBadge,
              isUnknown
                ? styles.unknownBadge
                : isIn
                ? styles.inBadge
                : styles.outBadge,
            ]}
          >
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        </View>

        {/* ── Tên ── */}
        <Text style={styles.nameText}>{name}</Text>

        {/* ── Các thông tin chi tiết ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="card-account-details"
              size={22}
              color="#378ADD"
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Mã học sinh</Text>
              <Text style={styles.infoValue}>{id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={22} color="#378ADD" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Ngày</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color="#378ADD"
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Giờ</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name={isIn ? 'login' : 'logout'}
              size={22}
              color={isUnknown ? '#FF6B00' : isIn ? '#2E7D32' : '#842029'}
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text
                style={[
                  styles.infoValue,
                  isUnknown
                    ? styles.unknownText
                    : isIn
                    ? styles.inText
                    : styles.outText,
                ]}
              >
                {isUnknown ? 'Người lạ' : isIn ? 'IN' : 'OUT'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckInDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { alignItems: 'center', padding: 20 },

  // ── Ảnh ──
  photoWrapper: { marginTop: 10, marginBottom: 20, alignItems: 'center' },
  photo: { width: 330, height: 290, borderRadius: 16 },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  inBg: { backgroundColor: '#E8F5E9' },
  outBg: { backgroundColor: '#F8D7DA' },
  unknownBg: { backgroundColor: '#FFF3E0' },
  initialsText: { fontSize: 40, fontWeight: 'bold', color: '#555' },

  // ── Badge góc ảnh ──
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: -5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 3,
  },
  inBadge: { backgroundColor: '#2E7D32' },
  outBadge: { backgroundColor: '#842029' },
  unknownBadge: { backgroundColor: '#FF6B00' },
  statusBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // ── Tên ──
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },

  // ── Info card ──
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoText: { marginLeft: 14 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: '#F0F0F0' },

  // ── Màu status ──
  inText: { color: '#2E7D32' },
  outText: { color: '#842029' },
  unknownText: { color: '#FF6B00' },
});
