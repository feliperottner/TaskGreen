package com.taskgreen.apitarefas.config;
// Pacote onde esta classe está localizada (ajuste conforme a estrutura do seu projeto)

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Classe de configuração para CORS (Cross-Origin Resource Sharing).
 * Habilita e configura as políticas de CORS para a aplicação Spring Boot.
 */
@Configuration  // Indica que esta é uma classe de configuração do Spring
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Método para configurar as políticas CORS da aplicação.
     *
     * @param registry O registro de configurações CORS fornecido pelo Spring
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Aplica a configuração a todos os endpoints da aplicação
                .allowedOrigins("*")  // Permite requisições de qualquer origem (em produção, substituir por domínios específicos)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Métodos HTTP permitidos
                .allowedHeaders("*")  // Permite todos os cabeçalhos nas requisições
                .maxAge(3600);  // Tempo em segundos que o navegador pode cachear as configurações CORS (1 hora)
    }
}