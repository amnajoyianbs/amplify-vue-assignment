#!/bin/bash

# Install dependencies for all Lambda functions before deployment
echo "Installing Lambda function dependencies..."

cd "$(dirname "$0")/asset-handler"
echo "Installing asset-handler dependencies..."
npm install
cd ..

cd asset-api
echo "Installing asset-api dependencies..."
npm install
cd ../..

echo "✅ All Lambda dependencies installed!"
