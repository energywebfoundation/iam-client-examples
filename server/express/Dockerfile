ARG PORT=3333

FROM node:14-alpine AS node

FROM node AS final

# Set node environment to production
ENV NODE_ENV production

# Update the system
RUN apk --no-cache -U upgrade && apk add python make g++

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/server/express
RUN chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app/server/express

# Install PM2
RUN npm i -g pm2

# Copy package.json, package-lock.json and process.yml
COPY --chown=node:node . ./

# Switch to user node
USER node

# Install libraries as user node
RUN npm i --only=production

# Open desired port
EXPOSE ${PORT}

# Use PM2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"] 