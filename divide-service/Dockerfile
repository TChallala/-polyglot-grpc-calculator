FROM python:3.11-slim
WORKDIR /app
COPY divide-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY divide-service/ ./
COPY proto/ /proto/
RUN python -m grpc_tools.protoc -I/proto --python_out=. --grpc_python_out=. /proto/calculator.proto
EXPOSE 50054
CMD ["python", "server.py"]
