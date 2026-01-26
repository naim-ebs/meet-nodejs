# Meet by EBS - Deployment Guide

## Project Overview
A real-time video conferencing application similar to Google Meet, built with Node.js, Express, Socket.io, and WebRTC.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.io, WebRTC
- **Frontend**: Vanilla JavaScript, jQuery, Bootstrap
- **File Upload**: express-fileupload

## Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn
- SSL certificate (required for production - WebRTC requires HTTPS)

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Required npm Packages
```json
{
  "express": "^5.2.1",
  "socket.io": "^4.8.3",
  "express-fileupload": "latest"
}
```

### 3. Development Dependencies
```json
{
  "nodemon": "^3.1.11"
}
```

## Port Configuration
- **Default Port**: 3000
- Can be changed in `server.js` line 4

## Directory Structure
```
Meet/
├── server.js                 # Main server file
├── index.html               # Meeting room page
├── action.html              # Landing page
├── package.json
├── public/
│   ├── Assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── app.js       # Main client logic
│   │   │   └── jquery-3.4.1.min.js
│   │   └── images/
│   └── attachment/          # User-uploaded files (auto-created)
└── node_modules/
```

## Running the Application

### Development Mode
```bash
npm start
# or
nodemon server.js
```

### Production Mode
```bash
node server.js
```

## Production Deployment Considerations

### 1. **SSL/HTTPS Required**
WebRTC requires HTTPS in production. You need:
- SSL certificate (Let's Encrypt recommended)
- Update `server.js` to use HTTPS:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

const server = https.createServer(options, app);
```

### 2. **Environment Variables**
Create a `.env` file for production:
```env
PORT=3000
NODE_ENV=production
```

Update `server.js` to use environment variables:
```javascript
const PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
});
```

### 3. **Process Manager**
Use PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "meet-app"
pm2 save
pm2 startup
```

### 4. **Reverse Proxy (Nginx)**
Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 5. **Firewall Configuration**
Open required ports:
```bash
# HTTP
sudo ufw allow 80/tcp
# HTTPS
sudo ufw allow 443/tcp
# Application port (if not using reverse proxy)
sudo ufw allow 3000/tcp
```

### 6. **File Upload Directory**
Ensure the `public/attachment/` directory has proper permissions:
```bash
mkdir -p public/attachment
chmod 755 public/attachment
```

### 7. **STUN/TURN Servers**
For production, consider using your own TURN server or a service like Twilio:
- Current STUN servers: Google's public STUN servers
- For NAT traversal in restrictive networks, add TURN servers in `app.js`

### 8. **Monitoring & Logging**
- Use PM2 logs: `pm2 logs meet-app`
- Consider integrating services like:
  - Sentry for error tracking
  - LogRocket for session replay
  - New Relic for performance monitoring

### 9. **Security Considerations**
- Enable CORS properly if needed
- Implement rate limiting (express-rate-limit)
- Add helmet.js for security headers
- Validate and sanitize file uploads
- Implement authentication/authorization if required

### 10. **Scaling Considerations**
For high traffic:
- Use Redis adapter for Socket.io to enable horizontal scaling
- Load balancer with sticky sessions
- CDN for static assets

## Testing the Deployment

1. Visit `https://yourdomain.com` - should show landing page
2. Click "New Meeting" - should generate a meeting ID and redirect
3. Join with another browser/device using the meeting link
4. Test video/audio streaming
5. Test screen sharing
6. Test file sharing
7. Test chat functionality

## Common Issues

### WebRTC not working
- Ensure HTTPS is enabled
- Check STUN/TURN server configuration
- Verify firewall allows WebRTC ports (UDP 3478, TCP 443)

### Socket.io connection fails
- Check WebSocket support in reverse proxy
- Verify CORS settings
- Check firewall rules

### File uploads failing
- Check directory permissions
- Verify file size limits in nginx/express

## Support Information
- **Author**: EBS (Developed by Naim Siddiqui)
- **Version**: 1.0.0
- **License**: ISC

## Quick Deployment Checklist
- [ ] Install Node.js and npm
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Configure SSL certificates
- [ ] Set up environment variables
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up PM2 process manager
- [ ] Configure firewall
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure backups for uploaded files
