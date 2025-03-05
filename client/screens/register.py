import requests
import re

from .base_screen import BaseScreen
from textual.app import ComposeResult
from textual.widgets import (
    Button, 
    Header, 
    Footer, 
    Static, 
    Input, 
    RadioSet, 
    RadioButton
)
from textual.containers import Container
from config import Config

class RegisterScreen(BaseScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.selected_gender = None
    
    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Container(
            Input(placeholder="Full Name", id="name"),
            Input(placeholder="Email", id="email"),
            Input(placeholder="Username", id="username"),
            Input(placeholder="Password", password=True, id="password"),
            RadioSet(
                RadioButton("Male", id="male", value="male"),
                RadioButton("Female", id="female", value="female"),
                id="gender_radios"
            ),
            Button("Register", id="register_btn"),
            Button("Login", id="login_btr"),
            Button("Back", id="back_btr"),
        )
        yield Footer()
    
    def on_mount(self) -> None :
        self.query_one("#name").focus()

    def on_radio_set_changed(self, event: RadioSet.Changed) -> None:
        self.selected_gender = event.pressed.label

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "register_btn":
            register_data: dict = {
                "name": self.query_one("#name").value,
                "email": self.query_one("#email").value,
                "username": self.query_one("#username").value,
                "password": self.query_one("#password").value,
                "gender": False if str(self.selected_gender) == "Female" else True
            }
            if not self.check_register_values(register_data):
                return
            if not self.register(register_data):
                return
        elif event.button.id == "login_btr" or event.button.id == "back_btr":
            self.app.switch_screen("login")
        self.app.switch_screen("conversations")

    def check_register_values( self, register_data: dict ) -> bool :
        is_valid: list[bool] = []
        if  len(register_data['name']) < 2 or len(register_data['name']) > 100 :
            self.notify(
                "Name length is not ( 2 <= x <= 100 )!\n",
                title="Name Error!",
                severity="error"
            )
            is_valid.append(False) 
        if not re.match(r"([a-z0-9_]+)", register_data['username']):
            self.notify(
                "Username Not good!\n",
                title="Username Error!",
                severity="error"
            )
            is_valid.append(False)
        if not re.match(r"((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$", register_data['password']):
            self.notify(
                "Password is too weak!\n"
                "Enter password contains capital letters,\n"
                "small letters, numbers and symbols\n",
                title="Password Error!",
                severity="error"
            )
            is_valid.append(False)
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", register_data['email']):
            self.notify(
                "Email doesn't look like email!\n",
                title="Email Error!",
                severity="error"
            )
            is_valid.append(False)
        return False if False in is_valid else True

    def register(self, register_data: dict) -> bool:
        res = requests.post(Config.REGISTER_API, json=register_data)
        if res.status_code == 201:
            res_json: dict = res.json()
            Config.set_tokens(
                accessToken= res_json['accessToken'],
                refreshToken= res.cookies.get('refreshToken')
            )
            Config.set_user(res_json['user'])
            self.notify(
                f"Hi {res_json['user']['name']} Thank you for using our app :)",
                severity="information"
            )
            self.app.socketClient.start()
            return True
        elif res.status_code == 302:
            self.notify(
                "Username or Email is found in the database!\n",
                title="Username or Email Error!",
                severity="error"
            )
        elif res.status_code == 400:
            self.notify(
                "Some fields are missing!\n",
                title="fields Error!",
                severity="error"
            )
        elif res.status_code in [429, 500]:
            self.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )
        return False