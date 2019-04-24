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

## Assumptions

The following assumptions were made during the development:

* Time taken per stop, time taken per line change and the opening dates only come into effect when the start time is provided.
* If the start time is not provided, the time taken per stop and the time taken to change lines, both are assumed to be 1 minute. The 
opening date for the stop is ignored.
* Trains cannot travel _through_ stations which are not open. 
Example: If the following is a train line: `Station A -> Station B -> Station C`. If Station B is not open yet, there is no route between Station A and Station C.

## Known Issues
Here are the known issues with the solution:

##### Line Closing Time
In case a train line is closing or opening in some time (due to night hours), but the start-time provided is just before the closing 
time, the solution only takes into account the train lines which were open at the start-time provided. Any lines closure/opening that 
happens after the start-time is not taken into account while determining the route.

Example:

Suppose a user is trying to go from Caldecott to Newton at `2019-01-01T21:59`. The optimum route, without considering the line closure 
which takes place at `22:00`, would be `CC17 -> CC19 -> DT9 -> DT10 -> DT11`. However, since the DT line closes at `22:00`, the user will 
not be able to switch to the DT line. 