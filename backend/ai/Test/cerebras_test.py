import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Load environment variables from .env file
load_dotenv()

# Initialize the Cerebras Client
client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY"),
)

# Create a chat completion
try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a concise and structured assistant. Provide responses in bullet points in 20 words maax."
            },
            {
                "role": "user",
                "content": "Why is fast inference important?",
            }
        ],
        model="llama-4-scout-17b-16e-instruct",
    )

    # Extract and print only the relevant content
    response_message = chat_completion.choices[0].message.content
    print("Assistant Response:")
    print(response_message)
except Exception as e:
    print(f"An error occurred while creating the chat completion: {e}")