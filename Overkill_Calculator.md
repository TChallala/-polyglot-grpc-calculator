# 🧮 Polyglot gRPC Calculator Microservices

## 📌 Overview

This project is a **polyglot microservices-based calculator system** where each mathematical operation is implemented as an independent service using a different programming language.

All services communicate using **gRPC and Protocol Buffers**, coordinated by a central **Orchestrator Service**.

### 🎯 Objectives

* Demonstrate microservices architecture
* Implement polyglot services (multiple languages)
* Use gRPC for inter-service communication
* Apply orchestration patterns
* Containerize services using Docker

---

## 🏗️ Architecture

### 🔷 High-Level Flow

```
Client → API Gateway (optional) → Orchestrator → Operator Services
```

### 🔷 System Components

#### 1. API Gateway (Optional)

* Provides REST interface for external clients
* Translates HTTP requests into gRPC calls
* Useful for testing via Postman or browser

#### 2. Orchestrator Service

* Central controller of the system
* Parses mathematical expressions
* Determines execution order
* Calls operator services via gRPC
* Aggregates results

#### 3. Operator Services (Microservices)

Each service:

* Handles a single operation
* Is independently deployable
* Uses a different programming language

| Service          | Language      | Responsibility |
| ---------------- | ------------- | -------------- |
| Add Service      | Node.js       | Addition       |
| Subtract Service | Java / Kotlin | Subtraction    |
| Multiply Service | Go            | Multiplication |
| Divide Service   | Python        | Division       |

#### 4. Shared Proto Definitions

* Defines gRPC contracts
* Ensures consistent communication across services

---

## 🧱 Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Communication    | gRPC (Protocol Buffers) |
| Orchestrator     | Node.js / Go            |
| Add Service      | Node.js                 |
| Subtract Service | Java / Kotlin           |
| Multiply Service | Go                      |
| Divide Service   | Python                  |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
/proto
  calculator.proto

/orchestrator

/add-service
/subtract-service
/multiply-service
/divide-service

/gateway (optional)

/docker-compose.yml
```

---

## 📄 gRPC Contract (Protocol Buffers)

```proto
syntax = "proto3";

package calculator;

message BinaryRequest {
  double a = 1;
  double b = 2;
}

message Result {
  double result = 1;
}

service AddService {
  rpc Add (BinaryRequest) returns (Result);
}

service SubtractService {
  rpc Subtract (BinaryRequest) returns (Result);
}

service MultiplyService {
  rpc Multiply (BinaryRequest) returns (Result);
}

service DivideService {
  rpc Divide (BinaryRequest) returns (Result);
}
```

---

## ⚙️ Functional Requirements

### 1. Basic Operations

Each operator service must:

* Accept two numeric inputs (`a`, `b`)
* Perform its assigned operation
* Return the result via gRPC

| Operation   | Formula |
| ----------- | ------- |
| Addition    | a + b   |
| Subtraction | a - b   |
| Multiply    | a * b   |
| Division    | a / b   |

---

### 2. Expression Evaluation

The system must support expressions such as:

```
10 + 5 * 2
```

The Orchestrator must:

1. Parse the expression
2. Respect operator precedence (PEMDAS/BODMAS)
3. Execute operations in correct order
4. Call appropriate services via gRPC
5. Return final computed result

---

### 3. Error Handling

The system must handle:

* Division by zero
* Invalid input format
* gRPC communication failures
* Service downtime/unavailability

---

### 4. Inter-Service Communication

* Must use **gRPC only**
* Must use shared `.proto` definitions
* No REST calls between internal services

---

### 5. Orchestration Logic

The Orchestrator must:

* Be the single decision-maker
* Control execution flow
* Chain service calls
* Aggregate intermediate results
* Return final output to client

---

## 🚀 Non-Functional Requirements

### 1. Performance

* Use gRPC for low-latency communication
* Efficient handling of multiple requests

### 2. Scalability

* Services must be independently deployable
* Support horizontal scaling

### 3. Maintainability

* Clear separation of concerns
* Modular service design

### 4. Observability (Recommended)

* Centralized logging
* Request tracing
* Error monitoring

---

## 🐳 Deployment

### Docker Requirements

Each service must:

* Have its own `Dockerfile`
* Expose a gRPC port
* Be accessible via Docker network

---

### Run the System

```bash
docker-compose up --build
```

---

## 🔄 Sample Execution Flow

### Input

```
10 + 5 * 2
```

### Execution Steps

1. Orchestrator parses expression
2. Calls Multiply Service:

   ```
   5 * 2 = 10
   ```
3. Calls Add Service:

   ```
   10 + 10 = 20
   ```
4. Returns result:

```
20
```

---

## 🔐 Future Enhancements

* Authentication & Authorization service
* Rate limiting (API Gateway)
* Centralized logging service
* Metrics (Prometheus & Grafana)
* gRPC streaming support
* Event-driven architecture (Kafka / RabbitMQ)

---

## 🧠 Key Concepts Demonstrated

* Microservices architecture
* Polyglot services
* gRPC communication
* Protocol Buffers contracts
* Service orchestration
* Containerized deployment

---

## 🧾 Resume Description (Suggested)

Built a polyglot microservices-based calculator using gRPC, with services implemented in Node.js, Go, Python, and Java. Designed an orchestrator to coordinate distributed computations, implemented Protocol Buffers for inter-service communication, and containerized the system using Docker Compose.

---

## 📌 Notes

* This project is designed for **learning and demonstration purposes**
* Focus is on architecture and communication patterns rather than UI
* Can be extended into a production-grade system with additional features

---
