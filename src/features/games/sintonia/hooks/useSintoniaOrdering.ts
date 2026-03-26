import * as Haptics from 'expo-haptics';
import { Dispatch, MutableRefObject, SetStateAction, useCallback, useState } from 'react';

import { movePlayerId } from '@/src/features/games/sintonia/logic';
import { SintoniaPhase } from '@/src/features/games/sintonia/types';
import { setRemoteSintoniaOrder } from '@/src/features/games/sintonia/realtime';

const CARD_DROP_VERTICAL_STEP = 92;
const ORDERING_GRID_ROW_GAP = 4;
const ORDERING_GRID_COLUMN_GAP = 10;
const ORDER_SYNC_DEBOUNCE_MS = 90;

type UseSintoniaOrderingParams = {
  phase: SintoniaPhase;
  orderingGridColumns: number;
  isRemoteRealtime: boolean;
  roomCode: string;
  localDeviceId: string;
  orderSyncTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setOrderedPlayerIds: Dispatch<SetStateAction<string[]>>;
};

export function useSintoniaOrdering({
  phase,
  orderingGridColumns,
  isRemoteRealtime,
  roomCode,
  localDeviceId,
  orderSyncTimerRef,
  setOrderedPlayerIds,
}: UseSintoniaOrderingParams) {
  const [orderingCardMetrics, setOrderingCardMetrics] = useState<{ width: number; height: number } | null>(
    null
  );

  const handleOrderingCardMeasure = useCallback((layout: { width: number; height: number }) => {
    setOrderingCardMetrics((current) => {
      if (
        current &&
        Math.abs(current.width - layout.width) < 1 &&
        Math.abs(current.height - layout.height) < 1
      ) {
        return current;
      }

      return layout;
    });
  }, []);

  const onDropPlayer = useCallback(
    (playerId: string, dragX: number, dragY: number): boolean => {
      if (phase !== 'ordering') {
        return false;
      }

      let moved = false;

      setOrderedPlayerIds((currentOrder) => {
        const fromIndex = currentOrder.indexOf(playerId);
        if (fromIndex < 0) {
          return currentOrder;
        }

        const fallbackColumnStep = orderingGridColumns === 4 ? 92 : orderingGridColumns === 3 ? 118 : 164;
        const columnStep = (orderingCardMetrics?.width ?? fallbackColumnStep) + ORDERING_GRID_COLUMN_GAP;
        const rowStep = (orderingCardMetrics?.height ?? CARD_DROP_VERTICAL_STEP) + ORDERING_GRID_ROW_GAP;
        const deltaColumns = Math.round(dragX / columnStep);
        const deltaRows = Math.round(dragY / rowStep);
        const deltaSlots = deltaRows * orderingGridColumns + deltaColumns;

        if (deltaSlots === 0) {
          return currentOrder;
        }

        const toIndex = Math.max(0, Math.min(currentOrder.length - 1, fromIndex + deltaSlots));
        if (toIndex === fromIndex) {
          return currentOrder;
        }

        const nextOrder = movePlayerId(currentOrder, fromIndex, toIndex);
        moved = true;

        if (isRemoteRealtime) {
          if (orderSyncTimerRef.current) {
            clearTimeout(orderSyncTimerRef.current);
          }

          orderSyncTimerRef.current = setTimeout(() => {
            void setRemoteSintoniaOrder(roomCode, nextOrder, localDeviceId).catch(() => undefined);
          }, ORDER_SYNC_DEBOUNCE_MS);
        }

        void Haptics.selectionAsync();
        return nextOrder;
      });

      return moved;
    },
    [
      isRemoteRealtime,
      localDeviceId,
      orderSyncTimerRef,
      orderingCardMetrics,
      orderingGridColumns,
      phase,
      roomCode,
      setOrderedPlayerIds,
    ]
  );

  return {
    handleOrderingCardMeasure,
    onDropPlayer,
  };
}


