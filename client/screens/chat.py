from .base_screen import BaseScreen

class ChatScreen(BaseScreen):
    def on_mount(self):
        self.set_content("Chat Screen...")
