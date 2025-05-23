package com.taskgreen.apitarefas.repository;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TarefaRepository extends MongoRepository<Tarefa, String> {
    // Tipo do ID mudou para String

    // Métodos personalizados (funcionam igual ao JPA, mas com sintaxe do MongoDB)
    List<Tarefa> findByConcluida(boolean concluida);

    // O Spring implementa automaticamente:
    // - save()
    // - findAll()
    // - findById()
    // - deleteById()
    // - etc.
}