package com.taskgreen.apitarefas.repository;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TarefaRepository extends MongoRepository<Tarefa, String> {

    List<Tarefa> findByConcluida(boolean concluida);

    List<Tarefa> findByPrioridadeIgnoreCase(String prioridade);

    @Query("{ 'dataEntrega' : { $lt: ?0 }, 'concluida' : false }")
    List<Tarefa> findTarefasAtrasadas(LocalDate dataAtual);

    @Query("{ 'nome' : { $regex: ?0, $options: 'i' } }")
    List<Tarefa> findByNomeContaining(String nome);

    @Query(value = "{ 'dataEntrega' : { $gte: ?0, $lte: ?1 } }", sort = "{ 'dataEntrega' : 1 }")
    List<Tarefa> findByDataEntregaBetween(LocalDate inicio, LocalDate fim);
}