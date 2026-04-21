export interface Student {
  id: string;
  name: string;
  current_status: 'IN' | 'OUT';
  last_seen: string;
}

export interface CheckIn {
  id: string;
  name: string;
  status: 'IN' | 'OUT';
  timestamp: string;
}

export type RootDrawerParamList = {
  DeviceControl: undefined;
  SystemConfig: undefined;
};

export type DeviceTabParamList = {
  MyDevices: undefined;
  SampleDevices: undefined;
};

export type RootTabParamList = {
 
  Home: undefined;
  Attendance: undefined;
  Students: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Warning: { forgotten?: Student[] };
  EndTrip: { forgotten: Student[]; allSafe: boolean; totalCount: number };
  ParentHome: { studentId: string; studentName: string }; // Thêm dòng này
};
