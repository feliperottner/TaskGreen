package com.taskgreen.apitarefas.service;

// Spring
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Java Collections
import java.util.List;
import java.util.Optional;

// Model e Repository
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.repository.TarefaRepository;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    private final List<String> PRIORIDADES_VALIDAS = List.of("baixa", "media", "alta");

    public Page<Tarefa> listarTarefas(int page, int size) {
        return tarefaRepository.findAll(PageRequest.of(page, size));
    }

    public Optional<Tarefa> buscarPorId(Long id) {
        return tarefaRepository.findById(id);
    }

    public boolean existeTarefa(Long id) {
        return tarefaRepository.existsById(id);
    }

    @Transactional
    public Tarefa salvarTarefa(Tarefa tarefa) {
        validarPrioridade(tarefa.getPrioridade());
        validarTarefa(tarefa);
        return tarefaRepository.save(tarefa);
    }

    @Transactional
    public void deletarTarefa(Long id) {
        tarefaRepository.deleteById(id);
    }

    @Transactional
    public Tarefa atualizarStatusConclusao(Long id, boolean concluida) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada"));
        tarefa.setConcluida(concluida);
        return tarefaRepository.save(tarefa);
    }

    @Transactional(readOnly = true)
    public Page<Tarefa> filtrarPorConclusao(boolean concluida, int page, int size) {
        return tarefaRepository.findByConcluida(concluida, PageRequest.of(page, size));
    }

    // Métodos de validação
    private void validarPrioridade(String prioridade) {
        if (prioridade == null || !PRIORIDADES_VALIDAS.contains(prioridade.toLowerCase())) {
            throw new IllegalArgumentException("Prioridade deve ser: baixa, media ou alta");
        }
    }

    private void validarTarefa(Tarefa tarefa) {
        if (tarefa.getDataInicio().isAfter(tarefa.getDataEntrega())) {
            throw new IllegalArgumentException("Data de início não pode ser após a data de entrega");
        }
        if (tarefa.getHorarioInicio().isAfter(tarefa.getHorarioTermino())) {
            throw new IllegalArgumentException("Horário de início não pode ser após o horário de término");
        }
    }
}