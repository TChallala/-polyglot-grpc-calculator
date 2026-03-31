FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY subtract-service/build.gradle subtract-service/settings.gradle ./
COPY subtract-service/src ./src
COPY proto /proto
RUN gradle installDist --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/build/install/subtract-service ./
EXPOSE 50052
CMD ["./bin/subtract-service"]
