import socketio
import threading
from config import Config

class SocketClient:
    def __init__(self, app):
        self.app = app
        self.sio = socketio.Client()
        self.__setup_events()

    def __setup_events(self):
        @self.sio.event
        def connect(): 
            self.app.notify(
                "Connect to the socket server..",
                title="Server Connected",
                severity='information'
            )
        @self.sio.event
        def disconnect():
            self.app.notify(
                "The socket server has been disconnected.",
                title="Server Disconnected",
                severity='warning'
            )
        @self.sio.on('message')
        def message( data: dict ): 
            if self.app.current_screen == "chat":
                if self.app.screen.conversationId == data['conversationId']:
                    self.app.screen.receive_message(data)
                    return
            self.app.notify(
                f"{data['body']}",
                title=f"{data["conversationId"]}: @{data['senderUsername']}",
                severity='information',
                timeout=3
            )
        @self.sio.event
        def error( data: dict ):
            self.app.notify(
                f"{data}",
                title="Server Error!",
                severity='error',
                timeout=10
            )

    def send_message(self, message:str, chat_id: int, receiver_username: str):
        self.sio.emit("message", data={
            "conversationId": chat_id,
            "receiverUsername": receiver_username,
            "body": message
        }, callback= lambda data: self.app.screen.receive_message(data) )

    def __run(self):
        _, refreshToken = Config.get_tokens()
        self.sio.connect( Config.SERVER_URL + f'/?token={refreshToken}' )
        self.sio.wait()

    def start(self):
        self.sio.disconnect()
        threading.Thread(target=self.__run, daemon=True, name="SocketIOClientThread").start()
