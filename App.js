import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './assets/components/screens/home';
import Pesquisa from './assets/components/screens/pesquisa';
import NovaTarefa from './assets/components/screens/novatarefa';
import VisualizarTarefa from './assets/components/screens/visualizar';
import EditarTarefa from './assets/components/screens/editar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen
          name="Pesquisa"
          component={Pesquisa}
          options={{ headerShown: false }}/>
        
        
        <Stack.Screen
          name="NovaTarefa"
          component={NovaTarefa}
          
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VisualizarTarefa"
          component={VisualizarTarefa}
          options={{ headerShown: false }}/>

        <Stack.Screen
          name="EditarTarefa"
          component={EditarTarefa}
          options={{ headerShown: false }}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
