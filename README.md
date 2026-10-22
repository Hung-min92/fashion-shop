# Fashion Shop

Website bán hàng thời trang xây dựng bằng MERN Stack (MongoDB, Express, React, Node.js).

## Trạng thái

Đang phát triển. Hướng dẫn cài đặt sẽ được bổ sung khi có bản chạy được.

Hello

Collection	Các trường chính
users	name, email (duy nhất), passwordHash, phone, role
categories	name, slug
products	name, description, price, images[], category (tham chiếu), variants[] (lồng)
carts	user (tham chiếu), items[] gồm product, sku, quantity
orders	user, items[], shippingAddress, paymentMethod, status, totalPrice
review userId, productId, rating, comment, createdAt
Comment userId, content, createdAt
Post title, slug, content, thumbnail, authorId, status