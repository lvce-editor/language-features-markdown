#!/bin/bash

set -e

cd $(dirname "$0")
cd ..

command_exists(){
  command -v "$1" &> /dev/null
}

if ! command_exists "ncu"; then
    echo "npm-check-updates is not installed"
    npm i -g npm-check-updates
else
    echo "ncu is installed"
fi

function updateDependencies {
  echo "updating dependencies..."
  ncu -u -x @types/node -x @types/jest -x jest -x typescript
}

updateDependencies
for PACKAGE_DIR in packages/*; do
  cd "$PACKAGE_DIR"
  updateDependencies
  cd ../..
done

npm install

echo "Great Success!"

sleep 2
