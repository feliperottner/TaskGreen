package com.taskgreen.apitarefas.service;

import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;

    @Autowired
    public TarefaService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    private final List<String> PRIORIDADES_VALIDAS = List.of("baixa", "media", "alta");

    public List<Tarefa> listarTodasTarefas() {
        return tarefaRepository.findAll();
    }

    public Optional<Tarefa> buscarPorId(String id) {
        return tarefaRepository.findById(id);
    }

    public boolean existeTarefa(String id) {
        return tarefaRepository.existsById(id);
    }

    public List<Tarefa> filtrarPorConclusao(boolean concluida) {
        return tarefaRepository.findAll().stream()
                .filter(t -> t.isConcluida() == concluida)
                .collect(Collectors.toList());
    }

    @Transactional
    public Tarefa salvarTarefa(Tarefa tarefa) {
        validarDatas(tarefa);
        validarPrioridade(tarefa.getPrioridade());
        validarTarefa(tarefa);
        return tarefaRepository.save(tarefa);
    }

    @Transactional
    public void deletarTarefa(String id) {
        tarefaRepository.deleteById(id);
    }

    @Transactional
    public Tarefa atualizarStatusConclusao(String id, boolean concluida) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada"));
        tarefa.setConcluida(concluida);
        return tarefaRepository.save(tarefa);
    }

    private void validarDatas(Tarefa tarefa) {
        LocalDate hoje = LocalDate.now();

        if (tarefa.getDataInicio().isBefore(hoje)) {
            throw new IllegalArgumentException("Data de início não pode ser no passado");
        }

        if (tarefa.getDataEntrega().isBefore(tarefa.getDataInicio())) {
            throw new IllegalArgumentException("Data de entrega não pode ser antes da data de início");
        }
    }

    private void validarPrioridade(String prioridade) {
        if (prioridade == null || !PRIORIDADES_VALIDAS.contains(prioridade.toLowerCase())) {
            throw new IllegalArgumentException("Prioridade deve ser: baixa, media ou alta");
        }
    }

    private void validarTarefa(Tarefa tarefa) {
        if (tarefa.getHorarioInicio().isAfter(tarefa.getHorarioTermino())) {
            throw new IllegalArgumentException("Horário de início não pode ser após o horário de término");
        }
    }
}