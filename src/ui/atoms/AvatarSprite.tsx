import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { resolveAvatarAsset } from '@/src/features/lobby/avatarCatalog';

type AvatarSpriteProps = {
  avatarId: number;
  size: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function AvatarSprite({ avatarId, size, style, imageStyle }: AvatarSpriteProps) {
  const avatarSource = resolveAvatarAsset(avatarId);

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}>
      <Image
        source={avatarSource}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
