# Singapore MRT

This application aims to determine the best route between two stations in Singapore's MRT.

## Getting Started

The project is based on Typescript and uses Node.js v10 in order to execute.

### Prerequisites

* Node v10.x & NPM v6.x

##### How to install Node & NPM on Ubuntu 16.04?

The following commands will install both Node v10.x and NPM are on Ubuntu 16.04.

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

sudo apt-get install -y nodejs
```

You can verify the installation using the following commands:

```
node --version 
# Prints Node version like (v10.15.3)

npm --version 
# Prints NPM version like (6.4.1)
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

#### Build
You can build the project using the following command:
```
# From the project root directory
npm run build
```

#### Run
You can run the transpiled code using the following command:
```
# From the project root directory
npm start
```

#### Usage
The easiest way to use the solution is `npm start`. Source station, Destination station and start-time (optional) are the arguments 
accepted by the solution. You can provide the start-time in `YYYY-MM-DDThh:mm` format. In case no arguments are provided, you will be 
prompted for the same.

```
# Be prompted for arguments
npm start

# Provide arguments while starting the solution 
# Without providing start-time
npm start -- route "Holland Village" "Bugis"

# With start-time
npm start -- route "Holland Village" "Bugis" --start-time "2019-01-01T08:00"
```