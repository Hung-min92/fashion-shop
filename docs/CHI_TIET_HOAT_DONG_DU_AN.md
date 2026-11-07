# TÀI LIỆU GIẢI THÍCH TOÀN BỘ MÃ NGUỒN DỰ ÁN FASHION SHOP

Tài liệu này được biên soạn chi tiết từng module, từng hàm và các đoạn mã quan trọng nhất của cả Backend lẫn Frontend, giúp bất kỳ ai đọc vào cũng có thể hiểu rõ luồng chạy và nguyên lý vận hành của hệ thống.

---

# MỤC LỤC
1. **Kiến trúc tổng thể & Công nghệ sử dụng**
2. **Chi tiết Backend (Node.js / Express / MongoDB)**
   - Khởi tạo & Cấu hình mạng (`server.js`, `app.js`, `db.js`)
   - Thiết kế cơ sở dữ liệu (Models)
   - Tầng kiểm soát & Bảo mật (Middleware)
   - Xử lý nghiệp vụ lõi (Controllers: Auth, Product, Cart, Order, Category)
   - Xác thực đầu vào (Validators với Zod)
3. **Chi tiết Frontend (React 19 / Vite / Tailwind)**
   - Quản lý phiên & Gọi API (`AuthContext.jsx`, `api.js`)
   - Điều hướng & Phân quyền (`App.jsx`, `ProtectedRoute.jsx`)
   - Các trang nghiệp vụ khách hàng (Danh sách, Chi tiết, Giỏ hàng, Đặt hàng, Lịch sử)
   - Các trang quản trị (Admin Products, Admin Orders)
4. **Hệ thống bảng tổng hợp (Chuẩn sao chép vào Microsoft Word)**

---

# PHẦN 1: KIẾN TRÚC TỔNG THỂ & CÔNG NGHỆ

Hệ thống hoạt động theo kiến trúc **Client-Server phân tách (Decoupled Single Page Application & RESTful API)**:
- **Client (Frontend)**: Chạy trên trình duyệt, đảm nhiệm render giao diện, quản lý trạng thái hiển thị (state) và gửi các yêu cầu HTTP/JSON đến Server.
- **Server (Backend)**: Đảm nhiệm xác thực, xử lý logic kiểm tra kho, tính toán giá tiền, quản lý trạng thái đơn hàng và ghi vào cơ sở dữ liệu MongoDB Atlas.

```
[Trình duyệt / React 19] 
       │
       │ (REST API qua Fetch + JWT Bearer Token)
       ▼
[Express 5 Server]
   ├── 1. Bảo mật: Helmet (HTTP Headers), CORS Whitelist, Rate Limiter (Chống DoS/Brute Force)
   ├── 2. Tầng Middleware: Auth (Xác thực JWT token & Phân quyền Admin)
   ├── 3. Tầng Controllers: Xử lý logic nghiệp vụ, tính toán giỏ hàng, trừ kho nguyên tử
   └── 4. Tầng Models (Mongoose): Ghi nhận dữ liệu vào MongoDB Atlas
```

---

# PHẦN 2: CHI TIẾT MÃ NGUỒN BACKEND

## 1. Khởi tạo & Cấu hình Server

### `server/src/server.js`
Điểm bắt đầu (entry point) của dịch vụ:
```javascript
import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("Thiếu JWT_SECRET trong file .env");
}

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Không thể khởi động server:", error.message);
    process.exit(1);
  }
}

start();
```
- **Ý nghĩa từng dòng**:
  - `dotenv/config`: Nạp biến môi trường từ file `.env` vào `process.env`.
  - `if (!process.env.JWT_SECRET)`: Chặn đứng server ngay khi khởi động nếu quên cấu hình khóa bí mật tạo token, tránh lỗi runtime phát sinh ngầm sau này.
  - Luôn đảm bảo `await connectDB()` thành công rồi mới cho `app.listen()` mở cổng nhận request.

### `server/src/config/db.js`
Xử lý kết nối cơ sở dữ liệu:
```javascript
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Thiếu MONGODB_URI trong file .env");

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
```
- **Chi tiết kỹ thuật quan trọng**: `dns.setServers(["8.8.8.8", "1.1.1.1"])` chỉ định sử dụng DNS của Google và Cloudflare nhằm giải quyết triệt để lỗi phổ biến `querySrv ECONNREFUSED` trên Windows khi kết nối tới chuỗi `mongodb+srv://` của MongoDB Atlas.

