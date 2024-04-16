import FlashyTabBar, {
  FlashyTabBarConfig,
  FlashyTabBarItemConfig,
} from './presets/flashy';

const Presets = {
  flashy: {
    component: FlashyTabBar,
    $c: undefined as any as FlashyTabBarConfig,
    $t: undefined as any as FlashyTabBarItemConfig,
  },
};

export type PresetEnum = keyof typeof Presets;

export default Presets;
