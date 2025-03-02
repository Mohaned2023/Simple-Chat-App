import gc

from textual.app           import App
from commands.handler      import CommandHandler
from screens.chat          import ChatScreen
from screens.conversations import ConversationsScreen
from screens.login         import LoginScreen
from screens.register      import RegisterScreen
from screens.update        import UpdateScreen
from screens.user_info     import UserInformationsScreen

class ChatApp(App):
    SCREENS = {
        'chat': ChatScreen,
        'conversations': ConversationsScreen,
        'login': LoginScreen,
        'register': RegisterScreen,
        'update': UpdateScreen,
        'user_info': UserInformationsScreen
    }

    def __init__(self):
        super().__init__()
        self.command_handler = CommandHandler(self)

    def on_mount(self):
        self.push_screen("conversations")

    def switch_screen(self, screen_name, **kwargs):
        del self.screen_stack[-1]
        gc.collect()
        self.pop_screen()
        self.push_screen(self.SCREENS[screen_name](**kwargs))

if __name__=="__main__":
    ChatApp().run()