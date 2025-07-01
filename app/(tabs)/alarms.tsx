import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { TriangleAlert as AlertTriangle, Bell, BellOff, Save } from 'lucide-react-native';
import { useBLE } from '@/hooks/useBLE';

export default function AlarmsScreen() {
  const { deviceData, setAlarmThresholds } = useBLE();
  const [currentHighAlarm, setCurrentHighAlarm] = useState('45.0');
  const [currentLowAlarm, setCurrentLowAlarm] = useState('-45.0');
  const [voltageHighAlarm, setVoltageHighAlarm] = useState('15.0');
  const [voltageLowAlarm, setVoltageLowAlarm] = useState('10.0');
  const [alarmsEnabled, setAlarmsEnabled] = useState(true);

  const handleSaveSettings = async () => {
    try {
      await setAlarmThresholds({
        currentAlarmHigh: parseFloat(currentHighAlarm),
        currentAlarmLow: parseFloat(currentLowAlarm),
        voltageAlarmHigh: parseFloat(voltageHighAlarm),
        voltageAlarmLow: parseFloat(voltageLowAlarm),
        alarmsEnabled,
      });
    } catch (error) {
      console.error('Error saving alarm settings:', error);
    }
  };

  const isAlarmActive = deviceData?.alarm ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Alarm Settings</Text>

        {isAlarmActive && (
          <View style={styles.alarmBanner}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.alarmText}>ALARM ACTIVE</Text>
            <Text style={styles.alarmSubtext}>
              Current or voltage limits exceeded
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Master Control</Text>
            {alarmsEnabled ? (
              <Bell size={20} color="#10B981" />
            ) : (
              <BellOff size={20} color="#64748B" />
            )}
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Alarms</Text>
            <Switch
              value={alarmsEnabled}
              onValueChange={setAlarmsEnabled}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={alarmsEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Thresholds</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>High Limit (A)</Text>
            <TextInput
              style={styles.input}
              value={currentHighAlarm}
              onChangeText={setCurrentHighAlarm}
              keyboardType="numeric"
              placeholder="45.0"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Low Limit (A)</Text>
            <TextInput
              style={styles.input}
              value={currentLowAlarm}
              onChangeText={setCurrentLowAlarm}
              keyboardType="numeric"
              placeholder="-45.0"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voltage Thresholds</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>High Limit (V)</Text>
            <TextInput
              style={styles.input}
              value={voltageHighAlarm}
              onChangeText={setVoltageHighAlarm}
              keyboardType="numeric"
              placeholder="15.0"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Low Limit (V)</Text>
            <TextInput
              style={styles.input}
              value={voltageLowAlarm}
              onChangeText={setVoltageLowAlarm}
              keyboardType="numeric"
              placeholder="10.0"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={styles.currentStatus}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current:</Text>
            <Text style={[
              styles.statusValue,
              { color: isAlarmActive ? '#EF4444' : '#10B981' }
            ]}>
              {(deviceData?.current ?? 0).toFixed(2)} A
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Voltage:</Text>
            <Text style={[
              styles.statusValue,
              { color: isAlarmActive ? '#EF4444' : '#10B981' }
            ]}>
              {(deviceData?.voltage ?? 0).toFixed(2)} V
            </Text>
          </View>
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
  alarmBanner: {
    backgroundColor: '#EF444420',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  alarmText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginTop: 8,
  },
  alarmSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FECACA',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
  },
  inputGroup: {
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
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  currentStatus: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  statusValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});