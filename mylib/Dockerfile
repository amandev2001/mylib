FROM eclipse-temurin:17-jdk-focal as builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-focal

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]