import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Play, Square, Plus, Minus, RotateCcw } from 'lucide-react-native';
import { useBLE } from '@/hooks/useBLE';
import { PIDMonitor } from '@/components/PIDMonitor';

export default function ControlScreen() {
  const { 
    connectionState, 
    testData, 
    testConfig, 
    pidData,
    startTest, 
    stopTest, 
    setTargetCurrent,
    getStatus 
  } = useBLE();

  const [targetCurrent, setLocalTargetCurrent] = useState(testData?.targetCurrent ?? 1.0);
  const isTestRunning = testData?.testStatus === 'RUNNING';
  const isConnected = connectionState.isConnected;

  const handleStartTest = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await startTest();
      Alert.alert('Success', 'Battery test started');
    } catch (error) {
      Alert.alert('Error', 'Failed to start test');
    }
  };

  const handleStopTest = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await stopTest();
      Alert.alert('Success', 'Battery test stopped');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop test');
    }
  };

  const handleCurrentChange = async (newCurrent: number) => {
    if (!isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    if (isTestRunning) {
      Alert.alert('Error', 'Cannot change current during test');
      return;
    }

    const minCurrent = testConfig?.minCurrent ?? 1;
    const maxCurrent = testConfig?.maxCurrent ?? 20;
    
    if (newCurrent < minCurrent || newCurrent > maxCurrent) {
      Alert.alert('Error', `Current must be between ${minCurrent}A and ${maxCurrent}A`);
      return;
    }

    try {
      await setTargetCurrent(newCurrent);
      setLocalTargetCurrent(newCurrent);
    } catch (error) {
      Alert.alert('Error', 'Failed to set target current');
    }
  };

  const handleRefreshStatus = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Device not connected');
      return;
    }

    try {
      await getStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Test Control</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Status</Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isTestRunning ? '#10B981' : '#64748B' }
            ]} />
            <Text style={styles.statusText}>
              {isTestRunning ? 'Test Running' : 'Test Stopped'}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.startButton,
                { opacity: (isConnected && !isTestRunning) ? 1 : 0.5 }
              ]}
              onPress={handleStartTest}
              disabled={!isConnected || isTestRunning}
            >
              <Play size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Start Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.stopButton,
                { opacity: (isConnected && isTestRunning) ? 1 : 0.5 }
              ]}
              onPress={handleStopTest}
              disabled={!isConnected || !isTestRunning}
            >
              <Square size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Stop Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Current</Text>
          
          <View style={styles.currentContainer}>
            <TouchableOpacity
              style={[
                styles.currentButton,
                { opacity: (isConnected && !isTestRunning) ? 1 : 0.5 }
              ]}
              onPress={() => handleCurrentChange(targetCurrent - (testConfig?.currentStep ?? 1))}
              disabled={!isConnected || isTestRunning}
            >
              <Minus size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.currentDisplay}>
              <Text style={styles.currentValue}>{targetCurrent.toFixed(1)}</Text>
              <Text style={styles.currentUnit}>A</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.currentButton,
                { opacity: (isConnected && !isTestRunning) ? 1 : 0.5 }
              ]}
              onPress={() => handleCurrentChange(targetCurrent + (testConfig?.currentStep ?? 1))}
              disabled={!isConnected || isTestRunning}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {testConfig && (
            <Text style={styles.rangeText}>
              Range: {testConfig.minCurrent}A - {testConfig.maxCurrent}A
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Measurements</Text>
          
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Actual Current:</Text>
            <Text style={styles.measurementValue}>
              {(testData?.current ?? 0).toFixed(3)} A
            </Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Target Current:</Text>
            <Text style={styles.measurementValue}>
              {(testData?.targetCurrent ?? 0).toFixed(1)} A
            </Text>
          </View>

          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Current Error:</Text>
            <Text style={[
              styles.measurementValue,
              { color: Math.abs((testData?.targetCurrent ?? 0) - (testData?.current ?? 0)) > 0.1 ? '#EF4444' : '#10B981' }
            ]}>
              {((testData?.targetCurrent ?? 0) - (testData?.current ?? 0)).toFixed(3)} A
            </Text>
          </View>
        </View>

        {pidData && (
          <PIDMonitor pidData={pidData} />
        )}

        <TouchableOpacity
          style={[
            styles.refreshButton,
            { opacity: isConnected ? 1 : 0.5 }
          ]}
          onPress={handleRefreshStatus}
          disabled={!isConnected}
        >
          <RotateCcw size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  currentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
  },
  currentDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  currentValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  currentUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  rangeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  measurementLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  measurementValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  refreshButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
});