FROM node:24-slim

# Loading the GnuCOBOL compiler
RUN apt-get update && apt-get install -y gnucobol && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compiling COBOL code into machine-readable binary once
RUN cobc -x -o total_sales total_sales.cbl

EXPOSE 4000

CMD ["node", "server.js"]