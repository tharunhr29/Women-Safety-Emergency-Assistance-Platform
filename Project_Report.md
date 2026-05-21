# SafeGuard: Women Safety & Emergency Assistance Platform
## Complete Institutional Engineering & Project Report (A-Z)

---

## 1. Executive Summary & Problem Statement

### The Problem
Personal safety, particularly for women traveling alone, in high-risk zones, or during late hours, remains a critical global challenge. Standard safety responses and traditional emergency telephone services (such as dialing 911 or local equivalents) are prone to several systemic limitations:
1. **Dispatch Delays**: Centralized dispatchers take crucial minutes gathering details before routing help.
2. **Lack of Immediate Local Context**: Standard services cannot efficiently alert nearby bystanders or community members who are within walking distance and could intervene immediately.
3. **Inability to Track Dynamic Targets**: If a victim is fleeing, moving, or in transit, standard dispatchers cannot dynamically follow their live, continuous coordinates.
4. **Boy Who Cried Wolf Effect**: False alarms and SOS button abuse often waste critical resources and desensitize emergency personnel.

### The Solution
**SafeGuard** is a hyper-local, community-driven emergency network. It bridges the gap between centralized emergency services and local, real-time intervention. 
By tapping into WebSockets, device-level GPS tracking, and a trusted, verified network of physical community volunteers, SafeGuard ensures that:
* Distressed individuals can broadcast their coordinates instantly.
* **Verified volunteers** in the immediate vicinity receive instantaneous notifications and navigation routes.
* Victim movement is broadcast in real time to the rescuer's screen.
* Safe Zones (hospitals, police stations, trusted sanctuaries) are mapped visually with interactive support networks.
* Strict role boundaries and anti-abuse protocols maintain the platform's trust, reliability, and speed.

---

## 2. Complete System Architecture & Flow

The following sequence illustrates the real-time operational flow of the system during an active emergency incident:

```mermaid
sequenceDiagram
    autonumber
    actor Victim as Distressed User (Victim)
    actor Vol as Verified Volunteer
    participant Serv as Node.js & Socket.io Server
    database DB as MongoDB Database
    actor Admin as System Administrator

    Note over Vol, Admin: Admin must verify Volunteer first
    Admin->>Serv: PUT /api/admin/users/:id/verify (Verify Volunteer)
    Serv->>DB: Update isVerified = true
    
    Note over Victim: Victim triggers SOS
    Victim->>Serv: POST /api/alerts (Create Alert with current GPS)
    Serv->>DB: Write Alert (status: "active")
    Victim->>Serv: socket.emit('join_room', alert.userId)
    Victim->>Serv: socket.emit('send_alert', alertData)
    
    Note over Serv: Socket.io broadcasts alert
    Serv-->>Vol: io.to('volunteers').emit('receive_alert')
    
    Note over Vol: Volunteer views alert & accepts
    Vol->>Serv: PUT /api/alerts/:id/respond (Accept Alert)
    Serv->>DB: Add Volunteer to responders array
    Vol->>Serv: socket.emit('volunteer_responding')
    Serv-->>Victim: io.to(userId).emit('volunteer_responding')
    
    Note over Victim, Vol: Live Tracking Phase
    Victim->>Serv: socket.emit('update_location', coordinates)
    Serv-->>Vol: io.emit('location_updated') (Map centers on victim)
    
    Vol->>Serv: PUT /api/alerts/:id/status (Mark as Arrived)
    Serv->>DB: Update responder status to "arrived"
    Vol->>Serv: socket.emit('update_responder_status', 'arrived')
    Serv-->>Victim: io.to(userId).emit('responder_status_updated')
    
    Note over Victim: Victim marks safety
    Victim->>Serv: PUT /api/alerts/:id/resolve (I Am Safe Now)
    Serv->>DB: Update status = "resolved"
    Victim->>Serv: PUT /api/alerts/:id/rate (Submit ratings & feedback)
    Serv->>DB: Commit star rating & review comment
```

---

## 3. Comprehensive Technology Stack

