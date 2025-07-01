import { View, Text, StyleSheet } from 'react-native';
import { PIDData } from '@/types/ble';
import { Settings, TrendingUp, Target } from 'lucide-react-native';

interface PIDMonitorProps {
  pidData: PIDData;
}

export function PIDMonitor({ pidData }: PIDMonitorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings size={20} color="#8B5CF6" />
        <Text style={styles.title}>PID Controller</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Target size={16} color="#EF4444" />
          </View>
          <Text style={styles.metricValue}>{pidData.error.toFixed(3)}</Text>
          <Text style={styles.metricLabel}>Error (A)</Text>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <TrendingUp size={16} color="#10B981" />
          </View>
          <Text style={styles.metricValue}>{pidData.output.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>PWM Output</Text>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Settings size={16} color="#F59E0B" />
          </View>
          <Text style={styles.metricValue}>{pidData.integral.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Integral</Text>
        </View>
      </View>

      {pidData.pTerm !== undefined && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>PID Terms</Text>
          
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>P Term:</Text>
            <Text style={styles.termValue}>{pidData.pTerm.toFixed(2)}</Text>
          </View>
          
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>I Term:</Text>
            <Text style={styles.termValue}>{pidData.iTerm?.toFixed(2) ?? '0.00'}</Text>
          </View>
          
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>D Term:</Text>
            <Text style={styles.termValue}>{pidData.dTerm?.toFixed(2) ?? '0.00'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    textAlign: 'center',
  },
  detailsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  termLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  termValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});