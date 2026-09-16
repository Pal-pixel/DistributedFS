FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src

COPY start-all.js ./

# Create storage directories for the 3 storage nodes
RUN mkdir -p \
    /app/storage-nodes/node-1 \
    /app/storage-nodes/node-2 \
    /app/storage-nodes/node-3

# Create temporary upload directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "start-all.js"]