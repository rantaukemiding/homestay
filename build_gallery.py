import os
import json

# Folder containing your images
IMAGES_FOLDER = "images"   # relative to where this script lives
GALLERY_JSON  = "gallery.json"

# Extensions we consider as images
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def main():
  base_dir = os.path.dirname(os.path.abspath(__file__))
  images_dir = os.path.join(base_dir, IMAGES_FOLDER)

  if not os.path.isdir(images_dir):
    print(f"[ERROR] Images folder not found: {images_dir}")
    return

  # Collect image files
  files = []
  for name in os.listdir(images_dir):
    ext = os.path.splitext(name)[1].lower()
    if ext in ALLOWED_EXT:
      files.append(name)

  if not files:
    print("[WARN] No image files found in 'images' folder.")
    data = []
  else:
    # Sort filenames for stable order
    files.sort()

    data = []
    for idx, filename in enumerate(files, start=1):
      url = f"{IMAGES_FOLDER}/{filename}"
      caption = f"Photo {idx}"
      data.append({"url": url, "caption": caption})

  # Write gallery.json prettily
  out_path = os.path.join(base_dir, GALLERY_JSON)
  with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

  print(f"[OK] Wrote {len(data)} entries to {out_path}")

if __name__ == "__main__":
  main()
