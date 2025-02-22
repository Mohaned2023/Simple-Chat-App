class CommandHandler:
    def __init__(self, app):
        self.app = app

    def execute(self, command: str):
        command = command.strip()
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
        elif command.startswith(":search"):
            self.app.switch_screen("user_info")
        else: 
            ...
