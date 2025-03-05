import requests

from .base_screen import BaseScreen
from config       import Config

class ConversationsScreen(BaseScreen):
    def __init__(self):
        super().__init__()
        self.conversations: str = ""

    def on_mount(self):
        self.refresh()
        self.set_conversations()
        self.set_content(self.conversations)

    def set_conversations(self) -> None:
        accessToken, refreshToken = Config.get_tokens()
        res = requests.get(Config.CONVERSATIONS_API, headers={ 'Authorization': accessToken })
        if res.status_code == 200:
            res_json = res.json()
            self.app.conversations = res_json
            username = Config.get_user().get("username", None)
            for i in res_json:
                usernames = f"@{i['user1']} @{i['user2']}"
                if username:
                    usernames = f"@{i['user1']} @{i['user2']}".replace(f"@{username}", "")
                self.conversations += f"{i['id']}: {usernames}\nLast message: {i['lastMessage']}\nLast active: {i['lastActive']}\n{'-'*20}\n"
        elif res.status_code == 401:
            res = requests.get(Config.REFRESH_API, cookies={ 'refreshToken': refreshToken })
            if res.status_code == 200:
                res_json: dict = res.json()
                Config.set_tokens(
                    accessToken= res_json['accessToken'],
                    refreshToken= res.cookies.get('refreshToken')
                )
                Config.set_user(res_json['user'])
                self.app.switch_screen("conversations")
            elif res.status_code in [401, 404]:
                self.notify(
                    "Please login before you continue.\n",
                    title="Unauthorized Error!",
                    severity="error"
                )
                self.app.switch_screen("login")
        elif res.status_code == 404:
            self.notify(
                "No Conversations to show!\n",
                title="Not Found!",
                severity="warning"
            )
        elif res.status_code in [429, 500] :
            self.app.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )
