import React, { memo, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PER_ITEM_ROTATION = (2 * Math.PI) / 180;
const PER_ITEM_SCALE = 0.9;
const HORIZONTAL_OFFSETS = [20, 14.5, 10, 9, 5] as const;

interface CardStackProps {
  data: Array<{ id: string | number; [key: string]: any }>;
  initialIndex?: number;
  cardDimensions: { width: number; height: number };
  renderItem: (item: any, index: number) => React.ReactNode;
  pageWidthFactor?: number;
}

interface CardProps {
  item: any;
  index: number;
  totalItems: number;
  scrollX: any;
  focusedIndex: any;
  cardDimensions: { width: number; height: number };
  renderItem: (item: any, index: number) => React.ReactNode;
  pageWidth: number;
}

function horizontalOffsetForProgress(offset: number): number {
  "worklet";
  const index = Math.floor(offset);
  const progress = offset - index;

  let value = 0;
  const limit = Math.min(HORIZONTAL_OFFSETS.length, Math.max(0, index));

  for (let i = 0; i < limit; i++) {
    value += HORIZONTAL_OFFSETS[i];
  }

  if (index >= 0 && index < HORIZONTAL_OFFSETS.length) {
    value += HORIZONTAL_OFFSETS[index] * progress;
  }

  return value;
}

function itemTransformForItem(
  index: number,
  progress: number,
  isLeading: boolean
): { horizontalOffset: number; rotation: number; scale: number } {
  "worklet";
  const multiplier = isLeading ? -1 : 1;
  const pageProgress = index - progress * multiplier;
  const horizontalOffset =
    horizontalOffsetForProgress(pageProgress) * multiplier;
  const rotation = PER_ITEM_ROTATION * pageProgress * multiplier;
  const scale = Math.pow(PER_ITEM_SCALE, pageProgress);

  return { horizontalOffset, rotation, scale: scale - 1 };
}

function easeInOut(t: number): number {
  "worklet";
  return t * t * (3 - 2 * t);
}

const AnimatedCard = memo<CardProps>(
  ({
    item,
    index,
    totalItems,
    scrollX,
    focusedIndex,
    cardDimensions,
    renderItem,
    pageWidth,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const offset = scrollX.value;
      const currentFocusedIndex = focusedIndex.value;
      const pageProgress = offset / pageWidth;

      const progressFromFocusedItem = pageProgress - currentFocusedIndex;
      const isMovingToLeadingStack = progressFromFocusedItem > 0;
      const isMovingToTrailingStack = progressFromFocusedItem < 0;

      const canGoForward = currentFocusedIndex < totalItems - 1;
      const canGoBackwards = currentFocusedIndex > 0;
      const shouldRubberBand =
        (!canGoForward && isMovingToLeadingStack) ||
        (!canGoBackwards && isMovingToTrailingStack);

      const relativeIndex = Math.abs(index - currentFocusedIndex);
      const isPartOfLeadingStack = index < currentFocusedIndex;

      let transform: Array<
        { translateX: number } | { rotate: string } | { scale: number }
      > = [];
      let zIndex = 0;
      let opacity = 1;

      // Current focused item with animation
      if (index === currentFocusedIndex && !shouldRubberBand) {
        const progress = Math.abs(progressFromFocusedItem);

        if (progress < 1) {
          zIndex = 100;
          const final = itemTransformForItem(1, 0, isMovingToLeadingStack);
          const t = easeInOut(progress);

          transform = [
            { translateX: final.horizontalOffset * t },
            { rotate: `${final.rotation * t}rad` },
            { scale: 1 + final.scale * t },
          ];
        } else {
          zIndex = -3;
          const final = itemTransformForItem(1, 0, isMovingToLeadingStack);
          transform = [
            { translateX: final.horizontalOffset },
            { rotate: `${final.rotation}rad` },
            { scale: 1 + final.scale },
          ];
        }
      }
      // Next item coming into focus
      else if (
        (isMovingToLeadingStack && index === currentFocusedIndex + 1) ||
        (isMovingToTrailingStack && index === currentFocusedIndex - 1)
      ) {
        const progress = Math.abs(progressFromFocusedItem);

        if (progress < 1) {
          zIndex = 50;
          const initial = itemTransformForItem(1, 0, !isMovingToLeadingStack);
          const t = easeInOut(progress);

          transform = [
            { translateX: initial.horizontalOffset * (1 - t) },
            { rotate: `${initial.rotation * (1 - t)}rad` },
            { scale: 1 + initial.scale * (1 - t) },
          ];
        } else {
          zIndex = 100;
          transform = [{ translateX: 0 }, { rotate: "0rad" }, { scale: 1 }];
        }
      }
      // Items in the stack
      else if (relativeIndex <= HORIZONTAL_OFFSETS.length) {
        if (isMovingToLeadingStack !== isPartOfLeadingStack) {
          zIndex = -2 * relativeIndex;
        } else {
          zIndex = -HORIZONTAL_OFFSETS.length - 2 * relativeIndex;
        }

        const itemTransform = itemTransformForItem(
          relativeIndex,
          progressFromFocusedItem,
          isPartOfLeadingStack
        );

        transform = [
          { translateX: itemTransform.horizontalOffset },
          { rotate: `${itemTransform.rotation}rad` },
          { scale: 1 + itemTransform.scale },
        ];

        // Alpha animation for last item in stack
        if (relativeIndex === HORIZONTAL_OFFSETS.length) {
          opacity = Math.abs(progressFromFocusedItem);
        } else if (
          isPartOfLeadingStack &&
          progressFromFocusedItem > 0 &&
          relativeIndex === HORIZONTAL_OFFSETS.length - 1
        ) {
          opacity = 1 - Math.abs(progressFromFocusedItem);
        } else if (
          !isPartOfLeadingStack &&
          progressFromFocusedItem < 0 &&
          relativeIndex === HORIZONTAL_OFFSETS.length - 1
        ) {
          opacity = 1 + progressFromFocusedItem;
        }
      }
      // Items beyond visible range
      else {
        opacity = 0;
        transform = [{ scale: 0 }];
        zIndex = -999;
      }

      return {
        transform,
        zIndex,
        opacity,
      };
    });

    return (
      <Reanimated.View
        style={[
          styles.card,
          {
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          animatedStyle,
        ]}
      >
        {renderItem(item, index)}
      </Reanimated.View>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

export const CardStack = memo<CardStackProps>(
  ({
    data,
    initialIndex = 0,
    cardDimensions,
    renderItem,
    pageWidthFactor = 0.5,
  }) => {
    const PAGE_WIDTH = useMemo(
      () => SCREEN_WIDTH * pageWidthFactor,
      [pageWidthFactor]
    );

    const scrollX = useSharedValue(initialIndex * PAGE_WIDTH);
    const focusedIndex = useSharedValue(initialIndex);
    const startX = useSharedValue(0);

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .onStart(() => {
            startX.value = scrollX.value;
          })
          .onUpdate((event) => {
            const newScroll = startX.value - event.translationX;
            const maxScroll = (data.length - 1) * PAGE_WIDTH;

            // Apply rubber banding at boundaries
            if (newScroll < 0) {
              scrollX.value = newScroll * 0.3;
            } else if (newScroll > maxScroll) {
              scrollX.value = maxScroll + (newScroll - maxScroll) * 0.3;
            } else {
              scrollX.value = newScroll;
            }
          })
          .onEnd((event) => {
            const velocity = -event.velocityX;
            const swipeThreshold = PAGE_WIDTH * 0.3;
            const displacement = scrollX.value - startX.value;

            let targetPage = focusedIndex.value;

            // Determine direction based on velocity or displacement
            if (Math.abs(velocity) > 400) {
              targetPage =
                velocity > 0 ? focusedIndex.value + 1 : focusedIndex.value - 1;
            } else if (Math.abs(displacement) > swipeThreshold) {
              targetPage =
                displacement > 0
                  ? focusedIndex.value + 1
                  : focusedIndex.value - 1;
            }

            // Clamp to valid range
            targetPage = Math.max(0, Math.min(data.length - 1, targetPage));

            // Update focused index
            focusedIndex.value = targetPage;

            // Animate to target page
            scrollX.value = withSpring(targetPage * PAGE_WIDTH, {
              damping: 20,
              stiffness: 90,
            });
          }),
      [data.length, PAGE_WIDTH, scrollX, focusedIndex, startX]
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.cardsContainer}>
          {data.map((item, index) => (
            <AnimatedCard
              key={item.id ?? index}
              item={item}
              index={index}
              totalItems={data.length}
              scrollX={scrollX}
              focusedIndex={focusedIndex}
              cardDimensions={cardDimensions}
              renderItem={renderItem}
              pageWidth={PAGE_WIDTH}
            />
          ))}
        </View>
      </GestureDetector>
    );
  }
);
CardStack.displayName = "CardStack";

const styles = StyleSheet.create({
  cardsContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});
