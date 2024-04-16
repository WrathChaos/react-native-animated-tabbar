import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  EasingFunction,
  SharedValue,
} from 'react-native-reanimated';

interface useTabBarItemFocusTransitionProps {
  index: number;
  selectedIndex: SharedValue<number>;
  duration: number;
  easing: EasingFunction;
}

export const useTabBarItemFocusTransition = ({
  index,
  selectedIndex,
  duration,
  easing,
}: useTabBarItemFocusTransitionProps) => {
  const position = useSharedValue(0);

  useEffect(() => {
    // This logic decides if the item should animate in or out based on the selectedIndex
    const isSelected = selectedIndex.value === index;
    position.value = withTiming(isSelected ? 1 : 0, {
      duration,
      easing,
    });
  }, [index, selectedIndex, duration, easing]);

  // We return the position to be used in animated styles or wherever necessary.
  return position;
};
