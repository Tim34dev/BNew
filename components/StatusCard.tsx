import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video as LucideIcon } from 'lucide-react-native';

interface StatusCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
  trend?: 'up' | 'down' | 'stable';
}

export function StatusCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  backgroundColor,
  trend
}: StatusCardProps) {
  return (
    <LinearGradient
      colors={[backgroundColor, backgroundColor + '80']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Icon size={24} color={color} />
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={[styles.unit, { color }]}>{unit}</Text>
      </View>

      {trend && (
        <View style={styles.trendContainer}>
          <View style={[styles.trendDot, { backgroundColor: color }]} />
          <Text style={[styles.trendText, { color }]}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    opacity: 0.9,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  unit: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});