import os
import json
from dotenv import load_dotenv


load_dotenv()

class Config:
    SERVER_URL: str = os.getenv('CHATAPP_BACKEND_URL')
    BASE_API: str = '/api/v1'
    CONVERSATIONS_API: str = SERVER_URL + BASE_API + '/conversation'

    @staticmethod
    def get_access_token():
        with open('./data/cookies.json', 'r', encoding='utf-8') as json_file:
            return json.load(json_file)['accessToken']