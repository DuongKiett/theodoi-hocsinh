import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Provider as PaperProvider, RadioButton, Checkbox } from 'react-native-paper';

const Bai3 = () => {
  const [hoTen, setHoTen] = useState('');
  const [cmnd, setCmnd] = useState('');
  const [bangCap, setBangCap] = useState('Đại học');
  const [soThich, setSoThich] = useState({
    docBao: false,
    docSach: false,
    docCoding: false,
  });
  const [boSung, setBoSung] = useState('');

  const handleSend = () => {
    // 1. Kiểm tra họ tên
    if (hoTen.trim().length < 3) {
      Alert.alert('Lỗi', 'Tên phải >= 3 ký tự');
      return;
    }

    // 2. Kiểm tra CMND
    if (!/^\d{9}$/.test(cmnd)) {
      Alert.alert('Lỗi', 'CMND phải đúng 9 chữ số');
      return;
    }

    // 3. Kiểm tra sở thích
    let hobbies = [];
    if (soThich.docBao) hobbies.push('Đọc báo');
    if (soThich.docSach) hobbies.push('Đọc sách');
    if (soThich.docCoding) hobbies.push('Đọc coding');

    if (hobbies.length === 0) {
      Alert.alert('Lỗi', 'Chọn ít nhất 1 sở thích');
      return;
    }

    // 4. Hiển thị thông tin
    const message =
      `${hoTen}\n` +
      `${cmnd}\n` +
      `${bangCap}\n` +
      `${hobbies.join(' - ')}\n` +
      `--------------------------\n` +
      `Thông tin bổ sung:\n${boSung || 'Không có'}\n` +
      `--------------------------`;

    Alert.alert('Thông tin cá nhân', message);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Thông tin cá nhân</Text>
          </View>

          {/* Họ tên */}
          <View style={styles.row}>
            <Text style={styles.label}>Họ tên:</Text>
            <TextInput
              style={styles.input}
              value={hoTen}
              onChangeText={setHoTen}
            />
          </View>

          {/* CMND */}
          <View style={styles.row}>
            <Text style={styles.label}>CMND:</Text>
            <TextInput
              style={styles.input}
              value={cmnd}
              onChangeText={setCmnd}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          {/* Bằng cấp */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>Bằng cấp</Text>
          </View>

          <RadioButton.Group value={bangCap} onValueChange={setBangCap}>
            <View style={styles.rowCenter}>
              <RadioButton value="Trung cấp" />
              <Text>Trung cấp</Text>

              <RadioButton value="Cao đẳng" />
              <Text>Cao đẳng</Text>

              <RadioButton value="Đại học" />
              <Text>Đại học</Text>
            </View>
          </RadioButton.Group>

          {/* Sở thích */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>Sở thích</Text>
          </View>

          <View style={styles.rowCenter}>
            <Checkbox
              status={soThich.docBao ? 'checked' : 'unchecked'}
              onPress={() => setSoThich({ ...soThich, docBao: !soThich.docBao })}
            />
            <Text>Đọc báo</Text>

            <Checkbox
              status={soThich.docSach ? 'checked' : 'unchecked'}
              onPress={() => setSoThich({ ...soThich, docSach: !soThich.docSach })}
            />
            <Text>Đọc sách</Text>

            <Checkbox
              status={soThich.docCoding ? 'checked' : 'unchecked'}
              onPress={() => setSoThich({ ...soThich, docCoding: !soThich.docCoding })}
            />
            <Text>Đọc coding</Text>
          </View>

          {/* Thông tin bổ sung */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>Thông tin bổ sung</Text>
          </View>

          <TextInput
            style={styles.textArea}
            multiline
            value={boSung}
            onChangeText={setBoSung}
          />

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleSend}>
            <Text style={styles.buttonText}>Gửi thông tin</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#2f6f6f',
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#d4e157',
    fontSize: 20,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  label: {
    width: 80,
    fontSize: 16,
  },

  input: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 16,
  },

  sectionHeader: {
    backgroundColor: '#2196f3',
    padding: 5,
  },

  sectionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
  },

  textArea: {
    margin: 10,
    borderWidth: 1,
    height: 100,
    padding: 10,
    textAlignVertical: 'top',
  },

  button: {
    margin: 20,
    backgroundColor: '#ccc',
    padding: 10,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
  },
});

export default Bai3;