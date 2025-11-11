import requests
from app.core.config import settings


def create_invoice(
    amount: float, currency: str, customer_name: str, callback_url: str, error_url: str
):

    url = settings.MYFATOORAH_API_URL
    api_key = settings.MYFATOORAH_API_KEY

    payload = {
        "InvoiceValue": amount,
        "CustomerName": customer_name,
        "NotificationOption": "Lnk",
        "CurrencyIso": currency,
        "CallBackUrl": callback_url,
        "ErrorUrl": error_url,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

    # return {
    #     "InvoiceId": data["Data"]["InvoiceId"],
    #     "PaymentURL": data["Data"]["InvoiceURL"],
    # }
