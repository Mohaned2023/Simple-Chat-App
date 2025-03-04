import requests
from config import Config

class CommandHandler:
    def __init__(self, app):
        self.app = app

    def execute(self, command: str):
        command = command.strip()
        args: list[str] = command.split(' ')
        if command.startswith(":chats"):
            self.app.switch_screen("conversations")
        elif command.startswith(":chat"):
            self.app.switch_screen("chat")
        elif command.startswith(":login"):
            self.app.switch_screen("login")
        elif command.startswith(":register"):
            self.app.switch_screen("register")
        elif command.startswith(":update"):
            self.app.switch_screen("update")
        elif command.startswith(":info"):
            self.app.switch_screen("user_info", username= None if len(args) < 2 else args[1] )
        elif command.startswith(":create"):
            if len(args) < 2:
                self.app.notify(
                    "The create command needed to have the user name\n"
                    "Please use the command like: `:create <username>`.",
                    title="Not Found Error",
                    severity="error"
                )
                return
            self.createConversation(args[1])
        elif command.startswith(":delete"):
            self.deleteAccount()
        else: 
            ...
    
    def createConversation(self, username:str ):
        accessToken, _ = Config.get_tokens()
        res = requests.post(
            Config.CREATE_CONVERSATION_API.replace(":username", username),
            headers={ 'Authorization': accessToken }
        )
        if res.status_code == 201:
            res_data: dict = res.json()
            self.app.notify(
                f"ID: {res_data['id']}\n"
                f"users: @{res_data['user1']} - @{res_data['user2']}",
                title="Conversation Has Been Created.",
                severity="information"
            )
        elif res.status_code == 401:
            self.app.notify(
                "Please make sure that you are logged in.\n"
                "If no try the command `:login` or `:register`.\n",
                title="Unauthorized Error!",
                severity="error"
            )
        elif res.status_code == 404:
            self.app.notify(
                f"User `{username}` NOT found.\n",
                title="Not Found Error",
                severity="error"
            )
        elif res.status_code in [429, 500]:
            self.app.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )

    def deleteAccount(self):
        accessToken, _ = Config.get_tokens()
        username = Config.get_user()['username']
        res = requests.delete(
            Config.DELETE_USER_API.replace(":username", username),
            headers={ 'Authorization': accessToken }
        )
        if res.status_code == 200:
            Config.set_tokens("", "")
            Config.set_user({})
            self.app.notify(
                "Your account has been deleted.",
                title="Deleted",
                severity="information"
            )
            self.app.switch_screen("login")
        elif res.status_code == 401:
            self.app.notify(
                "Please make sure that you are logged in.\n"
                "If no try the command `:login` or `:register`.\n",
                title="Unauthorized Error!",
                severity="error"
            )
        elif res.status_code in [429, 500]:
            self.app.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )