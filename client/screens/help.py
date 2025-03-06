
from .base_screen import BaseScreen
from config       import Config

class HelpScreen(BaseScreen):
    def on_mount(self):
        self.content.update(Config.get_help())