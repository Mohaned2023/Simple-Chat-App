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
        self.error_message = ""
    
    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Container(
            Static("Login..", id="content"),
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
                self.query_one("#content").update(self.error_message)
                self.error_message = ""
                return
            if not self.register(register_data):
                self.query_one("#content").update(self.error_message)
                return 
        elif event.button.id == "login_btr":
            self.app.switch_screen("login")
        self.app.switch_screen("conversations")

    def check_register_values( self, register_data: dict ) -> bool :
        is_valid: list[bool] = []
        if  len(register_data['name']) < 2 or len(register_data['name']) > 100 :
            self.error_message += "Error: Name length is not ( 2 <= x <= 100 )\n"
            is_valid.append(False) 
        if not re.match(r"([a-z0-9_]+)", register_data['username']):
            self.error_message += "Error: Username is not valid!\n"
            is_valid.append(False)
        if not re.match(r"((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$", register_data['password']):
            self.error_message += "Error: Password is too weak!. Enter password contains capital letters, small letters, numbers and symbols\n"
            is_valid.append(False)
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", register_data['email']):
            self.error_message += "Error: Email doesn't look like email\n"
            is_valid.append(False)
        return False if False in is_valid else True

    def register(self, register_data: dict) -> bool:
        res = requests.post(Config.REGISTER_API, json=register_data)
        if res.status_code == 201:
            Config.set_tokens(
                accessToken= res.json()['accessToken'],
                refreshToken= res.cookies.get('refreshToken')
            )
            return True
        elif res.status_code == 302:
            self.error_message = "Error: Username or Email is found in the database!\n"
        elif res.status_code == 400:
            self.error_message = f"{str(res.json())}\n{register_data['gender']}\nError: Some fields are missing!\n"
        elif res.status_code in [429, 500]:
            self.error_message = "Server Error: Too many requests!!\n"
        return False