## Indexes:
- [Description](#description).
- [Endpoint](#endpoint).
- [APIs](#apis):
    - [User](#user):
        - [Register](#register).
        - [Login](#login).
        - [Get New Access Token](#get-new-access-token).
        - [Get User Information](#get-user-information).
        - [Update User Information](#update-user-information).
        - [Delete User](#delete-user).
    - [Conversation](#conversation):
        - [Create](#create).
        - [Get All Conversation](#get-all-conversation).
    -  [Message](#message):
        - [Get All Messages](#get-all-messages).
- [WebSocket (Socket.io)](#websocket-socketio):
    - [Chat Gateway](#chat-gateway).

## Description:
This server has a limited number of APIs as well as WebSocket: `Socket.io`.

### Endpoint:
| API                                | HTTP   | For                  |
|------------------------------------|--------|----------------------|
| `/api/v1/user/register`            | POST   | Registration         |
| `/api/v1/user/login`               | POST   | Login                |
| `/api/v1/user/refresh`             | GET    | Get New Access Token |
| `/api/v1/user/info/{username}`     | GET    | Get User Information |
| `/api/v1/user/update/{username}`   | PATCH  | Update User Info     |
| `/api/v1/user/delete/{username}`   | DELETE | Delete User          |
| `/api/v1/conversation/{username}`  | POST   | Create Conversation  |
| `/api/v1/conversation`             | GET    | Get All Conversation |
| `/api/v1/message/{conversationId}` | GET    | Get All Messages     |

# APIs:
### User:
#### Register:
- API Endponit: `/api/v1/user/register`
- Mathod: `POST`
- Description: This endpoint use to create a new user.
- Request body:
    - Type: `JSON`
    - Example:
    ```json
    {
        "username": "mohaned2023",
        "name": "Mohaned Sherhan (Mr.x)",
        "password": "Mohaned2023+",
        "email": "mohaned2023@gmail.com",
        "gender": true
    }
    ```
    - Body rules:
        - `username`:
            - required.
            - type string.
            - length [3, 50].
            - consists of `a-z` or `0-9` or `_`.
            - match this pattern `/([a-z0-9_]+)/`.
        - `name`:
            - required.
            - type string.
            - length [2, 100].
        - `password`:
            - required.
            - type string.
            - length [8, 512].
            - consists of `a-zA-Z` and `0-9` and `\w`.
            - match this pattern `/((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/`.  
        - `email`:
            - required.
            - type string.
            - length [5, 100].
            - It must be an email.
        - `gender`:
            - not required.
            - type boolean.
            - default true male.
            - false female.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48",
        "user": {
            "id": 29,
            "username": "mohaned2023",
            "name": "Mohaned Sherhan (Mr.x)",
            "email": "mohaned2023@gmail.com",
            "gender": true,
            "create_at": "2024-11-15 15:13:46.660422",
            "update_at": "2024-11-15 15:13:46.660422",
        }
    }
    ```
    - Status codes:
        - OK    `201 - Created`: User created.
        - ERROR `302 - Found`: Username or Email is found in the database!.
        - ERROR `400 - Bad Request`: Request body is missing some fields.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
#### Login
- API Endponit: `/api/v1/user/login`
- Mathod: `POST`
- Description: Login using the username and password.
- Request body:
    - Type: `JSON`
    - Example:
    ```json
    {
        "username": "mohaned2023",
        "password": "Mohaned2023+",
    }
    ```
    - Body rules:
        - `username`:
            - required.
            - type string.
            - length [3, 50].
            - consists of `a-z` or `0-9` or `_`.
            - match this pattern `/([a-z0-9_]+)/`.
        - `password`:
            - required.
            - type string.
            - length [8, 512].
            - consists of `a-zA-Z` and `0-9` and `\w`.
            - match this pattern `/((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/`.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48",
        "user": {
            "id": 29,
            "username": "mohaned2023",
            "name": "Mohaned Sherhan (Mr.x)",
            "email": "mohaned2023@gmail.com",
            "gender": true,
            "create_at": "2024-11-15 15:13:46.660422",
            "update_at": "2024-11-15 15:13:46.660422"
        }
    }
    ```
    - Status codes:
        - OK `200 - Ok`: ok.
        - ERROR `400 - Bad Request`: Request body is missing some fields.
        - ERROR `401 - Unauthorized`: Invalid password.
        - ERROR `404 - Not Found`: User with username not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
#### Get New Access Token
- API Endponit: `/api/v1/user/refresh`
- Mathod: `GET`
- Description: Get a new access token.
- Request body: 
    - `Request body is not requires`.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48",
        "user": {
            "id": 29,
            "username": "mohaned2023",
            "name": "Mohaned Sherhan (Mr.x)",
            "email": "mohaned2023@gmail.com",
            "gender": true,
            "create_at": "2024-11-15 15:13:46.660422",
            "update_at": "2024-11-15 15:13:46.660422"
        }
    }
    ```
    - Status codes:
        - OK `200 - Ok`: ok.
        - ERROR `401 - Unauthorized`: Invalid refresh token.
        - ERROR `404 - Not Found`: User not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
    - Notes:
        - status code 401 -> the user has been inactive for more than 7 days or has not logged in.
        - as a frontend developer if you have status code 401 or 404 in this endpoint redirect the user to login or register page.
        - as a frontend developer if you have status code 401 in [ [Get User Information](#get-user-information), [Update User Information](#update-user-information), [Delete User](#delete-user) ] redirect the user to this endpoint. 
---
#### Get User Information
- API Endponit: `/api/v1/user/info/{username}`
    - username is a string with length of >= 3.
- Mathod: `GET`
- Description: Get User Information.
- Request body: 
    - `Request body is not requires`.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Response:
    - Type: `JSON`
    - Example if the user has this account:
    ```json
    {
        "id": 29,
        "username": "mohaned2023",
        "name": "Mohaned Sherhan (Mr.x)",
        "email": "mohaned2023@gmail.com",
        "gender": true,
        "create_at": "2024-11-15 15:13:46.660422",
        "update_at": "2024-11-15 15:13:46.660422"
    }
    ```
    - Example if the user is not the owner of this account:
    ```json
    {
        "username": "mohaned2023",
        "name": "Mohaned Sherhan (Mr.x)",
        "gender": true
    }
    ```
    - Status codes:
        - OK `200 - Ok`: ok.
        - ERROR `400 - Bad Request`: Invalid username.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `404 - Not Found`: User with username not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
#### Update User Information
- API Endponit: `/api/v1/user/update/{username}`
    - username is a string with length of >= 3.
- Mathod: `PATCH`
- Description: Update User Information.
- Request body: 
    - required.
    - type: `JSON`
    - you can update one or more of:
        - username
        - name
        - password
        - gender
    - Example:
    ```json
    {
        "username": "mohaned2023",
        "name": "Mohaned Sherhan (Mr.x)",
        "password": "Mohaned2023+",
        "gender": true
    }
    ```
    - Body rules:
        - `username`:
            - type string.
            - length [3, 50].
            - consists of `a-z` or `0-9` or `_`.
            - match this pattern `/([a-z0-9_]+)/`.
        - `name`:
            - type string.
            - length [2, 100].
        - `password`:
            - type string.
            - length [8, 512].
            - consists of `a-zA-Z` and `0-9` and `\w`.
            - match this pattern `/((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/`.
        - `gender`:
            - type boolean.
            - default true male.
            - false female.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48",
        "user": {
            "id": 29,
            "username": "mohaned2023",
            "name": "Mohaned Sherhan (Mr.x)",
            "email": "mohaned2023@gmail.com",
            "gender": true,
            "create_at": "2024-11-15 15:13:46.660422",
            "update_at": "2024-12-01 15:13:46.660422"
        }
    }
    ```
    - Status codes:
        - OK `200 - Ok`: ok.
        - ERROR `302 - Found`: Username or Email is found in the database!.
        - ERROR `400 - Bad Request`: Invalid body.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `403 - Forbidden`: User tried to update another account.
        - ERROR `404 - Not Found`: User with username not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
#### Delete User
- API Endponit: `/api/v1/user/delete/{username}`
    - username is a string with length of >= 3.
- Mathod: `DELETE`
- Description: Delete User.
- Request body: 
    - `Request body is not requires`.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "message": "The user 'mohaned2023' deleted successfully."
    }
    ```
    - Status codes:
        - OK `200 - Ok`: ok.
        - ERROR `400 - Bad Request`: Invalid username.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `403 - Forbidden`: User tried to delete another account.
        - ERROR `404 - Not Found`: User with username not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
### Conversation:
#### Create
- API Endponit: `/api/v1/conversation/{username}`
    - username is a string with length of >= 3.
- Mathod: `POST`
- Description: This endpoint use to create a new conversation.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Request body: 
    - `Request body is not requires`.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    {
        "id": 29,
        "user1": "mohaned",
        "user2": "mohammed",
        "lastMessage": "Hi, my name is mohaned.",
        "lastActive": "2024-11-15 15:13:46.660422",
        "createAt": "2024-11-15 15:13:46.660422",
    }
    ```
    - Status codes:
        - OK    `201 - Created`: User created.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `404 - Not Found`: User with username not found.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
#### Get All Conversation
- API Endponit: `/api/v1/conversation`
- Mathod: `GET`
- Description: This endpoint use to get all conversation.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Request body: 
    - `Request body is not requires`.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    [
        {
            "id": 29,
            "user1": "mohaned",
            "user2": "mohammed",
            "lastMessage": "Hi, my name is mohaned.",
            "lastActive": "2024-11-15 15:13:46.660422",
            "createAt": "2024-11-15 15:13:46.660422",
        },
        ...
    ]
    ```
    - Status codes:
        - OK    `200`: Ok.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `404 - Not Found`: No conversations.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.
---
### Message:
#### Get All Messages:
- API Endponit: `/api/v1/message/{conversationId}`
    - conversationId is a number start from 0.
- Mathod: `GET`
- Description: This endpoint use to get all messages in the conversation.
- Request authorization header:
    - required.
    - type: `JSON`
    ```json
    {
        "Authorization": "Bearer <accessToken>"
    }
    ```
    - Example:
    ```json
    {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFuZWQyMDIzIiwiaWF0IjoxNzMxNjc1MzM0LCJleHAiOjE3MzE2ODYxMzR9.MEZmEDKvl7giIH7whhWMRoxTK8v4lz8jgDytLPDcm48"
    }
    ```
- Request body: 
    - `Request body is not requires`.
- Response:
    - Type: `JSON`
    - Example:
    ```json
    [
        {
            "id": 1231,
            "senderUsername": "mohaned",
            "receiverUsername": "mohammed",
            "conversationId": 19,
            "body": "Hi, my name is mohaned.",
            "isDelivered": true,
            "isRead": false,
            "createAt": "2024-11-15 15:13:46.660422"
        },
        ...
    ]
    ```
    - Status codes:
        - OK    `200`: Ok.
        - ERROR `401 - Unauthorized`: Invalid accessToken.
        - ERROR `404 - Not Found`: No conversations.
        - ERROR `429 - Too Many Requests`: More than 3req/1s or 10req/20s or 30req/1m.
        - ERROR `500 - Internal Server Error`: Backend failure -> submit an issue in github.

# WebSocket (Socket.io):
### Chat Gateway:
- This gateway handling the chat logic.
- Events:
    - `message`: Use to send and receive the message.
    - `error`: Use to send the errors from the server to the client.
- URL: `<host>:<port>/?token=<accessToken>`.
    - Example: 
    ```
    localhost:3000/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJtb2hhbmVkIiwiaWF0IjoxNzM5Mzc5NzM1LCJleHAiOjE3MzkzOTA1MzV9.WDcGzzoub-mweBhEy51rrFTHWQPNCZ3T_-XhMqucrj0
    ```
- Send `message` body:
    - require.
    - type: `JSON`.
    - fields:
        - conversationId `number`: The conversation id.
        - receiverId `number`: The receiver id.
        - body `string`: The message body.
    - Example:
    ```json
    {
        "conversationId": 19,
        "receiverUsername": "mohammed",
        "body": "Hi, my name is mohaned"
    }
    ```
- Receive `message` body:
    - type: `JSON`.
    - Example:
    ```json
    {
        "id": 1231,
        "senderUsername": "mohaned",
        "receiverUsername": "mohammed",
        "conversationId": 19,
        "body": "Hi, my name is mohaned.",
        "isDelivered": true,
        "isRead": false,
        "createAt": "2024-11-15 15:13:46.660422"
    }
    ```
- Receive `error` body:
    - type: `JSON`.
    - Example:
    ```json
    {
        "error": "The name is not found!"
    }
    ```