### `server/src/app.js`
Lắp ráp các tầng bảo vệ và đăng ký tuyến đường:
- `app.set("trust proxy", 1)`: Để Express nhận biết đúng địa chỉ IP thực tế của client khi server chạy sau reverse proxy (như Vercel, Nginx, Cloudflare).
- `helmet()`: Đính kèm các tiêu đề bảo mật HTTP (Content-Security-Policy, X-Frame-Options, HSTS...).
- `cors({...})`: Kiểm tra địa chỉ gốc (`origin`). Chỉ những địa chỉ nằm trong biến môi trường `CLIENT_ORIGIN` (mặc định `http://localhost:5173`) mới được phép truy cập.
- `express.json({ limit: "100kb" })`: Giới hạn payload JSON tối đa 100 kilobyte để ngăn chặn tấn công DoS bằng payload khổng lồ.
- **Giới hạn tần suất gọi API (Rate Limiting)**:
  - `globalLimiter`: Tối đa 300 request / 15 phút trên toàn bộ `/api`.
  - `authLimiter`: Tối đa 20 lần thử đăng nhập/đăng ký trong 15 phút trên `/api/auth/login` và `/api/auth/register` để chống tấn công brute-force dò mật khẩu.

---

## 2. Thiết kế Cơ sở Dữ liệu (Mongoose Models)

### `Product.js` (Sản phẩm & Biến thể)
```javascript
const variantSchema = new mongoose.Schema({
    sku: { type: String, required: true, trim: true, uppercase: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
});
```
- Mỗi sản phẩm gồm nhiều biến thể (`variants`).
- **Mã SKU**: Mã duy nhất của từng cặp Size + Màu, luôn được chuẩn hóa viết hoa (`uppercase: true`).
- `stock`: Tồn kho được khóa điều kiện không được phép âm (`min: 0`).
- Sản phẩm có liên kết tham chiếu (`ref: "Category"`) đến danh mục và cờ `isActive: true` để hỗ trợ xóa mềm (ẩn sản phẩm khỏi cửa hàng mà không mất dữ liệu liên kết cũ).

### `User.js` (Người dùng)
- `email`: Có chỉ mục duy nhất (`unique: true`), tự động chuyển thành chữ thường (`lowercase: true`).
- `passwordHash`: Được đánh dấu `select: false` để khi truy vấn tài khoản bình thường, chuỗi băm mật khẩu không bao giờ vô tình bị rò rỉ gửi về frontend.
- `role`: Phân quyền rõ ràng giữa `"customer"` (khách mua hàng) và `"admin"` (quản trị viên).

### `Cart.js` (Giỏ hàng)
- Trường `user` được đặt `unique: true`: Mỗi tài khoản chỉ có duy nhất một tài liệu giỏ hàng trong cơ sở dữ liệu.
- Giỏ hàng **chỉ lưu ID sản phẩm, mã SKU và số lượng**, không lưu giá hay tên sản phẩm. Giá sản phẩm được tính toán động từ bảng `Product` khi người dùng mở giỏ để chống gian lận sửa giá trên máy khách.

### `Order.js` (Đơn hàng)
- Snapshot toàn bộ thông tin tại thời điểm mua hàng:
  ```javascript
  const orderItemSchema = new mongoose.Schema({
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      sku: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: String, required: true },
      color: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
  });
  ```
- **Lý do**: Nếu sau này chủ shop sửa giá hoặc đổi tên sản phẩm, đơn hàng cũ vẫn giữ nguyên vẹn giá trị và tên sản phẩm lúc khách đã mua.
- `orderSchema.index({ user: 1, createdAt: -1 })`: Tối ưu hóa truy vấn xem lịch sử đơn hàng của người dùng sắp xếp từ mới nhất đến cũ nhất.

---

## 3. Tầng Middleware & Bảo vệ

### `middleware/auth.js`
Bao gồm 2 hàm kiểm soát quyền truy cập:
1. `protect`:
   - Lấy chuỗi token từ header: `req.headers.authorization`.
   - Xác thực chữ ký bằng `jwt.verify(token, process.env.JWT_SECRET)`.
   - Kiểm tra `User.findById(payload.id)` và `user.isActive`. Nếu tài khoản bị khóa hoặc token giả mạo, lập tức chặn với mã `401 Unauthorized`.
   - Gán thông tin người dùng vào `req.user` cho các controller phía sau sử dụng.
