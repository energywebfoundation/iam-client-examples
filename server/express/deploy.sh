#!/usr/bin/env bash

git pull
sudo docker build . -t passport-did-auth-express:latest
sudo docker-compose -f docker-compose.prod.yml up -d