# YouTube Video Downloader - Whop App

A clean, minimal YouTube video downloader built as a Whop app with custom UI design.

## 🎨 Features

- **Clean UI**: Custom color palette (#FCF6F5, #141212, #FA4616)
- **High Quality**: Download videos up to 1080p
- **Video Preview**: See thumbnail, title, and duration before downloading
- **Quality Selection**: Choose from 1080p, 720p, 480p, or 360p
- **Access Control**: Full Whop authentication and membership verification
- **Powered by yt-dlp**: Most reliable YouTube downloader

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + yt-dlp CLI
- **Authentication**: Whop SDK with JWT verification
- **Hosting**: Vercel-ready

## 📋 Prerequisites

Before you begin, you need:

1. **Node.js 18+** installed
2. **yt-dlp** installed on your system:
   ```bash
   # macOS (Homebrew)
   brew install yt-dlp

   # Linux
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp

   # Windows (Scoop)
   scoop install yt-dlp
   ```

3. **Whop App** created at https://whop.com/dashboard/developer/

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Make sure your `.env.local` has these Whop variables:

```bash
# Whop App Configuration
WHOP_API_KEY=your_api_key_here
WHOP_APP_ID=app_xxx
NEXT_PUBLIC_WHOP_APP_ID=app_xxx
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxx
```

### 3. Run Development Server

```bash
npm run dev
```

This will start the Whop dev proxy on port 3000.

### 4. Enable Localhost Mode in Whop Dashboard

1. Go to your Whop app dashboard
2. Click the settings icon (⚙️) in the top right
3. Select "localhost"
4. Your app will now load from http://localhost:3000

## 🎯 Usage

### For Developers

Visit the experience page:
```
http://localhost:3000/experience/[experienceId]
```

Replace `[experienceId]` with your Whop experience ID.

### For Users

1. Paste a YouTube URL
2. Click "Get Info" to preview the video
3. Select your preferred quality
4. Click "Download Video"

## 📁 File Structure

```
app/
  experience/[experienceId]/page.tsx  # Main experience view with access control
  api/
    video-info/route.ts               # Get video metadata via yt-dlp
    download/route.ts                 # Download video stream
components/
  video-downloader.tsx                # Client component with custom UI
lib/
  whop-sdk.ts                         # Whop SDK configuration
  yt-dlp.ts                           # yt-dlp wrapper utilities
middleware.ts                         # Authentication middleware
```

## 🔐 Authentication Flow

1. User accesses `/experience/[experienceId]`
2. Middleware checks for `x-whop-user-token` header
3. Token is verified using Whop SDK
4. User access is checked for the specific experience
5. If valid, video downloader UI is shown

## 🎨 Color Palette

- **Background**: `#FCF6F5` (cream/beige)
- **Text**: `#141212` (almost black)
- **Accent**: `#FA4616` (vibrant orange-red)

## 🚀 Deployment to Vercel

### 1. Install yt-dlp on Vercel

Create a `install.sh` script:

```bash
#!/bin/bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp
chmod a+rx /tmp/yt-dlp
export PATH="/tmp:$PATH"
```

Add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "chmod +x install.sh && ./install.sh"
  }
}
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

### 3. Configure Whop Dashboard

1. Go to Whop Dashboard → App Settings → Hosting
2. Set Base URL: `https://your-app.vercel.app`
3. Set Experience Path: `/experience/[experienceId]`

## ⚠️ Important Notes

### yt-dlp on Vercel

- yt-dlp must be installed during build
- Use `/tmp` directory for temporary files
- Files in `/tmp` are automatically cleaned up
- Function timeout is 10 minutes for downloads

### Rate Limits

- Whop API: 100 requests per 10 seconds
- YouTube may rate-limit if downloading too frequently
- Consider implementing user-based rate limiting

### File Size Limits

- Vercel has a 4.5 MB request body limit
- Large videos may take time to download
- Consider streaming for very large files

## 🐛 Troubleshooting

### "yt-dlp: command not found"

Make sure yt-dlp is installed:
```bash
which yt-dlp
# Should output: /usr/local/bin/yt-dlp or similar
```

### "Invalid YouTube URL"

Supported formats:
- `https://www.youtube.com/watch?v=...`
- `https://youtu.be/...`
- `https://www.youtube.com/shorts/...`

### "Authentication Error"

Make sure you're running with the Whop dev proxy:
```bash
npm run dev  # NOT "next dev"
```

And enable localhost mode in your Whop dashboard.

### Downloads Taking Too Long

- Try a lower quality (480p or 360p)
- Check your internet connection
- Some videos may be large files

## 📝 API Routes

### POST /api/video-info

Get video metadata.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Video Title",
    "thumbnail": "https://...",
    "duration": 300,
    "uploader": "Channel Name",
    "formats": [...]
  }
}
```

### POST /api/download

Download video with selected quality.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "720"
}
```

**Response:**
Binary video file (video/mp4)

## 🔮 Future Enhancements

- [ ] Playlist support
- [ ] Audio-only downloads (MP3)
- [ ] Download history
- [ ] Batch downloads
- [ ] Progress tracking with websockets
- [ ] Video conversion options

## 📄 License

MIT

## 👤 Author

Built by [@edisonisgrowing](https://twitter.com/edisonisgrowing)

Want a custom app for your community? I build clean, fast, tailored solutions.

---

**Note**: This app is for educational purposes. Always respect YouTube's Terms of Service and copyright laws.
