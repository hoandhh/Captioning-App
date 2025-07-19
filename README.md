# 🖼️ AI Image Captioning Application

Ứng dụng tạo chú thích hình ảnh thông minh sử dụng AI, giúp mô tả và phân loại hình ảnh một cách tự động và chính xác.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Demo Video](#demo-video)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt và triển khai](#cài-đặt-và-triển-khai)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Documentation](#api-documentation)
- [Sử dụng ứng dụng](#sử-dụng-ứng-dụng)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Tổng quan

AI Image Captioning Application là một hệ thống hoàn chỉnh bao gồm:

- **Backend API** (Flask): Xử lý upload ảnh, tạo chú thích AI, quản lý người dùng
- **Mobile App** (React Native + Expo): Giao diện người dùng trên di động
- **AI Models**: Tích hợp BLIP (Bootstrapping Language-Image Pre-training) và Google Gemini

## 🎬 Demo Video

Xem video demo để hiểu rõ hơn về cách sử dụng ứng dụng:

### 📹 Video Demo
<a href="https://drive.google.com/file/d/1IFpTmOt0mjY87Ig1XcArPYH9vTOKXvRC/view?usp=sharing" target="_blank">
  <img src="https://img.shields.io/badge/📹_Xem_Demo-Video-red?style=for-the-badge" alt="Demo Video" />
</a>

*Video demo hiển thị đầy đủ quy trình từ đăng nhập, chụp ảnh, tạo chú thích AI đến chia sẻ kết quả.*

> **📁 File demo**: [Xem/Download tại đây](https://drive.google.com/file/d/1IFpTmOt0mjY87Ig1XcArPYH9vTOKXvRC/view?usp=sharing) | Format: MP4

## ✨ Tính năng chính

### 🤖 Tạo chú thích AI
- **Mô hình BLIP**: Tạo chú thích tự động cho hình ảnh
- **Hai loại mô hình**: Default và Travel (chuyên biệt cho ảnh du lịch)
- **Đa ngôn ngữ**: Hỗ trợ tiếng Anh và tiếng Việt
- **Text-to-Speech**: Phát âm chú thích bằng giọng nói

### 📱 Quản lý hình ảnh
- **Upload đa dạng**: Camera hoặc thư viện ảnh
- **Lưu trữ cloud**: MongoDB GridFS cho hiệu suất cao
- **Metadata**: Lưu thông tin vị trí, thời gian
- **Tìm kiếm và lọc**: Theo địa điểm, thời gian, nội dung

### 👥 Tính năng xã hội
- **Group Captioning**: Tạo mô tả tổng hợp cho nhóm ảnh
- **Chia sẻ**: Chia sẻ ảnh và chú thích lên mạng xã hội
- **Lịch sử**: Xem lại tất cả ảnh đã xử lý

### 🔐 Bảo mật và quản lý
- **Xác thực JWT**: Đăng nhập/đăng ký an toàn
- **Quên mật khẩu**: Reset mật khẩu qua email
- **Phân quyền**: User và Admin roles
- **Audit logs**: Theo dõi hoạt động hệ thống

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │   AI Services   │
│  (React Native) │◄──►│     (Flask)     │◄──►│  BLIP + GTTs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │   + GridFS      │
                       └─────────────────┘
```

## 🛠️ Công nghệ sử dụng

### Backend (be/)
- **Framework**: Flask 1.1.4
- **Database**: MongoDB với MongoEngine
- **Authentication**: Flask-JWT-Extended
- **AI Models**: 
  - Hugging Face Transformers (BLIP)
  - Google Text2Speech (GTTs)
- **Image Processing**: PIL, PyTorch
- **Translation**: Google Translate API
- **Email**: SMTP integration

### Frontend (fe2/)
- **Framework**: React Native với Expo SDK 53
- **Navigation**: Expo Router
- **State Management**: React Context
- **UI Components**: Custom components với Lottie animations
- **Media**: Expo ImagePicker, Camera, MediaLibrary
- **Location**: Expo Location
- **Styling**: StyleSheet với Gradient và Blur effects

## 🚀 Cài đặt và triển khai

### Yêu cầu hệ thống
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Expo CLI

### Backend Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd Captioning-App/be
```

2. **Tạo virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows
```

3. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

4. **Cấu hình environment variables**
Tạo file `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/captioning_app
JWT_SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

5. **Khởi chạy server**
```bash
python app.py
```

### Frontend Setup

1. **Chuyển đến thư mục frontend**
```bash
cd ../fe2
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình API endpoint**
Chỉnh sửa `constants/config.ts`:
```typescript
export const API_URL = 'http://your-backend-url:5000';
```

4. **Khởi chạy ứng dụng**
```bash
npm start
```

### Cài đặt AI Models

1. **BLIP Models**
   - Mô hình mặc định sẽ được tải tự động từ Hugging Face
   - Mô hình du lịch cần được huấn luyện riêng và đặt trong `pretrain/blip_trained/`

2. **Google Gemini**
   - Đăng ký API key tại [Google AI Studio](https://makersuite.google.com/)
   - Thêm API key vào file `.env`

## 📁 Cấu trúc dự án

### Backend Structure
```
be/
├── app.py                 # Entry point
├── requirements.txt       # Python dependencies
├── controllers/           # Request handlers
│   ├── auth_controller.py
│   ├── image_controller.py
│   ├── image_caption_controller.py
│   ├── group_caption_controller.py
│   └── location_controller.py
├── models/               # Data models
│   ├── user.py
│   ├── image.py
│   └── report.py
├── services/             # Business logic
│   ├── auth_service.py
│   ├── image_service.py
│   ├── image_caption_service.py
│   ├── gemini_service.py
│   └── email_service.py
├── routes/              # API routes
├── database/            # Database setup
├── pretrain/            # AI models storage
└── logs/               # Application logs
```

### Frontend Structure
```
fe2/
├── app/                    # Screen components
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── (public)/          # Public screens
├── components/            # Reusable UI components
├── services/             # API communication
├── context/              # Global state management
├── constants/            # App configuration
├── assets/              # Images, fonts, etc.
└── utils/               # Utility functions
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # Đăng ký tài khoản
POST /api/auth/login        # Đăng nhập
POST /api/auth/forgot-password  # Quên mật khẩu
POST /api/auth/reset-password   # Reset mật khẩu
```

### Image Management
```
GET  /api/images            # Lấy danh sách ảnh
POST /api/images/upload     # Upload ảnh
PUT  /api/images/:id        # Cập nhật thông tin ảnh
DELETE /api/images/:id      # Xóa ảnh
```

### Image Captioning
```
POST /api/image-caption/upload        # Upload với tạo chú thích
PUT  /api/image-caption/caption/:id   # Cập nhật chú thích
POST /api/image-caption/:id/regenerate # Tạo lại chú thích
```

### Group Features
```
POST /api/group-caption     # Tạo mô tả nhóm ảnh
GET  /api/locations         # Lấy danh sách địa điểm
GET  /api/images/location/:id # Lấy ảnh theo địa điểm
```

## 🎮 Sử dụng ứng dụng

📹 **Xem video demo để hiểu rõ hơn về cách sử dụng từng tính năng!**

### 1. Đăng ký/Đăng nhập
- Tạo tài khoản mới hoặc đăng nhập
- Hỗ trợ reset mật khẩu qua email

### 2. Chụp/Upload ảnh
- Chụp ảnh trực tiếp hoặc chọn từ thư viện
- Tự động lấy thông tin vị trí
- Chọn mô hình AI (Default/Travel)

### 3. Tạo chú thích
- AI tự động tạo chú thích
- Có thể chỉnh sửa hoặc tạo lại
- Hỗ trợ phát âm

### 4. Quản lý ảnh
- Xem lịch sử tất cả ảnh
- Tìm kiếm và lọc theo địa điểm
- Chia sẻ lên mạng xã hội

### 5. Group Captioning
- Chọn nhiều ảnh (2-4 ảnh)
- Tạo mô tả tổng hợp bằng AI
- Chia sẻ kết quả

## 🔧 Cấu hình nâng cao

### Tùy chỉnh AI Models
- Huấn luyện mô hình BLIP riêng cho domain cụ thể
- Điều chỉnh hyperparameters trong `image_caption_service.py`
- Thêm prompt templates cho Gemini

### Performance Optimization
- Caching model trong memory
- Image compression trước khi upload
- Lazy loading cho danh sách ảnh

### Security Best Practices
- Validation input nghiêm ngặt
- Rate limiting cho API
- Sanitize file uploads
- HTTPS trong production

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Development Guidelines
- Tuân thủ PEP 8 cho Python code
- Sử dụng TypeScript cho React Native
- Viết unit tests cho các functions quan trọng
- Cập nhật documentation khi thêm tính năng mới

## 📞 Liên hệ và Hỗ trợ

- **Email**: hoandoan288@gmail.com

---

⭐ **Star repo này nếu nó hữu ích cho bạn!**