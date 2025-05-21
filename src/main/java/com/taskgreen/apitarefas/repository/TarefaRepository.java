package com.taskgreen.apitarefas.repository;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Interface que liga a Tarefa ao banco de dados
@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    // Não precisa escrever nada aqui! O Spring já cria os métodos básicos:
    // salvar, buscar, deletar, listar...
}
