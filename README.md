# Singapore MRT

This application aims to determine the best route between two stations in Singapore's MRT.

## Getting Started

The project is based on Typescript and uses Node.js v10 in order to execute.

### Prerequisites

* Node v10.x & NPM v6.x

##### How to install Node & NPM on Ubuntu 16.04?

The following commands will install both Node v10.x and NPM are on the Ubuntu box.

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

sudo apt-get install -y nodejs
```

You can verify the installation using the following commands:

```
node --version # Prints (v10.15.3)

npm --version # Prints (6.4.1)
```

### Installing

Install dependencies:

```
# From the project root directory
npm install
```

## Running the tests

Automated tests for the project can be run using:

```
# From the project root directory
npm test
```

## Running the solution

Running the solution involves two steps:

* Build (Transpile TypeScript into JavaScript)
* Running the build output (javascript)

##### Build
You can build the project using the following command:
```
# From the project root directory
npm run build
```

##### Run
You can run the transpiled code using the following command:
```
# From the project root directory
npm start
```