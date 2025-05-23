package com.taskgreen.apitarefas.controller;

// ✅ Adicionado import do Cloudinary
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.UUID;
import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.dto.TarefaMultipartDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;

@Tag(name = "Tarefas", description = "API para gerenciamento de tarefas pessoais (CRUD com upload de imagem)")
@Validated
@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    // ✅ Injetando Cloudinary e removendo pasta local
    @Autowired
    private Cloudinary cloudinary;

    /* ========== ENDPOINTS ========== */

    // ... (Métodos listarTodas, buscarPorId e filtrarPorConclusao permanecem IGUAIS)

    // ✅ Alterado para Cloudinary - CRIAR TAREFA
    @Operation(summary = "Criar tarefa", description = "Upload de imagem opcional")
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

    // ... (Método atualizarStatus permanece IGUAL)

    // ✅ Alterado para Cloudinary - ATUALIZAR TAREFA
    @Operation(summary = "Atualizar tarefa")
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> atualizarTarefa(
            @Parameter(description = "ID da tarefa") @PathVariable Long id,
            @ModelAttribute TarefaMultipartDTO dto) {

        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Tarefa tarefaExistente = tarefaOptional.get();

            // ✅ Remove imagem antiga do Cloudinary se existir
            if (tarefaExistente.getImagemNome() != null && dto.getImagem() != null) {
                cloudinary.uploader().destroy(tarefaExistente.getImagemNome(), ObjectUtils.emptyMap());
            }

            atualizarCamposTarefa(tarefaExistente, dto);
            Tarefa atualizada = tarefaService.salvarTarefa(tarefaExistente);
            return ResponseEntity.ok(new TarefaDTO(atualizada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Alterado para Cloudinary - DELETAR TAREFA
    @Operation(summary = "Deletar tarefa")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTarefa(
            @Parameter(description = "ID da tarefa") @PathVariable Long id) throws IOException { // ✅ Adicionado throws IOException

        Optional<Tarefa> tarefaOpt = tarefaService.buscarPorId(id);
        if (tarefaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // ✅ Remove imagem do Cloudinary se existir
        if (tarefaOpt.get().getImagemNome() != null) {
            cloudinary.uploader().destroy(tarefaOpt.get().getImagemNome(), ObjectUtils.emptyMap());
        }

        tarefaService.deletarTarefa(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ NOVO ENDPOINT - DELETAR APENAS IMAGEM
    @Operation(summary = "Deletar imagem da tarefa")
    @DeleteMapping("/{id}/imagem")
    public ResponseEntity<Void> deletarImagem(
            @Parameter(description = "ID da tarefa") @PathVariable Long id) throws IOException {

        Optional<Tarefa> tarefaOpt = tarefaService.buscarPorId(id);
        if (tarefaOpt.isEmpty() || tarefaOpt.get().getImagemNome() == null) {
            return ResponseEntity.notFound().build();
        }

        // Remove do Cloudinary
        cloudinary.uploader().destroy(tarefaOpt.get().getImagemNome(), ObjectUtils.emptyMap());

        // Atualiza a tarefa
        Tarefa tarefa = tarefaOpt.get();
        tarefa.setImagemNome(null);
        tarefa.setImagemUrl(null);
        tarefaService.salvarTarefa(tarefa);

        return ResponseEntity.noContent().build();
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

    // ✅ COMPLETAMENTE ALTERADO para Cloudinary
    private void salvarImagem(MultipartFile arquivo, Tarefa tarefa) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                arquivo.getBytes(),
                ObjectUtils.asMap(
                        "folder", "tarefas",
                        "public_id", "tarefa_" + UUID.randomUUID(),
                        "overwrite", false
                )
        );

        // Armazena tanto o public_id quanto a URL completa
        tarefa.setImagemNome(uploadResult.get("public_id").toString());
        tarefa.setImagemUrl(uploadResult.get("secure_url").toString()); // ✅ URL HTTPS
    }
}