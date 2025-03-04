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
            if not re.match(r"([a-z0-9_]+)", username) :
                self.notify(
                    "Username Not good!\n",
                    title="Username Error!",
                    severity="error"
                )
                return
            if not re.match(r"((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$", password) :
                self.notify(
                    "Password Not good!\n",
                    title="Password Error!",
                    severity="error"
                )
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
            res_json: dict = res.json()
            Config.set_tokens(
                accessToken= res_json['accessToken'],
                refreshToken= res.cookies.get('refreshToken')
            )
            Config.set_user(res_json['user'])
            self.notify(
                f"Welcome back {res_json['user']['name']} :)",
                severity="information"
            )
            self.app.switch_screen("conversations")
        elif res.status_code == 401:
            self.notify(
                "Invalid password!",
                title="Password Error!",
                severity="error"
            )
        elif res.status_code == 404:
            self.notify(
                "User NOT found!",
                title="Username Error!",
                severity="error"
            )
        elif res.status_code in [429, 500] :
            self.app.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )