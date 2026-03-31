FROM node:18-alpine
WORKDIR /app
COPY orchestrator/package*.json ./
RUN npm install --production
COPY orchestrator/ ./
COPY proto/ /proto/
EXPOSE 3000
CMD ["npm", "start"]
