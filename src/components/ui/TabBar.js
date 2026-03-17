import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated as RNAnimated, 
  Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, radius } from '../../theme/tokens';

export const TabBar = ({ state, descriptors, navigation, insets }) => {
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
      <BlurView
        intensity={100}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.absoluteGradientOverlay} />
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <TabIcon 
                name={route.name} 
                isFocused={isFocused} 
                icon={options.tabBarIcon} 
              />
              <Text style={[
                styles.tabLabel, 
                typography.labelBold, 
                { color: isFocused ? colors.textPrimary : colors.textTertiary }
              ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
};

const TabIcon = ({ name, isFocused, icon: IconComponent }) => {
  const scale = React.useRef(new RNAnimated.Value(isFocused ? 1.2 : 1)).current;

  React.useEffect(() => {
    RNAnimated.spring(scale, {
      toValue: isFocused ? 1.2 : 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <View style={styles.iconContainer}>
      {isFocused && <View style={styles.activeGlow} />}
      <RNAnimated.View
        style={[
          styles.iconInner,
          { transform: [{ scale }] },
          isFocused && styles.iconInnerActive
        ]}
      >
        {IconComponent && (
          <IconComponent 
             size={20} 
             color={isFocused ? "#ffffff" : colors.textTertiary} 
             strokeWidth={isFocused ? 2.5 : 2}
          />
        )}
      </RNAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  blurContainer: {
    flexDirection: 'row',
    height: 72,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 15, 30, 0.75)',
  },
  absoluteGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white06,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDim,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  iconInner: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
