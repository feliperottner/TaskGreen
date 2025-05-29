import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_URL = 'https://taskgreen.onrender.com'; // Adicione essa linha no topo

export default function VisualizarTarefa() {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalImagem, setModalImagem] = useState(false); // Novo estado para modal da imagem
  const {
    nome = '',
    dataInicio = '',
    horarioInicio = '',
    horarioTermino = '',
    prioridade = '',
    descricao = '',
    imagem = '',
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
    // Se já está no formato HH:mm, retorna direto
    if (typeof hora === 'string' && /^\d{2}:\d{2}$/.test(hora)) return hora;
    // Se está no formato HH:mm:ss, corta os segundos
    if (typeof hora === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(hora)) return hora.slice(0, 5);
    // Se for Date, converte
    if (hora instanceof Date) {
      return hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Se for string de data, converte
    const data = new Date(hora);
    if (!isNaN(data.getTime())) {
      return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return hora;
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

        <Text style={styles.label}>Data</Text>
        <Text style={styles.dado}>{formatarData(dataInicio)}</Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.row}>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Início</Text>
            <Text style={styles.valor}>{formatarHora(horarioInicio)}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Término</Text>
            <Text style={styles.valor}>{formatarHora(horarioTermino)}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.label2}>Prioridade</Text>
            <Text
              style={[
                styles.valor,
                {
                  marginTop: 8,
                  color:
                    prioridade === 'alta'
                      ? '#FF8A80'
                      : prioridade === 'media'
                      ? '#FFD580'
                      : prioridade === 'baixa'
                      ? '#7ED957' // verde para baixa prioridade
                      : '#BFC8E8',
                  fontWeight: 'bold',
                  fontSize: 17,
                },
              ]}
            >
              {formatarPrioridade(prioridade)}
            </Text>
          </View>
        </View>

        <View style={styles.linhaClara} />

        <Text style={styles.label2}>Descrição</Text>
        <Text style={styles.textArea}>{descricao}</Text>

        <View style={styles.linhaClara} />

        <View style={styles.iconeContainer}>
          {imagem ? (
            <>
              <TouchableOpacity onPress={() => setModalImagem(true)}>
                <Image
                  source={{ uri: imagem }}
                  style={styles.imagemSelecionada}
                />
              </TouchableOpacity>
              <Modal
                visible={modalImagem}
                transparent
                animationType="fade"
                onRequestClose={() => setModalImagem(false)}
              >
                <View style={styles.modalImagemOverlay}>
                  <Image
                    source={{ uri: imagem }}
                    style={styles.imagemAmpliada}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    onPress={() => setModalImagem(false)}
                    style={{
                      position: 'absolute',
                      top: 40,
                      right: 30,
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      padding: 4,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="close" size={32} color="#222" />
                  </TouchableOpacity>
                </View>
              </Modal>
            </>
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
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  conteudo: {
    padding: 24,
    paddingTop: 10,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 36,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 15,
    color: '#fff',
    marginTop: 8,
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingVertical: 8,
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  label2: {
    fontSize: 15,
    color: '#BFC8E8',
    fontWeight: '500',
    marginBottom: 2,
  },
  valor: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  linhaClara: {
    marginTop: 24,
    height: 1,
    backgroundColor: '#BFC8E8',
    marginVertical: 12,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center', // centraliza horizontalmente
    alignItems: 'center',     // centraliza verticalmente
    marginBottom: 8,
  },
  timeBox: {
    flex: 1,
    marginHorizontal: 8,      // aumenta o espaçamento lateral
    alignItems: 'center',     // centraliza o conteúdo dentro de cada box
  },
  textArea: {
    backgroundColor: '#F6FAFF',
    borderRadius: 10,
    padding: 12,
    color: '#222',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  imagemSelecionada: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginTop: 8,
  },
  iconeContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  fraseIcone: {
    fontSize: 16,
    color: '#BFC8E8',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  modalImagemOverlay: {
    flex: 1,
    backgroundColor: '#000C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagemAmpliada: {
    width: '90%',
    height: '70%',
    borderRadius: 16,
    alignSelf: 'center',
  },
});
