package com.calculator;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.prometheus.client.exporter.HTTPServer;

import java.io.IOException;

public class SubtractServer {
    public static void main(String[] args) throws IOException, InterruptedException {
        int port = 50052;
        Server server = ServerBuilder.forPort(port)
            .addService(new SubtractServiceImpl())
            .build()
            .start();
            
        System.out.println("SubtractService running on port " + port);

        // Start Prometheus metrics server on port 9092
        HTTPServer metricsServer = new HTTPServer(9092);
        System.out.println("Metrics server running on port 9092");

        server.awaitTermination();
    }
}
