from .base_screen import BaseScreen

class ConversationsScreen(BaseScreen):
    def on_mount(self):
        self.set_content("Conversation Screen...")