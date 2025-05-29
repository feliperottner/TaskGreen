import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// Adicione a constante da URL do backend
const API_URL = 'https://taskgreen.onrender.com';

export default function CriarTarefa() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  // Remova o estado dataEntrega
  // const [dataEntrega, setDataEntrega] = useState(null);
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  // Remova o estado showEntregaPicker
  // const [showEntregaPicker, setShowEntregaPicker] = useState(false);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaTermino, setHoraTermino] = useState(null);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraTermino, setShowHoraTermino] = useState(false);
  const [prioridade, setPrioridade] = useState('');
  const [mostrarPrioridades, setMostrarPrioridades] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState(''); // 'erro' ou 'sucesso'

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

  const criarTarefa = async () => {
    if (!nome || !dataInicio || !horaInicio || !horaTermino || !prioridade) {
      setMensagem('Por favor, preencha todos os campos obrigatórios.');
      setTipoMensagem('erro');
      return;
    }
  
    const form = new FormData();
    form.append('nome', nome);
    form.append('dataInicio', dataInicio.toISOString().split('T')[0]);
    // Remova dataEntrega da validação
    // form.append('dataEntrega', dataEntrega.toISOString().split('T')[0]);
    form.append('horarioInicio', horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    form.append('horarioTermino', horaTermino.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    form.append('prioridade', prioridade);
    form.append('descricao', descricao);
    form.append('concluida', 'false');
  
    if (imagemSelecionada) {
      const filename = imagemSelecionada.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      form.append('imagem', {
        uri: imagemSelecionada,
        name: filename,
        type,
      });
    }
  
    try {
      await axios.post(`${API_URL}/api/tarefas`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMensagem('Tarefa criada com sucesso!');
      setTipoMensagem('sucesso');
      setTimeout(() => {
        setMensagem('');
        navigation.navigate('Home');
      }, 1500);
    } catch (error) {
      console.log('Erro ao criar tarefa:', error.response?.data || error.message);
      setMensagem('Erro ao criar tarefa');
      setTipoMensagem('erro');
    }
  };
  

  const formatarData = (data) => {
    return data ? data.toLocaleDateString('pt-br', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : '';
  };

  const formatarHora = (data) => {
    return data ? data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const formatarPrioridade = (valor) => {
    if (valor === 'alta') return 'Alta';
    if (valor === 'media') return 'Média';
    if (valor === 'baixa') return 'Baixa';
    return 'Selecionar';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.cardSuperior}>
        <View style={styles.topo}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Criar Tarefa</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Mensagem de erro ou sucesso DENTRO do cardSuperior */}
        {/* {mensagem !== '' && (
          <View
            style={[
              styles.mensagemBox,
              tipoMensagem === 'erro' ? styles.mensagemErro : styles.mensagemSucesso,
              { alignSelf: 'stretch', marginTop: 12, marginBottom: 8 }
            ]}
          >
            <Text style={styles.mensagemTexto}>{mensagem}</Text>
          </View>
        )} */}

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome"
          placeholderTextColor="#ffffff"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowInicioPicker(true)}>
          <Text style={styles.dateText}>{formatarData(dataInicio) || 'Selecionar data'}</Text>
        </TouchableOpacity>
        {/* Remova o campo Data de entrega */}
        {/* 
        <Text style={styles.label}>Data de entrega</Text>
        <TouchableOpacity onPress={() => setShowEntregaPicker(true)}>
          <Text style={styles.dateText}>{formatarData(dataEntrega) || 'Selecionar data'}</Text>
        </TouchableOpacity>
        */}
      </View>

      <View style={styles.conteudo}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setShowHoraInicio(true)} style={styles.timeBox}>
            <Text style={styles.label2}>Início</Text>
            <Text style={styles.valor}>{formatarHora(horaInicio) || 'Selecionar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowHoraTermino(true)} style={styles.timeBox}>
            <Text style={styles.label2}>Término</Text>
            <Text style={styles.valor}>{formatarHora(horaTermino) || 'Selecionar'}</Text>
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
          placeholder="Digite a descrição"
          placeholderTextColor="#BFC8E8"
          value={descricao}
          onChangeText={setDescricao}
        />

        <View style={styles.linhaClara} />

        <View style={styles.iconeContainer}>
  {imagemSelecionada ? (
    <View style={styles.imagemWrapper}>
      <Image source={{ uri: imagemSelecionada }} style={styles.imagemSelecionada} />
      <TouchableOpacity
        style={styles.botaoFecharImagem}
        onPress={() => setImagemSelecionada(null)}
      >
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
  <TouchableOpacity style={styles.botaoSimples} onPress={criarTarefa}>
  <Text style={styles.textoBotao}>Criar tarefa</Text>
</TouchableOpacity>


</View>

      </View>


      <DateTimePickerModal
        isVisible={showInicioPicker}
        mode="date"
        onConfirm={(date) => {
          setShowInicioPicker(false);
          setDataInicio(date);
        }}
        onCancel={() => setShowInicioPicker(false)}
        headerTextIOS="Selecione a data"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        pickerStyleIOS={{
          backgroundColor: '#B2E4F9',
        }}
      />
      {/* Remova o segundo DateTimePickerModal de dataEntrega */}
      {/* 
      <DateTimePickerModal
        isVisible={showEntregaPicker}
        mode="date"
        onConfirm={(date) => {
          setShowEntregaPicker(false);
          setDataEntrega(date);
        }}
        onCancel={() => setShowEntregaPicker(false)}
        headerTextIOS="Selecione a data"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        pickerStyleIOS={{
          backgroundColor: '#B2E4F9',
        }}
      />
      */}
      <DateTimePickerModal
        isVisible={showHoraInicio}
        mode="time"
        onConfirm={(time) => {
          setHoraInicio(time);
          setShowHoraInicio(false);
        }}
        onCancel={() => setShowHoraInicio(false)}
      />
      <DateTimePickerModal
        isVisible={showHoraTermino}
        mode="time"
        onConfirm={(time) => {
          setHoraTermino(time);
          setShowHoraTermino(false);
        }}
        onCancel={() => setShowHoraTermino(false)}
      />


      <Modal
        visible={mostrarPrioridades}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarPrioridades(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPrioridadeCustom}>
            <Text style={styles.modalTitulo}>Selecione a prioridade</Text>
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
            <TouchableOpacity
              style={[styles.cancelarPrioridade, { backgroundColor: '#D3D3D3' }]}
              onPress={() => setMostrarPrioridades(false)}
            >
              <Text style={[styles.cancelar, { color: '#222' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              { minWidth: 220, maxWidth: '80%' }
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
    // Ajuste o paddingBottom para dar mais espaço após remover o campo
    paddingBottom: 30,
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
    marginTop: 10,            // opcional: espaço acima
    marginBottom: 10,         // opcional: espaço abaixo
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
  modalPrioridadeCustom: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  opcaoPrioridade: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    // Removido backgroundColor para não ter cor de fundo
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
    color: 'red', // será sobrescrito para preto no botão cancelar
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
