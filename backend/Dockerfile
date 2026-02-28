# -----------------------------------------------------------------------------
# STAGE 1: Build the Application
# -----------------------------------------------------------------------------
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# 1. Copy maven wrapper and pom.xml (Cached Layer)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 2. Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# -----------------------------------------------------------------------------
# STAGE 2: Run the Application
# -----------------------------------------------------------------------------
# Using Alpine Linux for minimum image size footprint
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 1. Setup User, Directories, and Permissions in a SINGLE LAYER
RUN addgroup -S spring && \
    adduser -S spring -G spring && \
    chown -R spring:spring /app

# 2. Copy the JAR file and set ownership instantly
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

# 3. Switch to the non-root user
USER spring

# Expose port 8080
EXPOSE 8080

# Environment Configuration
ENV HOME=/app
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+UseSerialGC"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
