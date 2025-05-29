import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'https://taskgreen.onrender.com';

export default function EditarTarefa() {
  const navigation = useNavigation();
  const route = useRoute();
  const { tarefa } = route.params; 

  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaTermino, setHoraTermino] = useState(null);
  const [prioridade, setPrioridade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraTermino, setShowHoraTermino] = useState(false);
  const [mostrarPrioridades, setMostrarPrioridades] = useState(false);

  // Mensagem de erro/sucesso
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // 'erro' ou 'sucesso'

  function stringToDateHora(horaStr) {
    if (!horaStr) return null;
    if (horaStr instanceof Date) return horaStr;
    const [h, m] = horaStr.split(':');
    if (!h || !m) return null;
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  }

  function stringToDate(dataStr) {
    if (!dataStr) return null;
    return new Date(dataStr);
  }

  useEffect(() => {
    if (tarefa) {
      setNome(tarefa.nome);
      setDataInicio(tarefa.dataInicio ? stringToDate(tarefa.dataInicio) : null);
      setHoraInicio(tarefa.horarioInicio ? stringToDateHora(tarefa.horarioInicio) : null);
      setHoraTermino(tarefa.horarioTermino ? stringToDateHora(tarefa.horarioTermino) : null);
      setPrioridade(tarefa.prioridade || '');
      setDescricao(tarefa.descricao || '');
      setImagemSelecionada(tarefa.imagemUrl ? `${API_URL}/api/tarefas/uploads/${tarefa.imagemUrl}` : null);
    }
  }, [tarefa]);

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setMensagem('Permissão negada para acessar a galeria.');
      setTipoMensagem('erro');
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
    if (!nome || !dataInicio || !horaInicio || !horaTermino || !prioridade) {
      setMensagem('Por favor, preencha todos os campos obrigatórios.');
      setTipoMensagem('erro');
      return;
    }

    try {
      const form = new FormData();
      form.append('nome', nome);
      form.append('dataInicio', dataInicio.toISOString().split('T')[0]);
      form.append('horarioInicio', horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      form.append('horarioTermino', horaTermino.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      form.append('prioridade', prioridade);
      form.append('descricao', descricao);
      form.append('concluida', tarefa.concluida ?? false);

      if (imagemSelecionada && !imagemSelecionada.startsWith('http')) {
        const filename = imagemSelecionada.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        form.append('imagem', {
          uri: imagemSelecionada,
          name: filename,
          type,
        });
      }

      await axios.put(`${API_URL}/api/tarefas/${tarefa.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensagem('Tarefa atualizada com sucesso!');
      setTipoMensagem('sucesso');
      setTimeout(() => {
        setMensagem('');
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.log('Erro ao editar tarefa:', error.response?.data || error.message);
      setMensagem('Erro ao editar tarefa');
      setTipoMensagem('erro');
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

        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowInicioPicker(true)}>
          <Text style={styles.dateText}>{formatarData(dataInicio) || 'Selecionar data'}</Text>
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
            <Text
              style={[
                styles.valor,
                prioridade === 'alta' && { color: '#E57373', fontWeight: 'bold' },
                prioridade === 'media' && { color: '#FFD54F', fontWeight: 'bold' },
                prioridade === 'baixa' && { color: '#81C784', fontWeight: 'bold' }
              ]}
            >
              {formatarPrioridade(prioridade)}
            </Text>
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
      <DateTimePickerModal isVisible={showHoraInicio} mode="time" onConfirm={(time) => { setHoraInicio(time); setShowHoraInicio(false); }} onCancel={() => setShowHoraInicio(false)} />
      <DateTimePickerModal isVisible={showHoraTermino} mode="time" onConfirm={(time) => { setHoraTermino(time); setShowHoraTermino(false); }} onCancel={() => setShowHoraTermino(false)} />

      {/* Modal de prioridade estilizado */}
      <Modal visible={mostrarPrioridades} transparent animationType="fade" onRequestClose={() => setMostrarPrioridades(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPrioridade}>
            <TouchableOpacity
              style={styles.opcaoPrioridade}
              onPress={() => { setPrioridade('alta'); setMostrarPrioridades(false); }}
            >
              <Text
                style={[
                  styles.opcao,
                  { color: '#E57373', fontWeight: 'bold' },
                  prioridade === 'alta' && { textDecorationLine: 'underline' }
                ]}
              >
                Alta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.opcaoPrioridade}
              onPress={() => { setPrioridade('media'); setMostrarPrioridades(false); }}
            >
              <Text
                style={[
                  styles.opcao,
                  { color: '#FFD54F', fontWeight: 'bold' },
                  prioridade === 'media' && { textDecorationLine: 'underline' }
                ]}
              >
                Média
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.opcaoPrioridade}
              onPress={() => { setPrioridade('baixa'); setMostrarPrioridades(false); }}
            >
              <Text
                style={[
                  styles.opcao,
                  { color: '#81C784', fontWeight: 'bold' },
                  prioridade === 'baixa' && { textDecorationLine: 'underline' }
                ]}
              >
                Baixa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMostrarPrioridades(false)} style={[styles.cancelarPrioridade, { backgroundColor: '#D3D3D3' }]}>
              <Text style={[styles.cancelar, { color: '#222' }]}>Cancelar</Text>
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
    marginBottom: 0, // Reduza o espaço após o campo de data
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
    justifyContent: 'center', // centraliza horizontalmente
    alignItems: 'center',     // centraliza verticalmente
    marginTop: 10,
    marginBottom: 10,
  },
  timeBox: {
    flex: 1,
    marginHorizontal: 8,      // aumenta o espaçamento lateral
    alignItems: 'center',     // centraliza o conteúdo dentro de cada box
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
    alignItems: 'center',
  },
  opcaoPrioridade: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  opcao: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelarPrioridade: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelar: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
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