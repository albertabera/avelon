from PIL import Image
import os

image_path = r"C:\Users\Alberto Tabera\.gemini\antigravity\brain\b5afcb61-0eee-4db9-9b30-9bdc806049c8\uploaded_image_1766352670178.png"
output_dir = r"c:\Users\Alberto Tabera\Downloads\avalon-digital_-the-resistance\public\assets"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

img = Image.open(image_path)
width, height = img.size

# Estimated Coordinates based on 451x1024 layout
# Header takes top ~30%
# Offline Card: Middle-Top
# Online Card: Middle-Bottom

# Offline Card (Estimated)
# Width: ~90% of screen (most of 451)
# Height: ~20% of screen (~200px)
# Let's try x=20, y=330, w=410, h=220
# (330 is roughly 1/3 down)
offline_box = (20, 330, 430, 550)
offline_img = img.crop(offline_box)
offline_img.save(os.path.join(output_dir, "offline_mode.png"))

# Online Card (Estimated)
# Starts below offline, maybe y=570
online_box = (20, 570, 430, 790)
online_img = img.crop(online_box)
online_img.save(os.path.join(output_dir, "online_mode.png"))

print(f"Saved assets to {output_dir}")
