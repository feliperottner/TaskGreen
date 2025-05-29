// Define o pacote onde a classe está localizada
package com.taskgreen.apitarefas.service;

// Importações necessárias
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

// Indica que esta classe é um serviço Spring (componente de negócios)
@Service
public class TarefaService {

    // Repositório injetado para acesso aos dados das tarefas
    private final TarefaRepository tarefaRepository;

    // Lista de prioridades válidas para validação
    private final List<String> PRIORIDADES_VALIDAS = List.of("baixa", "media", "alta");

    // Injeção de dependência do repositório via construtor
    @Autowired
    public TarefaService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    // ============= MÉTODOS DE CONSULTA =============

    /**
     * Retorna todas as tarefas cadastradas
     * @return Lista completa de tarefas
     */
    public List<Tarefa> listarTodasTarefas() {
        return tarefaRepository.findAll();
    }

    /**
     * Busca uma tarefa específica pelo ID
     * @param id Identificador da tarefa
     * @return Optional contendo a tarefa, se encontrada
     */
    public Optional<Tarefa> buscarPorId(String id) {
        return tarefaRepository.findById(id);
    }

    /**
     * Filtra tarefas por status de conclusão
     * @param concluida true para concluídas, false para pendentes
     * @return Lista de tarefas filtradas
     */
    public List<Tarefa> filtrarPorConclusao(boolean concluida) {
        return tarefaRepository.findByConcluida(concluida);
    }

    /**
     * Busca tarefas atrasadas (não concluídas com data anterior à atual)
     * @return Lista de tarefas atrasadas
     */
    public List<Tarefa> buscarTarefasAtrasadas() {
        return tarefaRepository.findTarefasAtrasadas(LocalDate.now());
    }

    /**
     * Busca tarefas por prioridade (com validação)
     * @param prioridade Nível de prioridade (baixa, media, alta)
     * @return Lista de tarefas com a prioridade especificada
     * @throws IllegalArgumentException Se a prioridade for inválida
     */
    public List<Tarefa> buscarPorPrioridade(String prioridade) {
        validarPrioridade(prioridade);
        return tarefaRepository.findByPrioridadeIgnoreCase(prioridade);
    }

    /**
     * Busca tarefas cujo nome contém o texto informado
     * @param nome Texto para busca parcial
     * @return Lista de tarefas que contêm o texto no nome
     */
    public List<Tarefa> buscarPorNome(String nome) {
        return tarefaRepository.findByNomeContaining(nome);
    }

    // ============= MÉTODOS DE MODIFICAÇÃO =============

    /**
     * Salva uma tarefa (criação ou atualização) com validação
     * @param tarefa Tarefa a ser salva
     * @return Tarefa salva
     * @throws RuntimeException Se ocorrer erro no banco de dados
     * @throws IllegalArgumentException Se a tarefa for inválida
     */
    @Transactional
    public Tarefa salvarTarefa(Tarefa tarefa) {
        validarTarefa(tarefa);
        try {
            return tarefaRepository.save(tarefa);
        } catch (DataAccessException ex) {
            throw new RuntimeException("Erro ao salvar tarefa no banco de dados", ex);
        }
    }

    /**
     * Cria uma nova tarefa com validação adicional
     * @param tarefa Tarefa a ser criada
     * @return Tarefa criada
     * @throws IllegalArgumentException Se os campos obrigatórios não forem informados
     */
    @Transactional
    public Tarefa criarTarefaComValidacao(Tarefa tarefa) {
        validarTarefaParaCriacao(tarefa);
        return salvarTarefa(tarefa);
    }

    /**
     * Remove uma tarefa pelo ID
     * @param id Identificador da tarefa a ser removida
     * @throws RuntimeException Se ocorrer erro no banco de dados
     */
    @Transactional
    public void deletarTarefa(String id) {
        try {
            tarefaRepository.deleteById(id);
        } catch (DataAccessException ex) {
            throw new RuntimeException("Erro ao deletar tarefa", ex);
        }
    }

    /**
     * Atualiza o status de conclusão de uma tarefa
     * @param id Identificador da tarefa
     * @param concluida Novo status de conclusão
     * @return Tarefa atualizada
     * @throws IllegalArgumentException Se a tarefa não for encontrada
     */
    @Transactional
    public Tarefa atualizarStatusConclusao(String id, boolean concluida) {
        return tarefaRepository.findById(id)
                .map(tarefa -> {
                    tarefa.setConcluida(concluida);
                    return salvarTarefa(tarefa);
                })
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada com ID: " + id));
    }

    // ============= MÉTODOS DE VALIDAÇÃO =============

    /**
     * Valida os dados básicos de uma tarefa
     * @param tarefa Tarefa a ser validada
     * @throws IllegalArgumentException Se alguma regra de validação for violada
     */
    private void validarTarefa(Tarefa tarefa) {
        LocalDate hoje = LocalDate.now();

        if (tarefa.getDataInicio() == null) {
            throw new IllegalArgumentException("Data de início é obrigatória");
        }

        if (tarefa.getDataInicio().isBefore(hoje)) {
            throw new IllegalArgumentException("Data de início não pode ser no passado");
        }

        if (tarefa.getHorarioInicio() != null && tarefa.getHorarioTermino() != null &&
                tarefa.getHorarioInicio().isAfter(tarefa.getHorarioTermino())) {
            throw new IllegalArgumentException("Horário de início não pode ser após o horário de término");
        }

        validarPrioridade(tarefa.getPrioridade());
    }

    /**
     * Valida os campos obrigatórios para criação de uma nova tarefa
     * @param tarefa Tarefa a ser validada
     * @throws IllegalArgumentException Se algum campo obrigatório estiver faltando
     */
    private void validarTarefaParaCriacao(Tarefa tarefa) {
        if (tarefa.getNome() == null || tarefa.getNome().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (tarefa.getDataInicio() == null) {
            throw new IllegalArgumentException("Data de início é obrigatória");
        }
        if (tarefa.getPrioridade() == null || tarefa.getPrioridade().isEmpty()) {
            throw new IllegalArgumentException("Prioridade é obrigatória");
        }

        validarTarefa(tarefa);
    }

    /**
     * Valida se a prioridade informada é válida
     * @param prioridade Prioridade a ser validada
     * @throws IllegalArgumentException Se a prioridade não estiver na lista de valores permitidos
     */
    private void validarPrioridade(String prioridade) {
        if (prioridade == null || !PRIORIDADES_VALIDAS.contains(prioridade.toLowerCase())) {
            throw new IllegalArgumentException("Prioridade deve ser: baixa, media ou alta");
        }
    }
}