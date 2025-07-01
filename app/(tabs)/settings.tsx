import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Bluetooth, Info, Database } from 'lucide-react-native';
import { useBLE } from '@/hooks/useBLE';

export default function SettingsScreen() {
  const { connectionState, testConfig, testResult, getConfig } = useBLE();

  const handleGetConfig = async () => {
    if (!connectionState.isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await getConfig();
      Alert.alert('Success', 'Configuration refreshed');
    } catch (error) {
      Alert.alert('Error', 'Failed to get configuration');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bluetooth size={20} color="#3B82F6" />
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
            <Settings size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Device Configuration</Text>
          </View>
          
          {testConfig ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Max Current:</Text>
                <Text style={styles.infoValue}>{testConfig.maxCurrent} A</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Min Current:</Text>
                <Text style={styles.infoValue}>{testConfig.minCurrent} A</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cutoff Voltage:</Text>
                <Text style={styles.infoValue}>{testConfig.cutoffVoltage} V</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Step:</Text>
                <Text style={styles.infoValue}>{testConfig.currentStep} A</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No configuration data available</Text>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              { opacity: connectionState.isConnected ? 1 : 0.5 }
            ]}
            onPress={handleGetConfig}
            disabled={!connectionState.isConnected}
          >
            <Text style={styles.actionButtonText}>Refresh Configuration</Text>
          </TouchableOpacity>
        </View>

        {testResult && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Database size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Last Test Results</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Final Capacity:</Text>
              <Text style={styles.infoValue}>{testResult.finalCapacity.toFixed(0)} mAh</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Test Duration:</Text>
              <Text style={styles.infoValue}>
                {Math.floor(testResult.testDuration / 3600)}h {Math.floor((testResult.testDuration % 3600) / 60)}m
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Final Voltage:</Text>
              <Text style={styles.infoValue}>{testResult.finalVoltage.toFixed(3)} V</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Open Circuit Voltage:</Text>
              <Text style={styles.infoValue}>{testResult.openCircuitVoltage.toFixed(3)} V</Text>
            </View>
            
            {testResult.internalResistance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Internal Resistance:</Text>
                <Text style={styles.infoValue}>
                  {(testResult.internalResistance * 1000).toFixed(1)} mΩ
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <Text style={styles.aboutText}>
            Battery Capacity Tester v1.0{'\n'}
            Professional battery testing system with precise current control, 
            real-time monitoring, and comprehensive analysis.{'\n\n'}
            This app connects to Arduino-based battery testers using JDY-23 BLE modules 
            for wireless control and data collection.
          </Text>
          
          <View style={styles.specsList}>
            <Text style={styles.specTitle}>Device Specifications</Text>
            <Text style={styles.specItem}>• Current Range: 1-20A (configurable)</Text>
            <Text style={styles.specItem}>• Voltage Range: 0-24V</Text>
            <Text style={styles.specItem}>• Cutoff Voltage: 10V (configurable)</Text>
            <Text style={styles.specItem}>• Resolution: 12-bit ADC with oversampling</Text>
            <Text style={styles.specItem}>• Communication: JDY-23 BLE</Text>
            <Text style={styles.specItem}>• Control: PID-based current regulation</Text>
            <Text style={styles.specItem}>• Service UUID: 0000FFE0-0000-1000-8000-00805F9B34FB</Text>
            <Text style={styles.specItem}>• Characteristic UUID: 0000FFE1-0000-1000-8000-00805F9B34FB</Text>
          </View>
          
          <Text style={styles.copyrightText}>
            © 2025 Battery Capacity Tester Pro
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
  noDataText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  specsList: {
    marginBottom: 16,
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
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});