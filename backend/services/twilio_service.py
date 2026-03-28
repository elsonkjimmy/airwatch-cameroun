from twilio.rest import Client
from backend.config import settings
import logging

class TwilioService:
    def __init__(self):
        self.client = None
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    async def send_critical_alert(self, phone_number: str, ville: str, aqi: int):
        if not self.client:
            logging.warning(f"Twilio non configuré. Alerte critique non envoyée à {phone_number}")
            return False
            
        message = f"ALERTE AIRWATCH : Qualité de l'air CRITIQUE à {ville}. AQI: {aqi}. Activez le protocole d'urgence."
        
        try:
            self.client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number
            )
            return True
        except Exception as e:
            logging.error(f"Erreur envoi SMS Twilio : {e}")
            return False

twilio_service = TwilioService()
