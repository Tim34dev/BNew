import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Battery, Clock, Zap, Target } from 'lucide-react-native';

interface TestProgressProps {
  capacity: number;
  elapsedTime: number;
  voltage: number;
  current: number;
  targetCurrent: number;
}

export function TestProgress({
  capacity,
  elapsedTime,
  voltage,
  current,
  targetCurrent
}: TestProgressProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentError = Math.abs(targetCurrent - current);
  const currentAccuracy = currentError < 0.1 ? 'Excellent' : currentError < 0.2 ? 'Good' : 'Adjusting';
  const accuracyColor = currentError < 0.1 ? '#10B981' : currentError < 0.2 ? '#F59E0B' : '#EF4444';

  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Battery size={24} color="#FBBF24" />
        <Text style={styles.title}>Test in Progress</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Battery size={20} color="#FBBF24" />
          </View>
          <Text style={styles.metricValue}>{capacity.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>mAh</Text>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Clock size={20} color="#06B6D4" />
          </View>
          <Text style={styles.metricValue}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Zap size={20} color="#10B981" />
          </View>
          <Text style={styles.metricValue}>{voltage.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Volts</Text>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Target size={20} color={accuracyColor} />
          </View>
          <Text style={[styles.metricValue, { color: accuracyColor }]}>
            {current.toFixed(2)}
          </Text>
          <Text style={styles.metricLabel}>Amps</Text>
        </View>
      </View>

      <View style={styles.accuracyContainer}>
        <Text style={styles.accuracyLabel}>Current Control: </Text>
        <Text style={[styles.accuracyValue, { color: accuracyColor }]}>
          {currentAccuracy}
        </Text>
        <Text style={styles.accuracyError}>
          (±{currentError.toFixed(3)}A)
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3B82F6',
  },
  accuracyLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#E2E8F0',
  },
  accuracyValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginRight: 8,
  },
  accuracyError: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
  },
});