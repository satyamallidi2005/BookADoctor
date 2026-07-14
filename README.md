# Book a Doctor 🩺

Book a Doctor is a production-quality healthcare appointment booking web application that bridges the gap between patients and verified medical specialists. The system enables admin-guided practitioner onboarding, dynamic doctor availability configuration, interactive appointment scheduling, and consultation rating feedback.

---

## 🛠️ Tech Stack

### Frontend (BAD_client)
* **Core**: React 18, Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State & Routing**: React Router DOM (v6), Custom Auth Context hooks
* **API Client**: Axios

### Backend (server)
* **Server Framework**: Node.js, Express
* **Database**: MongoDB (Mongoose ODM)
* **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing
* **Validation**: Express-Validator & Mongoose Schema assertions

---

## 🚀 Key Features

* **Admin Dashboard**: onboarding of new practitioners, profile updates, and active doctor status toggles.
* **Doctor Availability Panel**: custom calendar day toggles and interactive `ClockPicker` for hourly slot batching.
* **Patient Portal**: specialist directory catalog search, real-time booking form, medical reports tracker, and consultation review submission.
* **Interactive Reviews**: completed consultation ratings (1-5 stars) dynamically recalculate overall medical specialist stats.
* **Responsive Architecture**: unified layout scaling across small mobile screens up to ultrawide monitors (320px - 2560px).

---

## 💻 Getting Started & Installation

Follow these steps to configure and run the application locally:

### Prerequisites
* **Node.js** (v16.x or newer)
* **MongoDB** (Local instance or Atlas connection string URI)

---

### Step 1: Clone & Setup Backend Server

1. Open your terminal and navigate to the project directory:
   ```bash
   cd server
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/book-a-doctor
   JWT_SECRET=your_jwt_super_secret_key_123
   JWT_EXPIRE=30d
   ```
4. Seed the default Administrator account:
   ```bash
   node seedAdmin.js
   ```
   *(Note: This creates the admin user: email `admin@gmail.com` | password `123456`)*

5. Run the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will start running on [http://localhost:5000](http://localhost:5000))*

---

### Step 2: Setup Frontend Client (BAD_client)

1. Open a new terminal window/tab and navigate to the client folder:
   ```bash
   cd BAD_client
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `BAD_client` root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the client development server:
   ```bash
   npm run dev
   ```
   *(The Vite development server will open the app on [http://localhost:5173](http://localhost:5173))*

---

## 🧪 Testing Credentials

Use the following preconfigured logins to inspect dashboard actions:

* **Administrator Role**:
  * **Email**: `admin@gmail.com`
  * **Password**: `123456`
