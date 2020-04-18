#!/bin/bash

mkdir /home/ubuntu/nodejs
cd /home/ubuntu/nodejs

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/nodejs/logs/config.json -s

sudo npm install --save