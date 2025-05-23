package com.taskgreen.apitarefas.repository;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    Page<Tarefa> findByConcluida(boolean concluida, Pageable pageable);
}