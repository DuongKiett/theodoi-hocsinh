import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens chung
import LoginScreen from '../screens/LoginScreen';

// Screens cho Admin
import HomeScreen from '../screens/HomeScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WarningScreen from '../screens/WarningScreen';
import EndTripScreen from '../screens/EndTripScreen';

// Screen cho Phụ huynh
import ParentHomeScreen from '../screens/ParentHomeScreen';

import { RootStackParamList, RootTabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#842029',
        tabBarInactiveTintColor: 'black',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarItemStyle: {
          justifyContent: 'center', // 👉 căn giữa theo chiều dọc
          alignItems: 'center', // 👉 căn giữa theo chiều ngang
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarLabelStyle: {
            fontWeight: 'bold',
            fontSize: 13,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={24} />
          ),
        }}
      />

      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Điểm danh',
          tabBarLabelStyle: {
            fontWeight: 'bold',
            fontSize: 13,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clipboard-check"
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarLabelStyle: {
            fontWeight: 'bold',
            fontSize: 13,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* 1. Màn hình Đăng nhập (Luôn xuất hiện đầu tiên) */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* 2. Cụm màn hình dành cho ADMIN */}
      <Stack.Screen
        name="Main"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Warning"
        component={WarningScreen}
        options={{
          title: 'Cảnh báo',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        }}
      />
      <Stack.Screen
        name="EndTrip"
        component={EndTripScreen}
        options={{ title: 'Kết thúc chuyến' }}
      />

      {/* 3. Màn hình dành cho PHỤ HUYNH (Không có bottom tab của admin) */}
      <Stack.Screen
        name="ParentHome"
        component={ParentHomeScreen}
        options={({ navigation }) => ({
          title: 'THEO DÕI HỌC SINH',
          
          headerTitleStyle: { fontWeight: 'bold' },
          // 👉 Thêm nút Logout ở bên phải Header
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              style={{ marginRight: 15 }}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#A94442" />
            </TouchableOpacity>
          ),
          headerLeft: () => null, // Chặn quay lại bằng nút back
        })}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
