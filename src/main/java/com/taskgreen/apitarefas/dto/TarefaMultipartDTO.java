package com.taskgreen.apitarefas.dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public class TarefaMultipartDTO {

    private Long id;

    @NotBlank(message = "O nome da tarefa é obrigatório")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    private String nome;

    @NotBlank(message = "A data de início é obrigatória")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Formato de data inválido (use yyyy-MM-dd)")
    private String dataInicio;

    @NotBlank(message = "A data de entrega é obrigatória")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Formato de data inválido (use yyyy-MM-dd)")
    private String dataEntrega;

    @NotBlank(message = "O horário de início é obrigatório")
    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Formato de horário inválido (use HH:mm)")
    private String horarioInicio;

    @NotBlank(message = "O horário de término é obrigatório")
    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Formato de horário inválido (use HH:mm)")
    private String horarioTermino;

    @NotBlank(message = "A prioridade é obrigatória")
    private String prioridade;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String descricao;

    private boolean concluida = false; // CAMPO NOVO ADICIONADO

    private MultipartFile imagem;

    // ===== GETTERS E SETTERS =====
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(String dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(String dataEntrega) {
        this.dataEntrega = dataEntrega;
    }

    public String getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(String horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public String getHorarioTermino() {
        return horarioTermino;
    }

    public void setHorarioTermino(String horarioTermino) {
        this.horarioTermino = horarioTermino;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    // GETTERS/SETTERS NOVOS PARA O CAMPO 'concluida'
    public boolean isConcluida() {
        return concluida;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }

    public MultipartFile getImagem() {
        return imagem;
    }

    public void setImagem(MultipartFile imagem) {
        this.imagem = imagem;
    }
}