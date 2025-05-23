import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function EditarTarefa() {
  const navigation = useNavigation();
  const route = useRoute();
  const { tarefa } = route.params; 

  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaTermino, setHoraTermino] = useState(null);
  const [prioridade, setPrioridade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showEntregaPicker, setShowEntregaPicker] = useState(false);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraTermino, setShowHoraTermino] = useState(false);
  const [mostrarPrioridades, setMostrarPrioridades] = useState(false);

  
  function stringToDateHora(horaStr) {
    if (!horaStr) return null;
    if (horaStr instanceof Date) return horaStr;
    const [h, m] = horaStr.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  }

  useEffect(() => {
    if (tarefa) {
      setNome(tarefa.nome);
      setDataInicio(new Date(tarefa.dataInicio));
      setDataEntrega(new Date(tarefa.dataEntrega));
      setHoraInicio(stringToDateHora(tarefa.horaInicio));
      setHoraTermino(stringToDateHora(tarefa.horaTermino));
      setPrioridade(tarefa.prioridade);
      setDescricao(tarefa.descricao || '');
      setImagemSelecionada(tarefa.imagem || null);
    }
  }, [tarefa]);

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão negada para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImagemSelecionada(result.assets[0].uri);
    }
  };

  const salvarEdicao = async () => {
    if (!nome || !dataInicio || !dataEntrega || !horaInicio || !horaTermino || !prioridade) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const tarefaAtualizada = {
        nome,
        dataInicio: dataInicio.toISOString(),
        dataEntrega: dataEntrega.toISOString(),
        horaInicio: horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        horaTermino: horaTermino.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        prioridade,
        descricao,
        imagem: imagemSelecionada,
      };

      await axios.put(`http://localhost:8080/tarefas/${tarefa.id}`, tarefaAtualizada);

      alert('Tarefa atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      alert('Erro ao editar tarefa');
    }
  };

  const formatarData = (data) => data ? data.toLocaleDateString('pt-br') : '';
  const formatarHora = (data) => data ? data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formatarPrioridade = (valor) => valor === 'alta' ? 'Alta' : valor === 'media' ? 'Média' : valor === 'baixa' ? 'Baixa' : 'Selecionar';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 20, backgroundColor: '#B2E4F9', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, color: '#fff', fontWeight: '600' }}>Editar Tarefa</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome da tarefa"
          placeholderTextColor="#ffffff"
        />

        <Text style={styles.label}>Data de início</Text>
        <TouchableOpacity onPress={() => setShowInicioPicker(true)}>
          <Text style={styles.dateText}>{formatarData(dataInicio) || 'Selecionar data'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Data de entrega</Text>
        <TouchableOpacity onPress={() => setShowEntregaPicker(true)}>
          <Text style={styles.dateText}>{formatarData(dataEntrega) || 'Selecionar data'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setShowHoraInicio(true)} style={styles.timeBox}>
            <Text style={styles.label2}>Início</Text>
            <Text style={styles.valor}>{formatarHora(horaInicio)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHoraTermino(true)} style={styles.timeBox}>
            <Text style={styles.label2}>Término</Text>
            <Text style={styles.valor}>{formatarHora(horaTermino)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMostrarPrioridades(true)} style={styles.timeBox}>
            <Text style={styles.label2}>Prioridade</Text>
            <Text style={styles.valor}>{formatarPrioridade(prioridade)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linhaClara} />

        <Text style={styles.label2}>Descrição</Text>
        <TextInput
          multiline
          style={styles.textArea}
          placeholder="Descrição da tarefa"
          placeholderTextColor="#BFC8E8"
          value={descricao}
          onChangeText={setDescricao}
        />

        <View style={styles.linhaClara} />

        {/* Imagem */}
        <View style={styles.iconeContainer}>
          {imagemSelecionada ? (
            <View style={styles.imagemWrapper}>
              <Image source={{ uri: imagemSelecionada }} style={styles.imagemSelecionada} />
              <TouchableOpacity onPress={() => setImagemSelecionada(null)} style={styles.botaoFecharImagem}>
                <Ionicons name="close-circle" size={28} color="#ff5c5c" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={escolherImagem} style={styles.campoImagem}>
              <Image source={require('../../icons/+foto.png')} style={styles.imagemIcone} />
              <Text style={styles.fraseIcone}>Adicionar imagem</Text>
            </TouchableOpacity>
          )}

          <View style={styles.linhaClara} />
          <TouchableOpacity style={styles.botaoSimples} onPress={salvarEdicao}>
            <Text style={styles.textoBotao}>Salvar alterações</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modais de data/hora/prioridade */}
      <DateTimePickerModal isVisible={showInicioPicker} mode="date" onConfirm={(date) => { setDataInicio(date); setShowInicioPicker(false); }} onCancel={() => setShowInicioPicker(false)} />
      <DateTimePickerModal isVisible={showEntregaPicker} mode="date" onConfirm={(date) => { setDataEntrega(date); setShowEntregaPicker(false); }} onCancel={() => setShowEntregaPicker(false)} />
      <DateTimePickerModal isVisible={showHoraInicio} mode="time" onConfirm={(time) => { setHoraInicio(time); setShowHoraInicio(false); }} onCancel={() => setShowHoraInicio(false)} />
      <DateTimePickerModal isVisible={showHoraTermino} mode="time" onConfirm={(time) => { setHoraTermino(time); setShowHoraTermino(false); }} onCancel={() => setShowHoraTermino(false)} />

      <Modal visible={mostrarPrioridades} transparent animationType="fade" onRequestClose={() => setMostrarPrioridades(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPrioridade}>
            {['alta', 'media', 'baixa'].map((nivel) => (
              <TouchableOpacity key={nivel} onPress={() => { setPrioridade(nivel); setMostrarPrioridades(false); }}>
                <Text style={styles.opcao}>{formatarPrioridade(nivel)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setMostrarPrioridades(false)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingBottom: 80
    },
    cardSuperior: {
      backgroundColor: '#B2E4F9',
      padding: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    conteudo: {
      padding: 20,
    },
    topo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      marginTop: 40,
    },
    titulo: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '600',
      color: '#fff',
    },
    label: {
      fontSize: 16,
      color: '#fff',
    },
    label2: {
      fontSize: 16,
      color: '#BFC8E8',
    },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: '#fff',
      paddingVertical: 10,
      marginBottom: 20,
      fontSize: 22,
      color: '#fff',
      fontWeight: 'bold',
    },
    dateText: {
      marginBottom: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#fff',
      marginTop: 8,
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
    },
    linha: {
      height: 1,
      backgroundColor: '#fff',
      marginVertical: 16,
    },
    linhaClara: {
      marginTop: 30,
      height: 1,
      backgroundColor: '#BFC8E8',
      marginVertical: 16,
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeBox: {
      flex: 1,
      marginHorizontal: 4,
    },
    valor: {
      color: '#000',
      fontWeight: 'bold',
      fontSize: 18,
      marginTop: 4,
    },
    textArea: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      color: '#000',
      fontSize: 18,
      height: 150,
      textAlignVertical: 'top',
      marginTop: 10,
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
      fontSize: 18,
      paddingVertical: 10,
      color: '#007AFF',
      textAlign: 'center',
    },
    cancelar: {
      fontSize: 18,
      paddingVertical: 10,
      color: 'red',
      textAlign: 'center',
      marginTop: 10,
    },
    imagemIcone: {
      width: 70,
      height: 62,
      resizeMode: 'contain',
    },
    imagemSelecionada: {
      width: 200,
      height: 200,
      borderRadius: 10,
    },
    fraseIcone: {
      marginTop: 8,
      fontSize: 22,
      color: '#BFC8E8',
      textAlign: 'center',
    },
    iconeContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    imagemWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    botaoFecharImagem: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: '#fff',
      borderRadius: 14,
    },
    
    campoImagem: {
      alignItems: 'center',
    },
    botaoSimples: {
      backgroundColor: '#B2E4F9',
      width: '100%',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 75,
      alignSelf: 'center',          
      marginTop: 30,
      marginBottom: 40, 
      paddingBottom: 10,           
    },
    textoBotao: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    
  });
