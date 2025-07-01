import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryArea } from 'victory-native';
import { useBLE } from '@/hooks/useBLE';
import { useState, useEffect } from 'react';
import { DataPoint } from '@/types/ble';

const { width } = Dimensions.get('window');

export default function ChartsScreen() {
  const { deviceData, connectionState } = useBLE();
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (deviceData && connectionState.isConnected) {
      const newPoint: DataPoint = {
        timestamp: Date.now(),
        current: deviceData.current,
        voltage: deviceData.voltage,
        power: deviceData.power,
      };

      setDataHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 50 points
        return updated.slice(-50);
      });
    }
  }, [deviceData, connectionState.isConnected]);

  const chartData = dataHistory.map((point, index) => ({
    x: index,
    y: point.current,
    voltage: point.voltage,
    power: point.power,
  }));

  const powerData = dataHistory.map((point, index) => ({
    x: index,
    y: point.power,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Real-time Data</Text>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Current (A)</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={200}
            width={width - 40}
            padding={{ left: 60, top: 20, right: 40, bottom: 40 }}
            style={{
              background: { fill: "#1E293B" }
            }}
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#64748B" },
                tickLabels: { fill: "#94A3B8", fontSize: 12 },
                grid: { stroke: "#334155", strokeWidth: 0.5 }
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: "#64748B" },
                tickLabels: { fill: "#94A3B8", fontSize: 12 },
              }}
            />
            <VictoryArea
              data={chartData}
              style={{
                data: { 
                  fill: "#0EA5E9", 
                  fillOpacity: 0.2,
                  stroke: "#0EA5E9",
                  strokeWidth: 2 
                }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
            />
          </VictoryChart>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Power (W)</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={200}
            width={width - 40}
            padding={{ left: 60, top: 20, right: 40, bottom: 40 }}
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#64748B" },
                tickLabels: { fill: "#94A3B8", fontSize: 12 },
                grid: { stroke: "#334155", strokeWidth: 0.5 }
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: "#64748B" },
                tickLabels: { fill: "#94A3B8", fontSize: 12 },
              }}
            />
            <VictoryLine
              data={powerData}
              style={{
                data: { stroke: "#F59E0B", strokeWidth: 2 }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
            />
          </VictoryChart>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {(deviceData?.peakCurrent ?? 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Peak Current (A)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {(deviceData?.peakVoltage ?? 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Peak Voltage (V)</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.floor((deviceData?.uptime ?? 0) / 60)}
            </Text>
            <Text style={styles.statLabel}>Uptime (min)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dataHistory.length}
            </Text>
            <Text style={styles.statLabel}>Data Points</Text>
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
  chartContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1E293B',
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    textAlign: 'center',
  },
});