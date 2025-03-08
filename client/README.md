## The Client:
It is a project that use with the `simple chat app backend` to deploy a full
chat application. It is a Python project that use `Textual` lib to implement 
a simple UI/TUI. Having a several of screens limited and related to the backend
features.

## Screens: 
- Help
- Login
- Register
- Update Account
- Show User Informations
- Conversations
- Chat

## Setup:
You need to up and run the server side of this application.

After the server is up and running you can setup the python side by:
- Set the `.env` file with this variables:
    - `CHATAPP_BACKEND_URL`: It is the base URL for the server,
        you need to set the URL like this `http://<HOST>:<PORT>/`,
        see the [`.env.example`](./.env.example) file for good example.

- Use Python `venv` if you want by using:
```bash
simple_chat_app/client$ python -m venv .vnev
# linux
simple_chat_app/client$ source .venv/bin/activate
# windows
D:\simple_chat_app\client> .\.venv\Scripts\activate
```
- Installing the requirements using this command:
```bash
simple_chat_app/client$ pip install -r requirements.txt
```
- Run the client side:
```bash
simple_chat_app/client$ python main.py
```
- If it's the first time, after login or register you can use the `:help`
    in screen input to get the help message.