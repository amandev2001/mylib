# Build stage
FROM maven:3.8.4-openjdk-11-slim AS build

# Set working directory
WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src
COPY .mvn .mvn
COPY mvnw ./

# Give execute permissions to mvnw
RUN chmod +x mvnw

# Build the application using mvnw
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM openjdk:11-jre-slim

# Set working directory
WORKDIR /app

# Create directory for file uploads
RUN mkdir -p uploads

# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Environment variables from your application-dev.properties
ENV JWT_SECRET_KEY=thisismypatnauniversitypulibsecretkey
ENV FILE_UPLOAD_DIR=uploads
ENV CORS_ALLOWED_ORIGINS=http://localhost:5174,http://192.168.0.127:5174

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
