import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ContactScreen from './ContactScreen';
import FetchContactHelper from '../helper/FetchContactHelper';
import GroupsScreen from './GroupsScreen';
import EditContactScreen from './EditContactScreen';
const Stack = createStackNavigator();

const MainStack = () => {
  useEffect(() => {
    FetchContactHelper.getUserInfo();
    FetchContactHelper.getContacts();
    FetchContactHelper.getGroups();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        mode="modal"
        initialRouteName="ContactScreen"
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen
          name={'ContactScreen'}
          component={ContactScreen}
        />
        <Stack.Screen name={'GroupsScreen'} component={GroupsScreen} />
        <Stack.Screen
          options={{ title: 'Contact Detail' }}
          name={'EditContactScreen'}
          component={EditContactScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default MainStack;
