import { Modal as RNModal, Text, TextInput, View } from 'react-native';

import type { Locale } from '@/src/i18n';
import { Button, IconCircleButton } from '@/src/ui/atoms';
import { styles } from '@/src/features/catalog/catalog.styles';

type CatalogJoinCodeModalProps = {
  locale: Locale;
  visible: boolean;
  isJoiningRoom: boolean;
  roomCodeInput: string;
  roomCodeError: string | null;
  onClose: () => void;
  onChangeCode: (value: string) => void;
  onConfirm: () => void;
};

export function CatalogJoinCodeModal({
  locale,
  visible,
  isJoiningRoom,
  roomCodeInput,
  roomCodeError,
  onClose,
  onChangeCode,
  onConfirm,
}: CatalogJoinCodeModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-[#18122E73] px-5">
        <View className="gap-[10px] rounded-3xl border border-white/90 bg-white/80 px-[14px] pb-[14px] pt-4">
          <IconCircleButton
            icon="close"
            accessibilityLabel={locale === 'pt' ? 'Fechar modal de código' : 'Close code modal'}
            onPress={onClose}
            tone="neutral"
            size={34}
            iconSize={18}
            style={styles.codeModalCloseButton}
          />

          <Text className="pr-11 font-display text-[30px] leading-[30px] tracking-[0.4px] text-catalog-ink">
            {locale === 'pt' ? 'Entrar com código' : 'Join with code'}
          </Text>
          <Text className="font-body text-[14px] leading-[18px] text-[#4A4A6F]">
            {locale === 'pt'
              ? 'Digite o código da sala para entrar direto no lobby.'
              : 'Type the room code to join the lobby directly.'}
          </Text>

          <TextInput
            value={roomCodeInput}
            onChangeText={onChangeCode}
            placeholder="Ex: 7ZP2K"
            placeholderTextColor="rgba(43,42,70,0.45)"
            className="min-h-[52px] rounded-2xl border bg-white/90 px-[14px] text-center font-number text-[22px] tracking-[1.5px] text-catalog-ink"
            style={[styles.codeModalInput, roomCodeError ? styles.codeModalInputError : null]}
            autoCorrect={false}
            autoCapitalize="characters"
            maxLength={5}
          />

          {roomCodeError ? (
            <Text className="-mt-[2px] font-body text-[12px] leading-[16px] text-[#C73961]">
              {roomCodeError}
            </Text>
          ) : null}

          <Button
            label={
              isJoiningRoom
                ? locale === 'pt'
                  ? 'ENTRANDO...'
                  : 'JOINING...'
                : locale === 'pt'
                  ? 'CONFIRMAR'
                  : 'CONFIRM'
            }
            onPress={onConfirm}
            disabled={isJoiningRoom}
            variant="primary"
            size="lg"
            style={[styles.codeModalConfirmButton, isJoiningRoom ? styles.modeButtonDisabled : null]}
          />
        </View>
      </View>
    </RNModal>
  );
}
