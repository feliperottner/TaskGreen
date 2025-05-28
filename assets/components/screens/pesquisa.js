import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Modal
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../navbar';
import axios from 'axios';

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
    dataEntrega: new Date(Date.now() + 86400000).toISOString(),
    horaInicio: '14:00',
    horaTermino: '15:30',
    prioridade: 'media',
    descricao: 'Atualizar os documentos técnicos do sistema',
    status: 'A fazer',
    imagem: null
  }
];

export default function PesquisaScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState({});
  const [filtroSelecionado, setFiltroSelecionado] = useState('A fazer');
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [showObservacaoInput, setShowObservacaoInput] = useState(false);

  const hoje = new Date();
  const dataKey = hoje.toISOString().split('T')[0];

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

  async function concluirTarefa(id, observacao = '') {
    try {
      await axios.patch(`http://localhost:8080/tarefas/${id}`, { 
        status: 'Concluída',
        observacao 
      });
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[dataKey] || []).map((tarefa) =>
          tarefa.id === id ? { ...tarefa, status: 'Concluída' } : tarefa
        );
        return { ...prevTasks, [dataKey]: atribuirStatusTarefas(novasTarefas) };
      });
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
    setModalVisible(false);
    setShowObservacaoInput(false);
    setObservacaoConclusao('');
  }

  async function excluirTarefa(id) {
    try {
      await axios.delete(`http://localhost:8080/tarefas/${id}`);
      setTasks((prevTasks) => {
        const novasTarefas = (prevTasks[dataKey] || []).filter((tarefa) => tarefa.id !== id);
        return { ...prevTasks, [dataKey]: novasTarefas };
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
    setModalVisible(false);
  }

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const response = await axios.get('http://localhost:8080/tarefas');
        setTasks({
          [dataKey]: atribuirStatusTarefas(response.data || tarefasSimuladas)
        });
      } catch (error) {
        setTasks({
          [dataKey]: atribuirStatusTarefas(tarefasSimuladas)
        });
      }
    };
    
    carregarTarefas();
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
      <View style={styles.contentArea}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#B2E4F9" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Procure uma tarefa"
            placeholderTextColor="#B2E4F9"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filtroContainer}>
          {['Concluídas', 'A fazer', 'Expirada'].map((opcao) => (
            <TouchableOpacity
              key={opcao}
              onPress={() => setFiltroSelecionado(opcao)}
              style={[
                styles.filtroBotao, 
                filtroSelecionado === opcao && styles.filtroBotaoAtivo
              ]}
            >
              <Text style={[
                styles.filtroTexto,
                filtroSelecionado === opcao && styles.filtroTextoAtivo
              ]}>
                {opcao}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
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
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    marginTop: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#B2E4F9',
    fontSize: 16,
    fontWeight: '500',
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 14,
  },
  filtroTextoAtivo: {
    color: '#fff',
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