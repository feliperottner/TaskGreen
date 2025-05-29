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





const API_URL = 'https://taskgreen.onrender.com';

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
      let status;
      if (tarefa.concluida) {
        status = 'Concluída';
      } else {
        const dataEntrega = new Date(tarefa.dataEntrega);
        if (dataEntrega < hoje.setHours(0,0,0,0)) {
          status = 'Expirada';
        } else {
          status = 'A fazer';
        }
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
        const novasTarefas = (prevTasks[dataKey] || []).map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: 'Concluída', concluida: true } : tarefa
        );
        return { ...prevTasks, [dataKey]: atribuirStatusTarefas(novasTarefas) };
      });
    } catch (error) {
      // Trate o erro se quiser
    }
    setModalVisible(false);
  }

  async function excluirTarefa(id) {
    try {
      await axios.delete(`${API_URL}/api/tarefas/${id}`); // DELETE correto
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[dataKey] || []).filter((tarefa) => tarefa.id !== id);
        return { ...prevTasks, [dataKey]: novasTarefas };
      });
    } catch (error) {
      // Trate o erro se quiser
    }
    setModalVisible(false);
  }

  useEffect(() => {
    async function fetchTarefas() {
      try {
        const response = await axios.get(`${API_URL}/api/tarefas`);
        // Ajuste os campos conforme o backend retorna
        setTasks({
          [dataKey]: atribuirStatusTarefas(response.data)
        });
      } catch (error) {
        console.log('Erro ao buscar tarefas:', error.response?.data || error.message);
        setTasks({ [dataKey]: [] });
      }
    }
    fetchTarefas();
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
          horarioInicio: item.horarioInicio, // use o nome do backend
          horarioTermino: item.horarioTermino,
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
          style={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 0,
            minWidth: 32,
          }}
        >
          <Text style={{ fontSize: 32, color: '#888', lineHeight: 32, textAlign: 'left' }}>⋮</Text>
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
              <TouchableOpacity
                style={[styles.opcaoHome, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
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
                        const novasTarefas = (prevTasks[dataKey] || []).map((tarefa) =>
                          tarefa.id === selectedTask.id
                            ? { ...tarefa, status: 'A fazer', concluida: false }
                            : tarefa
                        );
                        return { ...prevTasks, [dataKey]: atribuirStatusTarefas(novasTarefas) };
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
                        const novasTarefas = (prevTasks[dataKey] || []).map((tarefa) =>
                          tarefa.id === selectedTask.id
                            ? { ...tarefa, status: 'Concluída', concluida: true }
                            : tarefa
                        );
                        return { ...prevTasks, [dataKey]: atribuirStatusTarefas(novasTarefas) };
                      });
                    } catch (error) {}
                  }
                  setModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: '#4CAF50',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  {selectedTask?.concluida ? (
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#4CAF50',
                    }} />
                  ) : null}
                </View>
                <Text style={[styles.opcaoTextoHome, { color: '#222', fontWeight: 'bold' }]}>Concluir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.opcaoHome, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('EditarTarefa', { tarefa: selectedTask });
                }}
              >
                <Ionicons name="pencil" size={20} color="#7EC8E3" style={{ marginRight: 10 }} />
                <Text style={[styles.opcaoTextoHome, { color: '#222', fontWeight: 'bold' }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.opcaoHome, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                onPress={() => setConfirmarExcluir(true)}
              >
                <Ionicons name="trash" size={20} color="#FF8A80" style={{ marginRight: 10 }} />
                <Text style={[styles.opcaoTextoHome, { color: '#222', fontWeight: 'bold' }]}>Excluir</Text>
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
          <View style={styles.modalOverlayHome}>
            <View style={styles.modalPrioridadeHome}>
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
                  setConfirmarExcluir(false);
                  excluirTarefa(selectedTask.id);
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
