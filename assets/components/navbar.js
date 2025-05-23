import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Defina as rotas associadas aos ícones
  const isCalendar = route.name === 'Home';
  const isSearch = route.name === 'Pesquisa';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={40}
          color={isCalendar ? '#B2E4F9' : '#ccc'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Pesquisa')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="search"
          size={40}
          color={isSearch ? '#B2E4F9' : '#ccc'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', 
    paddingBottom: 60,
    paddingVertical: 10,
    backgroundColor: '#F2F5FF',
    
    paddingHorizontal: 40,
  
  },
});
