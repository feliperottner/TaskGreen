package com.taskgreen.apitarefas.model;

// Importações para anotações de JPA e validações
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Importações para manipular datas e horários
import java.time.LocalDate;
import java.time.LocalTime;

// Anotação que diz que essa classe será uma tabela no banco de dados
@Entity
// Define o nome da tabela no banco de dados como "tarefas"
@Table(name = "tarefas")
public class Tarefa {

    // Identificador único da tarefa (ID)
    @Id
    // O valor será gerado automaticamente (auto incremento)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome da tarefa - obrigatório e não pode ser vazio
    @NotBlank(message = "O nome da tarefa é obrigatório.")
    private String nome;

    // Data em que a tarefa começa - obrigatório
    @NotNull(message = "A data de início é obrigatória.")
    private LocalDate dataInicio;

    // Data em que a tarefa deve ser entregue - obrigatório
    @NotNull(message = "A data de entrega é obrigatória.")
    private LocalDate dataEntrega;

    // Horário que a tarefa começa - obrigatório
    @NotNull(message = "O horário de início é obrigatório.")
    private LocalTime horarioInicio;

    // Horário que a tarefa termina - obrigatório
    @NotNull(message = "O horário de término é obrigatório.")
    private LocalTime horarioTermino;

    // Prioridade da tarefa (por exemplo: alta, média, baixa) - obrigatório
    @NotBlank(message = "A prioridade é obrigatória.")
    private String prioridade; // Agora sem validação de enum, mas o front controla os valores

    // Campo opcional para descrever detalhes sobre a tarefa
    private String descricao;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean concluida = false;

    // Aqui armazenamos a URL da imagem da tarefa (ex: link da internet ou nome do arquivo local)
    @Column(name = "imagem_nome") // Nome do arquivo no Cloudinary (public_id)
    private String imagemNome;

    @Column(name = "imagem_url", length = 512) // URL completa da imagem
    private String imagemUrl;

    // === MÉTODOS GET E SET ===
    // Usados para acessar (get) e alterar (set) os valores dos atributos

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

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(LocalDate dataEntrega) {
        this.dataEntrega = dataEntrega;
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