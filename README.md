# SafeGuard - Women's Safety Platform

SafeGuard is a comprehensive, responsive web-based platform designed to enhance women's safety through rapid emergency requests, live location tracking, and seamless coordination between users, verified volunteers, and system administrators. 

## 🎯 Primary Objectives
- Provide immediate emergency assistance to women.
- Connect users with nearby verified support resources.
- Enable real-time location sharing during emergencies.
- Improve response time and safety outcomes.

## 🌟 Secondary Objectives
- Build a trusted network of volunteers and responders.
- Increase awareness of safety resources.
- Enable scalable deployment across cities and regions.

## 📈 Key Performance Indicators (KPIs)
- Number of registered users.
- Total emergency alerts triggered.
- Average response time to emergencies.
- Successful assistance rate (resolved alerts).
- Volunteer response and engagement rate.
- Monthly active users (MAU).

## ⚙️ Non-Functional Requirements
- **Performance:** Emergency alerts delivered within milliseconds via persistent WebSockets.
- **Security:** Fully encrypted user data (Bcrypt), secure JWT authentication, and strict role-based access.
- **Usability:** Panic-friendly UI featuring large, accessible components designed for minimal interaction during high-stress situations.
- **Scalability:** Node.js architecture handles high concurrent emergency requests natively.

## ⚠️ Assumptions & Constraints

### Assumptions
- **Verified Responders:** Volunteers and support teams are actively verified by administrators before gaining access.
- **Data Accuracy:** Users take responsibility to keep their emergency details and contacts updated.
- **Connectivity:** Internet connectivity (and GPS access) is available to the user during emergencies for accurate tracking.

### Constraints
- **Law Enforcement:** No direct or automated law enforcement system integration in Phase 1.
- **Resources:** Built under a fixed development timeline and budget.
- **Platform Scope:** Exclusively a web-only platform initially (no native iOS/Android application).

## 📦 Deliverables
- **Functional Web Application:** The complete, responsive React.js platform.
- **Admin Dashboards:** Secure portals for platform management and report generation.
- **Technical Documentation:** This comprehensive `README.md` serving as the technical PRD and setup guide.
- **Deployment-Ready Build:** A completely containerizable or hostable MERN stack codebase.

## 📋 Scope of Work

### In-Scope
- **Web-based platform:** Fully responsive design accessible on both desktop and mobile web browsers.
- **Emergency request and alert system:** One-click SOS functionality for immediate assistance.
- **Coordination System:** Dedicated dashboards and workflows for volunteers, support teams, and authority coordination.
- **Live Tracking:** Real-time location sharing and active incident tracking via WebSockets.

### Out of Scope
- Native mobile application (iOS/Android).
- Direct backend integration with official police emergency dispatch systems.
- Wearable or IoT hardware device integration.

---

## 🔄 User Flow (High-Level)
1. **Onboarding:** User registers an account and securely completes their personal safety profile.
2. **Setup:** User adds trusted emergency contacts (name, phone, relationship).
3. **Emergency Trigger:** In a high-stress situation, the user taps the prominent one-click SOS button on the dashboard.
4. **Broadcast:** The platform instantly broadcasts a high-priority alert along with the user's live GPS location.
5. **Notification:** Nearby verified volunteers and system admins are immediately notified via real-time WebSockets.
6. **Response:** An available responder accepts the request ("RESPOND NOW"), updating their status to 'En Route', and moves to assist.
7. **Resolution:** Once the situation is handled, the incident is securely tracked, marked as resolved, and logged in the emergency history.

---

## ✨ Key Features

### User (Women) Features
- **User Registration & Login:** Secure authentication to access the platform.
- **Personal Safety Profile:** Create and manage a personal safety profile including medical info.
- **Emergency Contacts:** Add and manage trusted emergency contacts.
- **One-Click SOS Emergency Button:** Trigger instant emergency alerts.
- **Real-Time Location Sharing:** Share live location with responders during emergencies using `Socket.io`.
- **View Nearby Support:** View nearby support teams and safe zones on an interactive map.
- **Emergency Alert History:** Access a historical log of past emergency alerts.

