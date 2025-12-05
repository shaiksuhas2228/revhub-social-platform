# ===== 1. Build stage =====
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom and download dependencies
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source and build jar
COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== 2. Run stage =====
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Default active profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]