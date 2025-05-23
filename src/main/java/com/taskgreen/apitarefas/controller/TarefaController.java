package com.taskgreen.apitarefas.controller;

import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.dto.TarefaMultipartDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Tag(name = "Tarefas", description = "API para gerenciamento de tarefas pessoais")
@Validated
@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;
    private final Path root = Paths.get("uploads");

    @Autowired
    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar a pasta uploads");
        }
    }

    /* ========== ENDPOINTS GET ========== */
    @Operation(summary = "Listar todas as tarefas")
    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<Tarefa> tarefas = tarefaService.listarTodasTarefas();
        return ResponseEntity.ok(tarefas.stream().map(TarefaDTO::new).toList());
    }

    @Operation(summary = "Buscar tarefa por ID")
    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(
            @Parameter(description = "ID da tarefa") @PathVariable String id) {
        return tarefaService.buscarPorId(id)
                .map(tarefa -> ResponseEntity.ok(new TarefaDTO(tarefa)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Filtrar tarefas por conclusão")
    @GetMapping("/filtro")
    public ResponseEntity<List<TarefaDTO>> filtrarPorConclusao(
            @Parameter(description = "Status de conclusão") @RequestParam boolean concluida) {
        List<Tarefa> tarefas = tarefaService.filtrarPorConclusao(concluida);
        return ResponseEntity.ok(tarefas.stream().map(TarefaDTO::new).toList());
    }

    /* ========== ENDPOINTS POST/PUT/DELETE ========== */
    @Operation(summary = "Criar tarefa com imagem")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> criarTarefa(@Valid @ModelAttribute TarefaMultipartDTO dto) {
        try {
            Tarefa tarefa = mapearDtoParaTarefa(dto);
            Tarefa salva = tarefaService.salvarTarefa(tarefa);
            return ResponseEntity.ok(new TarefaDTO(salva));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erro", "Falha ao criar tarefa",
                    "detalhes", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Atualizar status de conclusão")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TarefaDTO> atualizarStatus(
            @Parameter(description = "ID da tarefa") @PathVariable String id,
            @Parameter(description = "Novo status") @RequestParam boolean concluida) {
        Tarefa tarefa = tarefaService.atualizarStatusConclusao(id, concluida);
        return ResponseEntity.ok(new TarefaDTO(tarefa));
    }

    @Operation(summary = "Atualizar tarefa")
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> atualizarTarefa(
            @Parameter(description = "ID da tarefa") @PathVariable String id,
            @ModelAttribute TarefaMultipartDTO dto) {

        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Tarefa tarefaExistente = tarefaOptional.get();

            if (tarefaExistente.getImagemNome() != null && dto.getImagem() != null) {
                Files.deleteIfExists(root.resolve(tarefaExistente.getImagemNome()));
            }

            atualizarCamposTarefa(tarefaExistente, dto);
            Tarefa atualizada = tarefaService.salvarTarefa(tarefaExistente);
            return ResponseEntity.ok(new TarefaDTO(atualizada));

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar tarefa")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTarefa(@PathVariable String id) throws IOException {
        Optional<Tarefa> tarefaOpt = tarefaService.buscarPorId(id);
        if (tarefaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (tarefaOpt.get().getImagemNome() != null) {
            Files.deleteIfExists(root.resolve(tarefaOpt.get().getImagemNome()));
        }

        tarefaService.deletarTarefa(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Deletar imagem da tarefa")
    @DeleteMapping("/{id}/imagem")
    public ResponseEntity<Void> deletarImagem(@PathVariable String id) throws IOException {
        Optional<Tarefa> tarefaOpt = tarefaService.buscarPorId(id);
        if (tarefaOpt.isEmpty() || tarefaOpt.get().getImagemNome() == null) {
            return ResponseEntity.notFound().build();
        }

        Files.deleteIfExists(root.resolve(tarefaOpt.get().getImagemNome()));

        Tarefa tarefa = tarefaOpt.get();
        tarefa.setImagemNome(null);
        tarefa.setImagemUrl(null);
        tarefaService.salvarTarefa(tarefa);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Baixar imagem da tarefa")
    @GetMapping("/uploads/{filename}")
    public ResponseEntity<Resource> getImagem(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
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
    private Tarefa mapearDtoParaTarefa(TarefaMultipartDTO dto) throws IOException {
        Tarefa tarefa = new Tarefa();
        tarefa.setNome(dto.getNome());
        tarefa.setDataInicio(LocalDate.parse(dto.getDataInicio()));
        tarefa.setDataEntrega(LocalDate.parse(dto.getDataEntrega()));
        tarefa.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
        tarefa.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setConcluida(dto.isConcluida());

        if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
            salvarImagem(dto.getImagem(), tarefa);
        }

        return tarefa;
    }

    private void atualizarCamposTarefa(Tarefa tarefa, TarefaMultipartDTO dto) throws IOException {
        if (dto.getNome() != null) tarefa.setNome(dto.getNome());
        if (dto.getDataInicio() != null) tarefa.setDataInicio(LocalDate.parse(dto.getDataInicio()));
        if (dto.getDataEntrega() != null) tarefa.setDataEntrega(LocalDate.parse(dto.getDataEntrega()));
        if (dto.getHorarioInicio() != null) tarefa.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
        if (dto.getHorarioTermino() != null) tarefa.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
        if (dto.getPrioridade() != null) tarefa.setPrioridade(dto.getPrioridade());
        if (dto.getDescricao() != null) tarefa.setDescricao(dto.getDescricao());
        tarefa.setConcluida(dto.isConcluida());

        if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
            salvarImagem(dto.getImagem(), tarefa);
        }
    }

    private void salvarImagem(MultipartFile arquivo, Tarefa tarefa) throws IOException {
        if (arquivo.isEmpty()) {
            return;
        }

        String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
        Files.copy(arquivo.getInputStream(), root.resolve(nomeArquivo), StandardCopyOption.REPLACE_EXISTING);

        tarefa.setImagemNome(nomeArquivo);
        tarefa.setImagemUrl("/api/tarefas/uploads/" + nomeArquivo);
    }
}