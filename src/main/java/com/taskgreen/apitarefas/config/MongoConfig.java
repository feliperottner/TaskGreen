package com.taskgreen.apitarefas.config;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

/**
 * Classe de configuração para criar índices automaticamente no MongoDB
 * para a entidade Tarefa baseado nas anotações @Indexed definidas no modelo.
 */
@Configuration  // Indica que esta é uma classe de configuração do Spring
public class MongoConfig {

    /**
     * Construtor que configura os índices automaticamente ao iniciar a aplicação.
     *
     * @param mongoMappingContext Contexto de mapeamento do MongoDB que contém as informações das entidades
     * @param mongoTemplate Template do MongoDB para operações no banco de dados
     */
    public MongoConfig(MongoMappingContext mongoMappingContext, MongoTemplate mongoTemplate) {
        // Cria um resolvedor de índices baseado nas entidades mapeadas
        IndexResolver resolver = new MongoPersistentEntityIndexResolver(mongoMappingContext);

        // Obtém operações de índice para a coleção de Tarefa
        IndexOperations indexOps = mongoTemplate.indexOps(Tarefa.class);

        // Resolve todos os índices definidos na entidade Tarefa (via anotações @Indexed)
        // e cria cada índice no banco de dados (se não existir)
        resolver.resolveIndexFor(Tarefa.class).forEach(indexOps::ensureIndex);
    }
}