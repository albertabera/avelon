from PIL import Image
import os

image_path = r"C:\Users\Alberto Tabera\.gemini\antigravity\brain\b5afcb61-0eee-4db9-9b30-9bdc806049c8\uploaded_image_1766352670178.png"

if not os.path.exists(image_path):
    print("Image not found")
    exit(1)

img = Image.open(image_path)
print(f"Dimensions: {img.width}x{img.height}")
