import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Navbar from '../navbar';
import { Ionicons } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  StyleSheet, 
  Image,
  TextInput
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Navbar from '../navbar';
import { Ionicons } from '@expo/vector-icons';

// Tarefas simuladas para teste
const tarefasSimuladas = [
  {
    id: '1',
    nome: 'Reunião com equipe',
    dataInicio: new Date().toISOString(),
    dataEntrega: new Date().toISOString(),
    horaInicio: '09:00',
    horaTermino: '10:30',
    prioridade: 'alta',
    descricao: 'Discutir os próximos passos do projeto',
    status: 'A fazer',
    imagem: null
  },
  {
    id: '2',
    nome: 'Atualizar documentação',
    dataInicio: new Date().toISOString(),
    dataEntrega: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    horaInicio: '14:00',
    horaTermino: '15:30',
    prioridade: 'media',
    descricao: 'Atualizar os documentos técnicos do sistema',
    status: 'A fazer',
    imagem: null
  }
];

export default function TaskScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [weekDays, setWeekDays] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState({});
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [showObservacaoInput, setShowObservacaoInput] = useState(false);

  // Funções existentes (atribuirStatusTarefas, concluirTarefa, excluirTarefa, agruparPorData)
  // ... (mantenha as mesmas funções que já tinha)

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getWeekDays = (offset = 0) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (offset * 7));
    
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        day: diasDaSemana[date.getDay()],
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
      };
    });

    setWeekDays(days);
    
    const monthName = days[0].fullDate.toLocaleString('pt-BR', { month: 'short' });
    const year = new Date(days[0].fullDate).getFullYear();
    setCurrentMonthYear(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`);
  };

  useEffect(() => {
    getWeekDays(weekOffset);
  }, [weekOffset]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTarefas();
    }, [weekOffset])
  );

  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const renderTask = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('VisualizarTarefa', {
          nome: item.nome,
          dataInicio: item.dataInicio,
          dataEntrega: item.dataEntrega,
          horaInicio: item.horaInicio,
          horaTermino: item.horaTermino,
          prioridade: item.prioridade,
          descricao: item.descricao,
          imagem: item.imagem,
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.taskCard}>
        <View style={styles.taskIcon}>
          {item.status === 'Concluída' ? (
            <Image source={require('../../icons/concluido.png')} style={styles.taskIconImage} />
          ) : item.status === 'Expirada' ? (
            <Image source={require('../../icons/expirado.png')} style={styles.taskIconImage} />
          ) : (
            <Image source={require('../../icons/tarefa.png')} style={styles.taskIconImage} />
          )}
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.nome}</Text>
          <Text style={styles.taskSubtitle}>{item.status}</Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setSelectedTask(item);
            setModalVisible(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#D9D9D9" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <View style={styles.header}>
          <Image source={require('../../icons/Union.png')} style={styles.logo} />
          <Text style={styles.appTitle}>TaskGreen</Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.month}>{currentMonthYear}</Text>
          <TouchableOpacity 
            style={styles.addTaskBtn} 
            onPress={() => navigation.navigate('NovaTarefa')} 
          >
            <Text style={styles.addTaskText}>+ tarefa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <FlatList
            horizontal
            data={weekDays}
            keyExtractor={(item) => item.fullDate}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const isActive = selectedDate.toISOString().split('T')[0] === item.fullDate;
              return (
                <TouchableOpacity 
                  onPress={() => setSelectedDate(new Date(item.fullDate))}
                  style={styles.dayButton}
                >
                  <View style={[styles.dayItem, isActive && styles.activeDay]}>
                    <Text style={[styles.dayText, isActive && styles.activeDayText]}>{item.day}</Text>
                    <Text style={[styles.dateText, isActive && styles.activeDateText]}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      <View style={styles.contentArea}>
        <Text style={styles.sectionTitle}>Tarefas</Text>
        <FlatList
          data={tasks[selectedDateKey] || []}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal dos três pontos */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.threeDotsModal}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                setShowObservacaoInput(true);
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.modalOptionText}>Concluir</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditarTarefa', { tarefa: selectedTask });
              }}
            >
              <Ionicons name="create" size={20} color="#2196F3" />
              <Text style={styles.modalOptionText}>Editar</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                setConfirmarExcluir(true);
              }}
            >
              <Ionicons name="trash" size={20} color="#F44336" />
              <Text style={styles.modalOptionText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de observação */}
      <Modal
        visible={showObservacaoInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowObservacaoInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.observacaoModal}>
            <Text style={styles.observacaoTitle}>Adicionar Observação</Text>
            <TextInput
              style={styles.observacaoInput}
              placeholder="Digite sua observação..."
              multiline
              numberOfLines={4}
              value={observacaoConclusao}
              onChangeText={setObservacaoConclusao}
            />
            <View style={styles.observacaoButtons}>
              <TouchableOpacity
                style={[styles.observacaoButton, styles.cancelButton]}
                onPress={() => setShowObservacaoInput(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.observacaoButton, styles.confirmButton]}
                onPress={() => {
                  concluirTarefa(selectedTask.id, observacaoConclusao);
                  setShowObservacaoInput(false);
                }}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={confirmarExcluir}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmarExcluir(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmText}>Tem certeza que deseja excluir esta tarefa?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={() => {
                  excluirTarefa(selectedTask.id);
                  setConfirmarExcluir(false);
                }}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setConfirmarExcluir(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FF',
  },
  topCard: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B2E4F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  month: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addTaskBtn: {
    backgroundColor: '#B2E4F9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addTaskText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calendarContainer: {
    marginVertical: 10,
  },
  dayButton: {
    marginHorizontal: 4,
  },
  dayItem: {
    width: 48,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeDay: {
    backgroundColor: '#B2E4F9',
  },
  dayText: {
    fontSize: 14,
    color: '#868E96',
    marginBottom: 4,
    textAlign: 'center',
  },
  activeDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
  },
  activeDateText: {
    color: '#fff',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  tasksList: {
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#B2E4F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskIconImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  taskSubtitle: {
    color: '#868E96',
    fontSize: 14,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsModal: {
    position: 'absolute',
    right: 20,
    top: 100,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  observacaoModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  observacaoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  observacaoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  observacaoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  observacaoButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: '45%',
    alignItems: 'center',
  },
  confirmModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: '45%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  cancelButton: {
    backgroundColor: '#E3F2FD',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});