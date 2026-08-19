const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();

const cors = require('cors');
app.use(cors({
    credentials: true,
    origin: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// routes
const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);
const postsRouter = require("./routes/Posts");
app.use("/post", postsRouter);
const bookingsRouter = require("./routes/Bookings");
app.use("/booking", bookingsRouter);
const adminRouter = require("./routes/Admin");
app.use("/admin-api", adminRouter);
const aiRouter = require("./routes/Ai");
app.use("/api/ai", aiRouter);
app.use("/ai", aiRouter);

// Serve client static build
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

// If client build doesn't exist yet, trigger async build in background
if (!fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
    console.log('[Server] Client dist not found, starting background build...');
    exec('npm run build --workspace=client', { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
        if (err) {
            console.error('[Server] Background client build error:', err);
        } else {
            console.log('[Server] Background client build finished successfully');
        }
    });
}

app.use(express.static(clientBuildPath));

// SPA catch-all: any non-API route serves index.html
app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send('<!DOCTYPE html><html><head><title>Phongtro365</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f8fafc;"><div style="text-align:center;"><h2>Đang khởi động Phongtro365...</h2><p style="color:#64748b;">Trang sẽ tự động tải lại sau vài giây.</p></div><script>setTimeout(() => location.reload(), 2000);</script></body></html>');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Phongtro365] Server is running on port ${PORT}`);
});
