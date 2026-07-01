import { StyleSheet, Text, View } from 'react-native';
import { formatCOP } from '@barriapp/shared';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarriApp</Text>
      <Text style={styles.subtitle}>Tu barrio, a domicilio.</Text>
      <Text style={styles.hint}>Pedido de ejemplo: {formatCOP(25000)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, opacity: 0.7 },
  hint: { fontSize: 14, opacity: 0.5, marginTop: 12 },
});