2. `requireRole(...roles)`:
   - Kiểm tra vai trò của `req.user.role`. Nếu vai trò không khớp với danh sách cho phép (ví dụ khách hàng cố gọi API admin), chặn với mã `403 Forbidden`.

---

## 4. Logic Xử lý Nghiệp vụ Lõi (Controllers)

### A. Quản lý Giỏ hàng (`cartController.js`)
*   **Hàm `buildCartView(cart)`**:
    1. Lấy toàn bộ ID sản phẩm có trong giỏ hàng.
    2. Truy vấn từ cơ sở dữ liệu bảng `Product`.
    3. Duyệt qua từng món trong giỏ: kiểm tra xem sản phẩm còn bật (`isActive`) không, biến thể SKU đó còn tồn tại không, còn đủ hàng trong kho không.
    4. Trả về cấu trúc giỏ hàng hoàn chỉnh kèm tổng tiền thực tế được tính toán tức thì từ giá hiện hành của sản phẩm.

*   **Hàm `addItem(req, res)`**:
    - Kiểm tra số lượng thêm vào cộng với số lượng đã có trong giỏ không được vượt quá số lượng tồn kho `variant.stock`.

### B. Xử lý Đơn hàng & Quản lý Kho (`orderController.js`)
Đây là phần có độ phức tạp kỹ thuật cao nhất của hệ thống:

1. **Nguyên tắc Chống Gian Lận**:
   - Khi người dùng gửi yêu cầu đặt hàng, hệ thống lấy dữ liệu trực tiếp từ `Cart` trong database, tuyệt đối không nhận danh sách món hay giá tiền từ phía client.

2. **Cơ chế Trừ kho Nguyên tử (Atomic Stock Deduction)**:
   ```javascript
   const deducted = [];
   for (const oi of orderItems) {
       const result = await Product.updateOne(
           {
               _id: oi.product,
               isActive: true,
               variants: { $elemMatch: { sku: oi.sku, stock: { $gte: oi.quantity } } },
           },
           { $inc: { "variants.$.stock": -oi.quantity } }
       );

       if (result.modifiedCount !== 1) {
           await restoreStock(deducted);
           return res.status(400).json({
               message: `Không đủ hàng cho "${oi.name}" (${oi.size}, ${oi.color})`,
           });
       }
       deducted.push({ product: oi.product, sku: oi.sku, quantity: oi.quantity });
   }
   ```
   - Sử dụng toán tử `$elemMatch` kết hợp `$gte: oi.quantity` để kiểm tra kho và `$inc: -oi.quantity` để trừ kho trong một câu lệnh duy nhất.
   - Nếu có 2 khách hàng cùng đặt sản phẩm cuối cùng vào cùng 1 thời điểm, chỉ 1 người có `modifiedCount === 1`.
   - Nếu trong đơn hàng có 3 món mà món thứ 3 bị hết hàng, hàm `restoreStock(deducted)` sẽ tự động hoàn trả lại số lượng tồn kho cho 2 món trước đó, đảm bảo dữ liệu không bao giờ bị lệch.

3. **Máy Trạng Thái Đơn Hàng (State Machine)**:
   ```javascript
   const ALLOWED_TRANSITIONS = {
       pending: ["shipping", "cancelled"],
       shipping: ["completed", "cancelled"],
       completed: [],
       cancelled: [],
   };
   ```
   - Chặn đứng các thao tác chuyển trạng thái phi logic (ví dụ đơn đã hủy `cancelled` thì không thể chuyển sang `completed`).
   - Khi đơn bị chuyển sang `cancelled` (khách hủy lúc pending hoặc admin hủy khi đang giao), hệ thống tự động gọi hàm `restoreStock()` để cộng trả lại toàn bộ tồn kho cho từng biến thể SKU.

---

# PHẦN 3: CHI TIẾT MÃ NGUỒN FRONTEND

## 1. Cơ chế Quản lý Phiên & Tương tác API

