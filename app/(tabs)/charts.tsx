import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryArea } from 'victory-native';
import { useBLE } from '@/hooks/useBLE';
import { useState, useEffect } from 'react';
import { DataPoint } from '@/types/ble';

const { width } = Dimensions.get('window');

export default function ChartsScreen() {
  const { testData, connectionState } = useBLE();
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (testData && connectionState.isConnected && testData.testStatus === 'RUNNING') {
      const newPoint: DataPoint = {
        timestamp: Date.now(),
        voltage: testData.voltage,
        current: testData.current,
        capacity: testData.capacity,
      };

      setDataHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 100 points
        return updated.slice(-100);
      });
    }
  }, [testData, connectionState.isConnected]);

  const voltageData = dataHistory.map((point, index) => ({
    x: index,
    y: point.voltage,
  }));

  const currentData = dataHistory.map((point, index) => ({
    x: index,
    y: point.current,
  }));

  const capacityData = dataHistory.map((point, index) => ({
    x: index,
    y: point.capacity,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Real-time Charts</Text>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Battery Voltage (V)</Text>
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
            <VictoryLine
              data={voltageData}
              style={{
                data: { stroke: "#10B981", strokeWidth: 2 }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
            />
          </VictoryChart>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Discharge Current (A)</Text>
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
              data={currentData}
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

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Capacity (mAh)</Text>
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
            <VictoryArea
              data={capacityData}
              style={{
                data: { 
                  fill: "#8B5CF6", 
                  fillOpacity: 0.3,
                  stroke: "#8B5CF6",
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

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dataHistory.length}
            </Text>
            <Text style={styles.statLabel}>Data Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dataHistory.length > 0 ? 
                Math.max(...dataHistory.map(d => d.voltage)).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.statLabel}>Peak Voltage (V)</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dataHistory.length > 0 ? 
                Math.min(...dataHistory.map(d => d.voltage)).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.statLabel}>Min Voltage (V)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dataHistory.length > 0 ? 
                (dataHistory.reduce((sum, d) => sum + d.current, 0) / dataHistory.length).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.statLabel}>Avg Current (A)</Text>
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
    color: '#FBBF24',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    textAlign: 'center',
  },
});