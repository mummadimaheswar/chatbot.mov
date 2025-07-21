import streamlit as st
import requests

API_URL = "http://nginx/api"

st.title("Chatbot UI")
user_input = st.text_input("You:", "")

if st.button("Send"):
    if user_input.strip():
        try:
            response = requests.get(f"{API_URL}?query={user_input}", timeout=10)
            if response.status_code == 200:
                st.write("Chatbot Response:", response.json().get("message", "No response"))
            else:
                st.error(f"API Error: {response.status_code}")
        except Exception as e:
            st.error(f"Error contacting API: {e}")