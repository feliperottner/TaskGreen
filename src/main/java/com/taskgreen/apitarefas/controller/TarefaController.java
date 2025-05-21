package com.taskgreen.apitarefas.controller;

import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.dto.TarefaMultipartDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "Tarefas", description = "API para gerenciamento de tarefas pessoais (CRUD com upload de imagem)")
@Validated
@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    private final String pastaUpload = "uploads/";

    @Operation(
            summary = "Listar todas as tarefas",
            description = "Retorna uma lista de todas as tarefas cadastradas",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarefas encontradas"),
                    @ApiResponse(responseCode = "500", description = "Erro interno no servidor")
            }
    )
    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<TarefaDTO> tarefas = tarefaService.listarTarefas()
                .stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tarefas);
    }

    @Operation(
            summary = "Buscar tarefa por ID",
            description = "Retorna uma tarefa específica com base no ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarefa encontrada"),
                    @ApiResponse(responseCode = "404", description = "Tarefa não encontrada")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(
            @Parameter(description = "ID da tarefa", example = "1")
            @PathVariable Long id) {
        Optional<Tarefa> tarefa = tarefaService.buscarPorId(id);
        return tarefa.map(t -> ResponseEntity.ok(new TarefaDTO(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Criar nova tarefa",
            description = "Cadastra uma nova tarefa com dados e imagem (opcional)",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarefa criada com sucesso"),
                    @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                    @ApiResponse(responseCode = "500", description = "Erro ao processar imagem")
            }
    )
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> criarTarefa(
            @Valid @ModelAttribute TarefaMultipartDTO dto) {
        try {
            Tarefa tarefa = mapearDtoParaTarefa(dto);
            Tarefa salva = tarefaService.salvarTarefa(tarefa);
            return ResponseEntity.ok(new TarefaDTO(salva));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(
            summary = "Atualizar tarefa",
            description = "Atualiza uma tarefa existente com novos dados e imagem (opcional)",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarefa atualizada"),
                    @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                    @ApiResponse(responseCode = "404", description = "Tarefa não encontrada"),
                    @ApiResponse(responseCode = "500", description = "Erro ao processar imagem")
            }
    )
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> atualizarTarefa(
            @Parameter(description = "ID da tarefa", example = "1")
            @PathVariable Long id,
            @Valid @ModelAttribute TarefaMultipartDTO dto) {
        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Tarefa tarefa = tarefaOptional.get();
            tarefa.setNome(dto.getNome());
            tarefa.setDataInicio(LocalDate.parse(dto.getDataInicio()));
            tarefa.setDataEntrega(LocalDate.parse(dto.getDataEntrega()));
            tarefa.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
            tarefa.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
            tarefa.setPrioridade(dto.getPrioridade());
            tarefa.setDescricao(dto.getDescricao());

            if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
                salvarImagem(dto.getImagem(), tarefa);
            }

            Tarefa atualizada = tarefaService.salvarTarefa(tarefa);
            return ResponseEntity.ok(new TarefaDTO(atualizada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(
            summary = "Deletar tarefa",
            description = "Remove uma tarefa com base no ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Tarefa deletada"),
                    @ApiResponse(responseCode = "404", description = "Tarefa não encontrada")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTarefa(
            @Parameter(description = "ID da tarefa", example = "1")
            @PathVariable Long id) {
        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isPresent()) {
            tarefaService.deletarTarefa(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(
            summary = "Buscar imagem",
            description = "Retorna a imagem associada a uma tarefa",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Imagem encontrada"),
                    @ApiResponse(responseCode = "404", description = "Imagem não encontrada"),
                    @ApiResponse(responseCode = "500", description = "Erro ao ler imagem")
            }
    )
    @GetMapping("/imagem/{nomeArquivo}")
    public ResponseEntity<byte[]> buscarImagem(
            @Parameter(description = "Nome do arquivo", example = "imagem.jpg")
            @PathVariable String nomeArquivo) {
        try {
            Path caminho = Paths.get(pastaUpload).resolve(nomeArquivo);
            if (!Files.exists(caminho)) {
                return ResponseEntity.notFound().build();
            }

            byte[] conteudo = Files.readAllBytes(caminho);
            return ResponseEntity.ok()
                    .header("Content-Type", Files.probeContentType(caminho))
                    .body(conteudo);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ===== MÉTODOS AUXILIARES =====
    private Tarefa mapearDtoParaTarefa(TarefaMultipartDTO dto) throws IOException {
        Tarefa tarefa = new Tarefa();
        tarefa.setNome(dto.getNome());
        tarefa.setDataInicio(LocalDate.parse(dto.getDataInicio()));
        tarefa.setDataEntrega(LocalDate.parse(dto.getDataEntrega()));
        tarefa.setHorarioInicio(LocalTime.parse(dto.getHorarioInicio()));
        tarefa.setHorarioTermino(LocalTime.parse(dto.getHorarioTermino()));
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setDescricao(dto.getDescricao());

        if (dto.getImagem() != null && !dto.getImagem().isEmpty()) {
            salvarImagem(dto.getImagem(), tarefa);
        }

        return tarefa;
    }

    private void salvarImagem(MultipartFile arquivo, Tarefa tarefa) throws IOException {
        if (!Files.exists(Paths.get(pastaUpload))) {
            Files.createDirectories(Paths.get(pastaUpload));
        }

        String nomeOriginal = Paths.get(arquivo.getOriginalFilename()).getFileName().toString();
        String nomeFinal = UUID.randomUUID() + "_" + nomeOriginal;
        Path caminho = Paths.get(pastaUpload).resolve(nomeFinal);
        Files.write(caminho, arquivo.getBytes());

        tarefa.setImagemNome(nomeFinal);
    }
}