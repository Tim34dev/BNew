import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { useState, useEffect } from 'react';
import { Battery, Zap, Clock, TrendingUp, RotateCcw } from 'lucide-react-native';
import { useBLE } from '@/hooks/useBLE';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function EnergyScreen() {
  const { deviceData, resetStatistics } = useBLE();
  const [energyHistory, setEnergyHistory] = useState([{ x: 0, y: 0 }]);

  useEffect(() => {
    if (deviceData) {
      const newPoint = {
        x: energyHistory.length,
        y: deviceData.energy || 0,
      };
      
      setEnergyHistory(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-24); // Keep last 24 hours
      });
    }
  }, [deviceData?.energy]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const energyConsumption = deviceData?.energy ?? 0;
  const currentPower = (deviceData?.current ?? 0) * (deviceData?.voltage ?? 0);
  const uptime = deviceData?.uptime ?? 0;
  const averagePower = uptime > 0 ? (energyConsumption * 3600) / uptime : 0;

  const handleReset = async () => {
    try {
      await resetStatistics();
      setEnergyHistory([{ x: 0, y: 0 }]);
    } catch (error) {
      console.error('Error resetting statistics:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Energy Monitor</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Energy Consumption (Wh)</Text>
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
              data={energyHistory}
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

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Battery size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.metricValue}>
              {energyConsumption.toFixed(3)}
            </Text>
            <Text style={styles.metricLabel}>Total Energy (Wh)</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Zap size={24} color="#F59E0B" />
            </View>
            <Text style={styles.metricValue}>
              {currentPower.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Current Power (W)</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <Text style={styles.metricValue}>
              {averagePower.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Avg Power (W)</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Clock size={24} color="#0EA5E9" />
            </View>
            <Text style={styles.metricValue}>
              {formatUptime(uptime)}
            </Text>
            <Text style={styles.metricLabel}>Uptime</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Energy Analysis</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Peak Power:</Text>
            <Text style={styles.detailValue}>
              {((deviceData?.peakCurrent ?? 0) * (deviceData?.peakVoltage ?? 0)).toFixed(1)} W
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Min Power:</Text>
            <Text style={styles.detailValue}>
              {((deviceData?.minCurrent ?? 0) * (deviceData?.minVoltage ?? 0)).toFixed(1)} W
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Energy Rate:</Text>
            <Text style={styles.detailValue}>
              {(currentPower * 24).toFixed(1)} Wh/day
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost Estimate:</Text>
            <Text style={styles.detailValue}>
              ${(energyConsumption * 0.12).toFixed(4)}
            </Text>
            <Text style={styles.detailSubtext}>@ $0.12/kWh</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
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
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#1E293B',
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  detailSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 8,
  },
});