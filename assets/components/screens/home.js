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
  TouchableWithoutFeedback
} from 'react-native';

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

  const hoje = new Date();
  const horaInicio = '09:00';
  const horaTermino = '10:00';

  
  function atribuirStatusTarefas(tarefas) {
    const hoje = new Date();
    return tarefas.map((tarefa) => {
      const dataEntrega = new Date(tarefa.dataEntrega);
      let status = tarefa.status;
      if (status === 'Concluída') {
      } else if (dataEntrega < hoje.setHours(0,0,0,0)) {
        status = 'Expirada';
      } else {
        status = 'A fazer';
      }
      return { ...tarefa, status };
    });
  }

  const tarefasSimuladas = [
    { id: 'simulada-1',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
           },
           {
             id: 'simulada-2',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             
             dataEntrega: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           },
           {
             id: 'simulada-3',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
           },
           {
             id: 'simulada-4',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           },
           {
             id: 'simulada-5',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
           },
           {
             id: 'simulada-6',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           },
           {
             id: 'simulada-7',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
             status: 'Concluída', 
           },
           {
             id: 'simulada-8',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           },{
             id: 'simulada-9',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
           },
           {
             id: 'simulada-10',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           },
           {
             id: 'simulada-11',
             nome: 'Tarefa Simulada',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: horaInicio, 
             horaTermino: horaTermino, 
             prioridade: 'Alta',
             descricao: 'Esta é uma tarefa simulada para teste.',
             imagem: null,
           },
           {
             id: 'simulada-12',
             nome: 'Outra Tarefa',
             dataInicio: hoje.toISOString(),
             dataEntrega: hoje.toISOString(),
             horaInicio: '14:00',
             horaTermino: '15:00',
             prioridade: 'Baixa',
             descricao: 'Mais uma tarefa para visualizar na lista.',
             imagem: null,
           }];
  
  async function concluirTarefa(id) {
    try {
      await axios.patch(`http://localhost:8080/tarefas/${id}`, { status: 'Concluída' });
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[selectedDateKey] || []).map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: 'Concluída' } : tarefa
        );
        return { ...prevTasks, [selectedDateKey]: atribuirStatusTarefas(novasTarefas) };
      });
    } catch (error) {
    }
    setModalVisible(false);
  }

  async function excluirTarefa(id) {
    try {
      await axios.delete(`http://localhost:8080/tarefas/${id}`);
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[selectedDateKey] || []).filter((tarefa) => tarefa.id !== id);
        return { ...prevTasks, [selectedDateKey]: novasTarefas };
      });
    } catch (error) {

    }
    setModalVisible(false);
  }

  // Função para agrupar tarefas por data
  const agruparPorData = (tarefas) => {
    return tarefas.reduce((acc, tarefa) => {
      const dataKey = tarefa.dataInicio.split('T')[0];
      if (!acc[dataKey]) acc[dataKey] = [];
      acc[dataKey].push(tarefa);
      return acc;
    }, {});
  };

  // Buscar tarefas da API
  const fetchTarefas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/tarefas');
      const tarefas = response.data && response.data.length > 0
        ? response.data
        : tarefasSimuladas;
      setTasks(agruparPorData(atribuirStatusTarefas(tarefas)));
    } catch (error) {
      // Se der erro, usa as simuladas
      setTasks(agruparPorData(atribuirStatusTarefas(tarefasSimuladas)));
    }
  };

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getWeekDays = (offset = 0) => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + offset * 7);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return {
        day: diasDaSemana[date.getDay()],
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
      };
    });

    setWeekDays(days);

    const monthName = new Date(days[0].fullDate).toLocaleString('pt-BR', { month: 'short' });
    const year = new Date(days[0].fullDate).getFullYear();
    setCurrentMonthYear(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`);

    if (!days.some(d => d.fullDate === selectedDate.toISOString().split('T')[0])) {
      setSelectedDate(new Date(days[0].fullDate));
    }
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

  // Altere o renderTask para mostrar o status
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
                      <Image source={require('../../icons/concluido.png')} style={{ width: 30, height: 35,tintColor: 'white' }} />
                    ) : item.status === 'Expirada' ? (
                      <Image source={require('../../icons/expirado.png')} style={{ width: 30, height: 35, tintColor: 'white'}} />
                    ) : (
                      <Image source={require('../../icons/tarefa.png')} style={{ width: 30, height: 35,tintColor: 'white' }} />
                    )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.nome}</Text>
          <Text style={styles.taskSubtitle}>{item.status}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedTask(item);
            setModalVisible(true);
          }}
        >
          <Text style={{ fontSize: 42, color: '#D9D9D9' }}>⋮</Text>
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
            <Text style={{ fontSize: 24, padding: 5 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
            <Text style={{ fontSize: 24, padding: 5 }}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dayList}>
          {weekDays.map((item) => {
            const isActive = selectedDate.toISOString().split('T')[0] === item.fullDate;
            return (
              <TouchableOpacity key={item.fullDate} onPress={() => setSelectedDate(new Date(item.fullDate))}>
                <View style={[styles.dayItem, isActive && styles.activeDay]}>
                  <Text style={[styles.dayText, isActive && styles.activeDayText]}>{item.day}</Text>
                  <Text style={[styles.dateText, isActive && styles.activeDateText]}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.contentArea}>
        <Text style={styles.sectionTitle}>Tarefas</Text>
        <FlatList
          data={tasks[selectedDateKey] || []}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }} 
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPrioridade}>
            <TouchableOpacity style={styles.opcao} onPress={() => concluirTarefa(selectedTask.id)}>
              <Text style={styles.opcaoTexto}>Concluir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.opcao}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditarTarefa', { tarefa: selectedTask });
              }}
            >
              <Text style={styles.opcaoTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.opcao} onPress={() => setConfirmarExcluir(true)}>
              <Text style={styles.opcaoTexto}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmarExcluir}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmarExcluir(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPrioridade}>
            <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
              Tem certeza que deseja excluir esta tarefa?
            </Text>
            <TouchableOpacity
              style={styles.opcao}
              onPress={() => {
                setConfirmarExcluir(false);
                excluirTarefa(selectedTask.id);
              }}
            >
              <Text style={styles.opcaoTexto}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.opcao}
              onPress={() => setConfirmarExcluir(false)}
            >
              <Text style={styles.opcaoTexto}>Cancelar</Text>
            </TouchableOpacity>
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
    paddingBottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#DEE2E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#B2E4F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  month: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  addTaskBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B2E4F9',
    width: 100,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addTaskText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dayList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 5,
  },
  dayItem: {
    width: 45,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeDay: {
    backgroundColor: '#B2E4F9',
    borderRadius: 10,
    height: 65,
  },
  dayText: {
    fontSize: 11,
    color: '#868E96',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  activeDayText: {
    color: '#fff',
  },
  activeDateText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
    marginTop: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  taskSubtitle: {
    color: '#868E96',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000080',
  },
  modalPrioridade: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  opcao: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  opcaoTexto: {
    fontSize: 18,
    color: '#007AFF', // Agora todas as opções, inclusive "Excluir", ficam azuis
    textAlign: 'center',
  },
  cancelar: {
    fontSize: 18,
    paddingVertical: 10,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});