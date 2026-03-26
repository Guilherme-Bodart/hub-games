'use strict';

const React = require('react');
const { Text, View } = require('react-native');

const createAnimationBuilder = () => {
  const builder = {
    duration: () => builder,
    delay: () => builder,
    springify: () => builder,
    damping: () => builder,
    stiffness: () => builder,
    easing: () => builder,
    rotate: () => builder,
    withCallback: () => builder,
    withInitialValues: () => builder,
    randomDelay: () => builder,
  };

  return builder;
};

const AnimatedView = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));
const AnimatedText = React.forwardRef((props, ref) => React.createElement(Text, { ...props, ref }));

const Animated = {
  View: AnimatedView,
  Text: AnimatedText,
};

const Easing = {
  linear: (value) => value,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
  cubic: (value) => value,
};

module.exports = {
  __esModule: true,
  default: Animated,
  Easing,
  Extrapolation: {
    EXTEND: 'extend',
    CLAMP: 'clamp',
    IDENTITY: 'identity',
  },
  FadeIn: createAnimationBuilder(),
  FadeOut: createAnimationBuilder(),
  FadeInDown: createAnimationBuilder(),
  FadeOutUp: createAnimationBuilder(),
  FadeInUp: createAnimationBuilder(),
  Layout: createAnimationBuilder(),
  interpolate: () => 0,
  useAnimatedStyle: (updater) => updater(),
  useSharedValue: (value) => ({ value }),
  withRepeat: (animation) => animation,
  withTiming: (value) => value,
  withSequence: (...animations) => animations[animations.length - 1],
  withSpring: (value) => value,
};
