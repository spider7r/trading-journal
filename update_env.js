const fs = require('fs');

const content = `NEXT_PUBLIC_SUPABASE_URL=https://vugkkkvmkkbupftlfcac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2tra3Zta2tidXBmdGxmY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjgzMTQsImV4cCI6MjA3OTMwNDMxNH0.y5Evw0UTCWD5vKjQU3zyEVY4loL_DLv9JRfQr_aajKI

# --- THE SWARM ---
OPENROUTER_API_KEYS="YOUR_OPENROUTER_KEYS"

# --- THE SPEED CLUSTER (AI KEYS) ---
# Primary: Groq (Llama 3.3 70B)
GROQ_API_KEYS="YOUR_GROQ_API_KEYS"

# Failover: Cerebras (Llama 3.1 70B)
CEREBRAS_API_KEYS="YOUR_CEREBRAS_API_KEYS"

# Deprecated: Gemini
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_API_KEYS="YOUR_GEMINI_API_KEYS"
`;

fs.writeFileSync('.env.local', content);
console.log('Done');
