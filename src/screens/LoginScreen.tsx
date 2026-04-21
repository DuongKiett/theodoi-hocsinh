import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import database from '@react-native-firebase/database';

const LoginScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<'admin' | 'parent'>('parent');
  const [id, setId] = useState('');
  const [nameOrPass, setNameOrPass] = useState('');

  const handleLogin = async () => {
    if (!id || !nameOrPass) {
    Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    if (role === 'parent') {
      // --- LOGIC PHỤ HUYNH ---
      const snapshot = await database().ref(`/students/${id}`).once('value');
      const student = snapshot.val();

      if (student) {
        // 1. Xử lý tên từ Firebase: Xóa khoảng trắng + Chuyển về chữ thường
        const firebaseNameProcessed = student.name.replace(/\s+/g, '').toLowerCase();
        
        // 2. Xử lý tên nhập vào: Xóa khoảng trắng + Chuyển về chữ thường
        const inputNameProcessed = nameOrPass.replace(/\s+/g, '').toLowerCase();

        // So sánh 2 chuỗi đã được "làm sạch"
        if (firebaseNameProcessed === inputNameProcessed) {
          navigation.replace('ParentHome', { studentId: id, studentName: student.name });
        } else {
          Alert.alert('Lỗi', 'Tên học sinh không chính xác');
        }
      } else {
        Alert.alert('Lỗi', 'ID học sinh không tồn tại');
      }
    } else {
      // --- LOGIC ADMIN ---
      // Admin thường cũng nên dùng toLowerCase để tránh lỗi khi bật Caps Lock
      if (id.toLowerCase() === 'admin' && nameOrPass === '12345678') {
        navigation.replace('Main');
      } else {
        Alert.alert('Lỗi', 'Tên đăng nhập Admin hoặc mật khẩu sai');
      }
    }
  } catch (e) {
    Alert.alert('Lỗi', 'Không thể kết nối với máy chủ');
  }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>BUS SAFETY</Text>
        <Text style={styles.subLogo}>Hệ thống quản lý đưa đón</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, role === 'parent' && styles.activeTab]}
          onPress={() => {
            setRole('parent');
            setId('');
            setNameOrPass('');
          }}
        >
          <Text
            style={[styles.tabText, role === 'parent' && styles.activeTabText]}
          >
            PHỤ HUYNH
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, role === 'admin' && styles.activeTab]}
          onPress={() => {
            setRole('admin');
            setId('');
            setNameOrPass('');
          }}
        >
          <Text
            style={[styles.tabText, role === 'admin' && styles.activeTabText]}
          >
            ADMIN
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          {role === 'parent' ? 'Mã số học sinh (ID)' : 'Tên đăng nhập'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={role === 'parent' ? 'VD: ID001' : 'Nhập tên đăng nhập'}
          value={id}
          onChangeText={setId}
          // Tắt tự động viết hoa cho admin để nhập chính xác chữ thường
          autoCapitalize={role === 'admin' ? 'none' : 'characters'}
        />

        <Text style={styles.label}>
          {role === 'parent' ? 'Họ và tên học sinh' : 'Mật khẩu'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={
            role === 'parent' ? 'VD: Duong Van Kiet' : 'Nhập mật khẩu'
          }
          value={nameOrPass}
          onChangeText={setNameOrPass}
          secureTextEntry={role === 'admin'}
        />

        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
          <Text style={styles.btnText}>ĐĂNG NHẬP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... Styles giữ nguyên như cũ ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#A94442' },
  subLogo: { color: '#666', marginTop: 5 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FFF' },
  tabText: { fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#A94442' },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  btnLogin: {
    backgroundColor: '#A94442',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default LoginScreen;
