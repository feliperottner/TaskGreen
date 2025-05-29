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

/**
 * Classe centralizada para tratamento de exceções da aplicação.
 * Captura exceções lançadas pelos controllers e retorna respostas HTTP padronizadas.
 */
@ControllerAdvice // Habilita esta classe para interceptar exceções em toda a aplicação
public class GlobalExceptionHandler {

    /**
     * Trata erros de validação de campos (Bean Validation).
     * Captura quando os argumentos anotados com @Valid falham na validação.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        // Extrai todos os erros de campo e mapeia para um formato nomeCampo: mensagemErro
        ex.getBindingResult().getFieldErrors().forEach(error ->
                erros.put(error.getField(), error.getDefaultMessage())
        );
        return buildResponse(HttpStatus.BAD_REQUEST, erros);
    }

    /**
     * Trata erros genéricos de acesso a dados (banco de dados).
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDataAccessException(DataAccessException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro de acesso ao banco de dados",
                ex.getMostSpecificCause().getMessage());
    }

    /**
     * Trata tentativas de inserir dados com chaves duplicadas.
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateKeyException(DuplicateKeyException ex) {
        return buildResponse(HttpStatus.CONFLICT,
                "Conflito de dados",
                "Já existe um registro com esses dados");
    }

    /**
     * Trata argumentos ilegais ou inapropriados passados para métodos.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Dados inválidos",
                ex.getMessage());
    }

    /**
     * Trata quando o tamanho do arquivo enviado excede o limite permitido.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Tamanho do arquivo excedido",
                "O tamanho máximo permitido é 50MB");
    }

    /**
     * Trata erros de operações com arquivos.
     * Inclui casos específicos como arquivo não encontrado e permissão negada.
     */
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
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro de operação com arquivo",
                detalhe);
    }

    /**
     * Trata todas as outras exceções não capturadas pelos handlers específicos.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocorreu um erro inesperado",
                ex.getMessage());
    }

    /* ========== MÉTODOS AUXILIARES ========== */

    /**
     * Constrói uma resposta de erro padronizada com status, mensagem e detalhes.
     *
     * @param status Código HTTP de status
     * @param erro Mensagem geral do erro
     * @param detalhes Detalhes específicos do erro
     * @return ResponseEntity com o corpo formatado
     */
    private ResponseEntity<Map<String, String>> buildResponse(HttpStatus status, String erro, String detalhes) {
        Map<String, String> body = new HashMap<>();
        body.put("erro", erro);
        body.put("detalhes", detalhes);
        return ResponseEntity.status(status).body(body);
    }

    /**
     * Constrói uma resposta de erro padronizada com um mapa de erros.
     * Usado principalmente para erros de validação com múltiplos campos.
     *
     * @param status Código HTTP de status
     * @param body Mapa contendo os erros
     * @return ResponseEntity com o corpo formatado
     */
    private ResponseEntity<Map<String, String>> buildResponse(HttpStatus status, Map<String, String> body) {
        return ResponseEntity.status(status).body(body);
    }
}