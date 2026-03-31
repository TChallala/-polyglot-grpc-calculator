FROM node:18-alpine
WORKDIR /app
COPY add-service/package*.json ./
RUN npm install --production
COPY add-service/ ./
COPY proto/ /proto/
EXPOSE 50051
CMD ["npm", "start"]
