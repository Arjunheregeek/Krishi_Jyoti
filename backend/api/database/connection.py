from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
import os

load_dotenv()

class Database:
    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL")
        self.key: str = os.getenv("SUPABASE_ANON_KEY")
        self.service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and key must be provided")
        
        self.client: Client = create_client(self.url, self.key)
        self.admin_client: Client = create_client(self.url, self.service_key) if self.service_key else None
    
    def get_client(self, admin: bool = False) -> Client:
        if admin and self.admin_client:
            return self.admin_client
        return self.client

# Global database instance
db = Database()
