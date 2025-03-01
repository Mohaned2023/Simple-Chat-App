import os
import json
from dotenv import load_dotenv


load_dotenv()

class Config:
    COOKIES_FILE_PATH:str = './data/cookies.json'
    USER_FILE_PATH:str = './data/user.json'
    SERVER_URL: str = os.getenv('CHATAPP_BACKEND_URL')
    BASE_API: str = '/api/v1'
    CONVERSATIONS_API: str = SERVER_URL + BASE_API + '/conversation'
    LOGIN_API: str = SERVER_URL + BASE_API + '/user/login'
    REFRESH_API: str = SERVER_URL + BASE_API + '/user/refresh'
    REGISTER_API: str = SERVER_URL + BASE_API + '/user/register'

    @staticmethod
    def get_tokens() -> dict[str:str]:
        with open(Config.COOKIES_FILE_PATH, 'r', encoding='utf-8') as json_file:
            tokens: dict[str:str] = json.load(json_file)
            return tokens['accessToken'], tokens['refreshToken']

    @staticmethod
    def set_tokens(accessToken: str, refreshToken: str) -> None:
        with open(Config.COOKIES_FILE_PATH, 'w', encoding='utf-8') as json_file:
            json.dump({
                "accessToken": f"Bearer {accessToken}",
                "refreshToken": f"{refreshToken}"
            }, json_file)

    @staticmethod
    def get_user() -> None:
        with open(Config.USER_FILE_PATH, 'r', encoding='utf-8') as json_file:
            return json.load(json_file)

    @staticmethod
    def set_user(user: dict) -> None:
        with open(Config.USER_FILE_PATH, 'w', encoding='utf-8') as json_file:
            json.dump(user, json_file)