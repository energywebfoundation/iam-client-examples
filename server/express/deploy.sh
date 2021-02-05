#!/usr/bin/env bash

git pull
docker build . -t passport-did-auth-express:latest
docker-compose -f docker-compose.prod.yml up -d