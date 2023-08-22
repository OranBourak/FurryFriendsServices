# FurryFriends Backend 🐾
Welcome to the backend repository of FurryFriends. This repository powers all the services and functionalities offered by FurryFriends for furry pets.

# Technologies Used
* Node.js: Our runtime environment.
* Express: Web application framework.
* Nodemon: Utility to monitor changes in the codebase and automatically restart the server.
* fs: For file system operations.
* chai and mocha for testing
* eslint to enforce uniform coding style
* CircleCI as a CICD
* cors for cross origin resource sharing between Front and Backend
  

# Prerequisites
* Node.js
* npm
* MongoDB will be used in the future, for now we use a json file for the database.

  # Setup
* Clone the backend repository
* navigate to backend directory and install required package dependencies with : npm i
* Start the server with Nodemon with : npm run dev

# Database
Ensure MongoDB is running on your machine. Update the .env file with the correct MongoDB URI if necessary.

# Linting
We use ESLint with Google conventions for the backend. To check for linting errors, we added 2 more rules for 4 space tabbing, double quotes on strings and that there is no limit on line length. to use it run:
npm run lint

# Services Offered
* Pet sitting - Trusted sitters to take care of your pets when you're away.
* Pet Grooming - to make your pet look beautiful !
* Dog training - High level trainers offer services
* Dog walking - Dog walkers would love to walk your dog
* and many more services related to furry pets!

