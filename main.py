import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QFileDialog, QTextEdit, QVBoxLayout, QWidget
from PyQt5.QtGui import QPalette, QColor

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("Fatrocu")
        self.setGeometry(100, 100, 1240, 800)
        
        self.set_dark_theme()
        
        central_widget = QWidget()
        layout = QVBoxLayout()
        
        self.btn_okc_fisi = QPushButton("OKC Fisi Analiz Et & Excel'e Donustur", self)
        self.btn_okc_fisi.clicked.connect(lambda: self.open_directory("OKC Fisi"))
        
        self.btn_earsiv_fatura = QPushButton("Fatura Analiz Et & Excel'e Donustur", self)
        self.btn_earsiv_fatura.clicked.connect(lambda: self.open_directory('Fatura'))

        self.btn_earsiv_pdf = QPushButton("PDF'i png'ye Donustur", self)
        self.btn_earsiv_pdf.clicked.connect(lambda: self.open_directory("PDF'i png'ye Donustur"))
        
        self.log_text = QTextEdit(self)
        self.log_text.setReadOnly(True)
        
        layout.addWidget(self.btn_okc_fisi)
        layout.addWidget(self.btn_earsiv_fatura)
        layout.addWidget(self.btn_earsiv_pdf)
        layout.addWidget(self.log_text)
        
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)
    
    def set_dark_theme(self):
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(53, 53, 53))
        palette.setColor(QPalette.WindowText, QColor(255, 255, 255))
        palette.setColor(QPalette.Base, QColor(25, 25, 25))
        palette.setColor(QPalette.AlternateBase, QColor(53, 53, 53))
        palette.setColor(QPalette.ToolTipBase, QColor(255, 255, 255))
        palette.setColor(QPalette.ToolTipText, QColor(255, 255, 255))
        palette.setColor(QPalette.Text, QColor(255, 255, 255))
        palette.setColor(QPalette.Button, QColor(53, 53, 53))
        palette.setColor(QPalette.ButtonText, QColor(0, 0, 0))
        palette.setColor(QPalette.BrightText, QColor(255, 0, 0))
        palette.setColor(QPalette.Link, QColor(42, 130, 218))
        palette.setColor(QPalette.Highlight, QColor(42, 130, 218))
        palette.setColor(QPalette.HighlightedText, QColor(0, 0, 0))
        self.setPalette(palette)
    
    def open_directory(self, doc_type):
        directory = QFileDialog.getExistingDirectory(self, f"{doc_type} Konum Seç")
        if directory:
            self.log_message(f"{doc_type} için seçilen konum: {directory}")
            # TODO: logic
    
    def log_message(self, message):
        self.log_text.append(message)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
