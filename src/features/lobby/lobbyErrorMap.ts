export const mapRealtimeMessage = (message: string, fallbackMessage: string): string => {
  const normalized = message.trim();

  if (!normalized) {
    return fallbackMessage;
  }

  const lowered = normalized.toLowerCase();

  if (lowered.includes('permission denied') || lowered.includes('sem permiss') || lowered.includes('rules')) {
    return 'Sem permissão para concluir essa ação nesta sala.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('network') ||
    lowered.includes('offline') ||
    lowered.includes('disconnected') ||
    lowered.includes('reconnect')
  ) {
    return 'Conexão instável. Tente novamente em alguns segundos.';
  }

  if (
    lowered.includes('invalid lobby structure') ||
    lowered.includes('dados incompletos') ||
    lowered.includes('payload')
  ) {
    return 'A sala recebeu dados incompletos. Aguarde a próxima sincronização.';
  }

  return normalized;
};

export const resolveRealtimeMessage = (error: unknown, fallbackMessage: string): string =>
  mapRealtimeMessage(error instanceof Error && error.message ? error.message : fallbackMessage, fallbackMessage);
