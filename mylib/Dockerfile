# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17-slim AS builder

WORKDIR /app

# Copy the pom.xml and mvnw files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Grant execute permissions for mvnw
RUN chmod +x mvnw

# Copy the rest of the project
COPY src ./src

# Run Maven to build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the jar from the builder image
COPY --from=builder /app/target/*.jar /app/app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
