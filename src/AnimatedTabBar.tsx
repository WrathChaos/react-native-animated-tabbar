import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedTabBarView } from './AnimatedTabBarView';
import { interpolate } from './utilities';
import { useTabBarVisibility, useStableCallback } from './hooks';
import type { PresetEnum } from './presets';
import type { AnimatedTabBarProps } from './types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate as reanimatedInterpolate,
} from 'react-native-reanimated';

interface Route {
  name: string;
  key: string;
}

export function AnimatedTabBar<T extends PresetEnum>(
  props: AnimatedTabBarProps<T>
) {
  // props
  const {
    tabs,
    state,
    navigation,
    descriptors,
    onTabPress,
    onTabLongPress,
    style: overrideStyle,
    safeAreaInsets: overrideSafeAreaInsets,
    ...rest
  } = props;

  //#region variables
  const tabBarContainerRef = useRef<Animated.View>(null);
  const isReactNavigation5 = useMemo(() => Boolean(state), [state]);
  const tabBarHeight = useSharedValue(0);

  const { index: navigationIndex, routes } = useMemo(() => {
    if (isReactNavigation5) {
      return state;
    } else {
      return {
        index: navigation!.state.index,
        routes: navigation!.state.routes,
      };
    }
  }, [state, navigation, isReactNavigation5]);

  const shouldShowTabBar = useMemo(() => {
    if (!isReactNavigation5) {
      return true;
    }
    const route = routes[navigationIndex];
    const { options } = descriptors[route.key];
    return typeof options.tabBarVisible === 'boolean'
      ? options.tabBarVisible
      : true;
  }, [isReactNavigation5, routes, descriptors, navigationIndex]);

  const shouldShowTabBarAnimated = useTabBarVisibility(shouldShowTabBar);

  const safeAreaInsets = useSafeAreaInsets();
  const safeBottomArea =
    overrideSafeAreaInsets?.bottom ?? safeAreaInsets.bottom;

  //#endregion

  //#region styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      transform: [
        {
          translateY: reanimatedInterpolate(
            shouldShowTabBarAnimated.value,
            [0, 1],
            [tabBarHeight.value, 0]
          ),
        },
      ],
      position: shouldShowTabBar ? 'relative' : 'absolute',
    };
  }, [shouldShowTabBar]);

  const style = useMemo(
    () => ({
      ...overrideStyle,
      paddingBottom: safeBottomArea,
    }),
    [overrideStyle, safeBottomArea]
  );

  //#endregion

  //#region callbacks
  const handleIndexChange = useStableCallback((index: number) => {
    const { key, name } = routes[index];
    const event = navigation.emit({
      type: 'tabPress',
      target: key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(name);
    }
  });

  const handleLongPress = useStableCallback((index: number) => {
    const { key } = routes[index];
    navigation.emit({
      type: 'tabLongPress',
      target: key,
    });
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    tabBarHeight.value = event.nativeEvent.layout.height;
  }, []);

  //#endregion

  // render
  return (
    <Animated.View
      ref={tabBarContainerRef}
      style={animatedContainerStyle}
      onLayout={handleLayout}
    >
      <AnimatedTabBarView
        index={navigationIndex}
        onIndexChange={handleIndexChange}
        onLongPress={handleLongPress}
        tabs={routes.reduce((result: { [key: string]: {} }, route) => {
          const routeConfig = tabs[route.name] || tabs[route.key];
          const title = descriptors[route.key]?.title || route.name;
          result[route.key] = { title, ...routeConfig };
          return result;
        }, {})}
        style={style}
        {...rest}
      />
    </Animated.View>
  );
}
