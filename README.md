# Deltora Labs - Contact Form Backend

Backend server để xử lý form liên hệ và gửi email cho website Deltora Labs.

## 🚀 Cài đặt và Chạy

### 1. Cài đặt Node.js
Tải và cài đặt Node.js từ [nodejs.org](https://nodejs.org/)

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình Gmail

#### Bước 3.1: Tạo App Password cho Gmail
1. Truy cập [Google Account Settings](https://myaccount.google.com/)
2. Chọn **Security** → **2-Step Verification** (phải bật trước)
3. Chọn **App passwords**
4. Chọn app: **Mail**
5. Copy App Password được tạo

#### Bước 3.2: Tạo file .env
Tạo file `.env` trong thư mục gốc với nội dung:

```bash
# Email Configuration
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Lưu ý:** Thay thế:
- `yourgmail@gmail.com` bằng Gmail của bạn
- `your_app_password_here` bằng App Password vừa tạo

### 4. Chạy server

#### Development mode (có auto-restart):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📧 Test Email Function

### Endpoint kiểm tra:
- **Health check:** `GET http://localhost:3000/health`
- **Send email:** `POST http://localhost:3000/send-email`

### Test với curl:
```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "xAccount": "https://x.com/testuser",
    "yourName": "Test User",
    "telegramHandle": "@testuser",
    "budget": "5-10k",
    "projectDescription": "This is a test submission"
  }'
```

## 🌐 Deploy lên Production

### Option 1: Heroku
1. Tạo app trên [Heroku](https://heroku.com)
2. Thêm environment variables:
   ```bash
   heroku config:set GMAIL_USER=yourgmail@gmail.com
   heroku config:set GMAIL_APP_PASSWORD=your_app_password
   ```
3. Deploy code

### Option 2: Vercel
1. Cài đặt Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Thêm environment variables trong Vercel dashboard

### Option 3: VPS/Server
1. Upload code lên server
2. Cài đặt PM2: `npm install -g pm2`
3. Chạy: `pm2 start server.js --name deltora-api`

## 📁 Cấu trúc File

```
deltora/
├── server.js          # Backend server
├── package.json       # Dependencies
├── index.html         # Frontend với form
├── assets/           # CSS, images, icons
└── README.md         # Hướng dẫn này
```

## 🔧 Troubleshooting

### Lỗi "Invalid login" khi gửi email:
1. Kiểm tra Gmail user/password trong `.env`
2. Đảm bảo đã bật 2-Step Verification
3. Sử dụng App Password, không phải mật khẩu Gmail thường

### Lỗi CORS khi test từ localhost:
Server đã cấu hình CORS, nhưng nếu vẫn lỗi:
```javascript
// Thêm vào server.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com']
}));
```

### Form không submit:
1. Kiểm tra Console trong DevTools
2. Đảm bảo server đang chạy tại đúng port
3. Kiểm tra network requests trong DevTools

## 📞 Support

Nếu cần hỗ trợ, liên hệ qua:
- Email: titanworkcm@gmail.com
- Telegram: @DeltoraLabs

---

🚀 **Chúc bạn setup thành công!** 