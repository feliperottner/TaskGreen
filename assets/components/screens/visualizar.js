import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VisualizarTarefa() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    nome = '',
    dataInicio = '',
    dataEntrega = '',
    horaInicio = '',
    horaTermino = '',
    prioridade = '',
    descricao = '',
    imagem = null
  } = route.params || {};

  
  const formatarData = (data) => {
    if (!data) return '';
    const dataFormatada = new Date(data);
    return dataFormatada.toLocaleDateString('pt-br', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatarHora = (hora) => {
    if (!hora) return '';
    if (typeof hora === 'string' && /^\d{2}:\d{2}$/.test(hora)) return hora;
    const data = new Date(hora);
    if (isNaN(data.getTime())) return hora; 
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatarPrioridade = (valor) => {
    if (valor === 'alta') return 'Alta';
    if (valor === 'media') return 'Média';
    if (valor === 'baixa') return 'Baixa';
    return valor;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.cardSuperior}>
        <View style={styles.topo}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Visualizar Tarefa</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Nome</Text>
        <Text style={styles.dado}>{nome}</Text>

        <Text style={styles.label}>Data de início</Text>
        <Text style={styles.dado}>{formatarData(dataInicio)}</Text>

        <Text style={styles.label}>Data de entrega</Text>
        <Text style={styles.dado}>{formatarData(dataEntrega)}</Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.row}>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Início</Text>
            <Text style={styles.valor}>{formatarHora(horaInicio)}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Término</Text>
            <Text style={styles.valor}>{formatarHora(horaTermino)}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Prioridade</Text>
            <Text style={styles.valor}>{formatarPrioridade(prioridade)}</Text>
          </View>
        </View>

        <View style={styles.linhaClara} />

        <Text style={styles.label2}>Descrição</Text>
        <Text style={styles.textArea}>{descricao}</Text>

        <View style={styles.linhaClara} />

        <View style={styles.iconeContainer}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.imagemSelecionada} />
          ) : (
            <Text style={styles.fraseIcone}>Nenhuma imagem adicionada</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginTop: 10,
    
  },
  dado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingVertical: 10,
    marginBottom: 20,
  },
  label2: {
    fontSize: 16,
    color: '#BFC8E8',
  },
  valor: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
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
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    color: '#000',
    fontSize: 18,
    minHeight: 150,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  imagemSelecionada: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  iconeContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginVertical: 30,
  },
  fraseIcone: {
    fontSize: 18,
    color: '#BFC8E8',
    textAlign: 'center',
    marginTop: 10,
  },
});
