# 📚 Library Management System

A full-stack Library Management System that allows users to borrow, return, and reserve books. Admins can manage books, users, and view statistics.

---

## 🧾 Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Environment Variables](#environment-variables)
8. [Screenshots](#screenshots)
9. [Contributing](#contributing)
10. [License](#license)

---

<!-- About Section -->

<a name="about"></a>

## About

A web-based Library Management System with user authentication, book management, fine tracking, and a responsive frontend built with React. The backend is powered by Spring Boot and follows REST architecture.

---

<!-- Features Section -->

<a name="features"></a>

## Features

* ✅ User registration and login (JWT-based)
* 📚 Book CRUD (Create, Read, Update, Delete)
* 🔁 Borrow, return, and reserve books
* 💸 Fine calculation and payment
* 🔐 Role-based access (admin, user)
* 🔍 Book search, filter, and sort
* 🌙 Dark mode support (frontend)

---

<!-- Tech Stack Section -->

<a name="tech-stack"></a>

## Tech Stack

**Frontend:**

* React
* Tailwind CSS
* Axios

**Backend:**

* Spring Boot
* Spring Security & JWT
* Hibernate & JPA

**Database:**

* MySQL or PostgreSQL

**Tools:**

* Git & GitHub
* Postman
* Docker

---

<!-- Getting Started Section -->

<a name="getting-started"></a>

## Getting Started

### Prerequisites

* Java 17+
* Node.js & npm
* MySQL / PostgreSQL

### Backend Setup

```
cd backend
./mvnw spring-boot:run
```

Or run using your IDE (IntelliJ, VS Code, etc.)

### Frontend Setup

```
cd .\frontend\mylib-frontend\
npm install
npm run dev
```

---

<!-- API Endpoints Section -->

<a name="api-endpoints"></a>

## API Endpoints

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/auth/login`      | User login          |
| POST   | `/api/auth/register`   | User registration   |
| GET    | `/api/books`           | Get all books       |
| POST   | `/api/books`           | Add a new book      |
| PUT    | `/api/books/{id}`      | Update book         |
| DELETE | `/api/books/{id}`      | Delete book         |
| POST   | `/api/borrow`          | Borrow a book       |
| POST   | `/api/return`          | Return a book       |
| GET    | `/api/fines/user/{id}` | Get fine by user ID |

---

<!-- Database Schema Section -->

<a name="database-schema"></a>

## Database Schema (Entities)

* **users**: `user_id`, `about`, `user_email`, `email_token`, `email_verified`, `enabled`, `user_name`, `password`, `phone_number`, `phone_verified`, `profile_pic`, `provider`, `provider_id`, `password_reset_expiry`, `password_reset_token`
* **library\_books**: `book_id`, `author`, `available`, `category`, `cover_url`, `description`, `edition`, `language`, `location`, `page_count`, `price`, `publication_date`, `publisher`, `quantity`, `title`, `version`, `isbn`
* **borrow\_records**: `borrow_record_id`, `due_date`, `fine_amount`, `is_from_reservation`, `issue_date`, `reservation_created_at`, `return_date`, `status`, `book_id`, `user_id`, `fine_paid`
* **book\_reservation**: `reservation_id`, `created_at`, `reservations`, `status`, `book_id`, `user_id`
* **users\_role\_list**: `users_user_id`, `role_list`

---

<!-- Environment Variables Section -->

<a name="environment-variables"></a>

## Environment Variables

Create a `.env` file or configure these in `application.properties` (backend):

```properties
server.port=${PORT:8080}

# DB configuration
# Uncomment and configure your DB (MySQL example):
# spring.datasource.url=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:mylib}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
# spring.datasource.username=${MYSQL_USER:root}
# spring.datasource.password=${MYSQL_PASSWORD:password}

# PostgreSQL example:
spring.datasource.url=jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
spring.jpa.hibernate.ddl-auto=update

# JPA Settings
spring.jpa.show-sql=${SHOW_SQL:false}
spring.jpa.hibernate.ddl-auto=${DDL_AUTO:update}
# spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Cloudinary (for image uploads)
cloudinary.cloud.name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api.key=${CLOUDINARY_API_KEY}
cloudinary.api.secret=${CLOUDINARY_API_SECRET}

# Mail configuration (SMTP)
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.enable=false
spring.mail.properties.mail.smtp.from=${MAIL_FROM:no-reply@example.com}
spring.mail.properties.mail.smtp.timeout=5000

# Logging configuration
logging.file.name=/app/logs/application.log
logging.file.max-size=10MB
logging.file.max-history=5
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n

# Logging levels
logging.level.root=INFO
logging.level.com.example.mylib=INFO
logging.level.org.springframework.web=INFO
logging.level.org.springframework=INFO
logging.level.org.springframework.security=INFO
logging.level.org.hibernate=INFO
logging.level.org.hibernate.SQL=INFO
logging.level.org.hibernate.type.descriptor.sql=INFO
logging.level.org.apache.tomcat=INFO
logging.level.org.apache.catalina=INFO

# JWT Security Configuration
jwt.secret=${JWT_SECRET_KEY}
jwt.expiration=${JWT_EXPIRATION:86400000}
jwt.header=Authorization
jwt.token-prefix=Bearer 
spring.security.filter.order=10

# HikariCP (DB connection pool)
spring.datasource.hikari.connection-timeout=120000
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.validation-timeout=10000
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.auto-commit=false
spring.datasource.hikari.initialization-fail-timeout=120000
spring.datasource.hikari.register-mbeans=true
spring.datasource.hikari.leak-detection-threshold=60000
spring.jpa.properties.hibernate.connection.provider_disables_autocommit=true

# Server configuration & optimization
server.tomcat.max-threads=200
server.connection-timeout=5000
server.forward-headers-strategy=NATIVE
server.tomcat.remoteip.remote-ip-header=X-Forwarded-For
server.tomcat.remoteip.protocol-header=X-Forwarded-Proto

# Error handling
server.error.include-message=always
server.error.include-binding-errors=always
server.error.include-stacktrace=never
server.error.include-exception=false

# Graceful shutdown
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s

# Hibernate batch & performance
spring.jpa.properties.hibernate.generate_statistics=false
spring.jpa.properties.hibernate.jdbc.batch_size=25
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.batch_versioned_data=true
```

---

<!-- Contributing Section -->

<a name="contributing"></a>

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git.push origin feature/YourFeature`)
5. Open a Pull Request

---
