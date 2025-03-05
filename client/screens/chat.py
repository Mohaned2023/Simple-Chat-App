import requests

from textual.screen import Screen
from textual.widgets import Input, Header, Footer, Static
from textual.containers import Container, VerticalScroll 
from config import Config

class ChatScreen(Screen):
    def __init__(self, **kwargs):
        self.conversationId: str = kwargs["conversationId"]
        del kwargs['conversationId']
        super().__init__(**kwargs)
        self.messages: list[str] = []
        self.user_username: str | None = None
        self.conversation_data: dict = {}
        ## load conversation data
        for conv in self.app.conversations:
            if conv['id'] == self.conversationId:
                self.conversation_data = conv
                break

    def compose(self):
        yield Header()
        yield VerticalScroll(Static('\n'.join(self.messages), id="chat_box"))
        yield Input(placeholder="message or command (e.g Hi, :chats)", id="input")
        yield Footer()
    
    def on_mount(self):
        self.query_one("#input").focus()
        self.get_messages()
        self.query_one("#chat_box").update('\n'.join(self.messages))

    async def on_input_submitted(self, event: Input.Submitted):
        command = event.value.strip()
        self.query_one("#input").clear()
        if len(command) > 0:
            if command.startswith(":"):
                self.app.command_handler.execute(command)
            else:
                receiver_username = f"{self.conversation_data['user1']} {self.conversation_data['user2']}".replace(self.user_username, "")
                self.app.socketClient.send_message(
                    message = command,
                    chat_id = self.conversationId,
                    receiver_username = receiver_username.strip()
                )

    def receive_message(self, message:dict ):
        self.fromat_messages([message])
        self.query_one("#chat_box").update('\n'.join(self.messages))

    def fromat_messages(self, messages: list[dict]):
        for message in messages:
            sender_username = self.user_username if self.user_username == message['senderUsername'] else message['senderUsername']
            is_delivered_readed = 'D' if message['isDelivered'] else '-'
            is_delivered_readed += 'R' if message['isRead'] else '-'
            self.messages.append(
                f"@{sender_username}: {message['body']} -> {is_delivered_readed}"
            )

    def get_messages(self):
        self.user_username = Config.get_user().get("username", None)
        if not self.user_username:
            self.notify(
                "Please make sure that you are logged in.\n",
                title="User Data Error!",
                severity="error"
            )
            self.app.switch_screen("login")
        accessToken, _ = Config.get_tokens()
        res = requests.get(
            Config.GET_MESSAGES_API.replace(":conversationId", str(self.conversationId)),
            headers={ 'Authorization': accessToken }
        )
        if res.status_code == 200:
            self.fromat_messages(res.json())
        elif res.status_code == 401:
            self.notify(
                "Please make sure that you are logged in.\n",
                title="Unauthorized Error!",
                severity="error"
            )
            self.app.switch_screen("login")
        elif res.status_code == 404:
            self.notify(
                "No messages to show!\n",
                title="Not Found Error!",
                severity="error"
            )
        elif res.status_code in [429, 500]:
            self.notify(
                "Too many requests! Please try again later.",
                title="Server Error!",
                severity="error"
            )
            self.app.switch_screen("conversations")