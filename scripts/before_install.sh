#!/bin/bash

# Install forever module 
sudo npm install forever -g

cd /opt/codedeploy-agent/deployment-root/deployment-instructions/
sudo rm -rf *-cleanup