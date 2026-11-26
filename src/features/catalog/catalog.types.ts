import type { GameCatalogItem } from '@/src/features/catalog/games';
import type { Locale } from '@/src/i18n';

export type CatalogCardVariant = 'grid' | 'wide';

export type CatalogState = {
  nickname: string;
  avatarId: number;
  nicknameDraft: string;
  isEditingNickname: boolean;
  isAvatarPickerVisible: boolean;
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  isCodeModalVisible: boolean;
  roomCodeInput: string;
  roomCodeError: string | null;
  readyGames: GameCatalogItem[];
};

export type CatalogHandlers = {
  openSettings: () => void;
  setNicknameDraft: (value: string) => void;
  startNicknameEditing: () => void;
  commitNicknameEdit: () => void;
  openAvatarPicker: () => void;
  closeAvatarPicker: () => void;
  selectAvatar: (avatarId: number) => void;
  shuffleNickname: () => void;
  openJoinCodeModal: () => void;
  closeJoinCodeModal: () => void;
  setRoomCodeInput: (value: string) => void;
  joinByCode: () => Promise<void>;
  openGame: (game: GameCatalogItem) => Promise<void>;
};

export type UseCatalogScreenResult = {
  locale: Locale;
  state: CatalogState;
  handlers: CatalogHandlers;
};
