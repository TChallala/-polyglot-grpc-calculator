package main

import (
	"context"
	"log"
	"net"

	pb "multiply-service/calculator"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"
	"net/http"
)

var (
	multiplyCounter = promauto.NewCounter(prometheus.CounterOpts{
		Name: "multiply_service_calls_total",
		Help: "The total number of multiplication operations",
	})
)

type server struct {
	pb.UnimplementedMultiplyServiceServer
}

func (s *server) Multiply(ctx context.Context, req *pb.BinaryRequest) (*pb.Result, error) {
	multiplyCounter.Inc()
	log.Printf("MultiplyService processing: %v * %v", req.A, req.B)
	return &pb.Result{Result: req.A * req.B}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50053")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterMultiplyServiceServer(s, &server{})
	log.Printf("MultiplyService server listening at %v", lis.Addr())

	// Start Prometheus metrics server on port 9093
	go func() {
		http.Handle("/metrics", promhttp.Handler())
		log.Printf("Metrics server running on port 9093")
		if err := http.ListenAndServe(":9093", nil); err != nil {
			log.Fatalf("failed to serve metrics: %v", err)
		}
	}()

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
