import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatusCard } from '@/components/StatusCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { CircularGauge } from '@/components/CircularGauge';
import { useBLE } from '@/hooks/useBLE';
import { Activity, Zap, Gauge, TrendingUp } from 'lucide-react-native';

export default function MonitorScreen() {
  const {
    connectionState,
    deviceData,
    isScanning,
    availableDevices,
    startScanning,
    connectToDevice,
    disconnect,
  } = useBLE();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (connectionState.isConnected) {
      // Request fresh data from device
      try {
        // The useBLE hook will handle sending STATUS command
      } catch (error) {
        console.error('Refresh error:', error);
      }
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const currentValue = deviceData?.current ?? 0;
  const voltageValue = deviceData?.voltage ?? 0;
  const powerValue = deviceData?.power ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0EA5E9"
            colors={['#0EA5E9']}
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

        <View style={styles.gaugeContainer}>
          <CircularGauge
            value={Math.abs(currentValue)}
            maxValue={50}
            size={120}
            strokeWidth={8}
            color="#0EA5E9"
            backgroundColor="#1E293B"
            title="Current"
            unit="A"
          />
          <CircularGauge
            value={voltageValue}
            maxValue={15}
            size={120}
            strokeWidth={8}
            color="#10B981"
            backgroundColor="#1E293B"
            title="Voltage"
            unit="V"
          />
        </View>

        <StatusCard
          title="Current"
          value={currentValue.toFixed(2)}
          unit="A"
          icon={Activity}
          color="#0EA5E9"
          backgroundColor="#0EA5E920"
          trend="stable"
        />

        <StatusCard
          title="Voltage"
          value={voltageValue.toFixed(2)}
          unit="V"
          icon={Zap}
          color="#10B981"
          backgroundColor="#10B98120"
          trend="stable"
        />

        <StatusCard
          title="Power"
          value={powerValue.toFixed(1)}
          unit="W"
          icon={Gauge}
          color="#F59E0B"
          backgroundColor="#F59E0B20"
          trend="up"
        />

        <StatusCard
          title="Energy"
          value={(deviceData?.energy ?? 0).toFixed(3)}
          unit="Wh"
          icon={TrendingUp}
          color="#8B5CF6"
          backgroundColor="#8B5CF620"
          trend="up"
        />
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