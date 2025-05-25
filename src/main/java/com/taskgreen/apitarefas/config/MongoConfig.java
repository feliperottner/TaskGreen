package com.taskgreen.apitarefas.config;

import com.taskgreen.apitarefas.model.Tarefa;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class MongoConfig {

    public MongoConfig(MongoMappingContext mongoMappingContext, MongoTemplate mongoTemplate) {
        IndexResolver resolver = new MongoPersistentEntityIndexResolver(mongoMappingContext);
        IndexOperations indexOps = mongoTemplate.indexOps(Tarefa.class);
        resolver.resolveIndexFor(Tarefa.class).forEach(indexOps::ensureIndex);
    }
}