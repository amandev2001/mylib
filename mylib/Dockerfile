# Build stage
FROM eclipse-temurin:21-jdk-jammy as builder

WORKDIR /app

# Copy Maven wrapper and source code
COPY mvnw .mvn .mvn
COPY pom.xml . 
COPY src src

# Make Maven wrapper executable and build the project
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Set Spring profile for production
ENV SPRING_PROFILES_ACTIVE=prod

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