The application is built on the **MERN (MongoDB, Express.js, React, Node.js)** stack, chosen specifically for its asynchronous, event-driven capabilities which are vital for real-time safety services.

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Frontend Core** | React.js (v19) | Powers the responsive, dynamic single-page application (SPA) architecture, enabling stateful layout changes (e.g. tracking screen overlay) without layout refreshes. |
| **Frontend Build Tool** | Vite (v8) | Replaced standard bundlers to gain lightning-fast Hot Module Replacement (HMR) and produce highly optimized, code-split production bundles. |
| **Global State** | React Context API | Powers global authentication and active session management (`AuthContext.jsx`), keeping auth tokens and role payloads accessible globally without prop drilling. |
| **Mapping Engine** | React-Leaflet & Leaflet.js | Renders dynamic map canvases, overlays, custom icons, safety rings, and live-drawing GPS markers on the client. |
| **Real-time Comms** | Socket.io-Client (v4) | Keeps a persistent two-way TCP connection open with the server, permitting low-latency location broadcasts and instant notification delivery. |
| **Styling** | Vanilla CSS + Lucide Icons | Premium styling using a curated HSL color palette, dark mode defaults, backdrop filters (glassmorphism), and modern micro-animations. |
| **Backend Engine** | Node.js & Express.js | An asynchronous, non-blocking runtime environment capable of managing thousands of concurrent network connections during critical emergencies. |
| **Database** | MongoDB & Mongoose | NoSQL structure stores location histories, emergency contact sub-documents, and live active incident logs in flexible JSON-like documents. |
| **Memory Fallback** | MongoMemoryServer | Serves as an automatic memory-backed database fallback in restrictive server/ISP environments blocking external Atlas cloud clusters, ensuring high availability. |

---

## 4. Detailed Database Schemas (Models)

### A. The User Schema (`User.js`)
Stores the profile and authorization details for standard users, volunteers, and administrators.
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["user", "volunteer", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false }, // Critical admin validation flag
  bloodGroup: { type: String, default: "" },
  medicalConditions: { type: String, default: "" },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true }
  }],
  falseAlarmCount: { type: Number, default: 0 }, // Tracks SOS abuse
  sosBanUntil: { type: Date } // Active penalty timeline
});
```

### B. The Alert Schema (`Alert.js`)
Acts as the central transaction log of an emergency, tracking the victim, geographical coordinates, rescue status, and responder ratings.
```javascript
const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: { type: String, enum: ["active", "resolved", "dismissed", "false_alarm"], default: "active" },
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  responders: [{
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['en_route', 'arrived'], default: 'en_route' },
    timestamp: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 }, // Rating given by victim to this volunteer
    feedback: { type: String } // Text comment from the victim
  }]
});
```

### C. The Safe Zone Schema (`SafeZone.js`)
Defines trusted community sanctuaries plotted on the map.
```javascript
const safeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["police", "hospital", "community_center", "other"], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  contactNumber: { type: String }
});
```

---

## 5. Comprehensive REST API Specifications

All endpoints (excluding `/api/users/login` and `/api/users/register`) are protected by JWT tokens passed inside the `Authorization: Bearer <token>` header.

### A. Authentication & Registration (`userRoutes.js`)
* `POST /api/users/register` - Creates a new user profile. Role defaults to `"user"`, but can be set to `"volunteer"`.
* `POST /api/users/login` - Authenticates credentials, returns signed JWT token, profile details, and role metadata.
* `GET /api/users/profile` - Retrieves detailed profile information for the logged-in session.
* `PUT /api/users/profile` - Updates medical details, blood group, and emergency contacts.

### B. Emergency Alerts (`alertRoutes.js`)
* `POST /api/alerts/` - Triggers a new emergency incident. Automatically fetches device location and broadcasts the alert.
* `GET /api/alerts/history` - Pulls historical incident logs for the logged-in user.
* `PUT /api/alerts/:id/resolve` - Resolves an active SOS, ending broadcasts.
* `PUT /api/alerts/:id/rate` - Allows the victim to rate and leave written feedback for active responders.

### C. Secured Volunteer Operations (`alertRoutes.js` via `verifiedVolunteer`)
* `GET /api/alerts/active` - Pulls list of all active emergencies. Restricted to verified volunteers only.
* `PUT /api/alerts/:id/respond` - Registers the volunteer as a responder. Restricted to verified volunteers only.
* `PUT /api/alerts/:id/status` - Updates responder status (e.g. from `'en_route'` to `'arrived'`). Restricted to verified volunteers only.

### D. Administrative Control Panel (`adminRoutes.js` via `admin`)
* `GET /api/admin/users` - Fetches all registered users, volunteer metrics, and verification states.
* `PUT /api/admin/users/:id/verify` - Verifies an unverified volunteer, elevating their access.
* `PUT /api/admin/users/:id/role` - Overrides a user's role (elevates to admin or demotes).
* `DELETE /api/admin/users/:id` - Deletes a user profile from the platform.
* `GET /api/admin/alerts` - Retrieves all alert logs, including active, resolved, and false alarms.
* `PUT /api/admin/alerts/:id/false-alarm` - Marks an alert as a false alarm, applying disciplinary penalties.
* `POST /api/admin/safe-zones` - Creates a new safe zone sanctuary (coordinates parsed strictly to floats).
* `GET /api/admin/safe-zones` - Retrieves all mapped safe zones.
* `DELETE /api/admin/safe-zones/:id` - Removes a safe zone from the maps.

---

## 6. Real-Time Synchronization Protocol (WebSockets)

Real-time interactions are managed by a centralized Socket.io gateway inside `server.js` matching standard event payloads:

```
                  ┌───────────────────────┐
                  │   Socket.io Gateway   │
                  │      (server.js)      │
                  └───────────┬───────────┘
            ┌─────────────────┼─────────────────┐
    Volunteers Room     Victim Room        Admins Room
     ('volunteers')     (userId String)     ('admins')
