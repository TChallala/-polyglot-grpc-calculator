const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const http = require('http');
const client = require('prom-client');

const PROTO_PATH = path.join(__dirname, '../proto/calculator.proto');

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;

// Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const addCounter = new client.Counter({
  name: 'add_service_calls_total',
  help: 'Total number of additions'
});

/**
 * Implements the Add RPC method.
 */
function add(call, callback) {
  const { a, b } = call.request;
  const result = a + b;
  addCounter.inc();
  console.log(`AddService processing: ${a} + ${b} = ${result}`);
  callback(null, { result });
}

function main() {
  const server = new grpc.Server();
  
  // Register the AddService with its implementation
  server.addService(calculatorProto.AddService.service, { add: add });
  
  const port = process.env.PORT || 50051;
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`AddService running on port ${boundPort}`);
  });

  // Metrics Server (HTTP)
  const metricsPort = process.env.METRICS_PORT || 9091;
  http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }).listen(metricsPort, () => {
    console.log(`Metrics server running on port ${metricsPort}`);
  });
}

main();
