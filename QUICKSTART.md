# 🚀 Quick Start Guide - YouTube Downloader

## ✅ Prerequisites Check

- [x] Node.js installed
- [x] yt-dlp installed at `/opt/homebrew/bin/yt-dlp`
- [x] Whop app credentials in `.env.local`

## 🏃‍♂️ Start the App (2 steps)

### 1. Start Development Server

```bash
npm run dev
```

You should see:
```
Whop proxy running on port 3000
Ready in 1.2s
```

### 2. Enable Localhost Mode

1. Open your Whop app in the dashboard
2. Click the **settings icon (⚙️)** in top right
3. Select **"localhost"**

## 🎯 Test the App

Open in your browser:
```
http://localhost:3000/experience/YOUR_EXPERIENCE_ID
```

Or test directly with your Whop iframe!

## 🎨 What You'll See

A beautiful YouTube downloader with:
- Clean cream background (#FCF6F5)
- Orange-red accent buttons (#FA4616)
- URL input field
- Video preview with thumbnail
- Quality selector (1080p/720p/480p/360p)
- Download button

## 📝 Try It Out

1. **Paste a YouTube URL**:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

2. **Click "Get Info"**
   - See video thumbnail
   - View title and duration
   - Check uploader name

3. **Select Quality**
   - Choose from dropdown (default 720p)

4. **Click "Download Video"**
   - Video downloads to your device
   - Named automatically

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
# Then run again
npm run dev
```

### Can't Access Experience Page?
Make sure:
- Dev server is running
- Localhost mode is enabled in Whop dashboard
- You're using the correct experience ID from Whop

### yt-dlp Issues?
```bash
# Update yt-dlp
brew upgrade yt-dlp
```

## 📂 Key Files Created

```
app/experience/[experienceId]/page.tsx  ← Main page with auth
components/video-downloader.tsx         ← UI component
lib/whop-sdk.ts                        ← Whop integration
lib/yt-dlp.ts                          ← YouTube downloader
middleware.ts                          ← Authentication
```

## 🎉 You're Ready!

Your YouTube downloader Whop app is fully functional with:
- ✅ Clean custom UI
- ✅ Whop authentication
- ✅ Access control
- ✅ High-quality downloads
- ✅ Mobile responsive

## 📚 Next Steps

1. **Customize branding** in [components/video-downloader.tsx](components/video-downloader.tsx)
2. **Add features** like playlist support or MP3 extraction
3. **Deploy to Vercel** when ready (see YOUTUBE-DOWNLOADER-README.md)

Need help? Check the full documentation in `YOUTUBE-DOWNLOADER-README.md`
