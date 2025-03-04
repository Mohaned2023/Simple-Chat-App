from textual.screen        import Screen
from textual.widgets       import Header, Footer, Static
from textual.containers    import Container
from widgets.command_input import CommandInput

class BaseScreen(Screen):
    def compose(self):
        yield Header()
        self.content = Static("....", id="content")
        yield Container(self.content)
        yield CommandInput()
        yield Footer()

    def set_content(self, text: str):
        self.content.update(text)