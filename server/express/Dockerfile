ARG PORT=3333

FROM node:14-alpine

# Set node environment to production
ENV NODE_ENV production

WORKDIR /app

# Update the system
RUN apk --no-cache -U upgrade && apk add python make g++

COPY . .

# install only prod dependencies
RUN npm ci --only=production

# Install PM2
RUN npm i -g pm2

# Switch to user node
USER node

# Open desired port
EXPOSE ${PORT}

# Use PM2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"] 