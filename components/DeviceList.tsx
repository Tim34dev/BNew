import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Bluetooth, Signal } from 'lucide-react-native';

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect: (deviceId: string) => void;
  isConnecting: boolean;
}

export function DeviceList({ devices, onDeviceSelect, isConnecting }: DeviceListProps) {
  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onDeviceSelect(item.id)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Bluetooth size={20} color="#0EA5E9" />
        <View style={styles.deviceDetails}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </View>
      </View>
      <View style={styles.signalContainer}>
        <Signal size={16} color="#10B981" />
        <Text style={styles.rssi}>{item.rssi || 0} dBm</Text>
      </View>
    </TouchableOpacity>
  );

  if (devices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Bluetooth size={48} color="#64748B" />
        <Text style={styles.emptyText}>No devices found</Text>
        <Text style={styles.emptySubtext}>Make sure your device is powered on and in range</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Devices</Text>
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  deviceId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rssi: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});