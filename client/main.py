import gc

from textual.app           import App
from commands.handler      import CommandHandler
from commands.socket       import SocketClient
from screens.chat          import ChatScreen
from screens.conversations import ConversationsScreen
from screens.login         import LoginScreen
from screens.register      import RegisterScreen
from screens.update        import UpdateScreen
from screens.user_info     import UserInformationsScreen
from screens.help          import HelpScreen

class ChatApp(App):
    SCREENS = {
        'chat': ChatScreen,
        'conversations': ConversationsScreen,
        'login': LoginScreen,
        'register': RegisterScreen,
        'update': UpdateScreen,
        'user_info': UserInformationsScreen,
        "help": HelpScreen
    }

    def __init__(self):
        super().__init__()
        self.current_screen = None
        self.conversations: list[dict] = []
        self.command_handler = CommandHandler(self)
        self.socketClient = SocketClient(self)
        self.socketClient.start()

    def on_mount(self):
        self.current_screen = "conversations"
        self.push_screen(self.current_screen)

    def switch_screen(self, screen_name, **kwargs):
        del self.screen_stack[-1]
        gc.collect()
        self.pop_screen()
        self.push_screen(self.SCREENS[screen_name](**kwargs))
        self.current_screen = screen_name

if __name__=="__main__":
    ChatApp().run()