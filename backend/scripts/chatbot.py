from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip().lower()

    # Simple rule-based responses
    if any(greet in user_message for greet in ["hello", "hi", "hey"]):
        reply = "Hello! Welcome to BARS Wheels! 🚘 How can I help you today?"
        buttons = ["Show Vehicles", "Admin Login"]
    elif any(book in user_message for book in ["rent", "book", "vehicle"]):
        reply = "You can browse vehicles under 'Vehicles' section. Want me to take you there?"
        buttons = ["Show Vehicles"]
    elif any(price in user_message for price in ["price", "cost", "charges"]):
        reply = "Prices depend on vehicle type and duration. Mention your preference."
        buttons = ["Show Vehicles"]
    elif "admin" in user_message:
        reply = "Redirecting to admin login..."
        buttons = ["Admin Login"]
    elif "bye" in user_message or "exit" in user_message:
        reply = "Goodbye! Hope to see you again at BARS Wheels. 🚗"
        buttons = []
    elif "book now" in user_message:
        reply = "Redirecting to booking page..."
        buttons = ["Book Now"]
    else:
        reply = "I can help with bookings, pricing, and availability. What do you want to know?"
        buttons = ["Show Vehicles", "Admin Login"]

    return jsonify({"reply": reply, "buttons": buttons})

if __name__ == "__main__":
    app.run(debug=True)
