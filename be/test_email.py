import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def test_email_smtp():
    try:
        # Lấy thông tin từ biến môi trường
        smtp_host = os.getenv("MAIL_HOST", "smtp.gmail.com")
        smtp_username = os.getenv("MAIL_USERNAME", "doanhuuhoan_t66@hus.edu.vn")
        smtp_password = os.getenv("MAIL_PASSWORD", "kqdk pisq carz dlgd")
        
        print(f"Cấu hình email: Host={smtp_host}, Username={smtp_username}")
        
        # Tạo message
        to_email = smtp_username  # Gửi cho chính mình để kiểm tra
        subject = "Kiểm tra kết nối email - SMTP"        
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = smtp_username
        message["To"] = to_email
        
        # Nội dung email
        html_content = """
        <html>
        <body>
            <h2>Đây là email thử nghiệm</h2>
            <p>Nếu bạn nhận được email này, tức là cấu hình email đã hoạt động.</p>
        </body>
        </html>
        """
        
        # Thêm nội dung HTML
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        print("Thử phương pháp 1: SSL trực tiếp...")
        try:
            # Phương pháp 1: Sử dụng SSL trực tiếp
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_host, 465, context=context) as server:
                print("Kết nối SSL thành công, đăng nhập...")
                server.login(smtp_username, smtp_password)
                print("Đăng nhập thành công, gửi email...")
                server.sendmail(smtp_username, to_email, message.as_string())
                print("Email đã được gửi thành công với SSL!")
                return True
        except Exception as ssl_error:
            print(f"Lỗi khi sử dụng SSL: {str(ssl_error)}")
            print("Thử lại với TLS...")
            
            try:
                # Phương pháp 2: Sử dụng TLS
                with smtplib.SMTP(smtp_host, 587) as server:
                    server.set_debuglevel(1)  # Hiển thị thông tin debug
                    print("Kết nối thành công, gửi EHLO...")
                    server.ehlo()
                    print("Bắt đầu TLS...")
                    server.starttls(context=context)
                    server.ehlo()  # Cần EHLO lại sau khi bắt đầu TLS
                    print("Đăng nhập vào SMTP server...")
                    server.login(smtp_username, smtp_password)
                    print("Đăng nhập thành công, gửi email...")
                    server.sendmail(smtp_username, to_email, message.as_string())
                    print("Email đã được gửi thành công với TLS!")
                    return True
            except Exception as tls_error:
                print(f"Lỗi khi sử dụng TLS: {str(tls_error)}")
                raise
    except Exception as e:
        print(f"Lỗi tổng quát khi gửi email: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def check_gmail_settings():
    print("\n=== Hướng dẫn kiểm tra cài đặt Gmail ===\n")
    print("1. Đảm bảo bạn đã bật 'Less secure app access' trong tài khoản Google:")
    print("   - Truy cập https://myaccount.google.com/security")
    print("   - Tìm 'Less secure app access' và bật nó lên")
    print("\n2. Nếu bạn đã bật xác thực 2 lớp:")
    print("   - Tạo mật khẩu ứng dụng tại https://myaccount.google.com/apppasswords")
    print("   - Sử dụng mật khẩu ứng dụng này thay cho mật khẩu thường")
    print("\n3. Kiểm tra xem có thông báo bảo mật nào trong Gmail:")
    print("   - Đăng nhập vào Gmail và kiểm tra các thông báo bảo mật")
    print("   - Có thể cần xác nhận hoạt động đáng ngờ")

if __name__ == "__main__":
    print("\n=== Kiểm tra kết nối email ===\n")
    result = test_email_smtp()
    if not result:
        check_gmail_settings()
