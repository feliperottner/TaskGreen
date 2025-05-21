package com.taskgreen.apitarefas.controller;

import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.dto.TarefaMultipartDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    private final String pastaUpload = "uploads/";

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<TarefaDTO> tarefas = tarefaService.listarTarefas()
                .stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        Optional<Tarefa> tarefa = tarefaService.buscarPorId(id);
        return tarefa.map(t -> ResponseEntity.ok(new TarefaDTO(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> criarTarefa(@ModelAttribute TarefaMultipartDTO dto) {
        try {
            Tarefa tarefa = mapearDtoParaTarefa(dto);
            Tarefa salva = tarefaService.salvarTarefa(tarefa);
            return ResponseEntity.ok(new TarefaDTO(salva));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<TarefaDTO> atualizarTarefa(@PathVariable Long id, @ModelAttribute TarefaMultipartDTO dto) {
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTarefa(@PathVariable Long id) {
        Optional<Tarefa> tarefaOptional = tarefaService.buscarPorId(id);
        if (tarefaOptional.isPresent()) {
            tarefaService.deletarTarefa(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/imagem/{nomeArquivo}")
    public ResponseEntity<byte[]> buscarImagem(@PathVariable String nomeArquivo) {
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
            return ResponseEntity.status(500).build();
        }
    }

    // === MÉTODOS AUXILIARES ===

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
