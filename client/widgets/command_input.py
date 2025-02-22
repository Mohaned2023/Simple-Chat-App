from textual.widgets import Input

class CommandInput(Input):
    def __init__(self):
        super().__init__(placeholder="Type Any...")

    async def on_input_submitted(self, event: Input.Submitted):
        command = event.value.strip()
        self.clear()
        self.app.command_handler.execute(command)
