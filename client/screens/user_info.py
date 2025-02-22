from .base_screen import BaseScreen

class UserInformationsScreen(BaseScreen):
    def on_mount(self):
        self.set_content("UserInformations Screen...")