### `client/src/api.js`
Đóng vai trò là cầu nối liên lạc giữa client và server:
```javascript
export async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
    return data;
}
```
- **Tính năng**:
  - Tự động lấy token trong `localStorage` và chèn vào header `Authorization: Bearer <token>`.
  - Tự động chuyển đổi `body` sang chuỗi JSON.
  - Kiểm tra `res.ok`: Nếu backend trả về mã lỗi (400, 401, 403, 404, 500), hàm sẽ ném ra ngoại lệ (`throw new Error`) chứa đúng câu thông báo từ backend để UI hiển thị cho người dùng.

### `client/src/AuthContext.jsx`
Context toàn cục quản lý danh tính người dùng:
- Khi người dùng tải trang (`useEffect`):
  - Đọc token từ LocalStorage.
  - Nếu có token, gọi API `/api/auth/me` để lấy thông tin tài khoản mới nhất.
  - Nếu token hỏng hoặc hết hạn, gọi `clearToken()` để dọn sạch.
  - Biến `ready` được bật thành `true` khi hoàn thành kiểm tra phiên.
- Cung cấp sẵn các hàm `login(email, password)`, `register(...)` và `logout()`.

### `client/src/ProtectedRoute.jsx`
Lớp bảo vệ định tuyến:
- Kiểm tra cờ `ready`: Nếu đang xác thực thì hiển thị `"Đang tải..."` để không bị chuyển trang nhầm.
- Nếu `!user`: Lập tức chuyển hướng về trang `/login`.
- Nếu trang yêu cầu quyền cụ thể (ví dụ `role="admin"`) mà tài khoản không phải admin: Hiển thị cảnh báo không có quyền truy cập.

---

## 2. Các Trang Chức Năng Cốt Lõi

### A. Trang Danh Sách Sản Phẩm (`ProductListPage.jsx`)
- Tích hợp thanh tìm kiếm. Khi người dùng submit từ khóa `keyword`, hook `useEffect` sẽ gọi API:
  `/api/products?search=<keyword>`
- Dữ liệu trả về được render dạng lưới sản phẩm responsive (2 cột trên mobile, 4 cột trên desktop), hiển thị tên, danh mục và giá tiền định dạng tiền tệ Việt Nam (`toLocaleString("vi-VN")đ`).

### B. Trang Chi Tiết Sản Phẩm (`ProductDetailPage.jsx`)
- Đọc `id` sản phẩm từ URL thông qua `useParams()`.
- Lọc danh sách biến thể thành các tập hợp Size và Màu sắc không trùng lặp:
  ```javascript
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];
  ```
- Khi người dùng bấm chọn 1 Size và 1 Màu, hệ thống tự động tìm biến thể tương ứng `selected = variants.find(...)`:
  - Hiển thị số lượng hàng còn trong kho: `"Còn X sản phẩm"`.
  - Nếu `stock === 0`: Nút "Thêm vào giỏ" bị vô hiệu hóa (`disabled`) và hiển thị chữ `"Hết hàng"`.
  - Nếu chưa đăng nhập, khi bấm thêm vào giỏ hàng sẽ tự động chuyển hướng người dùng sang trang `/login`.

### C. Trang Giỏ Hàng (`CartPage.jsx`)
- Hiển thị danh sách các món hàng hiện có trong giỏ.
- Cho phép bấm `+` hoặc `-` để tăng giảm số lượng, gọi API `PATCH /api/cart/items/:itemId`.
- Nếu có bất kỳ sản phẩm nào trong giỏ bị hết hàng hoặc bị ẩn (`!item.available`), nút "Đặt hàng" sẽ bị ẩn và thay thế bằng cảnh báo nhắc nhở người dùng cần điều chỉnh hoặc xóa món trước khi tiếp tục.

### D. Trang Đặt Hàng (`CheckoutPage.jsx`)
- Thu thập thông tin giao hàng: Họ tên, Số điện thoại, Địa chỉ, Tỉnh/Thành phố, Ghi chú.
- Gửi yêu cầu `POST /api/orders` với địa chỉ giao hàng. Sau khi đặt thành công, tự động điều hướng sang trang `/orders`.

### E. Trang Quản Lý Đơn Của Tôi (`OrdersPage.jsx`)
- Danh sách lịch sử mua sắm của khách.
- Với các đơn đang ở trạng thái `pending`, nút `"Hủy đơn"` sẽ xuất hiện cho phép khách hàng tự hủy đơn ngay trên giao diện mà không cần liên hệ tổng đài.

