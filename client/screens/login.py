import requests
import re

from .base_screen import BaseScreen
from textual.app import ComposeResult
from textual.widgets import Button, Header, Footer, Static, Input
from textual.containers import Container
from config import Config

class LoginScreen(BaseScreen):

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Container(
            Static("Login..", id="content"),
            Input(placeholder="Username", id="username"),
            Input(placeholder="Password", password=True, id="password"),
            Button("Login", id="login_btn"),
            Button("Register", id="register_btr"),
            Button("Back", id="back_btr"),
        )
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "login_btn":
            username = self.query_one("#username").value
            password = self.query_one("#password").value
            if not re.match(r"((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$", password) :
                self.query_one("#content").update(f"Error: Password Not good!")
                return
            if not re.match(r"([a-z0-9_]+)", username) :
                self.query_one("#content").update(f"Error: Username Not good!")
                return
            self.login( username, password )
        elif event.button.id == "register_btr":
            self.app.switch_screen("register")
        elif event.button.id == "back_btr":
            self.app.switch_screen("conversations")

    def login(self, username: str, password: str) -> None:
        res: requests.Response = requests.post(
            url = Config.LOGIN_API,
            data = {
                'username': username,
                'password': password
            }
        )
        if res.status_code == 200:
            Config.set_access_token(res.json()['accessToken'])
            Config.set_refresh_token(res.cookies.get('refreshToken'))
            self.app.switch_screen("conversations")
        elif res.status_code == 401:
            self.query_one("#content").update(f"Error: Invalid password!")
        elif res.status_code == 404:
            self.query_one("#content").update(f"Error: User NOT found!")
        elif res.status_code in [429, 500] :
            self.query_one("#content").update(f"Server Error: Too many requests!!\nPlease try to reload by :chats")