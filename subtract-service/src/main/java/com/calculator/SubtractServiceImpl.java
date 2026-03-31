package com.calculator;

import io.grpc.stub.StreamObserver;
import io.prometheus.client.Counter;

public class SubtractServiceImpl extends SubtractServiceGrpc.SubtractServiceImplBase {
    static final Counter subtractCounter = Counter.build()
        .name("subtract_service_calls_total")
        .help("Total number of subtractions")
        .register();

    @Override
    public void subtract(BinaryRequest request, StreamObserver<Result> responseObserver) {
        subtractCounter.inc();
        System.out.println("SubtractService processing: " + request.getA() + " - " + request.getB());
        
        Result result = Result.newBuilder()
            .setResult(request.getA() - request.getB())
            .build();
            
        responseObserver.onNext(result);
        responseObserver.onCompleted();
    }
}
