import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAIL_HOST = os.getenv("MAIL_HOST", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 465))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM_ADDRESS")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Your App")

# Jinja2 setup for email templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "templates"))

if not os.path.exists(TEMPLATE_DIR):
    # fallback to app/templates
    TEMPLATE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "templates"))
    print(f"🔄 [EMAIL] Falling back to app/templates: {TEMPLATE_DIR}")

print(f"📂 [EMAIL] Using template directory: {TEMPLATE_DIR}")


template_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def render_template(template_name: str, context: dict):
    """Render HTML template with dynamic data."""
    template = template_env.get_template(template_name)
    return template.render(context)


def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP."""
    try:
        # Create a multipart message
        message = MIMEMultipart("alternative")
        message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM_ADDRESS}>"
        message["To"] = to_email
        message["Subject"] = subject

        # Attach HTML content
        part = MIMEText(html_content, "html")
        message.attach(part)

        # Connect to SMTP server and send email
        with smtplib.SMTP_SSL(MAIL_HOST, MAIL_PORT) as server:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM_ADDRESS, to_email, message.as_string())

        print(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False