### Volunteer / Support Team Features
- **Volunteer Registration & Verification:** Specialized onboarding process with admin approval required for full access.
- **Receive Nearby Alerts:** Instantly receive and monitor localized emergency SOS broadcasts.
- **Accept/Decline Requests:** Rapidly review incoming emergencies and choose to respond to those within range.
- **View Location & Details:** Access an interactive map with the user's live location and incident details.
- **Update Response Status:** Keep the system and the user updated by marking status as 'En Route' or 'Arrived'.

### System & Admin Features
- **Manage Users & Teams:** Manage users, volunteers, and support teams (including role updates and account deletions).
- **Verify Volunteers:** Review and officially verify new volunteer and responder applications.
- **Monitor Emergency Alerts:** View real-time active emergencies for high-level coordination and monitoring.
- **Manage Safety Zones:** Add, remove, and manage localized safe zones and resources on the map.
- **Reports & Analytics:** Generate historical incident and performance reports, exportable to PDF.
- **Interactive Maps:** Real-time map rendering for live tracking and safe zone identification.

---

## 🗄️ Data Requirements & Core Entities

### Core Entities
- **Users:** Primary users of the platform with detailed safety profiles.
- **Emergency Contacts:** Trusted individuals linked directly to user profiles.
- **Volunteers:** Verified responders capable of receiving active alerts.
- **Alerts:** The central entity tracking an active or historical emergency incident.
- **Locations:** GPS coordinate plotting used across alerts and tracking.
- **Safety Resources:** Designated "Safe Zones" managed by administrators (Hospitals, Police Stations).

### Sample Service Data Payload
When an emergency is triggered, the system relies on essential data packets containing:
- Unique User ID
- Precise Alert Timestamp
- Live GPS Location (Latitude & Longitude)
- Current Alert Status (e.g., Active, Resolved)
- Assigned Responders / Volunteers

---

## 🛠️ Technology Stack

### Frontend
- **HTML5, CSS3, JavaScript:** Core web technologies forming the foundation.
- **Framework:** Built entirely using **React.js** (Single Page Application).
- **Styling:** Custom Vanilla CSS utilizing advanced CSS variables for a premium Glassmorphism UI (Tailwind CSS/Bootstrap are intentionally bypassed for maximum design control).

### Backend
- **Server:** Node.js combined with the Express.js web framework.
- **Real-Time Communication:** Socket.io for persistent, low-latency WebSockets.

### APIs
- **REST APIs:** Comprehensive endpoints for alert routing, authentication, and user management.
- **Maps & Location APIs:** Integration with OpenStreetMap via `react-leaflet` for rendering interactive maps and plotting GPS coordinates.

### Database
- **Storage:** **MongoDB** (via Mongoose ODM).
- **Offline Fallback:** `mongodb-memory-server` to gracefully handle network restrictions.

---

## 🔮 Future Enhancements
- **Native Mobile Apps:** Deploy iOS and Android versions featuring a lock-screen SOS widget for even faster access.
- **Law Enforcement Integration:** Establish direct APIs with local police and ambulance dispatch centers.
- **Voice-Activated SOS:** Trigger alerts completely hands-free using custom voice commands.
- **Wearable Device Support:** Smartwatch and smart-jewelry integration (e.g., double-tap to trigger SOS).
- **AI-Based Risk Detection:** Predictive algorithms that analyze user movement and historical data to auto-detect potential risks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- A MongoDB cluster URI (or `mongodb-memory-server` for local offline testing).

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd Women_Safety_Platform
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

### Running the Application
To run the platform locally, you will need to start both the server and the client.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The application will be accessible at `http://localhost:5173`. 
*(Note: A default admin account `admin@safeguard.com` with password `admin123` is auto-generated on backend startup for testing purposes).*
