import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/Main/HomeScreen';
import { SavedScreen } from '../screens/Main/SavedScreen';
import { BookingsScreen } from '../screens/Main/BookingsScreen';
import { ProfileScreen } from '../screens/Main/ProfileScreen';

import { PGDetailScreen } from '../screens/Main/PGDetailScreen';
import { BookingDetailScreen } from '../screens/Main/BookingDetailScreen';
import { EditProfileScreen } from '../screens/Main/EditProfileScreen';

import { TabBar } from '../components/ui/TabBar';
import { Home, Heart, Calendar, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// The Tab Navigator is the root of the "Main" flow
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: Home }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen} 
        options={{ tabBarIcon: Heart }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ tabBarIcon: Calendar }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: User }}
      />
    </Tab.Navigator>
  );
};

// We wrap the TabNavigator in a Stack so we can push detail screens OVER the tabs
export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="TabsRoot" component={TabNavigator} />
      <Stack.Screen name="PGDetail" component={PGDetailScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};
