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
            username = Config.get_user().get("username", None)
            for i in res.json():
                usernames = f"@{i['user1']} @{i['user2']}"
                if username:
                    usernames = f"@{i['user1']} @{i['user2']}".replace(f"@{username}", "")
                self.conversations += f"{i['id']}: {usernames}\nLast message: {i['lastMessage']}\nLast active: {i['lastActive']}\n{'-'*20}\n"
        elif res.status_code == 401:
            # TODO: Add notification for login or register.
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
                self.app.switch_screen("login")
        elif res.status_code == 404:
            self.conversations = "No Conversations to show!!!"
        elif res.status_code in [429, 500] :
            self.conversations = "Server Error: Too many requests!!\nPlease try to reload by :chats"