```

1. **`join_room` (Payload: `userId`)**:
   Victims join a room designated by their user ID. Responders emit updates to this room, ensuring only the target victim receives status changes.
2. **`join_volunteer`**:
   Verified volunteers join the `'volunteers'` channel on login to receive immediate, passive alert broadcasts.
3. **`send_alert` (Payload: `alertData`)**:
   Fires when an SOS is raised. Broadcasts alert parameters immediately to `'volunteers'` and `'admins'` channels without pulling from DB.
4. **`volunteer_responding` (Payload: `{ userId, volunteerId, volunteerName, volunteerPhone }`)**:
   Notifies the victim's dashboard room that a specific rescuer has accepted the request.
5. **`update_responder_status` (Payload: `{ userId, volunteerId, status }`)**:
   Pushes live status transitions (e.g., "Arrived") straight to the victim's screen.
6. **`update_location` (Payload: `{ userId, lat, lng }`)**:
   Pushed by the victim's geolocation tracker. Broadcasts live coordinate changes to volunteers currently tracking the incident.

---

## 7. Crucial Security & Reliability Subsystems

### A. Strict Admin Verification & Role Security
To prevent unauthorized users from spying on active alerts, security is enforced dynamically:
* **Backend Security**: Built `verifiedVolunteer` middleware in [authMiddleware.js](file:///c:/Users/tharu/OneDrive/Desktop/Women_Safety_Platform/server/middleware/authMiddleware.js) that checks if `req.user.role === 'volunteer' && req.user.isVerified === true`. This intercepts requests at the routing level for `/api/alerts/active`, `/respond`, and `/status`. Unverified users are rejected with `403 Forbidden`.
* **Frontend Security**:
  * Unverified volunteers logging into the platform are presented with a glowing crimson **"Verification Pending"** warning state card on [VolunteerDashboard.jsx](file:///c:/Users/tharu/OneDrive/Desktop/Women_Safety_Platform/client/src/pages/VolunteerDashboard.jsx). Real-time sockets and alert fetching are blocked.
  * Direct deep-link routing is protected by a check inside `ActiveIncident.jsx` that automatically navigates unverified volunteers back to their dashboard.

### B. Intelligent Redundancy: "Already Responding" Prevention
* **The Problem**: A volunteer already responding to an alert might reload their dashboard or click the respond button again. The backend responds with `400 "Already responding to this alert"`, which previously blocked the UI with intrusive alert popups.
* **The Fix**:
  * **Interactive Action Button**: [VolunteerDashboard.jsx](file:///c:/Users/tharu/OneDrive/Desktop/Women_Safety_Platform/client/src/pages/VolunteerDashboard.jsx) scans the `responders` array of active alerts. If the logged-in volunteer's ID is found, the button dynamically updates to a premium Indigo glassmorphic **"VIEW INCIDENT"** button. This routes them directly to `/incident/:id` bypassing the backend respond API.
  * **Fallback Handling**: If a race condition occurs and they hit the backend respond API, the catch block intercepts the `"Already responding to this alert"` string, immediately navigating the volunteer to the incident tracking screen without throwing any error alerts.

### C. Active SOS & Tracking Session Persistence
* **The Problem**: Refreshing the browser clears all local React states. A victim or volunteer reloading their page would lose the tracking UI and active responder logs.
* **The Solution**:
  * **Victim Session Restoration**: On dashboard mount, `Dashboard.jsx` queries the backend history API (`/history`). If the latest alert status is `"active"`, it automatically rebuilds the SOS active state, retrieves coordinates, and draws the active responder cards.
  * **Volunteer Session Restoration**: [ActiveIncident.jsx](file:///c:/Users/tharu/OneDrive/Desktop/Women_Safety_Platform/client/src/pages/ActiveIncident.jsx) checks for missing location states on load. If missing (from a refresh), it calls `/api/alerts/active`, finds the matched incident by URL parameter `id`, and dynamically restores coordinates, map markers, and status ("En Route" / "Arrived").

### D. Disciplinary Engine (Anti-Abuse System)
To prevent platform fatigue and false emergency triggers:
1. Admins inspect alerts inside their dashboard. If an alert is marked as a false alarm, `PUT /api/admin/alerts/:id/false-alarm` fires.
2. The server increments the user's `falseAlarmCount` by 1.
3. If this count reaches **3**, the system applies an automatic suspension, setting `sosBanUntil` to exactly **15 days in the future**.
4. During this suspension, any attempt by the user to trigger the SOS button is blocked at the routing level with a `403 Forbidden` error. On the client, the SOS button turns gray and displays a warning banner stating the exact ban expiration date.

### E. Double-Geolocation Fallback & Map Alignment
* **Gray Canvas Leaflet Fix**: Leaflet containers loaded inside CSS animations often calculate bounds prematurely, leading to half-rendered gray boxes. We fixed this by adding a dynamic `RecenterMap` sub-component that triggers a delayed (400ms) `map.invalidateSize()` after DOM mounting completes, ensuring full-bleed tile rendering.
* **Double-Geolocation**: On dashboard mount, the app initiates city-level IP geolocation (via IPAPI) as an immediate fallback (~200ms) to center the map on the user's general area. Once high-accuracy GPS permissions are accepted by the user, the map smoothly pans and centers on their exact GPS coordinates.

---

## 8. Volunteer Rating & Performance Feedback System

To ensure volunteer accountability and recognize outstanding rescuers, the platform includes a fully integrated rating and review system:

### A. Gold-Star Rescuer Feedback Modal
Upon marking themselves safe via the **"I Am Safe Now"** button, victims are not immediately kicked out to the main screen. Instead, they are presented with an interactive glassmorphic review modal:
* Renders individual star selections (1 to 5 stars) and review text boxes for **each responder** who assisted them.
* Stars animate on hover and feature a glowing golden shadow effect.
* Submitting coordinates triggers `PUT /api/alerts/:id/rate`, updating the sub-documents in the `responders` array of the Alert model before restoring the dashboard.

### B. Admin Inspector Analytics
The Admin Control Panel aggregates this feedback dynamically:
* Volunteer lists compute overall performance ratios: **Total accepted missions**, **Average star rating** (e.g. `★ 4.8`), and total ratings count.
* Clicking on any volunteer opens a timeline grouping details of their past missions: victim names, dynamic star counts, written feedback comments, and chronological timestamps.

---

## 9. Frontend Design System & UX Philosophy

SafeGuard uses a custom dark-mode glassmorphic styling system to provide a calm, modern, and highly legible interface during high-stress emergency situations.

* **Curated Harmonious Color Palette**:
  ```css
  :root {
    --background: #0b0f19;      /* Sleek dark-blue background */
    --glass-bg: rgba(30, 41, 59, 0.4); /* Glassmorphic container backgrounds */
    --glass-border: rgba(255, 255, 255, 0.08);
    --primary: #6366f1;         /* Indigo accents for action prompts */
    --danger: #ef4444;          /* Vivid red for primary alerts & SOS */
    --success: #10b981;         /* Emerald green for safety state confirmations */
    --text-muted: #94a3b8;
  }
  ```
* **Backdrop Blur Glassmorphism**: Cards feature `backdrop-filter: blur(16px)` and `border: 1px solid var(--glass-border)`, giving a premium layered look.
* **Micro-Animations**: All primary buttons use smooth scale transforms (`transform: scale(0.98)` on active clicks) and hover translations for instant tactile confirmation.
* **SOS Glow Pulse**: The primary SOS button features an infinite keyframe pulse animation, drawing immediate visual attention upon landing.
* **Responsive Fluid Grids**: Flexible CSS Flexbox and responsive grids dynamically rearrange elements (e.g. map vs side panel details) between vertical mobile phone layouts and wide desktop monitor dashboards.

---

## 10. Deployment & Hosting Setup

The system is designed with a decoupled architecture, allowing independent scaling of the client and backend API:

```
┌─────────────────────────────────┐      ┌─────────────────────────┐
│         Vercel Client           │      │   Render Backend API    │
│  (Static React, Leaflet Maps)   ├─────►│  (Node.js, Express, WS) │
└─────────────────────────────────┘      └────────────┬────────────┘
                                                      │
                                         ┌────────────┴────────────┐
                                         │      MongoDB Database   │
                                         │    (Mock RAM or Atlas)  │
                                         └─────────────────────────┘
```

1. **Frontend Hosting (Vercel)**:
   * Compiles the client code into static HTML, CSS, and JS assets served via high-speed global Edge CDNs.
   * Leverages a `vercel.json` SPA rewrite rule to route all requests back to `index.html`, allowing React Router to handle page routes (like `/incident/:id`) without 404 errors.
2. **Backend Engine Hosting (Render)**:
   * Automatically pulls the latest `server/` code from GitHub on commit.
   * Runs the server environment exposing secure HTTPS REST and WebSocket endpoints.
   * Dynamically switches to an in-memory database configuration (`MongoMemoryServer`) if external Atlas database servers are blocked by network/ISP constraints, ensuring 100% platform uptime.
