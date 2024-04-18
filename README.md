# Ft_app_backend

## Overview

This backend application serves as the server-side component for our project. It handles data processing, authentication, and communication with the database.

## Technologies Used

- **Language:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **ODM:** [Mongoose](https://mongoosejs.com/)
- **Authentication:** JSON Web Tokens ([JWT](https://jwt.io/))

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jojosony21/Ft_app_backend
   
#2.Install dependencies:npm install

##3.Database setup:

.Install and configure MongoDB.
.Update the database configurations in  config.js.

##4.Environment setup:

Create a .env file based on .env.example and configure environment variables.

##5.Start the server:npm start 

##5.Endpoints


.User Authentication:
./register: Register a new user.
./login: Log in an existing user.
./forgot-password: Send password reset link to user's email.
.Chemical Management:
./add-chemical: Add a new chemical to the inventory.
./use-chemical: Record the usage of a chemical from the inventory.
./recent-chemicals: Get the list of recently used chemicals.
.Reagent Management:
./add-reagent: Add a new reagent to the inventory.
./use-reagent: Record the usage of a reagent from the inventory.
./recent-reagents: Get the list of recently used reagents.
.Experiment Management:
./add-experiment: Add a new experiment.
./recent-experiments: Get the list of recently conducted experiments.
Usage History:
./chemical-usage-history: Get the usage history of chemicals.
./reagent-usage-history: Get the usage history of reagents.
./experiment-history: Get the history of conducted experiments.


##Authentication


This application uses JWT tokens for authentication. To access protected endpoints, include the JWT token in the Authorization header of your requests.


##Contributing
Contributions are welcome! Please follow the guidelines outlined in CONTRIBUTING.md.

##License
This project is licensed under the MIT License - see the LICENSE file for details.
