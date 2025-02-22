from .base_screen import BaseScreen

class UpdateScreen(BaseScreen):
    def on_mount(self):
        self.set_content("Update Screen...")