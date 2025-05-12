from fatrocu_app import create_app

app = create_app()

if __name__ == '__main__':
    # Debug modunu .flaskenv'den alacak, ama burada da belirtebiliriz
    # Host='0.0.0.0' tüm ağ arayüzlerinden erişime izin verir (dikkatli kullanın)
    app.run(host='127.0.0.1', port=5000)