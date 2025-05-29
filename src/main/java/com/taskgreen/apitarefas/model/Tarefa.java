package com.taskgreen.apitarefas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

// Define que esta classe é um documento MongoDB que será armazenado na coleção "tarefas"
@Document(collection = "tarefas")
public class Tarefa {

    // Campo que representa o ID único do documento no MongoDB
    // A anotação @Id indica que este é o campo identificador principal
    @Id
    private String id;

    // Nome da tarefa - campo obrigatório e indexado para melhor performance em buscas
    // @NotBlank valida que o campo não pode ser nulo ou vazio
    // @Indexed cria um índice no banco de dados para este campo
    @NotBlank(message = "O nome da tarefa é obrigatório.")
    @Indexed
    private String nome;

    // Data de início da tarefa - campo obrigatório
    // @NotNull valida que o campo não pode ser nulo
    @NotNull(message = "A data de início é obrigatória.")
    private LocalDate dataInicio;

    // Horário de início da tarefa (opcional)
    private LocalTime horarioInicio;

    // Horário de término da tarefa (opcional)
    private LocalTime horarioTermino;

    // Prioridade da tarefa - campo obrigatório
    // @NotBlank valida que o campo não pode ser nulo ou vazio
    @NotBlank(message = "A prioridade é obrigatória.")
    private String prioridade;

    // Descrição detalhada da tarefa (opcional)
    private String descricao;

    // Status de conclusão da tarefa - inicia como false por padrão
    private boolean concluida = false;

    // Nome do arquivo de imagem associado à tarefa (opcional)
    private String imagemNome;

    // URL da imagem associada à tarefa (opcional)
    private String imagemUrl;

    // Métodos Getters e Setters para todos os campos

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalTime getHorarioTermino() {
        return horarioTermino;
    }

    public void setHorarioTermino(LocalTime horarioTermino) {
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

    public boolean isConcluida() {
        return concluida;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getImagemNome() {
        return imagemNome;
    }

    public void setImagemNome(String imagemNome) {
        this.imagemNome = imagemNome;
    }
}