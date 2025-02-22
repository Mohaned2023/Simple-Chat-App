from .base_screen import BaseScreen

class LoginScreen(BaseScreen):
    def on_mount(self):
        self.set_content("Login Screen...")