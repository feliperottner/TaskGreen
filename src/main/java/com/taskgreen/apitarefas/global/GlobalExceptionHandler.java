package com.taskgreen.apitarefas.global;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.NoSuchFileException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                erros.put(error.getField(), error.getDefaultMessage())
        );
        return buildResponse(HttpStatus.BAD_REQUEST, erros);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDataAccessException(DataAccessException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de acesso ao banco de dados", ex.getMostSpecificCause().getMessage());
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateKeyException(DuplicateKeyException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflito de dados", "Já existe um registro com esses dados");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Dados inválidos", ex.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Tamanho do arquivo excedido", "O tamanho máximo permitido é 50MB");
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIOException(IOException ex) {
        String detalhe;
        if (ex instanceof NoSuchFileException) {
            detalhe = "Arquivo não encontrado";
        } else if (ex instanceof AccessDeniedException) {
            detalhe = "Acesso negado ao arquivo";
        } else {
            detalhe = ex.getMessage();
        }
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de operação com arquivo", detalhe);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro inesperado", ex.getMessage());
    }

    // Utilitário DRY para evitar repetição de código
    private ResponseEntity<Map<String, String>> buildResponse(HttpStatus status, String erro, String detalhes) {
        Map<String, String> body = new HashMap<>();
        body.put("erro", erro);
        body.put("detalhes", detalhes);
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<Map<String, String>> buildResponse(HttpStatus status, Map<String, String> body) {
        return ResponseEntity.status(status).body(body);
    }
}
