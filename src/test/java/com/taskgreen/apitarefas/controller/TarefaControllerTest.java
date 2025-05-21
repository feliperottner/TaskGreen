package com.taskgreen.apitarefas.controller;

import com.taskgreen.apitarefas.dto.TarefaDTO;
import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.service.TarefaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TarefaControllerTest {

    @Mock
    private TarefaService tarefaService;

    @InjectMocks
    private TarefaController tarefaController;

    @Test
    public void testListarTodasAsTarefas() {
        // Arrange
        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setNome("Teste");
        when(tarefaService.listarTarefas()).thenReturn(Collections.singletonList(tarefa));

        // Act
        ResponseEntity<List<TarefaDTO>> resposta = tarefaController.listarTodas();

        // Assert
        assertEquals(200, resposta.getStatusCodeValue());
        assertEquals(1, resposta.getBody().size());
        assertEquals("Teste", resposta.getBody().get(0).getNome());
    }

    @Test
    public void testBuscarTarefaPorIdNaoExistente() {
        // Arrange
        when(tarefaService.buscarPorId(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<TarefaDTO> resposta = tarefaController.buscarPorId(999L);

        // Assert
        assertEquals(404, resposta.getStatusCodeValue());
    }

    @Test
    public void testDeletarTarefaExistente() {
        // Arrange
        Long id = 1L;
        when(tarefaService.buscarPorId(id)).thenReturn(Optional.of(new Tarefa()));

        // Act
        ResponseEntity<Void> resposta = tarefaController.deletarTarefa(id);

        // Assert
        assertEquals(204, resposta.getStatusCodeValue());
        verify(tarefaService, times(1)).deletarTarefa(id);
    }
}