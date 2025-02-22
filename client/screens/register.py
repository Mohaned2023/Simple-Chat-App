from .base_screen import BaseScreen

class RegisterScreen(BaseScreen):
    def on_mount(self):
        self.set_content("Register Screen...")