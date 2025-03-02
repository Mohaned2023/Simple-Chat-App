import requests
import re

from .base_screen import BaseScreen
from config import Config

class UserInformationsScreen(BaseScreen):
    def __init__(self, **kwargs):
        self.username = kwargs.get("username", None)
        del kwargs['username']
        super().__init__(**kwargs)

    def on_mount(self) -> None:
        if not self.username:
            user_data: dict = Config.get_user()
            self.set_content(self.format_user_data(user_data))
        else:
            if not re.match(r"([a-z0-9_]+)", self.username) or len(self.username) < 3:
                self.set_content(f"Error: Username `{self.username}` invalid!")
                return
            accessToken, _ = Config.get_tokens()
            res = requests.get(
                Config.USER_INFO_API.replace(":username", self.username),
                headers={ 'Authorization': accessToken }
            )
            if res.status_code == 200:
                self.set_content(self.format_user_data(res.json()))
            elif res.status_code == 400:
                self.set_content(f"Error: Username `{self.username}` invalid!\n")
            elif res.status_code == 401:
                self.set_content("Error: Unauthorized access!\n")
            elif res.status_code == 404:
                self.set_content("Error: User NOT found!\n")
            elif res.status_code in [429, 500]:
                self.set_content("Server Error: Too many requests!!\n")

    def format_user_data(self, user_data) -> str:
        return "\n".join([
                "Full Name: " + user_data.get("name", "Can NOT get information!"),
                "Username: "  + user_data.get("username", "Can NOT get information!"),
                "Email: "     + user_data.get("email", "Can NOT get information!"),
                "Gender: "    + str(user_data.get("gender", "Can NOT get information!")),
                "Create At: " + user_data.get("create_at", "Can NOT get information!"),
                "Update At: " + user_data.get("update_at", "Can NOT get information!")
            ])
