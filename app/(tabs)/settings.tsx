import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Settings, Wrench, Zap, Info, Bluetooth } from 'lucide-react-native';
import { useBLE } from '@/hooks/useBLE';

export default function SettingsScreen() {
  const { calibrateZeroCurrent, sendCommand, connectionState } = useBLE();
  const [calibrationCurrent, setCalibrationCurrent] = useState('');
  const [calibrationVoltage, setCalibrationVoltage] = useState('');

  const handleZeroCalibration = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await calibrateZeroCurrent();
      Alert.alert('Success', 'Zero current calibration completed');
    } catch (error) {
      Alert.alert('Error', 'Failed to calibrate zero current');
    }
  };

  const handleCurrentCalibration = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    if (!calibrationCurrent) {
      Alert.alert('Error', 'Please enter a known current value');
      return;
    }

    try {
      await sendCommand(`CAL:${calibrationCurrent}`);
      Alert.alert('Success', 'Current calibration completed');
      setCalibrationCurrent('');
    } catch (error) {
      Alert.alert('Error', 'Failed to calibrate current');
    }
  };

  const handleVoltageCalibration = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    if (!calibrationVoltage) {
      Alert.alert('Error', 'Please enter a known voltage value');
      return;
    }

    try {
      await sendCommand(`CALV:${calibrationVoltage}`);
      Alert.alert('Success', 'Voltage calibration completed');
      setCalibrationVoltage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to calibrate voltage');
    }
  };

  const showDeviceInfo = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await sendCommand('STATUS');
      Alert.alert('Info', 'Status request sent. Check the monitor tab for updated data.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get device status');
    }
  };

  const showHelp = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await sendCommand('HELP');
      Alert.alert('Info', 'Help command sent to device');
    } catch (error) {
      Alert.alert('Error', 'Failed to send help command');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bluetooth size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Connection</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[
              styles.infoValue,
              { color: connectionState.isConnected ? '#10B981' : '#EF4444' }
            ]}>
              {connectionState.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          {connectionState.deviceName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device:</Text>
              <Text style={styles.infoValue}>{connectionState.deviceName}</Text>
            </View>
          )}

          {connectionState.deviceId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID:</Text>
              <Text style={styles.infoValueSmall}>{connectionState.deviceId}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wrench size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Calibration</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.actionButton, { opacity: connectionState.isConnected ? 1 : 0.5 }]}
            onPress={handleZeroCalibration}
            disabled={!connectionState.isConnected}
          >
            <Text style={styles.actionButtonText}>Zero Current Calibration</Text>
            <Text style={styles.actionButtonSubtext}>
              Calibrate zero point with no current flow
            </Text>
          </TouchableOpacity>

          <View style={styles.calibrationGroup}>
            <Text style={styles.inputLabel}>Current Calibration</Text>
            <TextInput
              style={[styles.input, { opacity: connectionState.isConnected ? 1 : 0.5 }]}
              value={calibrationCurrent}
              onChangeText={setCalibrationCurrent}
              placeholder="Enter known current (A)"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              editable={connectionState.isConnected}
            />
            <TouchableOpacity
              style={[
                styles.calibrateButton, 
                { opacity: (connectionState.isConnected && calibrationCurrent) ? 1 : 0.5 }
              ]}
              onPress={handleCurrentCalibration}
              disabled={!connectionState.isConnected || !calibrationCurrent}
            >
              <Text style={styles.calibrateButtonText}>Calibrate Current</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calibrationGroup}>
            <Text style={styles.inputLabel}>Voltage Calibration</Text>
            <TextInput
              style={[styles.input, { opacity: connectionState.isConnected ? 1 : 0.5 }]}
              value={calibrationVoltage}
              onChangeText={setCalibrationVoltage}
              placeholder="Enter known voltage (V)"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              editable={connectionState.isConnected}
            />
            <TouchableOpacity
              style={[
                styles.calibrateButton, 
                { opacity: (connectionState.isConnected && calibrationVoltage) ? 1 : 0.5 }
              ]}
              onPress={handleVoltageCalibration}
              disabled={!connectionState.isConnected || !calibrationVoltage}
            >
              <Text style={styles.calibrateButtonText}>Calibrate Voltage</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Device Information</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.actionButton, { opacity: connectionState.isConnected ? 1 : 0.5 }]}
            onPress={showDeviceInfo}
            disabled={!connectionState.isConnected}
          >
            <Text style={styles.actionButtonText}>Get Device Status</Text>
            <Text style={styles.actionButtonSubtext}>
              Request fresh data from device
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { opacity: connectionState.isConnected ? 1 : 0.5 }]}
            onPress={showHelp}
            disabled={!connectionState.isConnected}
          >
            <Text style={styles.actionButtonText}>Show Device Commands</Text>
            <Text style={styles.actionButtonSubtext}>
              Display available device commands
            </Text>
          </TouchableOpacity>
          
          <View style={styles.specsList}>
            <Text style={styles.specTitle}>Device Specifications</Text>
            <Text style={styles.specItem}>• Current Range: ±50A (ACS758-50A)</Text>
            <Text style={styles.specItem}>• Voltage Range: 0-55V</Text>
            <Text style={styles.specItem}>• Power Range: 0-2750W</Text>
            <Text style={styles.specItem}>• Resolution: 10-bit ADC</Text>
            <Text style={styles.specItem}>• Communication: JDY-23 BLE</Text>
            <Text style={styles.specItem}>• Update Rate: 10Hz</Text>
            <Text style={styles.specItem}>• Service UUID: 0000FFE0-0000-1000-8000-00805F9B34FB</Text>
            <Text style={styles.specItem}>• Characteristic UUID: 0000FFE1-0000-1000-8000-00805F9B34FB</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <Text style={styles.aboutText}>
            BLE Current Monitor v1.0{'\n'}
            Professional electrical measurement system with real-time monitoring, 
            data logging, and configurable alarms.{'\n\n'}
            This app connects to Arduino-based current sensors using JDY-23 BLE modules 
            for wireless data transmission and device control.
          </Text>
          
          <Text style={styles.copyrightText}>
            © 2025 Current Monitor Pro
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  infoValueSmall: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  calibrationGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  calibrateButton: {
    backgroundColor: '#0EA5E9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  calibrateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  specsList: {
    marginTop: 16,
  },
  specTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  specItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});