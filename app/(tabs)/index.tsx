import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatusCard } from '@/components/StatusCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { CircularGauge } from '@/components/CircularGauge';
import { TestProgress } from '@/components/TestProgress';
import { useBLE } from '@/hooks/useBLE';
import { Battery, Zap, Clock, Activity } from 'lucide-react-native';

export default function TestScreen() {
  const {
    connectionState,
    testData,
    testConfig,
    isScanning,
    availableDevices,
    startScanning,
    connectToDevice,
    disconnect,
    getStatus,
  } = useBLE();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (connectionState.isConnected) {
      try {
        await getStatus();
      } catch (error) {
        console.error('Refresh error:', error);
      }
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const voltage = testData?.voltage ?? 0;
  const current = testData?.current ?? 0;
  const capacity = testData?.capacity ?? 0;
  const targetCurrent = testData?.targetCurrent ?? 0;
  const isTestRunning = testData?.testStatus === 'RUNNING';

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FBBF24"
            colors={['#FBBF24']}
          />
        }
      >
        <ConnectionStatus
          connectionState={connectionState}
          isScanning={isScanning}
          availableDevices={availableDevices}
          onConnect={startScanning}
          onDisconnect={disconnect}
          onDeviceSelect={connectToDevice}
        />

        {isTestRunning && (
          <TestProgress
            capacity={capacity}
            elapsedTime={testData?.elapsedTime ?? 0}
            voltage={voltage}
            current={current}
            targetCurrent={targetCurrent}
          />
        )}

        <View style={styles.gaugeContainer}>
          <CircularGauge
            value={voltage}
            maxValue={testConfig?.cutoffVoltage ? testConfig.cutoffVoltage + 5 : 15}
            size={120}
            strokeWidth={8}
            color="#10B981"
            backgroundColor="#1E40AF"
            title="Voltage"
            unit="V"
          />
          <CircularGauge
            value={current}
            maxValue={testConfig?.maxCurrent ?? 20}
            size={120}
            strokeWidth={8}
            color="#F59E0B"
            backgroundColor="#1E40AF"
            title="Current"
            unit="A"
          />
        </View>

        <StatusCard
          title="Battery Voltage"
          value={voltage.toFixed(3)}
          unit="V"
          icon={Battery}
          color="#10B981"
          backgroundColor="#10B98120"
          trend={isTestRunning ? (voltage > 12 ? 'stable' : 'down') : 'stable'}
        />

        <StatusCard
          title="Discharge Current"
          value={current.toFixed(3)}
          unit="A"
          icon={Zap}
          color="#F59E0B"
          backgroundColor="#F59E0B20"
          trend={isTestRunning ? 'stable' : 'stable'}
        />

        <StatusCard
          title="Capacity Measured"
          value={capacity.toFixed(0)}
          unit="mAh"
          icon={Activity}
          color="#8B5CF6"
          backgroundColor="#8B5CF620"
          trend={isTestRunning ? 'up' : 'stable'}
        />

        <StatusCard
          title="Test Duration"
          value={formatTime(testData?.elapsedTime ?? 0)}
          unit=""
          icon={Clock}
          color="#06B6D4"
          backgroundColor="#06B6D420"
          trend={isTestRunning ? 'up' : 'stable'}
        />

        {testData?.internalResistance && (
          <StatusCard
            title="Internal Resistance"
            value={(testData.internalResistance * 1000).toFixed(1)}
            unit="mΩ"
            icon={Activity}
            color="#EF4444"
            backgroundColor="#EF444420"
            trend="stable"
          />
        )}
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
  gaugeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
});