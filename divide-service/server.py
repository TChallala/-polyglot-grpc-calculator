import grpc
from concurrent import futures
from prometheus_client import start_http_server, Counter
import calculator_pb2
import calculator_pb2_grpc

# Prometheus Metrics
DIVIDE_COUNTER = Counter('divide_service_calls_total', 'Total number of divisions')

class DivideService(calculator_pb2_grpc.DivideServiceServicer):
    def Divide(self, request, context):
        DIVIDE_COUNTER.inc()
        if request.b == 0:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Division by zero")
            return calculator_pb2.Result()
        
        result = request.a / request.b
        print(f"DivideService processing: {request.a} / {request.b} = {result}")
        return calculator_pb2.Result(result=result)

def serve():
    # Set up the gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Register the service
    calculator_pb2_grpc.add_DivideServiceServicer_to_server(DivideService(), server)
    
    # Start Prometheus metrics server on port 9094
    start_http_server(9094)
    print("Metrics server running on port 9094")

    # Listen on port 50054
    port = '50054'
    server.add_insecure_port(f'[::]:{port}')
    print(f"DivideService running on port {port}")
    
    # Start and wait for termination
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
