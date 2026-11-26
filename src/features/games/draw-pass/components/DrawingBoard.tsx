import { SymbolView } from 'expo-symbols';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';

import { drawPassStyles as styles } from '@/src/features/games/draw-pass/styles/drawPassStyles';
import { Point, Stroke } from '@/src/features/games/draw-pass/types/drawPass.types';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { triggerHaptic } from '@/src/ui/feedback';

const PALETTE_COLORS = ['#181C3A', '#F43F5E', '#0EA5E9', '#10B981', '#F97316', '#8B5CF6'];
const BRUSH_SIZES = [3, 6, 11];

type DrawingBoardProps = {
  strokes: Stroke[];
  interactive: boolean;
  compact?: boolean;
  isPt?: boolean;
  onAddStroke?: (stroke: Stroke) => void;
  onClear?: () => void;
};

function renderStrokeSegments(stroke: Stroke, strokeIndex: number) {
  return stroke.points.map((pt, ptIndex) => {
    if (ptIndex === 0) {
      return (
        <View
          key={`dot-${strokeIndex}-0`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: pt.x - stroke.size / 2,
            top: pt.y - stroke.size / 2,
            width: stroke.size,
            height: stroke.size,
            borderRadius: stroke.size / 2,
            backgroundColor: stroke.color,
          }}
        />
      );
    }
    const prev = stroke.points[ptIndex - 1];
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    const length = Math.max(Math.hypot(dx, dy), stroke.size);
    const angle = Math.atan2(dy, dx);
    return (
      <View
        key={`seg-${strokeIndex}-${ptIndex}`}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (prev.x + pt.x) / 2 - length / 2,
          top: (prev.y + pt.y) / 2 - stroke.size / 2,
          width: length,
          height: stroke.size,
          borderRadius: stroke.size / 2,
          backgroundColor: stroke.color,
          transform: [{ rotate: `${angle}rad` }],
        }}
      />
    );
  });
}

export function DrawingBoard({
  strokes,
  interactive,
  compact = false,
  isPt = true,
  onAddStroke,
  onClear,
}: DrawingBoardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('draw-pass');

  const [activeColor, setActiveColor] = useState(PALETTE_COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [activePoints, setActivePoints] = useState<Point[]>([]);

  const activePointsRef = useRef<Point[]>([]);
  const activeColorRef = useRef(activeColor);
  const brushSizeRef = useRef(brushSize);
  activeColorRef.current = activeColor;
  brushSizeRef.current = brushSize;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => interactive,
        onMoveShouldSetPanResponder: () => interactive,
        onPanResponderGrant: (evt) => {
          if (!interactive) return;
          const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
          activePointsRef.current = [pt];
          setActivePoints([pt]);
        },
        onPanResponderMove: (evt) => {
          if (!interactive) return;
          const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
          activePointsRef.current = [...activePointsRef.current, pt];
          setActivePoints(activePointsRef.current);
        },
        onPanResponderRelease: () => {
          if (!interactive || activePointsRef.current.length === 0) return;
          onAddStroke?.({
            color: activeColorRef.current,
            size: brushSizeRef.current,
            points: activePointsRef.current,
          });
          activePointsRef.current = [];
          setActivePoints([]);
        },
      }),
    [interactive, onAddStroke]
  );

  const allStrokes = useMemo(
    () =>
      activePoints.length > 0
        ? [...strokes, { color: activeColor, size: brushSize, points: activePoints }]
        : strokes,
    [activeColor, activePoints, brushSize, strokes]
  );

  return (
    <View style={styles.boardWrapper}>
      <View
        style={[
          styles.canvasFrame,
          compact && styles.canvasCompact,
          interactive ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
          { borderColor: theme.semantic.border.hairline },
        ]}
        {...panResponder.panHandlers}>
        {interactive && allStrokes.length === 0 ? (
          <View pointerEvents="none" style={styles.canvasHint}>
            <SymbolView
              name={{ ios: 'pencil.tip', android: 'edit', web: 'edit' }}
              size={22}
              tintColor={theme.semantic.text.muted}
            />
            <Text style={[styles.canvasHintText, { color: theme.semantic.text.muted }]}>
              {isPt ? 'Desenhe com o dedo aqui' : 'Draw with your finger here'}
            </Text>
          </View>
        ) : null}
        {allStrokes.map(renderStrokeSegments)}
      </View>

      {interactive ? (
        <View
          style={[
            styles.toolbarCard,
            { backgroundColor: theme.semantic.bg.subtle, borderColor: theme.semantic.border.hairline },
          ]}>
          <View style={styles.paletteRow}>
            {PALETTE_COLORS.map((color) => {
              const isSelected = activeColor === color;
              return (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setActiveColor(color);
                    triggerHaptic('selection');
                  }}
                  style={[
                    styles.colorDotOuter,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      borderColor: isSelected ? accent.primary : 'transparent',
                    },
                  ]}>
                  <View style={[styles.colorDotInner, { backgroundColor: color }]} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.brushToolbarRow}>
            <View style={styles.brushGroup}>
              {BRUSH_SIZES.map((size) => {
                const isSelected = brushSize === size;
                return (
                  <Pressable
                    key={`brush-${size}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setBrushSize(size);
                      triggerHaptic('selection');
                    }}
                    style={[
                      styles.brushChip,
                      {
                        backgroundColor: isSelected ? accent.tint : theme.semantic.bg.surface,
                        borderColor: isSelected ? accent.primary : theme.semantic.border.hairline,
                      },
                    ]}>
                    <View
                      style={{
                        width: size + 4,
                        height: size + 4,
                        borderRadius: 999,
                        backgroundColor: activeColor,
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>

            {onClear ? (
              <Pressable
                accessibilityRole="button"
                disabled={strokes.length === 0}
                onPress={onClear}
                style={[
                  styles.clearButton,
                  {
                    backgroundColor: theme.semantic.bg.surface,
                    borderColor: theme.semantic.border.hairline,
                    opacity: strokes.length === 0 ? 0.45 : 1,
                  },
                ]}>
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={13}
                  tintColor={theme.semantic.text.secondary}
                />
                <Text style={[styles.clearButtonText, { color: theme.semantic.text.secondary }]}>
                  {isPt ? 'Limpar' : 'Clear'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
