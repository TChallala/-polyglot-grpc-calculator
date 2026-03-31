FROM golang:1.24-alpine AS builder
RUN apk add --no-cache protobuf
WORKDIR /app
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
COPY multiply-service/go.mod multiply-service/go.sum ./
RUN go mod download
COPY multiply-service/ ./
COPY proto/ /proto/
ENV PATH="$PATH:/go/bin"
RUN protoc --go_out=. --go_opt=module=multiply-service \
           --go-grpc_out=. --go-grpc_opt=module=multiply-service \
           -I/proto /proto/calculator.proto
RUN go build -o multiply-service main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/multiply-service .
EXPOSE 50053
CMD ["./multiply-service"]
