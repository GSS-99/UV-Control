```md

# UV Control ☀️

UV Control is a web application that displays solar UV radiation forecasts, provides skincare tips, and educates users on sun safety and solar radiation.

## 🌐 Features

- 🔒 User authentication (Email/Password and Google)
- 📍 Location-based UV index forecast
- 🧴 Skincare recommendations
- 📚 Educational content on solar radiation

## 🚀 Tech Stack

- **Frontend**: HTML, CSS, JS (Vanilla or Framework)
- **Backend**: Firebase Authentication, Firestore (if applicable)
- **Auth Methods**: Email/Password, Google Sign-In (popup)
- **Hosting**: Firebase Hosting / Local Dev

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🛠️ Getting Started

1. **Clone** the repository  
```bash
git clone https://github.com/yourusername/uv-control.git
cd uv-control

2.	Set up Firebase
	•	Create a Firebase project at console.firebase.google.com
	•	Enable Authentication methods
	•	Get your web app credentials and paste them into /path/to/config.js

3.	Run the project (if using any bundlers or dev server)
npm install
npm run dev

⚠️ Do not commit your `serviceAccountKey.json` or API keys. This project includes a `.gitignore` that protects sensitive files. Always use environment variables or config files not tracked by Git.

## 🌄 Screenshots

![UV Control Screenshot](./screenshots/homepage.png)

## 🔗 Live Demo

[Try the app here](https://your-firebase-project.web.app)
