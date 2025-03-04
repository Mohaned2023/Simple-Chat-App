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

class UpdateScreen(BaseScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.selected_gender = None
    
    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield Container(
            Input(placeholder="Full Name", id="name"),
            Input(placeholder="Username", id="username"),
            Input(placeholder="Password", password=True, id="password"),
            RadioSet(
                RadioButton("Male", id="male", value="male"),
                RadioButton("Female", id="female", value="female"),
                id="gender_radios"
            ),
            Button("update", id="update_btn"),
            Button("Back", id="back_btr"),
        )
        yield Footer()
    
    def on_radio_set_changed(self, event: RadioSet.Changed) -> None:
        self.selected_gender = event.pressed.label
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "update_btn":
            update_data: dict = {
                "name": self.query_one("#name").value,
                "username": self.query_one("#username").value,
                "password": self.query_one("#password").value,
                "gender": False if str(self.selected_gender) == "Female" else True
            }
            check_status, update_data = self.check_update_values(update_data)
            if not check_status:
                return
            if len(update_data.keys()) != 0:
                if not self.update(update_data):
                    return
        self.app.switch_screen("conversations")

    def check_update_values( self, update_data: dict ) -> (bool, dict) :
        new_update_date: dict = {}
        if  len(update_data['name']) != 0:
            if len(update_data['name']) < 2 or len(update_data['name']) > 100 :
                self.notify(
                    "Name length is not ( 2 <= x <= 100 )!\n",
                    title="Name Error!",
                    severity="error"
                )
                return False, new_update_date
            new_update_date['name'] = update_data['name']
        if len(update_data['username']) != 0:
            if not re.match(r"([a-z0-9_]+)", update_data['username']):
                self.notify(
                    "Username Not good!\n",
                    title="Username Error!",
                    severity="error"
                )
                return False, new_update_date
            new_update_date['username'] = update_data['username']
        if len(update_data['password']) != 0:
            if not re.match(r"((?=.*\d)|(?=.*\w+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$", update_data['password']):
                self.notify(
                    "Password is too weak!\n"
                    "Enter password contains capital letters,\n"
                    "small letters, numbers and symbols\n",
                    title="Password Error!",
                    severity="error"
                )
                return False, new_update_date
            new_update_date['password'] = update_data['password']
        if update_data['gender'] != Config.get_user().get('gender', None):
            new_update_date['gender'] = update_data['gender']
        return True, new_update_date

    def update(self, update_data: dict) -> bool:
        username: str | None = Config.get_user().get('username', None)
        accessToken, _ = Config.get_tokens()
        if not username:
            self.notify(
                "Please make sure that you are logged in.\n"
                "If no try the command `:login` or `:register`.\n",
                title="User Data Error!",
                severity="error"
            )
            return False
        res = requests.patch(
            Config.UPDATE_API.replace(":username",username),
            json=update_data, 
            headers={ 'Authorization': accessToken }
        )
        if res.status_code == 200:
            res_json: dict = res.json()
            Config.set_tokens(
                accessToken= res_json['accessToken'],
                refreshToken= res.cookies.get('refreshToken')
            )
            self.notify(
                f"Your information has been updated.",
                title="Updated",
                severity="information"
            )
            Config.set_user(res_json['user'])
            return True
        elif res.status_code == 302:
            self.notify(
                "Username found in the database!\n",
                title="Username Error!",
                severity="error"
            )
        elif res.status_code == 400:
            self.notify(
                "Some fields are missing!\n",
                title="fields Error!",
                severity="error"
            )
        elif res.status_code in [401, 403]:
            self.notify(
                "Please make sure that you are logged in.\n"
                "If no try the command `:login` or `:register`.\n",
                title="Unauthorized Error!",
                severity="error"
            )
        elif res.status_code == 404:
            self.notify(
                "User NOT found!\n",
                title="User Error!",
                severity="error"
            )
        elif res.status_code in [429, 500]:
            self.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )
        return False