package com.taskgreen.apitarefas.service;

import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    public List<Tarefa> listarTarefas() {
        return tarefaRepository.findAll();
    }

    public Optional<Tarefa> buscarPorId(Long id) {
        return tarefaRepository.findById(id);
    }

    public Tarefa salvarTarefa(Tarefa tarefa) {
        validarTarefa(tarefa);
        return tarefaRepository.save(tarefa);
    }

    public void deletarTarefa(Long id) {
        tarefaRepository.deleteById(id);
    }

    // ✅ Validação de datas e horários
    private void validarTarefa(Tarefa tarefa) {
        if (tarefa.getDataInicio().isAfter(tarefa.getDataEntrega())) {
            throw new IllegalArgumentException("Data de início não pode ser após a data de entrega.");
        }

        if (tarefa.getHorarioInicio().isAfter(tarefa.getHorarioTermino())) {
            throw new IllegalArgumentException("Horário de início não pode ser após o horário de término.");
        }
    }
}
