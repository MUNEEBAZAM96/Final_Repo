# ✅ Cloudinary Integration Complete

## 📁 Files Created/Updated

### 1. ✅ Configuration File
**`/src/config/cloudinary.ts`**
- Configures Cloudinary v2
- Loads environment variables from `env.ts`
- Exports configured Cloudinary instance

### 2. ✅ Upload Middleware
**`/src/Middleware/upload.ts`**
- Uses `multer` with `multer-storage-cloudinary`
- Restricts files to: jpg, jpeg, png
- Sets Cloudinary folder: `"myApp"`
- File size limit: 5MB
- Image transformation: 500x500 limit

### 3. ✅ Upload Routes
**`/src/Router/upload_Routes.ts`**
- `POST /api/upload/upload-profile` - Upload profile image
- `DELETE /api/upload/delete-image` - Delete profile image
- Both routes require authentication
- Proper error handling and validation

### 4. ✅ User Model Updated
**`/src/db/models/User.ts`**
- Added `profileImage` field:
  ```typescript
  profileImage?: {
    url: string
    publicId: string
  }
  ```

### 5. ✅ TypeScript Types
**`/src/types/express.d.ts`**
- Extended Express Request type
- Added Multer File type extensions

### 6. ✅ Environment Configuration
**`env.ts`**
- Added Cloudinary environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 7. ✅ Server Integration
**`server.ts`**
- Added upload routes: `/api/upload`
- Protected with authentication middleware

---

## 🔑 Environment Variables

Your `.env` file now includes:
```env
CLOUDINARY_CLOUD_NAME=dibgebv9u
CLOUDINARY_API_KEY=887232855367279
CLOUDINARY_API_SECRET=xZy36_ZEzqgUnJ2PaS5PcqL4bUM
```

---

## 📡 API Endpoints

### Upload Profile Image
```http
POST /api/upload/upload-profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  image: <file> (jpg, jpeg, or png)
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "myApp/xyz123"
}
```

### Delete Profile Image
```http
DELETE /api/upload/delete-image
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "publicId": "myApp/xyz123"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

---

## 🧪 Testing with cURL

### Upload Image
```bash
curl -X POST http://localhost:3000/api/upload/upload-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Delete Image
```bash
curl -X DELETE http://localhost:3000/api/upload/delete-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"publicId": "myApp/xyz123"}'
```

---

## ✨ Features

- ✅ Automatic image optimization (500x500 limit)
- ✅ Old image deletion when uploading new one
- ✅ File type validation (jpg, jpeg, png only)
- ✅ File size limit (5MB)
- ✅ Secure authentication required
- ✅ Proper error handling
- ✅ MongoDB integration
- ✅ TypeScript support

---

## 🎯 Usage in Frontend

```typescript
// Upload profile image
const formData = new FormData()
formData.append('image', fileInput.files[0])

const response = await fetch('/api/upload/upload-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

const data = await response.json()
console.log(data.url) // Cloudinary image URL
```

---

## ✅ All Requirements Met

- [x] Cloudinary configuration file created
- [x] Multer + Cloudinary storage middleware
- [x] Image upload route (POST /upload-profile)
- [x] Image delete route (DELETE /delete-image)
- [x] User model updated with profileImage field
- [x] TypeScript types added
- [x] Routes connected in server.ts
- [x] ES modules + TypeScript
- [x] Error handling included
- [x] Production-ready code

🎉 **Cloudinary integration is complete and ready to use!**

