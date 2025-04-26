# Giới thiệu về dự án

Dự án này là một ứng dụng web được phát triển bằng Flask tích hợp thêm mô hình BLIP (Bootstrapped Language-Image Pretraining) và công nghệ Text2Speech, cung cấp các chức năng cho người dùng, quản trị viên và hệ thống sinh caption cho hình ảnh. Dưới đây là những chức năng chính của từng phần trong ứng dụng:

## Chức năng của ứng dụng

- **Tính năng xác thực và quản lý người dùng**:
    - Đăng ký, đăng nhập người dùng.
    - Thay đổi mật khẩu và khôi phục mật khẩu.
    
    **Các endpoint**:
    - `POST /register`: Đăng ký tài khoản mới.
    - `POST /login`: Đăng nhập vào tài khoản.
    - `POST /change-password`: Thay đổi mật khẩu cho người dùng.
    - `POST /forgot-password`: Yêu cầu khôi phục mật khẩu.
    - `POST /reset-password`: Đặt lại mật khẩu.

- **Tính năng quản trị viên**:
    - Quản lý người dùng và tình trạng của họ.
    - Xem và quản lý các hình ảnh trong hệ thống.
    - Xem báo cáo và thống kê chất lượng hoạt động của ứng dụng.
    
    **Các endpoint**:
    - `GET /users`: Lấy danh sách tất cả người dùng.
    - `PUT /users/<user_id>`: Cập nhật thông tin người dùng.
    - `DELETE /users/<user_id>`: Xóa người dùng.
    - `PUT /users/change-status/<user_id>`: Bật/tắt trạng thái hoạt động của người dùng.
    - `PUT /users/change-role/<user_id>`: Thay đổi vai trò của người dùng.
    - `GET /images`: Lấy danh sách tất cả hình ảnh.
    - `DELETE /images/<image_id>`: Xóa hình ảnh từ hệ thống.
    - `GET /reports`: Lấy danh sách các báo cáo.
    - `PUT /reports/<report_id>`: Cập nhật báo cáo.
    - `GET /stats`: Lấy thông tin thống kê.

- **Tính năng xử lý hình ảnh và caption**:
    - Tải lên hình ảnh và tạo caption tự động.
    - Cập nhật caption theo ý người dùng.
    - Tạo lại caption bằng mô hình đã được đào tạo.
    
    **Các endpoint**:
    - `POST /upload`: Tải lên hình ảnh và tự động tạo caption.
    - `PUT /caption/<image_id>`: Cập nhật caption cho một hình ảnh đã tồn tại.
    - `POST /<image_id>/regenerate`: Tạo lại caption cho một hình ảnh và chuyển caption đó thành giọng nói.

- **Tính năng cho người dùng**:
    - Lấy thông tin profile người dùng và cập nhật thông tin đó.
    - Tìm kiếm người dùng theo các tiêu chí khác nhau.
    
    **Các endpoint**:
    - `GET /profile`: Lấy thông tin profile của người dùng hiện tại.
    - `PUT /profile`: Cập nhật thông tin profile của người dùng hiện tại.
    - `GET /<user_id>`: Lấy thông tin của người dùng theo ID.
    - `GET /search`: Tìm kiếm người dùng.

- **Tính năng quản lý hình ảnh**:
    - Tải lên, xem, cập nhật và xóa hình ảnh.
    - Báo cáo hình ảnh không phù hợp.

    **Các endpoint**:
    - `POST /api/images/`: Tải lên hình ảnh mới.
    - `GET /api/images/`: Lấy danh sách tất cả hình ảnh.
    - `GET /api/images/file/<image_id>`: Lấy dữ liệu hình ảnh từ MongoDB.
    - `GET /api/images/user`: Lấy danh sách hình ảnh của người dùng hiện tại.
    - `PUT /api/images/<image_id>/description`: Cập nhật mô tả hình ảnh.
    - `DELETE /api/images/<image_id>`: Xóa hình ảnh.
    - `POST /api/images/<image_id>/report`: Báo cáo hình ảnh không phù hợp.


# Hướng dẫn cài đặt môi trường và thiết lập

## Yêu cầu hệ thống
- **Python**: Phiên bản >= 3.10
- **pip**: Công cụ quản lý gói đi kèm với Python
- **Git**: Để quản lý mã nguồn
- **MongoDB**: Phiên bản >= 4.x (nếu sử dụng cơ sở dữ liệu MongoDB)

## Bước 1: Clone dự án
```bash
git clone https://github.com/your-repo/airc-backend.git
cd airc-backend
```

## Bước 2: Tạo và kích hoạt môi trường ảo
```bash
python -m venv venv
source venv/bin/activate  # Trên Linux/MacOS
venv\Scripts\activate     # Trên Windows
```

## Bước 3: Cài đặt các gói phụ thuộc
```bash
pip install -r requirements.txt
```

## Bước 4: Cấu hình môi trường
- Tạo file `.env` trong thư mục gốc dự án.
- Thêm các biến môi trường cần thiết, ví dụ:
    ```env
    FLASK_APP=app.py
    FLASK_ENV=development
    DATABASE_URL=mongodb://your_host:your_port/your_database
    SECRET_KEY=your_secret_key
    ```

## Bước 5: Chạy dự án
### Chạy ở môi trường phát triển
```bash
flask run
```

### Chạy ở môi trường develop
Sử dụng một WSGI server như `gunicorn`:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Bước 6: Kiểm tra
- Mở trình duyệt và truy cập `http://localhost:5000` để kiểm tra ứng dụng.

## Liên hệ và hỗ trợ
Nếu bạn có câu hỏi hoặc gặp vấn đề khi sử dụng, vui lòng:

Liên hệ qua email: hoandoan288@gmail.com
© 2025 Hoan Doan