package com.taskgreen.apitarefas.dto;

import com.taskgreen.apitarefas.model.Tarefa;

import java.time.LocalDate;
import java.time.LocalTime;

public class TarefaDTO {
    private Long id;
    private String nome;
    private LocalDate dataInicio;
    private LocalDate dataEntrega;
    private LocalTime horarioInicio;
    private LocalTime horarioTermino;
    private String prioridade;
    private String descricao;
    private boolean concluida;
    private String imagemUrl;

    public TarefaDTO(Tarefa tarefa) {
        this.id = tarefa.getId();
        this.nome = tarefa.getNome();
        this.dataInicio = tarefa.getDataInicio();
        this.dataEntrega = tarefa.getDataEntrega();
        this.horarioInicio = tarefa.getHorarioInicio();
        this.horarioTermino = tarefa.getHorarioTermino();
        this.prioridade = tarefa.getPrioridade();
        this.descricao = tarefa.getDescricao();
        this.concluida = tarefa.isConcluida();
        this.imagemUrl = (tarefa.getImagemNome());
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataEntrega() {
        return dataEntrega;
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
