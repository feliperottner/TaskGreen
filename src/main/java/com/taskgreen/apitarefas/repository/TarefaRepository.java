// Pacote onde a interface está localizada
package com.taskgreen.apitarefas.repository;

// Importações necessárias
import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

// Indica que esta interface é um componente Spring do tipo Repository
// Isso permite a injeção de dependência em outros componentes
@Repository
public interface TarefaRepository extends MongoRepository<Tarefa, String> {

    /**
     * Busca tarefas por status de conclusão
     * @param concluida true para tarefas concluídas, false para pendentes
     * @return Lista de tarefas com o status especificado
     */
    List<Tarefa> findByConcluida(boolean concluida);

    /**
     * Busca tarefas por prioridade (case insensitive)
     * @param prioridade Prioridade a ser filtrada (ignora maiúsculas/minúsculas)
     * @return Lista de tarefas com a prioridade especificada
     */
    List<Tarefa> findByPrioridadeIgnoreCase(String prioridade);

    /**
     * Busca tarefas atrasadas (não concluídas com data de início anterior à data atual)
     * Usa uma query MongoDB personalizada
     * @param dataAtual Data de referência para verificar atrasos
     * @return Lista de tarefas atrasadas
     */
    @Query("{ 'dataInicio' : { $lt: ?0 }, 'concluida' : false }")
    List<Tarefa> findTarefasAtrasadas(LocalDate dataAtual);

    /**
     * Busca tarefas cujo nome contém o texto especificado (case insensitive)
     * Usa expressão regular para busca parcial
     * @param nome Texto a ser buscado no nome das tarefas
     * @return Lista de tarefas que contêm o texto no nome
     */
    @Query("{ 'nome' : { $regex: ?0, $options: 'i' } }")
    List<Tarefa> findByNomeContaining(String nome);
}