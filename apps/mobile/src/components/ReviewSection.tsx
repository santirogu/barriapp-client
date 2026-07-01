import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@barriapp/api-client';
import { useCreateReview } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Stars, colors } from './ui';

type Target = 'store' | 'collaborator';

function RateCard({ orderId, target, label }: { orderId: string; target: Target; label: string }) {
  const createReview = useCreateReview();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (stars < 1) {
      setError('Elige de 1 a 5 estrellas.');
      return;
    }
    try {
      await createReview.mutateAsync({
        order_id: orderId,
        target_type: target,
        stars,
        comment: comment.trim() || null,
      });
      setDone(true);
    } catch (e) {
      // Treat an existing review as already done.
      if (e instanceof ApiError && e.code === 'already_reviewed') {
        setDone(true);
        return;
      }
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar la calificación.');
    }
  }

  if (done) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.thanks}>¡Gracias por tu calificación! ✓</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Stars value={stars} onChange={setStars} />
      <Field label="Comentario (opcional)" value={comment} onChangeText={setComment} placeholder="¿Cómo estuvo?" />
      <ErrorText>{error}</ErrorText>
      <Button title="Enviar calificación" onPress={submit} loading={createReview.isPending} />
    </View>
  );
}

/** Review prompt shown on a delivered order: rate the store and (if any) the courier. */
export function ReviewSection({
  orderId,
  hasCollaborator,
}: {
  orderId: string;
  hasCollaborator: boolean;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.title}>Califica tu pedido</Text>
      <RateCard orderId={orderId} target="store" label="La tienda" />
      {hasCollaborator && (
        <RateCard orderId={orderId} target="collaborator" label="El repartidor" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', marginTop: 20, color: colors.text },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  thanks: { color: colors.primaryDark, fontWeight: '600' },
});
