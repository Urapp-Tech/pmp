# auth.py
import requests
from config import BACKEND_LOGIN_URL

def authenticate_user():
    email = input("Enter email: ")
    password = input("Enter password: ")
    
    payload = {
        "identifier": email,
        "password": password
    }
    try:
        res = requests.post(BACKEND_LOGIN_URL, json=payload)
        res_data = res.json()
        if res_data.get("code") == 200:
            return res_data["data"]["token"]
        print("Invalid login. Check credentials.")
    except Exception as e:
        print(f"Login error: {e}")
    return None
