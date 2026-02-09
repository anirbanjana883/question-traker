# 🚀 Prep Flow  
### Structured interview prep, reimagined.

**Prep Flow** is a high-performance, interactive DSA tracking platform .  
It provides a clean, intuitive single-page experience for managing large interview preparation sheets with smooth drag-and-drop reordering, hierarchical organization, and modern UX optimizations.

---

## 📋 Table of Contents
- 🌟 Key Features  
- 🛠 Tech Stack  
- 📂 Project Structure  
- ⚡ Installation & Setup  
- 📡 API Documentation  
  - Data Retrieval  
  - Management (CRUD)  
  - Interactions  
  - Reordering Engine  
- 🏗 Architecture & Optimizations  
- 🐛 Troubleshooting  

---

## 🌟 Key Features

### ⚡ Advanced Drag & Drop
Built with **@dnd-kit**, featuring:
- Smooth drag interactions
- DragOverlay “ghost” previews
- Stable collision detection
- Optimistic UI updates for instant feedback

### 🗂 Hierarchical Data Model
Three-level normalized hierarchy:
- **Topics** (e.g., Arrays)  
- **Sub-Topics** (e.g., Logic Building)  
- **Questions**

Designed for scalability and fast reordering.

### 🔍 Global Search
Command-palette style search that:
- Instantly filters questions
- Switches from hierarchical view to a flat, searchable table
- Keeps drag-and-drop logic isolated from derived views

### ✏️ Full CRUD Support
Create, rename, update, and delete:
- Topics
- Sub-Topics
- Questions  

All destructive actions include safety confirmations.

### 📌 Pinning System
- Pin important questions to the top of a sub-topic
- Pinned items are visually highlighted
- Pinned questions are locked from dragging to preserve priority

### 🎨 TUF-Inspired Aesthetic
Custom Tailwind configuration inspired by the **Striver / TakeUForward** red-and-black dark theme, while maintaining original design decisions.

---

## 🛠 Tech Stack

### Frontend (Client)
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v3.4 
- **State Management:** Zustand (normalized global store)
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Local JSON Store (file-system based persistence)
- **Utilities:** `uuid`, `cors`, `body-parser`

---

## 📂 Project Structure

```bash
root/
├── backend/
│   ├── controllers/
│   │   ├── mainController.js     # CRUD + Pin logic
│   │   └── reorderController.js  # Drag & Drop reorder engine
│   ├── routes/
│   │   └── api.js                # API route definitions
│   ├── scripts/
│   │   ├── seed.js               # Database seeding & normalization
│   │   └── sheet.json            # Raw source data
│   ├── store/
│   │   ├── store.js              # File-system persistence layer
│   │   └── data.json             # Live database
│   ├── index.js                  # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios instance
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   ├── QuestionItem.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── SubTopicItem.jsx
│   │   │   └── TopicItem.jsx
│   │   ├── hooks/
│   │   │   └── useSortableItem.js
│   │   ├── store/
│   │   │   └── useSheetStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── tailwind.config.js
│
└── README.md
```

## ⚡ Installation & Setup

*1️⃣ Backend Setup*
```
cd backend
npm install
```
Seed the Database (Required)
```
node scripts/seed.js
# Database seeded! Created X topics and Y questions.
```
Start Server
```
node index.js
# Server running on http://localhost:5000
```
**2️⃣ Frontend Setup**
```
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```
## 📡 API Documentation
```
Base URL: http://localhost:5000/api
```

**1. Get Sheet Data**

Fetches the entire normalized sheet.

Endpoint: `GET /sheet`
```
{
  "success": true,
  "data": {
    "sheet": { "topicOrder": ["topic-1", "topic-2"] },
    "topics": {},
    "subTopics": {},
    "questions": {}
  }
}
```
**2. Add Items**

Generic creation endpoint.

Endpoint: `POST /add`
```
{ "type": "topic", "title": "Dynamic Programming" }
{ "type": "subTopic", "parentId": "topic-1", "title": "1D DP" }
{
  "type": "question",
  "parentId": "sub-1",
  "title": "Climbing Stairs",
  "link": "https://leetcode.com/...",
  "difficulty": "Easy"
}
```
**3. Update Items**

Rename or edit question details.

Endpoint: `PUT /update`
```
{
  "type": "question",
  "id": "q-123",
  "title": "New Title",
  "link": "https://new-link.com",
  "difficulty": "Hard"
}
```
**4. Pin / Unpin Question**

Toggles pinned state.

Endpoint: `POST /pin`
```
{ "id": "q-123" }
```
**5. Delete Items**

Deletes an item and updates ordering.

Endpoint: `POST /delete`
```
{
  "type": "question",
  "id": "q-123",
  "parentId": "sub-1"
}
```
**6. Reorder Items**

Handles drag-and-drop reordering.

Endpoint: `PUT /reorder`
```
{
  "type": "question",
  "sourceParentId": "sub-1",
  "destParentId": "sub-1",
  "sourceIndex": 2,
  "destIndex": 5
}
```
## 🏗 Architecture & Optimizations

**1️⃣ Normalized State (Zustand)**

Data is flattened like a relational database.

Why:

- O(1) lookups

- Easy reordering

- No deep mutations


**2️⃣ Render Optimization**

All draggable components use React.memo.

Result:

Only the active item re-renders during drag — others stay static.

**3️⃣ DragOverlay (Ghost Layer)**

A cloned preview is rendered in a portal during drag.

Benefit:

No layout shifts, smooth visuals, stable nesting.

**4️⃣ Collision Detection Strategy**

Uses pointerWithin instead of closestCorners.

Why:

More stable behavior in nested, variable-height layouts.

## 🐛 Troubleshooting

**❌ “No topics yet”**
Fix:
```
cd backend
node scripts/seed.js
node index.js
```
**❌ Drag feels stuck or delayed**

Explanation:

A small activation distance is used to prevent accidental drags when clicking action buttons.

**❌ Icons look oversized while dragging**

Fix:

Ensure DragOverlay styles do not apply scale transforms.

**❤️ Closing Note
Built with care to demonstrate real-world frontend architecture, performance-aware drag-and-drop, and clean state management — not just feature completeness.**

### Happy prepping 🚀

## 🚀 ANIRBAN JANA 🚀