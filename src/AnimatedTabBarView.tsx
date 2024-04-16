import React, { useMemo, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import Presets, { PresetEnum } from './presets';
import type { AnimatedTabBarViewProps } from './types';

/**
 * @DEV
 * this is needed for react-native-svg to animate on the native thread.
 * @external (https://github.com/software-mansion/react-native-reanimated/issues/537)
 */
Animated.addWhitelistedUIProps({
  width: true,
  stroke: true,
  backgroundColor: true,
});

export function AnimatedTabBarView<T extends PresetEnum>(
  props: AnimatedTabBarViewProps<T>
) {
  // props
  const {
    index: controlledIndex,
    onIndexChange,
    onLongPress,
    tabs: _tabs,
    preset = 'bubble',
    style,
    itemInnerSpace,
    itemOuterSpace,
    itemContainerWidth,
    iconSize,
    duration,
    easing,
    isRTL,
    ...rest
  } = props;

  // verify props
  if (!Object.keys(Presets).includes(preset)) {
    throw new Error(
      `Wrong preset been provided. expected one of these: [${Object.keys(
        Presets
      ).join(', ')}], but found "${preset}".`
    );
  }

  // variables
  const selectedIndex = useSharedValue(controlledIndex);
  const tabs = useMemo(() => {
    return Object.keys(_tabs).map(key => {
      return _tabs[key].title && _tabs[key].key
        ? _tabs[key]
        : {
            title: key,
            key: `tab-${key}`,
            ..._tabs[key],
          };
    });
  }, [_tabs]);

  //#region Effects
  const indexRef = useRef(controlledIndex);

  useEffect(() => {
    selectedIndex.value = controlledIndex;
  }, [controlledIndex]);

  useAnimatedReaction(
    () => selectedIndex.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(onIndexChange)(current);
      }
    },
    [onIndexChange]
  );
  //#endregion

  const PresetComponent = Presets[preset].component;

  // render
  return (
    <PresetComponent
      style={style}
      selectedIndex={selectedIndex}
      tabs={tabs}
      itemInnerSpace={itemInnerSpace}
      itemOuterSpace={itemOuterSpace}
      itemContainerWidth={itemContainerWidth}
      iconSize={iconSize}
      duration={duration}
      easing={easing}
      isRTL={isRTL}
      onLongPress={onLongPress}
      {...rest}
    />
  );
}
