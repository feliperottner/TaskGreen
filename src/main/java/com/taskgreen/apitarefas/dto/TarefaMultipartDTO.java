package com.taskgreen.apitarefas.dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO especializado para receber dados de tarefa com upload de imagem via multipart/form-data.
 * Inclui validações para os campos recebidos.
 */
public class TarefaMultipartDTO {

    // Validação: tamanho máximo de 100 caracteres
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    private String nome;

    // Validação: formato de data específico (yyyy-MM-dd)
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Formato de data inválido (use yyyy-MM-dd)")
    private String dataInicio;

    // Validação: formato de horário (HH:mm)
    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Formato de horário inválido (use HH:mm)")
    private String horarioInicio;

    // Validação: formato de horário (HH:mm)
    @Pattern(regexp = "^\\d{2}:\\d{2}$", message = "Formato de horário inválido (use HH:mm)")
    private String horarioTermino;

    private String prioridade;  // Prioridade da tarefa (ex: alta, média, baixa)

    // Validação: tamanho máximo de 500 caracteres
    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String descricao;

    private boolean concluida = false;  // Status padrão: não concluída

    private MultipartFile imagem;  // Arquivo de imagem enviado no upload

    /* ========== GETTERS & SETTERS ========== */

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