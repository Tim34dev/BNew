import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CircularGaugeProps {
  value: number;
  maxValue: number;
  minValue?: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  title: string;
  unit: string;
  showValue?: boolean;
}

export function CircularGauge({
  value,
  maxValue,
  minValue = 0,
  size,
  strokeWidth,
  color,
  backgroundColor,
  title,
  unit,
  showValue = true
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(minValue, Math.min(maxValue, value));
  const progress = (normalizedValue - minValue) / (maxValue - minValue);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {showValue && (
        <View style={styles.content}>
          <Text style={styles.value}>
            {normalizedValue.toFixed(1)}
          </Text>
          <Text style={[styles.unit, { color }]}>{unit}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  unit: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  title: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});