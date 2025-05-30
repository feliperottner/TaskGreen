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
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';

const API_URL = 'https://taskgreen.onrender.com';

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
  const [radioMarcado, setRadioMarcado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // 'erro' ou 'sucesso'

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

  
  async function concluirTarefa(id) {
    try {
      const form = new FormData();
      form.append('concluida', 'true');
      await axios.patch(`${API_URL}/api/tarefas/${id}/status?concluida=true`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[selectedDateKey] || []).map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: 'Concluída', concluida: true } : tarefa
        );
        return { ...prevTasks, [selectedDateKey]: atribuirStatusTarefas(novasTarefas) };
      });
    } catch (error) {
      // Trate o erro se quiser
    }
    setModalVisible(false);
  }

  async function excluirTarefa(id) {
    try {
      await axios.delete(`${API_URL}/api/tarefas/${id}`);
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[selectedDateKey] || []).filter((tarefa) => tarefa.id !== id);
        return { ...prevTasks, [selectedDateKey]: novasTarefas };
      });
      setMensagem('Tarefa excluída com sucesso!');
      setTipoMensagem('sucesso');
    } catch (error) {
      setMensagem('Erro ao excluir tarefa');
      setTipoMensagem('erro');
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
      const response = await axios.get(`${API_URL}/api/tarefas`); // GET correto
      const tarefas = response.data && response.data.length > 0
        ? response.data
        : tarefasSimuladas;
      setTasks(agruparPorData(atribuirStatusTarefas(tarefas)));
    } catch (error) {
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
          horarioInicio: item.horarioInicio, // <-- nome correto!
          horarioTermino: item.horarioTermino, // <-- nome correto!
          prioridade: item.prioridade,
          descricao: item.descricao,
          imagem: item.imagemUrl
  ? item.imagemUrl.startsWith('http')
    ? item.imagemUrl
    : `${API_URL}/api/tarefas/uploads/${item.imagemUrl}`
  : null,
          status: item.concluida ? 'Concluída' : item.status,
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.taskCard}>
        <View style={styles.taskIcon}>
          {item.concluida ? (
            <Image source={require('../../icons/concluido.png')} style={{ width: 30, height: 35, tintColor: 'white' }} />
          ) : item.status === 'Expirada' ? (
            <Image source={require('../../icons/expirado.png')} style={{ width: 30, height: 35, tintColor: 'white'}} />
          ) : (
            <Image source={require('../../icons/tarefa.png')} style={{ width: 30, height: 35, tintColor: 'white' }} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.nome}</Text>
          <Text style={styles.taskSubtitle}>{item.concluida ? 'Concluída' : item.status}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedTask(item);
            setModalVisible(true);
          }}
          style={{ justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 0, minWidth: 32 }}
        >
          <Text style={{ fontSize: 32, color: '#888', lineHeight: 32, textAlign: 'left' }}>⋮</Text>
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

        <View style={styles.dayList}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weekDays.map((item) => {
              const isActive = selectedDate.toISOString().split('T')[0] === item.fullDate;
              return (
                <TouchableOpacity key={item.fullDate} onPress={() => setSelectedDate(new Date(item.fullDate))}>
                  <View style={[styles.dayItem, isActive && styles.activeDay]}>
                    <Text
  style={[
    styles.dayText,
    item.fullDate === new Date().toISOString().split('T')[0] && { color: '#FF8A80' }, // vermelho para o dia atual
    isActive && styles.activeDayText,
  ]}
>
  {item.day}
</Text>
                    <Text style={[styles.dateText, isActive && styles.activeDateText]}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
          <View style={[styles.modalPrioridade, { alignItems: 'flex-start' }]}>
            <TouchableOpacity
              style={[
                styles.opcao,
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }
              ]}
              onPress={async () => {
                if (selectedTask?.concluida) {
                  // Desmarcar: marcar como "A fazer"
                  try {
                    const form = new FormData();
                    form.append('concluida', 'false');
                    await axios.patch(`${API_URL}/api/tarefas/${selectedTask.id}/status?concluida=false`, form, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setTasks((prevTasks) => {
                      const novasTarefas = (prevTasks[selectedDateKey] || []).map((tarefa) =>
                        tarefa.id === selectedTask.id
                          ? { ...tarefa, status: 'A fazer', concluida: false }
                          : tarefa
                      );
                      return { ...prevTasks, [selectedDateKey]: atribuirStatusTarefas(novasTarefas) };
                    });
                  } catch (error) {}
                } else {
                  // Marcar como concluída
                  try {
                    const form = new FormData();
                    form.append('concluida', 'true');
                    await axios.patch(`${API_URL}/api/tarefas/${selectedTask.id}/status?concluida=true`, form, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setTasks((prevTasks) => {
                      const novasTarefas = (prevTasks[selectedDateKey] || []).map((tarefa) =>
                        tarefa.id === selectedTask.id
                          ? { ...tarefa, status: 'Concluída', concluida: true }
                          : tarefa
                      );
                      return { ...prevTasks, [selectedDateKey]: atribuirStatusTarefas(novasTarefas) };
                    });
                  } catch (error) {}
                }
                setModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              {/* Quadrado com borda preta, preenchido só se concluída */}
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: '#111',
                backgroundColor: selectedTask?.concluida ? '#111' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                {selectedTask?.concluida ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : null}
              </View>
              <Text style={[styles.opcaoTexto, { color: '#222', fontWeight: 'bold' }]}>Concluir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.opcao,
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }
              ]}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditarTarefa', { tarefa: selectedTask });
              }}
            >
              <Ionicons name="pencil" size={20} color="#111" style={{ marginRight: 10 }} />
              <Text style={[styles.opcaoTexto, { color: '#222', fontWeight: 'bold' }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.opcao,
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }
              ]}
              onPress={() => setConfirmarExcluir(true)}
            >
              <Ionicons name="trash" size={20} color="#111" style={{ marginRight: 10 }} />
              <Text style={[styles.opcaoTexto, { color: '#222', fontWeight: 'bold' }]}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginTop: 10,
                backgroundColor: '#D3D3D3',
                width: '100%',
                paddingVertical: 12,
                borderRadius: 12,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#222', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
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
  style={{
    alignItems: 'center',
    backgroundColor: '#B3D9FF',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  }}
  onPress={() => {
    excluirTarefa(selectedTask.id); // Chame primeiro a exclusão
    setConfirmarExcluir(false);     // Depois feche o modal de confirmação
  }}
