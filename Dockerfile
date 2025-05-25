
FROM maven:3.8.6-openjdk-17-slim AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do pom e do src
COPY pom.xml .
COPY src ./src

# Baixa as dependências e faz o build (o -DskipTests pula os testes)
RUN mvn clean package -DskipTests

# Estágio 2 - Imagem final de execução
FROM openjdk:17-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR do estágio de build
COPY --from=build /app/target/*.jar app.jar

# Cria diretório para uploads (necessário para sua API)
RUN mkdir -p /app/uploads

# Expõe a porta que sua API usa
EXPOSE 8080

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]