#!/bin/bash

docker build -t jetqorfront .
docker run -d -p 8080:80 --name jetqor_front jetqorfront
echo "jetqor started on http://localhost:8080"


