package com.taskgreen.apitarefas.controller;

import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.dto.TarefaMultipartDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controlador REST para operações relacionadas a tarefas.
 * Expõe endpoints para CRUD de tarefas incluindo upload de imagens.
 */
@Tag(name = "Tarefas", description = "API para gerenciamento de tarefas pessoais")
@Validated  // Habilita validação dos DTOs recebidos
@RestController
@RequestMapping("/api/tarefas")  // Define o prefixo para todos os endpoints
public class TarefaController {

    private final TarefaService tarefaService;  // Serviço de negócio para tarefas
    private final Path root = Paths.get("uploads");  // Diretório para armazenar imagens

    /**
     * Construtor com injeção de dependência do serviço
     */
    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    /**
     * Inicializa o diretório de uploads quando a aplicação sobe
     */
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);  // Cria o diretório se não existir
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar a pasta uploads");
        }
    }

    /* ========== ENDPOINTS GET ========== */

    /**
     * Lista todas as tarefas cadastradas
     */
    @Operation(summary = "Listar todas as tarefas")
    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<Tarefa> tarefas = tarefaService.listarTodasTarefas();
        return ResponseEntity.ok(toDtoList(tarefas));  // Converte para DTO antes de retornar
    }

    /**
     * Busca uma tarefa específica por ID
     */
    @Operation(summary = "Buscar tarefa por ID")
    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(
            @Parameter(description = "ID da tarefa") @PathVariable String id) {
        return tarefaService.buscarPorId(id)
                .map(tarefa -> ResponseEntity.ok(new TarefaDTO(tarefa)))
                .orElse(ResponseEntity.notFound().build());  // Retorna 404 se não encontrar
    }

    /**
     * Filtra tarefas por status de conclusão
     */
    @Operation(summary = "Filtrar tarefas por conclusão")
    @GetMapping("/filtro/conclusao")
    public ResponseEntity<List<TarefaDTO>> filtrarPorConclusao(
            @Parameter(description = "Status de conclusão") @RequestParam boolean concluida) {
        List<Tarefa> tarefas = tarefaService.filtrarPorConclusao(concluida);
        return ResponseEntity.ok(toDtoList(tarefas));
    }

    /**
     * Lista tarefas que estão atrasadas (data atual > data da tarefa não concluída)
     */
    @Operation(summary = "Listar tarefas atrasadas")
    @GetMapping("/atrasadas")
    public ResponseEntity<List<TarefaDTO>> listarTarefasAtrasadas() {
        List<Tarefa> tarefas = tarefaService.buscarTarefasAtrasadas();
        return ResponseEntity.ok(toDtoList(tarefas));
    }

    /**
     * Filtra tarefas por prioridade (baixa, media, alta)
     */
    @Operation(summary = "Filtrar tarefas por prioridade")
    @GetMapping("/filtro/prioridade/{prioridade}")
    public ResponseEntity<List<TarefaDTO>> filtrarPorPrioridade(
            @Parameter(description = "Prioridade (baixa, media, alta)") @PathVariable String prioridade) {
        List<Tarefa> tarefas = tarefaService.buscarPorPrioridade(prioridade);
        return ResponseEntity.ok(toDtoList(tarefas));
    }

    /**
     * Busca tarefas por nome (contendo o termo)
     */
    @Operation(summary = "Buscar tarefas por nome")
    @GetMapping("/buscar")
    public ResponseEntity<List<TarefaDTO>> buscarPorNome(
            @Parameter(description = "Termo para busca") @RequestParam String nome) {
        List<Tarefa> tarefas = tarefaService.buscarPorNome(nome);
        return ResponseEntity.ok(toDtoList(tarefas));
    }

    /* ========== ENDPOINTS POST/PUT/DELETE ========== */

    /**
     * Cria uma nova tarefa com possibilidade de upload de imagem
     */
    @Operation(summary = "Criar tarefa com imagem")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)  // Aceita multipart/form-data
    public ResponseEntity<?> criarTarefa(@Valid @ModelAttribute TarefaMultipartDTO dto) {
        try {
            Tarefa tarefa = mapearDtoParaTarefa(dto);  // Converte DTO para entidade
            Tarefa salva = tarefaService.criarTarefaComValidacao(tarefa);
            return ResponseEntity.status(HttpStatus.CREATED).body(new TarefaDTO(salva));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(  // Retorna erro detalhado
                    "erro", "Falha ao criar tarefa",
                    "detalhes", e.getMessage()
            ));
        }
    }

    /**
     * Atualiza apenas o status de conclusão de uma tarefa
     */
    @Operation(summary = "Atualizar status de conclusão")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TarefaDTO> atualizarStatus(
            @Parameter(description = "ID da tarefa") @PathVariable String id,
            @Parameter(description = "Novo status") @RequestParam boolean concluida) {
        Tarefa tarefa = tarefaService.atualizarStatusConclusao(id, concluida);
        return ResponseEntity.ok(new TarefaDTO(tarefa));
    }

    /**
     * Atualiza todos os campos de uma tarefa existente
     */
    @Operation(summary = "Atualizar tarefa")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> atualizarTarefa(
            @Parameter(description = "ID da tarefa") @PathVariable String id,
            @ModelAttribute TarefaMultipartDTO dto) {

        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Tarefa tarefaExistente = tarefaOptional.get();

        try {
            // Atualiza imagem se foi enviada uma nova
            if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
                if (tarefaExistente.getImagemNome() != null) {
                    Files.deleteIfExists(root.resolve(tarefaExistente.getImagemNome()));
                }
                salvarImagem(dto.getImagem(), tarefaExistente);
            }

            // Atualiza campos se foram fornecidos
            if (dto.getNome() != null) tarefaExistente.setNome(dto.getNome());
            if (dto.getDataInicio() != null) tarefaExistente.setDataInicio(LocalDate.parse(dto.getDataInicio()));
            if (dto.getHorarioInicio() != null) tarefaExistente.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
            if (dto.getHorarioTermino() != null) tarefaExistente.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
            if (dto.getPrioridade() != null) tarefaExistente.setPrioridade(dto.getPrioridade());
            if (dto.getDescricao() != null) tarefaExistente.setDescricao(dto.getDescricao());

            tarefaExistente.setConcluida(dto.isConcluida());

            Tarefa atualizada = tarefaService.salvarTarefa(tarefaExistente);
            return ResponseEntity.ok(new TarefaDTO(atualizada));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erro", "Falha ao atualizar tarefa",
                    "detalhes", e.getMessage()
            ));
        }
    }

    /**
     * Remove uma tarefa e sua imagem associada (se existir)
     */
    @Operation(summary = "Deletar tarefa")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTarefa(@PathVariable String id) {
        try {
            tarefaService.buscarPorId(id).ifPresent(tarefa -> {
                if (tarefa.getImagemNome() != null) {
                    try {
                        Files.deleteIfExists(root.resolve(tarefa.getImagemNome()));
                    } catch (IOException e) {
                        throw new RuntimeException("Falha ao deletar imagem", e);
                    }
                }
            });

            tarefaService.deletarTarefa(id);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Endpoint para download de imagens das tarefas
     */
    @Operation(summary = "Baixar imagem da tarefa")
    @GetMapping("/uploads/{filename}")
    public ResponseEntity<Resource> getImagem(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /* ========== MÉTODOS AUXILIARES ========== */

    /**
     * Converte lista de entidades para lista de DTOs
     */
    private List<TarefaDTO> toDtoList(List<Tarefa> tarefas) {
        return tarefas.stream().map(TarefaDTO::new).collect(Collectors.toList());
    }

    /**
     * Converte DTO multipart (com imagem) para entidade Tarefa
     */
    private Tarefa mapearDtoParaTarefa(TarefaMultipartDTO dto) throws IOException {
        Tarefa tarefa = new Tarefa();
        tarefa.setNome(dto.getNome());
        tarefa.setDataInicio(LocalDate.parse(dto.getDataInicio()));

        if (dto.getHorarioInicio() != null) {
            tarefa.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
        }

        if (dto.getHorarioTermino() != null) {
            tarefa.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
        }

        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setConcluida(dto.isConcluida());

        if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
            salvarImagem(dto.getImagem(), tarefa);
        }

        return tarefa;
    }

    /**
     * Salva imagem no sistema de arquivos e atualiza referência na tarefa
     */
    private void salvarImagem(MultipartFile arquivo, Tarefa tarefa) throws IOException {
        if (arquivo.isEmpty() || !arquivo.getContentType().startsWith("image/")) {
            return;
        }

        // Gera nome único para o arquivo
        String nomeArquivo = UUID.randomUUID() + "_" + Objects.requireNonNull(arquivo.getOriginalFilename());
        Files.copy(arquivo.getInputStream(), root.resolve(nomeArquivo), StandardCopyOption.REPLACE_EXISTING);

        // Atualiza entidade com informações da imagem
        tarefa.setImagemNome(nomeArquivo);
        tarefa.setImagemUrl("/api/tarefas/uploads/" + nomeArquivo);
    }
}