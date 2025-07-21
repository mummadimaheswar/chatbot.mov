from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Load Phi-2 model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2")
model = AutoModelForCausalLM.from_pretrained("microsoft/phi-2")
model.eval()

@app.get("/api")
def chat_with_llm(query: str = "Hello"):
    prompt = f"Human: {query}\nAssistant:"
    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7,
            top_k=50
        )

    response = tokenizer.decode(output[0], skip_special_tokens=True)
    assistant_reply = response.split("Assistant:")[-1].strip()
    return {"message": assistant_reply}