import React, { useMemo, memo } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import MaskedView from '@react-native-community/masked-view';
import { Svg, Circle, SvgProps, CircleProps } from 'react-native-svg';
import isEqual from 'lodash.isequal';
import {
  DEFAULT_INDICATOR_VISIBILITY,
  DEFAULT_INDICATOR_SIZE,
  DEFAULT_INDICATOR_COLOR,
} from '../constants';
import type { FlashyTabBarItemProps } from '../types';
import { styles } from './styles';

const AnimatedSvg = Animated.createAnimatedComponent(
  Svg
) as React.ComponentType<Animated.AnimateProps<SvgProps>>;
const AnimatedCircle = Animated.createAnimatedComponent(
  Circle
) as React.ComponentType<Animated.AnimateProps<CircleProps>>;

const FlashyTabBarItemComponent = ({
  animatedFocus,
  label,
  icon,
  labelStyle: labelStyleOverride,
  spacing,
  iconSize,
  indicator,
  isRTL,
}: FlashyTabBarItemProps) => {
  const {
    innerVerticalSpace,
    innerHorizontalSpace,
    outerVerticalSpace,
    outerHorizontalSpace,
  } = spacing;
  const {
    size: _indicatorSize,
    color: _indicatorColor,
    visible: _indicatorVisible,
  } = indicator || {
    size: undefined,
    color: undefined,
    visible: undefined,
  };
  const { indicatorVisibility, indicatorColor, indicatorSize } = useMemo(
    () => ({
      indicatorVisibility: _indicatorVisible ?? DEFAULT_INDICATOR_VISIBILITY,
      indicatorColor:
        _indicatorColor ?? labelStyleOverride?.color ?? DEFAULT_INDICATOR_COLOR,
      indicatorSize: _indicatorSize ?? DEFAULT_INDICATOR_SIZE,
    }),
    [_indicatorVisible, _indicatorColor, _indicatorSize, labelStyleOverride]
  );

  const labelWidth = useSharedValue(0);
  const labelHeight = useSharedValue(0);
  const containerHeight = useMemo(
    () => iconSize + innerVerticalSpace * 2,
    [iconSize, innerVerticalSpace]
  );
  const containerWidth = useSharedValue(iconSize + innerHorizontalSpace * 2);

  const labelContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          animatedFocus.value,
          [0, 1],
          [labelHeight.value * 0.5, labelHeight.value * -0.5],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          animatedFocus.value,
          [0, 1],
          [iconSize * -0.5, iconSize * -1.5],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const handleLabelLayout = ({
    nativeEvent: {
      layout: { height, width },
    },
  }: LayoutChangeEvent) => {
    labelWidth.value = width;
    labelHeight.value = height;
    containerWidth.value = Math.max(
      width + innerHorizontalSpace * 2,
      containerWidth.value
    );
  };

  const renderIcon = () => {
    const IconComponent = icon.component as any;
    return typeof IconComponent === 'function' ? (
      <IconComponent
        animatedFocus={animatedFocus.value}
        color={icon.color}
        size={iconSize}
      />
    ) : (
      <IconComponent
        animatedFocus={animatedFocus.value}
        color={icon.color}
        size={iconSize}
      />
    );
  };

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          paddingHorizontal: outerHorizontalSpace,
          paddingVertical: outerVerticalSpace,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          { width: containerWidth.value, height: containerHeight },
        ]}
      >
        <MaskedView
          style={styles.root}
          maskElement={<Animated.View style={iconContainerStyle} />}
        >
          <Animated.View pointerEvents="none" style={iconContainerStyle}>
            <View style={styles.icon}>{renderIcon()}</View>
          </Animated.View>
        </MaskedView>
        <MaskedView
          style={styles.root}
          maskElement={<Animated.View style={labelContainerStyle} />}
        >
          <Animated.View style={labelContainerStyle}>
            <Text
              numberOfLines={1}
              style={[styles.label, labelStyleOverride]}
              onLayout={handleLabelLayout}
            >
              {label}
            </Text>
          </Animated.View>
        </MaskedView>
        {indicatorVisibility && (
          <AnimatedSvg
            style={[
              styles.root,
              {
                left: containerWidth.value / 2 - indicatorSize / 2,
                top: containerHeight - indicatorSize,
              },
            ]}
          >
            <AnimatedCircle
              r={interpolate(
                animatedFocus.value,
                [0.5, 1],
                [0, indicatorSize / 2],
                Extrapolate.CLAMP
              )}
              fill={indicatorColor}
            />
          </AnimatedSvg>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default memo(FlashyTabBarItemComponent, isEqual);
