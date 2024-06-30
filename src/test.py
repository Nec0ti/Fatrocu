"""
Install the Google AI Python SDK

$ pip install google-generativeai

See the getting started guide for more information:
https://ai.google.dev/gemini-api/docs/get-started/python
"""

import os

import google.generativeai as genai

genai.configure(api_key="INSERT_YOUR_GEMINI_API_KEY_HERE")
# Variables
output = '''

'''

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

# Create the model
# See https://ai.google.dev/api/python/google/generativeai/GenerativeModel
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
  # safety_settings = Adjust safety settings
  # See https://ai.google.dev/gemini-api/docs/safety-settings
)

# TODO Make these files available on the local file system
# You may need to update the file paths
# TODO: Automaticly choose the images from computer
files = [
  upload_to_gemini("src/ftr.jpg", mime_type="image/jpeg"),
  upload_to_gemini("src/ftr2.png", mime_type="image/png"),
  upload_to_gemini("src/ftr3.png", mime_type="image/png"),
]

chat_session = model.start_chat(
  history=[
    {
      "role": "user",
      "parts": [
        f"bu fotograftaki su bilgileri yaz; fatura tarihi,fatura turu(Satis/Alis),Uretici firma ismi(sol en ustteki firma uretici olur),Alici kisi/firma'nin VKN numarasi(Sol ust kisimda olur ve SAYIN .. firmasi diye baslayan kisim alicinin bilgileri olur),fatura no,matrah,matrah orani(kdv orani ile ayni),kdv tutari, kdv orani. fotograf burda: {files[0]}",
        files[0],
      ],
    },
    {
      "role": "model",
      "parts": [
        "**Fatura Tarihi:** 24-12-2015\n**Fatura Turu:** SATIS\n**Uretici Firma ismi:** LOGO \n**Alici Kisi/Firma VKN Numarasi:** 4780469628\n**Fatura No:**  GID201500000062\n**Matrah:**  1,00 TL\n**Matrah Orani:** %0\n**KDV Tutari:**  0.00 TL\n**KDV Orani:**  %0.00",
      ],
    },
  ]
)

print("\nAnalyzing please wait...\n")

response = chat_session.send_message(f"bu fotograftaki su bilgileri yaz; fatura tarihi,fatura turu(Satis/Alis),Uretici firma ismi(sol en ustteki firma uretici olur),Alici kisi/firma'nin VKN numarasi(Sol ust kisimda olur ve SAYIN .. firmasi diye baslayan kisim alicinin bilgileri olur),fatura no,matrah,matrah orani(kdv orani ile ayni),kdv tutari, kdv orani. fotograf burda: {files[2]}")

output = response.text

print(output)

# TODO Save output variable into a excel file
'''
tarih,    fatura turu(Satis/Alis),     Cari ad/aciklama,     evrak no,
vkn,     matrah(kdv),   kdv
'''