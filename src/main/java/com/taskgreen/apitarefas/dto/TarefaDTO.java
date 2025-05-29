package com.taskgreen.apitarefas.dto;

import com.taskgreen.apitarefas.model.Tarefa;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Classe DTO (Data Transfer Object) para representação segura dos dados de Tarefa.
 * Utilizado para transferir dados entre as camadas da aplicação sem expor a entidade completa.
 */
public class TarefaDTO {

    // Atributos que representam os dados da tarefa
    private String id;                // Identificador único da tarefa
    private String nome;              // Nome/título da tarefa
    private LocalDate dataInicio;     // Data de início da tarefa
    private LocalTime horarioInicio;  // Horário de início (opcional)
    private LocalTime horarioTermino; // Horário de término (opcional)
    private String prioridade;        // Nível de prioridade (ex: "alta", "media", "baixa")
    private String descricao;         // Descrição detalhada da tarefa
    private boolean concluida;        // Status de conclusão
    private String imagemUrl;         // URL da imagem associada (se existir)

    /**
     * Construtor que converte uma entidade Tarefa para DTO.
     *
     * @param tarefa Entidade Tarefa a ser convertida
     */
    public TarefaDTO(Tarefa tarefa) {
        this.id = tarefa.getId();
        this.nome = tarefa.getNome();
        this.dataInicio = tarefa.getDataInicio();
        this.horarioInicio = tarefa.getHorarioInicio();
        this.horarioTermino = tarefa.getHorarioTermino();
        this.prioridade = tarefa.getPrioridade();
        this.descricao = tarefa.getDescricao();
        this.concluida = tarefa.isConcluida();
        this.imagemUrl = tarefa.getImagemNome();  // Assume que a entidade tem getImagemNome()
    }

    /* ========== GETTERS ========== */
    // Métodos de acesso para permitir leitura dos atributos

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public LocalTime getHorarioTermino() {
        return horarioTermino;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public String getDescricao() {
        return descricao;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }
}