const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const math = require('mathjs');
const http = require('http');
const client = require('prom-client');

const app = express();
app.use(cors());
app.use(express.json());

const PROTO_PATH = path.join(__dirname, '../proto/calculator.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;

// Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const expressionCounter = new client.Counter({
  name: 'orchestrator_expressions_total',
  help: 'Total number of mathematical expressions evaluated'
});

const operationCounter = new client.Counter({
  name: 'orchestrator_operations_total',
  help: 'Total number of gRPC operations performed',
  labelNames: ['operation']
});

// Initialize gRPC clients
const addUrl = process.env.ADD_SERVICE_URL || 'localhost:50051';
const subUrl = process.env.SUBTRACT_SERVICE_URL || 'localhost:50052';
const mulUrl = process.env.MULTIPLY_SERVICE_URL || 'localhost:50053';
const divUrl = process.env.DIVIDE_SERVICE_URL || 'localhost:50054';

const addClient = new calculatorProto.AddService(addUrl, grpc.credentials.createInsecure());
const divideClient = new calculatorProto.DivideService(divUrl, grpc.credentials.createInsecure());
const multiplyClient = new calculatorProto.MultiplyService(mulUrl, grpc.credentials.createInsecure());
const subtractClient = new calculatorProto.SubtractService(subUrl, grpc.credentials.createInsecure());

// Helper functions for Promisifying gRPC calls
function callAdd(a, b) {
  return new Promise((resolve, reject) => {
    operationCounter.inc({ operation: 'add' });
    addClient.Add({ a, b }, (err, response) => {
      if (err) reject(err);
      else resolve(response.result);
    });
  });
}

function callDivide(a, b) {
  return new Promise((resolve, reject) => {
    operationCounter.inc({ operation: 'divide' });
    divideClient.Divide({ a, b }, (err, response) => {
      if (err) reject(err);
      else resolve(response.result);
    });
  });
}

function callMultiply(a, b) {
  return new Promise((resolve, reject) => {
    operationCounter.inc({ operation: 'multiply' });
    multiplyClient.Multiply({ a, b }, (err, response) => {
      if (err) reject(err);
      else resolve(response.result);
    });
  });
}

function callSubtract(a, b) {
  return new Promise((resolve, reject) => {
    operationCounter.inc({ operation: 'subtract' });
    subtractClient.Subtract({ a, b }, (err, response) => {
      if (err) reject(err);
      else resolve(response.result);
    });
  });
}

// AST Evaluator
async function evaluateAST(node) {
  if (node.isConstantNode) {
    return node.value;
  }
  if (node.isOperatorNode) {
    const left = await evaluateAST(node.args[0]);
    const right = await evaluateAST(node.args[1]);

    if (node.op === '+') {
      return await callAdd(left, right);
    } else if (node.op === '/') {
      return await callDivide(left, right);
    } else if (node.op === '*') {
      return await callMultiply(left, right);
    } else if (node.op === '-') {
      return await callSubtract(left, right);
    } else {
      throw new Error(`Operator '${node.op}' is not supported yet or service is missing.`);
    }
  }
  if (node.isParenthesisNode) {
    return await evaluateAST(node.content);
  }
  throw new Error(`Unsupported node type: ${node.type}`);
}

app.post('/calculate', async (req, res) => {
  try {
    const { expression } = req.body;
    if (!expression) {
      return res.status(400).json({ error: "Please provide an 'expression' in the JSON body." });
    }
    
    expressionCounter.inc();
    
    // Parse expression into AST
    const node = math.parse(expression);
    
    // Evaluate via gRPC calls
    const result = await evaluateAST(node);
    
    res.json({ expression, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator Service running on port ${PORT}`);
});

// Metrics Server (HTTP)
const metricsPort = process.env.METRICS_PORT || 9090;
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