### F. Trang Quản Trị Đơn Hàng (`AdminOrdersPage.jsx`)
- Cho phép Admin lọc đơn theo trạng thái (`pending`, `shipping`, `completed`, `cancelled`) và phân trang.
- Các nút chuyển trạng thái hiển thị thông minh dựa trên bản đồ `NEXT`:
  - Nếu đơn là `pending`: Hiển thị nút "Đang giao" và "Đã hủy".
  - Nếu đơn là `shipping`: Hiển thị nút "Hoàn tất" và "Đã hủy".

---

# PHẦN 4: HỆ THỐNG BẢNG TỔNG HỢP (DÙNG ĐỂ COPY VÀO WORD)

Bạn có thể bôi đen và sao chép trực tiếp các bảng dưới đây vào file Word.

### BẢNG 1: DANH MỤC THÀNH PHẦN VÀ TRÁCH NHIỆM MÃ NGUỒN

| Phân hệ | Tên File | Vai trò kiến trúc | Tóm tắt chức năng |
| :--- | :--- | :--- | :--- |
| **Backend** | `server.js` | Server Bootstrapper | Kiểm tra biến môi trường, kết nối DB và mở cổng HTTP server. |
| **Backend** | `app.js` | Express Pipeline | Cấu hình Helmet, CORS whitelist, Rate Limiters, đăng ký routes. |
| **Backend** | `config/db.js` | Database Connector | Cấu hình DNS Google/Cloudflare chống lỗi SRV, kết nối Mongoose. |
| **Backend** | `models/User.js` | Database Schema | Quản lý bảng người dùng, lưu mật khẩu băm, quyền hạn và sổ địa chỉ. |
| **Backend** | `models/Product.js` | Database Schema | Quản lý sản phẩm, danh mục và mảng nhúng biến thể (SKU, size, màu, tồn). |
| **Backend** | `models/Order.js` | Database Schema | Lưu snapshot thông tin mua hàng, địa chỉ nhận hàng và máy trạng thái đơn. |
| **Backend** | `models/Cart.js` | Database Schema | Quản lý giỏ hàng theo cơ chế 1-1 với User, chỉ lưu ID và SKU. |
| **Backend** | `middleware/auth.js` | Security Guard | Giải mã JWT token (`protect`), kiểm tra phân quyền người dùng (`requireRole`). |
| **Backend** | `controllers/authController.js` | Business Logic | Xử lý đăng ký (hash bcrypt), đăng nhập (sinh JWT), kiểm tra profile. |
| **Backend** | `controllers/productController.js` | Business Logic | Tìm kiếm regex an toàn, lọc khoảng giá, phân trang, thêm/sửa, xóa mềm. |
| **Backend** | `controllers/orderController.js` | Business Logic | Trừ kho nguyên tử, tạo đơn, hoàn kho tự động khi hủy đơn. |
| **Backend** | `controllers/cartController.js` | Business Logic | Tính toán giá giỏ hàng theo thời gian thực, cập nhật số lượng, xóa món. |
| **Frontend** | `main.jsx` | Client Entry | Khởi tạo ReactDOM, bọc BrowserRouter và AuthProvider. |
| **Frontend** | `App.jsx` | Navigation Layout | Thanh điều hướng Header, định tuyến Route và phân phối quyền. |
| **Frontend** | `api.js` | API Gateway Client | Wrapper fetch tự động gắn Bearer Token và trích xuất lỗi từ Server. |
| **Frontend** | `AuthContext.jsx` | State Management | Lưu trữ user, nạp phiên từ LocalStorage, hỗ trợ login/logout. |
| **Frontend** | `ProtectedRoute.jsx` | Route Guard | Chặn truy cập người dùng chưa đăng nhập hoặc không đủ quyền Admin. |
| **Frontend** | `pages/ProductDetailPage.jsx` | View Layer | Lựa chọn Size/Màu, kiểm tra tồn kho theo SKU, thêm vào giỏ. |
| **Frontend** | `pages/CartPage.jsx` | View Layer | Quản lý giỏ hàng, tăng giảm số lượng, kiểm tra món hàng còn bán. |
| **Frontend** | `pages/CheckoutPage.jsx` | View Layer | Form thu thập địa chỉ nhận hàng và xác nhận đơn COD. |
| **Frontend** | `pages/OrdersPage.jsx` | View Layer | Lịch sử mua hàng cá nhân, hủy đơn pending. |
| **Frontend** | `pages/admin/AdminOrdersPage.jsx`| View Layer | Quản lý danh sách đơn, lọc theo trạng thái, chuyển trạng thái đơn. |

