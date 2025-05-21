import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Pressable } from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [days, setDays] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    loadDate();
    loadDays();
  }, []);

  const loadDate = async () => {
    const res = await api.get('/data-atual');
    setCurrentDate(res.data); // Retorna tipo "mai,2025"
  };

  const loadDays = async () => {
    const res = await api.get('/dias-do-mes'); // Espera dias com nome do dia da semana
    setDays(res.data);
  };

  const loadTasks = async (dia) => {
    setSelectedDay(dia);
    const res = await api.get(`/tarefas?dia=${dia}`);
    setTasks(res.data);
  };

  const openModal = (task) => {
    setActiveTask(task);
    setModalVisible(true);
  };

  const handleAction = (action) => {
    setModalVisible(false);
    // Faz os POST/DELETE/PUT aqui
    alert(`Você escolheu: ${action} para ${activeTask.nome}`);
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.nome}</Text>
      <Text>{item.prioridade}</Text>
      <TouchableOpacity style={styles.dots} onPress={() => openModal(item)}>
        <Ionicons name="ellipsis-vertical" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TaskGreen</Text>
      <View style={styles.header}>
        <Text style={styles.date}>{currentDate}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddTask')}>
          <Text style={styles.addText}>+ tarefa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={days}
        keyExtractor={(item) => item.dia.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.dayItem} onPress={() => loadTasks(item.dia)}>
            <Text>{item.diaSemana}</Text>
            <Text>{item.dia}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ marginVertical: 10 }}
      />

      <Text style={styles.sectionTitle}>Tarefas</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.searchIcon} onPress={() => navigation.navigate('Search')}>
        <Ionicons name="search" size={30} />
      </TouchableOpacity>

      {/* Modal de Opções */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {['Concluída', 'Editar', 'Excluir'].map(action => (
              <Pressable key={action} onPress={() => handleAction(action)} style={styles.modalButton}>
                <Text style={styles.modalText}>{action}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
