import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, Brand, Radius, NeuShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/shared/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { t } = useI18n();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? Brand.primaryLight : Brand.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          isDark ? NeuShadow.dark.md : NeuShadow.md,
          {
            backgroundColor: isDark ? Brand.darkCard : Brand.white,
            borderTopColor: isDark ? Brand.darkBorder : Brand.lightBorder,
          },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: `${Brand.primary}15` }]}>
              <MaterialIcons size={22} name={focused ? 'dashboard' : 'dashboard-customize'} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="libraries"
        options={{
          title: t('tab_libraries'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: `${Brand.primary}15` }]}>
              <MaterialIcons size={22} name="library-books" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: t('tab_study'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: `${Brand.primary}15` }]}>
              <MaterialIcons size={22} name="school" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t('tab_notes'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: `${Brand.primary}15` }]}>
              <MaterialIcons size={22} name="sticky-note-2" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tab_more'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: `${Brand.primary}15` }]}>
              <MaterialIcons size={22} name="apps" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    borderTopWidth: 0,
    borderRadius: Radius.xl,
    height: 72,
    paddingTop: 6,
    paddingBottom: 8,
    borderWidth: 1,
  },
  tabItem: {
    borderRadius: Radius.md,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
