package com.taskgreen.apitarefas.service;

import com.taskgreen.apitarefas.model.Tarefa;
import com.taskgreen.apitarefas.repository.TarefaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TarefaServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @InjectMocks
    private TarefaService tarefaService;

    @Test
    public void testSalvarTarefaComDatasValidas() {
        // Arrange
        Tarefa tarefa = new Tarefa();
        tarefa.setNome("Tarefa Válida");
        tarefa.setDataInicio(LocalDate.now());
        tarefa.setDataEntrega(LocalDate.now().plusDays(1));
        tarefa.setHorarioInicio(LocalTime.of(9, 0));
        tarefa.setHorarioTermino(LocalTime.of(10, 0));

        when(tarefaRepository.save(any(Tarefa.class))).thenReturn(tarefa);

        // Act
        Tarefa resultado = tarefaService.salvarTarefa(tarefa);

        // Assert
        assertNotNull(resultado);
        assertEquals("Tarefa Válida", resultado.getNome());
        verify(tarefaRepository, times(1)).save(tarefa);
    }

    @Test
    public void testSalvarTarefaComDataInvalida() {
        // Arrange
        Tarefa tarefa = new Tarefa();
        tarefa.setDataInicio(LocalDate.now().plusDays(1));
        tarefa.setDataEntrega(LocalDate.now()); // Data inválida

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            tarefaService.salvarTarefa(tarefa);
        });
    }

    @Test
    public void testBuscarTarefaPorIdExistente() {
        // Arrange
        Long id = 1L;
        Tarefa tarefa = new Tarefa();
        tarefa.setId(id);
        when(tarefaRepository.findById(id)).thenReturn(Optional.of(tarefa));

        // Act
        Optional<Tarefa> resultado = tarefaService.buscarPorId(id);

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals(id, resultado.get().getId());
    }
}