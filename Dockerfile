FROM node:18-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
#RUN curl -fsSL https://get.pnpm.io/install.sh | sh -
WORKDIR /home/node/app

COPY pnpm-lock.yaml package.json ./

COPY ./ /home/node/app/

# Install app dependencies using PNPM
RUN npm install -g pnpm
# Install dependencies
RUN pnpm i 
# Copy the application code 

USER node

CMD [ "tail", "-f", "/dev/null" ]

