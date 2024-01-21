# Electronic Wallet App
A financial app enabling users to deposit, withdraw, transfer funds, and view transaction history.

<br/>

## Used Technologies
This project is built in Typescript using MongoDB, ExpressJS and NodeJS.
* [NodeJS](https://nodejs.org/)
* [ExpressJS](https://www.expresjs.org/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose ODM](https://mongoosejs.com/) 
* [JSON Web Token](https://jwt.io/)
* [Bcrypt.js](https://www.npmjs.com/package/bcrypt)
* [Zod](https://zod.dev/)

<br/>

## Running Electronic Wallet App
Download [Electronic Wallet App](https://github.com/semaghith/Electronic-Wallet-App.git)
``` bash
git clone https://github.com/semaghith/Electronic-Wallet-App.git
```

<br/>

## Running the server
1. To run the server, the first step is downloading and installing [NodeJS](https://nodejs.org/en/download) on your machine. <br/>

2. Open a terminal, navigate to the project's directory, and run the following command to install the needed packages:
``` bash
npm i
```

3. Create a `.env` file in the project's root directory and fill in the data according to the [.env.example](https://github.com/semaghith/Electronic-Wallet-App/blob/main/.env.example) file.

4. Now, run the server through:
``` bash
npm run dev
```

<br/>

## Features
User can
* Register and Login
* Deposit Money to the wallet
* Withdraw Money from the wallet
* Transfer Money to other user
* View Transactions History
* View current wallet balance
* Get an analysis for the wallet in a specific month
  
<br/>

## API Endpoints
| HTTP Method | Endpoint | Required fields | Optional fields | Action | Response |
| :---------- | :------- | :-------------- | :-------------- | :----- | :------- |
| POST   | /register | - email: string <br/> - password: string <br/> | None | Register | - Created user id |
| POST   | /login | - email: string <br/> - password: string | None | login | - jwt access token |

> **Note: The following endpoints require an access token (bearer token)**

| HTTP Method | Endpoint | Required fields | Optional fields | Action | Response |
| :---------- | :------- | :-------------- | :-------------- | :----- | :------- |
| GET    | /users/getUsers | - cursor: string <br/> - limit: number <br/> | None | Get Users | - `Users` Object <br/> - Metadata = {<br/> prev_cursor, <br/> next_cursor <br/>} |
| GET    | /users/:id/balance | - id: string | None | Get Balance | - User balance |
| Patch  | /users/:id/balance | - id: string <br/> - amount: number | None | Update Balance | - Updated balance |
| DELETE | /users/:id | - id: string | None | Delete User | - Deleted user id |
|    <br/>    |      <br/>         |    <br/>             |          <br/>      |     <br/>    |      <br/>    |
| GET    | /transactions/ | - page: number <br/> - limit: number <br/> | None | list Transactions | - `Transactions` Object <br/> |
| GET    | /transactions/analyze | - month: number <br/> - year: number <br/> | None | Analyze Transactions | - Total deposit <br/> - Total withdraw |
| POST   | /transactions/deposit | - depositAmount: number | None | Deposit Money | - Deposit amount |
| POST   | /transactions/withdraw | - withdrawAmount: number | None | Withdraw Money | - Withdraw amount |
| POST   | /transactions/transfer | - transferAmount: number <br/> - receiverID: string| None | Transfer Money | - Receiver id <br/> - Transfer amount |

<br/>

## Returned objects format
> **Note: optional fields could be null**

``` js
user = {
  email,
  password,
  balance,
  transactions: [{
    amount,
    date,
    category
  }]
}
```

``` js
transaction = {
    amount,
    date,
    category
}
```
<br/>