>
  <Text style={{ color: '#222', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Sim</Text>
</TouchableOpacity>
<TouchableOpacity
  style={{
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
  }}
  onPress={() => setConfirmarExcluir(false)}
>
  <Text style={{ color: '#222', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
</TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de mensagem de erro/sucesso centralizado */}
      {mensagem !== '' && (
        <Modal
          visible={!!mensagem}
          transparent
          animationType="fade"
          onRequestClose={() => setMensagem('')}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000080'
          }}>
            <View style={[
              styles.mensagemBox,
              tipoMensagem === 'erro' ? styles.mensagemErro : styles.mensagemSucesso,
              { minWidth: 220, maxWidth: '85%' }
            ]}>
              <Text style={styles.mensagemTexto}>{mensagem}</Text>
              <TouchableOpacity
                style={{
                  marginTop: 18,
                  backgroundColor: tipoMensagem === 'erro' ? '#ff5c5c' : '#4CAF50',
                  paddingVertical: 8,
                  paddingHorizontal: 22,
                  borderRadius: 8,
                }}
                onPress={() => setMensagem('')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    marginBottom: 12,
    paddingVertical: 5,
    // Removido justifyContent para permitir scroll
  },
  dayItem: {
    width: 55,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginHorizontal: 3,
    backgroundColor: '#F6FAFF',
  },
  activeDay: {
    backgroundColor: '#B2E4F9',
    borderRadius: 12,
    height: 70,
    shadowColor: '#B2E4F9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  dayText: {
    fontSize: 13,
    color: '#868E96',
    marginBottom: 6,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 17,
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
    textAlign: 'center',
  },
  cancelar: {
    fontSize: 18,
    paddingVertical: 10,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  mensagemBox: {
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minWidth: 220,
    maxWidth: '85%',
  },
  mensagemErro: {
    backgroundColor: '#fff6f6',
  },
  mensagemSucesso: {
    backgroundColor: '#eafcf3', // verde pastel suave
  },
  mensagemTexto: {
    color: '#222',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
});