# ☁️ CloudDrive AI

> **Intelligent Serverless Cloud Storage Prototype powered by Google Gemini 2.5**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Powered%20by-Google%20Gemini-8E75B2)](https://ai.google.dev/)

CloudDrive AI is a next-generation cloud storage dashboard that demonstrates a **Simulated Serverless Microservices Architecture**. Unlike traditional storage, every file uploaded triggers an event-driven workflow where AI agents perform content moderation, classification, OCR text extraction, and accessibility metadata generation in real-time.

---

## ✨ Features

### 🧠 AI-Powered File Processing
Every upload is processed by **Google Gemini 2.5 Flash** to automatically:
*   **🛡️ Content Moderation**: Detects unsafe or sensitive content immediately.
*   **🏷️ Smart Classification**: Auto-tags images and suggests folder organization (e.g., "Finance", "Nature").
*   **📝 Optical Character Recognition (OCR)**: Extracts text from documents and images.
*   **👁️ Visual Description**: Generates alt-text and metadata for accessibility.

### 🏗️ Simulated Infrastructure
*   **Event Log Terminal**: Watch the "serverless" backend events trigger in real-time.
*   **System Health Monitor**: View the status and latency of simulated microservices.
*   **Database State Viewer**: Inspect the JSON document store state for your files.

### 🎨 Modern UI/UX
*   **Responsive Design**: Built with Tailwind CSS for a seamless experience on desktop and tablet.
*   **Dynamic Storage Quota**: Visual progress bars that react to file sizes.
*   **Account Management**: Complete settings interface for profile, billing, and notifications.

---

## 📸 Screenshots

> *Note: Replace the paths below with your actual screenshots after taking them.*

### 1. The Dashboard
*A clean, professional interface showing recent files and storage usage.*
![Dashboard Screenshot](docs/images/dashboard-preview.png)

### 2. AI Analysis Results
*Detailed breakdown of AI insights including Tags, OCR text, and Safety scores.*
![Analysis Modal](docs/images/analysis-preview.png)

### 3. Account Settings
*Manage user profile, billing plans, and notification preferences.*
![Settings Modal](docs/images/settings-preview.png)

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v16 or higher)
*   **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/clouddrive-ai.git
    cd clouddrive-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your API key:
    ```env
    # .env
    API_KEY=your_actual_gemini_api_key_here
    ```
    *> Note: In a Vite setup, you might need to prefix this with VITE_ or configure the build tool to expose `process.env`. This project uses a custom loader in the demo environment.*

4.  **Run the application**
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Visit `http://localhost:5173` to see the app in action.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI Engine**: Google GenAI SDK (`@google/genai`)
*   **Icons**: Lucide React
*   **State Management**: React Hooks (Context/State)

---

## 📂 Project Structure

```
src/
├── components/        # UI Components (FileCard, Modals, Sidebar)
├── services/          # API integrations & Simulated Microservices
│   └── geminiService.ts # Core AI logic
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main Application Controller
└── index.tsx          # Entry point
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
