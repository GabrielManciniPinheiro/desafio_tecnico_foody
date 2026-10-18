# Etapa de build: compila o projeto com o Maven Wrapper
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Dependências em uma camada separada: só são baixadas de novo se o pom.xml mudar
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q -DskipTests package

# Etapa final: apenas o JRE e o jar, rodando com usuário sem privilégios
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --uid 1001 foody
COPY --from=build /app/target/foody-api-*.jar app.jar
USER foody

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Ajustes para instâncias pequenas (512 MB): heap limitada, GC serial e inicialização mais rápida
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-jar", "app.jar"]
