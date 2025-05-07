# services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import sys
from dotenv import load_dotenv

# Thêm thông báo để cài đặt yagmail nếu chưa có
try:
    import yagmail
except ImportError:
    print("\nThư viện yagmail chưa được cài đặt. Vui lòng cài đặt bằng lệnh:")
    print("pip install yagmail keyring")
    print("Hoặc:")
    print("pip install -U yagmail keyring\n")

load_dotenv()

class EmailService:
    @staticmethod
    def send_email(to_email, subject, html_content):
        """Gửi email sử dụng SMTP của Gmail"""
        try:
            # Lấy thông tin cấu hình từ biến môi trường
            smtp_host = os.getenv("MAIL_HOST", "smtp.gmail.com")
            smtp_port = int(os.getenv("MAIL_PORT", "587"))
            smtp_username = os.getenv("MAIL_USERNAME", "doanhuuhoan_t66@hus.edu.vn")
            smtp_password = os.getenv("MAIL_PASSWORD", "kqdk pisq carz dlgd")
            
            print(f"Cấu hình email: Host={smtp_host}, Port={smtp_port}, Username={smtp_username}")
            print(f"Gửi email đến: {to_email}, Chủ đề: {subject}")
            
            # Tạo message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = smtp_username
            message["To"] = to_email
            
            # Thêm nội dung HTML
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Kết nối và gửi email
            print("Bắt đầu kết nối đến SMTP server sử dụng SSL...")
            try:
                # Thử phương pháp 1: Sử dụng SMTP_SSL
                server = smtplib.SMTP_SSL(smtp_host, 465)
                server.set_debuglevel(1)  # Bật chế độ debug để xem chi tiết
                print("Kết nối SSL thành công, đăng nhập...")
                server.login(smtp_username, smtp_password)
                print("Đăng nhập thành công, gửi email...")
                server.sendmail(smtp_username, to_email, message.as_string())
                print("Email đã được gửi thành công!")
                server.quit()
            except Exception as ssl_error:
                print(f"Lỗi khi sử dụng SSL: {str(ssl_error)}")
                print("Thử lại với TLS...")
                
                # Thử phương pháp 2: Sử dụng SMTP với TLS
                server = smtplib.SMTP(smtp_host, smtp_port)
                server.set_debuglevel(1)
                print("Kết nối thành công, gửi EHLO...")
                server.ehlo()
                print("Bắt đầu TLS...")
                server.starttls()
                server.ehlo()  # Thêm EHLO sau khi starttls
                print("Đăng nhập vào SMTP server...")
                server.login(smtp_username, smtp_password)
                print("Đăng nhập thành công, gửi email...")
                server.sendmail(smtp_username, to_email, message.as_string())
                print("Email đã được gửi thành công!")
                server.quit()
                
            return True, "Email đã được gửi thành công"
        except Exception as e:
            error_msg = f"Lỗi khi gửi email: {str(e)}"
            print(f"ERROR: {error_msg}")
            import traceback
            print(traceback.format_exc())
            return False, error_msg
    
    @staticmethod
    def send_password_reset_email(to_email, reset_token, username):
        """Gửi email đặt lại mật khẩu với token"""
        # Tạo URL đặt lại mật khẩu với token
        # Sử dụng biến API_HOST và FRONTEND_PORT từ file .env
        api_host = os.getenv("API_HOST", "localhost")
        frontend_port = os.getenv("FRONTEND_PORT", "8081")
        reset_url = f"http://{api_host}:{frontend_port}/reset-password?token={reset_token}"
        print(f"Reset URL: {reset_url}")
        
        # Tạo nội dung email
        subject = "Đặt lại mật khẩu - Ứng dụng Mô tả Hình ảnh"
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(to right, #4A00E0, #8E2DE2); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }}
                .button {{ display: inline-block; background: linear-gradient(to right, #4A00E0, #8E2DE2); color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 20px; font-size: 12px; color: #777; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Đặt lại mật khẩu</h2>
                </div>
                <div class="content">
                    <p>Xin chào {username},</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Đặt lại mật khẩu</a>
                    </p>
                    <p>Hoặc sao chép và dán URL này vào trình duyệt của bạn:</p>
                    <p>{reset_url}</p>
                    <p>Liên kết này sẽ hết hạn sau 30 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ Ứng dụng Mô tả Hình ảnh</p>
                </div>
                <div class="footer">
                    <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Thử gửi email bằng cả hai phương pháp
        try:
            # Thử gửi email bằng yagmail trước
            return EmailService.send_email_yagmail(to_email, subject, html_content)
        except Exception as e:
            print(f"Lỗi khi gửi email bằng yagmail: {str(e)}")
            print("Thử lại với phương pháp SMTP thông thường...")
            # Nếu yagmail thất bại, thử lại với SMTP thông thường
            return EmailService.send_email(to_email, subject, html_content)
            
    @staticmethod
    def send_email_yagmail(to_email, subject, html_content):
        """Gửi email sử dụng thư viện yagmail"""
        try:
            # Lấy thông tin cấu hình từ biến môi trường
            smtp_username = os.getenv("MAIL_USERNAME", "doanhuuhoan_t66@hus.edu.vn")
            smtp_password = os.getenv("MAIL_PASSWORD", "kqdk pisq carz dlgd")
            
            print(f"Gửi email bằng yagmail: Từ {smtp_username} đến {to_email}")
            
            # Kiểm tra xem yagmail đã được cài đặt chưa
            if 'yagmail' not in sys.modules:
                print("Thư viện yagmail chưa được cài đặt. Vui lòng cài đặt bằng lệnh: pip install yagmail keyring")
                return False, "Thư viện yagmail chưa được cài đặt"
            
            # Tạo đối tượng yagmail
            yag = yagmail.SMTP(user=smtp_username, password=smtp_password)
            
            # Gửi email
            yag.send(
                to=to_email,
                subject=subject,
                contents=html_content
            )
            
            print("Email đã được gửi thành công bằng yagmail!")
            return True, "Email đã được gửi thành công"
            
        except Exception as e:
            error_msg = f"Lỗi khi gửi email bằng yagmail: {str(e)}"
            print(f"ERROR: {error_msg}")
            import traceback
            print(traceback.format_exc())
            return False, error_msg
