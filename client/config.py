import os
import json
from dotenv import load_dotenv


load_dotenv()

class Config:
    SERVER_URL: str = os.getenv('CHATAPP_BACKEND_URL')
    BASE_API: str = '/api/v1'
    CONVERSATIONS_API: str = SERVER_URL + BASE_API + '/conversation'
    LOGIN_API: str = SERVER_URL + BASE_API + '/user/login'

    @staticmethod
    def get_access_token() -> str:
        with open('./data/cookies.json', 'r', encoding='utf-8') as json_file:
            return json.load(json_file)['accessToken']

    @staticmethod
    def get_refresh_token() -> str:
        with open('./data/cookies.json', 'r', encoding='utf-8') as json_file:
            return json.load(json_file)['refreshToken']

    @staticmethod
    def set_access_token(accessToken: str) -> None:
        cookies: dict[str:str] = {
            'accessToken': f"Bearer {accessToken}",
            'refreshToken': Config.get_refresh_token()
        }
        with open('./data/cookies.json', 'w', encoding='utf-8') as json_file:
            json.dump(cookies, json_file)

    @staticmethod
    def set_refresh_token(refreshToken: str) -> None:
        cookies: dict[str:str] = {
            'accessToken': Config.get_access_token(),
            'refreshToken': f"Bearer {refreshToken}"
        }
        with open('./data/cookies.json', 'w', encoding='utf-8') as json_file:
            json.dump(cookies, json_file)
