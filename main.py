import pytesseract as pt
from PIL import Image

print(pt.image_to_string('Fatro Samples/Fis.png', lang='tur'))