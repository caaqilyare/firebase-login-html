# 🚀 Modern Firebase Dashboard

A sleek and modern dashboard application built with Firebase, featuring a beautiful dark/light mode interface and powerful data management capabilities.

## ✨ Live Demo

Check out the live demo: [Modern Firebase Dashboard](https://caaqilyare.github.io/firebase-login-html/)

### 🔑 Test Credentials
- Email: `test@admin.com`
- Password: `test123`

> ⚠️ **Important Note About Test Account**
> - This is a shared test account that everyone can access
> - Please be considerate when using the test account
> - Any data you add can be viewed by others
> - Others may edit or delete your data
> - Use this account only for testing features
> - For personal use, please set up your own Firebase instance (instructions below)
> - Do not store any sensitive or personal information

## 🌟 Features

- **🎨 Beautiful UI/UX**
  - Modern and clean interface
  - Smooth animations and transitions
  - Responsive design for all devices
  - Dark/Light mode support

- **📝 Note Management**
  - Create and organize notes
  - Rich text formatting
  - Quick search and filtering

- **🔗 Link Management**
  - Save and organize URLs
  - Auto-fetch link metadata
  - Easy copy and share

- **🔐 Password Management**
  - Secure password storage
  - Password visibility toggle
  - Optional website links

- **👥 Contact Management**
  - Store contact information
  - Phone and email integration
  - Optional notes and addresses

## 🛠️ Technical Features

- **🔥 Firebase Integration**
  - Real-time data synchronization
  - Secure authentication
  - Cloud Firestore database

- **🎯 Modern Web Technologies**
  - Tailwind CSS for styling
  - Font Awesome icons
  - Responsive grid layout

- **🔒 Security**
  - Secure password handling
  - Protected routes
  - Data encryption

## 📊 Dashboard Features

- **📈 Statistics**
  - Total items counter
  - Category-wise breakdown
  - Recent activity tracking

- **🎯 Quick Actions**
  - Add new items
  - Quick edit and delete
  - Type switching

## 🎨 Theme Support

- **🌓 Dark/Light Mode**
  - System preference detection
  - Manual toggle option
  - Persistent preference saving

## 🚀 Getting Started

### 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

4. Create Firestore Database:
   - Go to Firestore Database
   - Create database
   - Start in production mode
   - Choose a location closest to your users

5. Get Your Firebase Config:
   - Go to Project Settings (⚙️ icon)
   - Under "Your apps", click the web icon (</>)
   - Register your app with a nickname
   - Copy the firebaseConfig object

6. Update the Config:
   - Open `index.js`
   - Replace the existing config with your Firebase config:
   ```javascript
   var config = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

7. Security Rules:
   - Go to Firestore Database > Rules
   - Update the rules to:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### 📱 Running the App

1. Clone the repository
2. Update Firebase config as described above
3. Open `index.html` in your browser
4. Create a new account or use existing credentials

## 💡 Usage Tips

- Use the theme toggle in the top-right corner to switch between dark and light modes
- Click the eye icon to reveal passwords
- Use the type selector to switch between different item types
- All data is automatically saved and synced

## 🔧 Technical Stack

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript
- Firebase (Authentication & Firestore)
- Font Awesome Icons

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [Munasar @caaqilyare](https://github.com/caaqilyare)
