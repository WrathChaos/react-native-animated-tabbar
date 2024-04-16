import React, { useRef } from 'react';
import { LayoutChangeEvent, LayoutRectangle, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import {
  State,
  TapGestureHandler,
  LongPressGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useStableCallback } from '../../hooks';

interface RawButtonProps {
  index: number;
  selectedIndex: Animated.SharedValue<number>;
  accessibilityLabel: string;
  children: React.ReactNode[] | React.ReactNode;
  style?: Animated.AnimateStyle<ViewStyle>;
  animatedOnChange: (index: number) => void;
  onLongPress: (index: number) => void;
  onLayout?: (index: number, layout: LayoutRectangle) => void;
}

const RawButton = ({
  index,
  selectedIndex,
  accessibilityLabel,
  children,
  style,
  animatedOnChange,
  onLongPress,
  onLayout,
}: RawButtonProps) => {
  const rootViewRef = useRef<Animated.View>(null);
  const longPressGestureHandlerRef = useRef<LongPressGestureHandler>(null);

  // Gesture handlers using Reanimated v3
  const tapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      animatedOnChange(index);
    },
  });

  const longPressGestureHandler = useAnimatedGestureHandler({
    onActive: () => {
      runOnJS(onLongPress)(index);
    },
  });

  // Animated reaction for accessibility changes
  useAnimatedReaction(
    () => selectedIndex.value === index,
    (isSelected, wasSelected) => {
      if (isSelected !== wasSelected) {
        runOnJS(rootViewRef.current?.setNativeProps)({
          accessibilityState: { selected: isSelected },
        });
      }
    }
  );

  // Layout handling callback
  const handleContainerLayout = useStableCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) =>
      onLayout && onLayout(index, layout)
  );

  // Animated styles if needed
  const animatedStyles = useAnimatedStyle(() => {
    return {
      // Conditional styles or transitions can be added here
    };
  });

  return (
    <GestureHandlerRootView>
      <TapGestureHandler
        ref={longPressGestureHandlerRef}
        onHandlerStateChange={tapGestureHandler}
      >
        <Animated.View
          ref={rootViewRef}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityComponentType="button"
          onLayout={handleContainerLayout}
          style={[style, animatedStyles]}
        >
          <LongPressGestureHandler
            onHandlerStateChange={longPressGestureHandler}
          >
            <Animated.View>{children}</Animated.View>
          </LongPressGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};

export default RawButton;
