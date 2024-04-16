import { useEffect } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

export const useTabBarVisibility = (shouldShowTabBar: boolean) => {
  // Shared animated value for the tab bar visibility
  const position = useSharedValue(shouldShowTabBar ? 1 : 0);

  // Effect hook to animate position when shouldShowTabBar changes
  useEffect(() => {
    // Animate the position value to 1 or 0 with timing
    position.value = withTiming(shouldShowTabBar ? 1 : 0, {
      duration: 250,
      easing: Easing.linear,
    });
  }, [shouldShowTabBar, position]);

  // The animated style or value can be returned as needed
  // If you need to use the position value in a style, you can create a derived animated style
  // Otherwise, returning the position directly is also fine for logic-based operations

  return position;
};
