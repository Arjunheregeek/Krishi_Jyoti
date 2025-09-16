import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Load environment variables from .env file
load_dotenv()

# Initialize the Cerebras Client
client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY"),
)

# Create a chat completion with streaming response
try:
    stream = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a concise and structured assistant. Provide responses in bullet points in 20 words max."
            },
            {
                "role": "user",
                "content": "Why is fast inference important?",
            }
        ],
        model="llama-4-scout-17b-16e-instruct",
    )

    # Stream and print the response in real-time
    print("Assistant Response:", end=" ")
    for chunk in stream:
        if isinstance(chunk, tuple) and chunk[0] == "choices":
            choices = chunk[1]
            if choices and hasattr(choices[0], "message"):
                print(choices[0].message.content or "", end="")
    print()
except Exception as e:
    print(f"An error occurred while creating the chat completion: {e}")