---

### BẢNG 2: ĐẶC TẢ DANH SÁCH RESTful API CỦA HỆ THỐNG

| Method | Đường dẫn Endpoint | Xác thực | Quyền | Payload gửi lên | Phản hồi chính (Response) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Không | Công khai | `{ name, email, password, phone }` | Thông tin User mới tạo (mã 201) |
| **POST** | `/api/auth/login` | Không | Công khai | `{ email, password }` | `{ token, user }` (mã 200) |
| **GET** | `/api/auth/me` | Bearer Token | Đã login | Header `Authorization` | Thông tin cá nhân của User (mã 200) |
| **GET** | `/api/products` | Không | Công khai | Query: `search, category, page...` | Danh sách sản phẩm kèm phân trang |
| **GET** | `/api/products/:id` | Không | Công khai | Param `id` | Thông tin chi tiết 1 sản phẩm |
| **POST** | `/api/products` | Bearer Token | Admin | Thông tin SP + mảng `variants` | Sản phẩm mới được tạo (mã 201) |
| **DELETE** | `/api/products/:id` | Bearer Token | Admin | Param `id` | Thông báo đã ẩn SP (xóa mềm) |
| **GET** | `/api/categories` | Không | Công khai | Không có | Toàn bộ danh mục sản phẩm |
| **GET** | `/api/cart` | Bearer Token | Đã login | Header `Authorization` | Giỏ hàng kèm giá tính toán tức thì |
| **POST** | `/api/cart/items` | Bearer Token | Đã login | `{ productId, sku, quantity }` | Giỏ hàng sau khi thêm món |
| **PATCH** | `/api/cart/items/:itemId` | Bearer Token | Đã login | `{ quantity }` | Giỏ hàng sau khi đổi số lượng |
| **DELETE** | `/api/cart/items/:itemId` | Bearer Token | Đã login | Param `itemId` | Giỏ hàng sau khi xóa món |
| **POST** | `/api/orders` | Bearer Token | Đã login | `{ shippingAddress, note }` | Đơn hàng mới tạo thành công |
| **GET** | `/api/orders/my` | Bearer Token | Đã login | Header `Authorization` | Danh sách đơn hàng của người dùng |
| **PATCH** | `/api/orders/:id/cancel` | Bearer Token | Chủ đơn | Param `id` | Đơn hàng đã chuyển sang cancelled |
| **GET** | `/api/admin/orders` | Bearer Token | Admin | Query: `status, page, limit` | Toàn bộ đơn hàng trong hệ thống |
| **PATCH** | `/api/admin/orders/:id/status`| Bearer Token | Admin | `{ status }` | Đơn hàng sau khi cập nhật trạng thái |

---

### BẢNG 3: MÁY TRẠNG THÁI ĐƠN HÀNG VÀ CƠ CHẾ QUẢN LÝ KHO

| Trạng thái hiện tại | Trạng thái chuyển tiếp cho phép | Người thao tác | Hành động tồn kho tương ứng |
| :--- | :--- | :--- | :--- |
| **Khách gửi đơn** | Chuyển thành **pending** | Hệ thống | Trừ kho nguyên tử (`$inc: -quantity`) cho từng SKU. |
| **pending** | Chuyển sang **shipping** | Quản trị viên | Giữ nguyên kho (hàng đang trên đường giao). |
| **pending** | Chuyển sang **cancelled** | Khách hàng / Admin | **Hoàn trả kho (`restoreStock`)**: cộng bù lại số lượng cho SKU. |
| **shipping** | Chuyển sang **completed** | Quản trị viên | Giữ nguyên kho, cập nhật `paymentStatus = "paid"`. |
| **shipping** | Chuyển sang **cancelled** | Quản trị viên | **Hoàn trả kho (`restoreStock`)**: cộng bù lại số lượng cho SKU. |
| **completed** | *(Khóa trạng thái)* | Không ai | Đơn thành công, cấm thay đổi trạng thái. |
| **cancelled** | *(Khóa trạng thái)* | Không ai | Đơn đã đóng, cấm mở lại để bảo toàn kho. |

