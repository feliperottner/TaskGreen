package com.taskgreen.apitarefas.service;

import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final List<String> PRIORIDADES_VALIDAS = List.of("baixa", "media", "alta");

    @Autowired
    public TarefaService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    public List<Tarefa> listarTodasTarefas() {
        return tarefaRepository.findAll();
    }

    public Optional<Tarefa> buscarPorId(String id) {
        return tarefaRepository.findById(id);
    }

    public List<Tarefa> filtrarPorConclusao(boolean concluida) {
        return tarefaRepository.findByConcluida(concluida);
    }

    public List<Tarefa> buscarTarefasAtrasadas() {
        return tarefaRepository.findTarefasAtrasadas(LocalDate.now());
    }

    public List<Tarefa> buscarPorPrioridade(String prioridade) {
        validarPrioridade(prioridade);
        return tarefaRepository.findByPrioridadeIgnoreCase(prioridade);
    }

    public List<Tarefa> buscarPorNome(String nome) {
        return tarefaRepository.findByNomeContaining(nome);
    }

    public List<Tarefa> buscarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return tarefaRepository.findByDataEntregaBetween(inicio, fim);
    }

    @Transactional
    public Tarefa salvarTarefa(Tarefa tarefa) {
        validarTarefa(tarefa);
        try {
            return tarefaRepository.save(tarefa);
        } catch (DataAccessException ex) {
            throw new RuntimeException("Erro ao salvar tarefa no banco de dados", ex);
        }
    }

    @Transactional
    public Tarefa criarTarefaComValidacao(Tarefa tarefa) {
        validarTarefaParaCriacao(tarefa);
        return salvarTarefa(tarefa);
    }

    @Transactional
    public void deletarTarefa(String id) {
        try {
            tarefaRepository.deleteById(id);
        } catch (DataAccessException ex) {
            throw new RuntimeException("Erro ao deletar tarefa", ex);
        }
    }

    @Transactional
    public Tarefa atualizarStatusConclusao(String id, boolean concluida) {
        return tarefaRepository.findById(id)
                .map(tarefa -> {
                    tarefa.setConcluida(concluida);
                    return salvarTarefa(tarefa);
                })
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada com ID: " + id));
    }

    private void validarTarefa(Tarefa tarefa) {
        LocalDate hoje = LocalDate.now();

        if (tarefa.getDataInicio() == null || tarefa.getDataEntrega() == null) {
            throw new IllegalArgumentException("Datas são obrigatórias");
        }

        if (tarefa.getDataInicio().isBefore(hoje)) {
            throw new IllegalArgumentException("Data de início não pode ser no passado");
        }

        if (tarefa.getDataEntrega().isBefore(tarefa.getDataInicio())) {
            throw new IllegalArgumentException("Data de entrega não pode ser antes da data de início");
        }

        if (tarefa.getHorarioInicio() != null && tarefa.getHorarioTermino() != null &&
                tarefa.getHorarioInicio().isAfter(tarefa.getHorarioTermino())) {
            throw new IllegalArgumentException("Horário de início não pode ser após o horário de término");
        }

        validarPrioridade(tarefa.getPrioridade());
    }

    private void validarTarefaParaCriacao(Tarefa tarefa) {
        if (tarefa.getNome() == null || tarefa.getNome().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (tarefa.getDataInicio() == null) {
            throw new IllegalArgumentException("Data de início é obrigatória");
        }
        if (tarefa.getDataEntrega() == null) {
            throw new IllegalArgumentException("Data de entrega é obrigatória");
        }
        if (tarefa.getPrioridade() == null || tarefa.getPrioridade().isEmpty()) {
            throw new IllegalArgumentException("Prioridade é obrigatória");
        }

        validarTarefa(tarefa);
    }

    private void validarPrioridade(String prioridade) {
        if (prioridade == null || !PRIORIDADES_VALIDAS.contains(prioridade.toLowerCase())) {
            throw new IllegalArgumentException("Prioridade deve ser: baixa, media ou alta");
        }
    }
}