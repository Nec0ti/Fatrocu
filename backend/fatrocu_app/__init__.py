# backend/fatrocu_app/__init__.py
from flask import Flask, render_template # render_template eklendi
from config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__,
                static_folder='../static', # static klasörün göreceli yolu doğru olmalı
                template_folder='../templates') # templates klasörün göreceli yolu doğru olmalı
    app.config.from_object(config_class)

    # Gerekli klasörlerin varlığını kontrol et ve oluştur
    required_folders = [app.config['UPLOAD_FOLDER'], app.config['OUTPUT_FOLDER']]
    for folder in required_folders:
        if not os.path.exists(folder):
            try:
                os.makedirs(folder)
                print(f"Klasör oluşturuldu: {folder}")
            except OSError as e:
                print(f"Klasör oluşturulamadı: {folder}, Hata: {e}")

    # API Anahtarının yüklenip yüklenmediğini kontrol et
    if not app.config.get('GOOGLE_API_KEY'):
         print("UYARI: GOOGLE_API_KEY ortam değişkeni bulunamadı veya .env dosyasında ayarlanmadı.")

    # ----- Blueprint Kaydı -----
    # routes modülünü burada import et ve blueprint'i kaydet
    from .routes import api_bp # Relative import
    app.register_blueprint(api_bp)
    # --------------------------

    # ----- Ana Sayfa Route'u -----
    # API olmayan route'ları doğrudan app üzerinde tanımlayabiliriz (Blueprint sonrası)
    @app.route('/')
    def index():
        print("Ana sayfa isteği alındı.")
        # templates klasöründeki index.html'i render et
        return render_template('index.html')
    # --------------------------

    print("Flask uygulaması oluşturuldu ve yapılandırıldı.")
    print(f"Static folder: {app.static_folder}")
    print(f"Template folder: {app.template_folder}")
    print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"Output folder: {app.config['OUTPUT_FOLDER']}")

    return app