# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim AS build

# Set the working directory in the container
WORKDIR /app

# Copy the local code to the container
COPY . .

# Run Maven to build the application
RUN ./mvnw clean package -DskipTests

# Second stage: Run the application
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Copy the .jar file from the build stage
COPY --from=build /app/target/mylib-0.0.1-SNAPSHOT.jar /app/mylib.jar

# Run the .jar file
CMD ["java", "-jar", "/app/mylib.jar"]
