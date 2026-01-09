import { useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Hook to hide/show the bottom tab bar based on scroll direction.
 * 
 * @param options Configuration options
 * @param options.isRootTab Set to true if the screen is a direct child of the Tab Navigator. Default is false (for nested Stack screens).
 * @returns An object containing the `onScroll` handler to be passed to a ScrollView/FlatList.
 */
export const useTabBarScroll = (navigation: any, options: { isRootTab?: boolean } = {}) => {
    const offset = useRef(0);
    const isTabBarVisible = useRef(true);

    // Threshold to prevent jittering on small scrolls
    const SCROLL_THRESHOLD = 5;

    const setTabBarVisible = (visible: boolean) => {
        const style = visible ? undefined : { display: 'none' };

        if (options.isRootTab) {
            navigation.setOptions({
                tabBarStyle: style,
            });
        } else {
            navigation.getParent()?.setOptions({
                tabBarStyle: style,
            });
        }
    };

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const diff = currentOffset - offset.current;

        // Ignore bounces (iOS)
        if (currentOffset <= 0) {
            if (!isTabBarVisible.current) {
                setTabBarVisible(true);
                isTabBarVisible.current = true;
            }
            offset.current = currentOffset;
            return;
        }

        // Scroll Down -> Hide Tab Bar
        if (diff > SCROLL_THRESHOLD && isTabBarVisible.current) {
            setTabBarVisible(false);
            isTabBarVisible.current = false;
        }
        // Scroll Up -> Show Tab Bar
        else if (diff < -SCROLL_THRESHOLD && !isTabBarVisible.current) {
            setTabBarVisible(true);
            isTabBarVisible.current = true;
        }

        offset.current = currentOffset;
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            // Restore visibility state based on current scroll position/ref
            // If we are coming back from a screen that hid the tabs, we need to restore them
            // UNLESS we were scrolled down.

            // Note: We don't have easy access to the exact current scroll position here without a ref to the list.
            // However, we can rely on the last known offset.current.

            if (offset.current <= SCROLL_THRESHOLD) {
                // If we are near the top, show the tabs
                setTabBarVisible(true);
                isTabBarVisible.current = true;
            } else {
                // If we are scrolled down, ensure they stay hidden (or hide them if they were shown)
                // But wait, if we come back from TurfDetail, tabs are hidden.
                // If we are scrolled down, we want them hidden. So we do nothing or enforce hidden.
                // If we are scrolled down, isTabBarVisible.current should be false.

                if (!isTabBarVisible.current) {
                    setTabBarVisible(false);
                }
            }
        }, [navigation])
    );

    return { onScroll };
};
