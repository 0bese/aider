import { useKeyboardHandler } from "react-native-keyboard-controller";
import {
    useAnimatedScrollHandler,
    useSharedValue,
} from "react-native-reanimated";

export const useKeyboardAnimation = () => {
  const height = useSharedValue(0);
  const inset = useSharedValue(0);
  const offset = useSharedValue(0);
  const scroll = useSharedValue(0);

  useKeyboardHandler({
    onStart: (e) => {
      "worklet";
      height.value = e.height;
      inset.value = e.height;
      offset.value = Math.max(e.height + scroll.value, 0);
    },
    onMove: (e) => {
      "worklet";
      height.value = e.height;
    },
    onEnd: (e) => {
      "worklet";
      height.value = e.height;
    },
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scroll.value = e.contentOffset.y - inset.value;
    },
  });

  return { height, onScroll, inset, offset };
};
