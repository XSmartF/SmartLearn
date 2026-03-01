import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Brand } from '@/constants/theme';

interface ResultStatProps {
  icon: string;
  color: string;
  label: string;
  value: string;
}

export function ResultStat({ icon, color, label, value }: ResultStatProps) {
  return (
    <View style={styles.item}>
      <MaterialIcons name={icon as any} size={22} color={color} />
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', gap: 4 },
  value: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 12, color: Brand.gray400, fontWeight: '700' },
});
