import requests

from .base_screen import BaseScreen
from config       import Config

class ConversationsScreen(BaseScreen):
    def __init__(self):
        super().__init__()
        self.conversations: str = ""

    def on_mount(self):
        self.set_conversations()
        self.set_content(self.conversations)

    def set_conversations(self) -> None:
        res = requests.get(Config.CONVERSATIONS_API, headers={ 'Authorization': Config.get_access_token() })
        if res.status_code == 200:
            for i in res.json():
                self.conversations += f"{i['id']}: {i['lastMessage']}\n  Last Active: {i['lastActive']}\n\n"
        elif res.status_code == 401:
            # TODO: Add notification for login or register.
            self.app.command_handler.execute(":login")
        elif res.status_code == 404:
            self.conversations = "No Conversations to show!!!"
        elif res.status_code in [429, 500] :
            self.conversations = "Server Error: Too many requests!!\nPlease try to reload by :chats"
