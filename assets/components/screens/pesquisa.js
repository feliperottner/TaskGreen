import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../navbar';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const hoje = new Date();
const dataKey = hoje.toISOString().split('T')[0];
const horaInicio = '09:00';
const horaTermino = '10:00';

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
          status: 'Concluída',
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
        }
];

export default function TaskScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState({});
  const [filtroSelecionado, setFiltroSelecionado] = useState('A fazer');
   const [confirmarExcluir, setConfirmarExcluir] = useState(false);

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
      await axios.patch(`http://localhost:8080/tarefas/${id}`, { status: 'Concluída' });
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[dataKey] || []).map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: 'Concluída' } : tarefa
        );
        return { ...prevTasks, [dataKey]: atribuirStatusTarefas(novasTarefas) };
      });
    } catch (error) {
    }
    setModalVisible(false);
  }


  async function excluirTarefa(id) {
    try {
      await axios.delete(`http://localhost:8080/tarefas/${id}`);
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[dataKey] || []).filter((tarefa) => tarefa.id !== id);
        return { ...prevTasks, [dataKey]: novasTarefas };
      });
    } catch (error) {
    }
    setModalVisible(false);
  }

  useEffect(() => {
    setTasks({
      [dataKey]: atribuirStatusTarefas(tarefasSimuladas),
    });
  }, []);

  const filteredTasks = (tasks[dataKey] || []).filter((task) => {
    const matchTexto = task.nome.toLowerCase().includes(search.toLowerCase());
    let matchFiltro = true;
    if (filtroSelecionado === 'Expirada') {
      matchFiltro = task.status === 'Expirada';
    } else if (filtroSelecionado === 'A fazer') {
      matchFiltro = task.status === 'A fazer';
    } else if (filtroSelecionado === 'Concluídas') {
      matchFiltro = task.status === 'Concluída';
    }
    return matchTexto && matchFiltro;
  });

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
        <View style={styles.iconContainer}>
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
    <>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Procure uma tarefa"
              placeholderTextColor="#B2E4F9"
              value={search}
              onChangeText={setSearch}
            />
            <Feather name="search" size={25} color="#B2E4F9" style={styles.searchIcon} />
          </View>

          <View style={styles.filtroContainer}>
            {['Concluídas', 'A fazer', 'Expirada'].map((opcao) => (
              <TouchableOpacity
                key={opcao}
                onPress={() => setFiltroSelecionado(opcao)}
                style={[styles.filtroBotao, filtroSelecionado === opcao && styles.filtroBotaoAtivo]}
              >
                <Text
                  style={[styles.filtroTexto, filtroSelecionado === opcao && styles.filtroTextoAtivo]}
                >
                  {opcao}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlayHome}>
            <View style={styles.modalPrioridadeHome}>
              <TouchableOpacity style={styles.opcaoHome} onPress={() => concluirTarefa(selectedTask.id)}>
                <Text style={styles.opcaoTextoHome}>Concluir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.opcaoHome}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('EditarTarefa', { tarefa: selectedTask });
                }}
              >
                <Text style={styles.opcaoTextoHome}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.opcaoHome}
                onPress={() => setConfirmarExcluir(true)}
              >
                <Text style={styles.opcaoTextoHome}>Excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelarHome}>Cancelar</Text>
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
          <View style={styles.modalOverlayHome}>
            <View style={styles.modalPrioridadeHome}>
              <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
                Tem certeza que deseja excluir esta tarefa?
              </Text>
              <TouchableOpacity
                style={styles.opcaoHome}
                onPress={() => {
                  setConfirmarExcluir(false);
                  excluirTarefa(selectedTask.id);
                }}
              >
                <Text style={styles.opcaoTextoHome}>Sim, excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.opcaoHome}
                onPress={() => setConfirmarExcluir(false)}
              >
                <Text style={styles.opcaoTextoHome}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <Navbar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FF',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 5,
    marginTop: 45,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#B2E4F9',
    fontSize: 18,
    fontWeight: '500',
  },
  searchIcon: {
    marginLeft: 8,
  },
  taskSubtitle: {
    color: '#868E96',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#000',
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 10,
    
  },
  filtroBotao: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  filtroBotaoAtivo: {
    backgroundColor: '#B2E4F9',
  },
  filtroTexto: {
    color: '#B2E4F9',
    fontWeight: '600',
    paddingVertical: 3,
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  modalOverlayHome: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000080',
  },
  modalPrioridadeHome: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  opcaoHome: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  opcaoTextoHome: {
    fontSize: 18,
    color: '#007AFF',
    textAlign: 'center',
  },
  cancelarHome: {
    fontSize: 18,
    paddingVertical: 10,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
