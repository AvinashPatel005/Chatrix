# implementation_plan.md

## Objective
Completely overhaul the backend and frontend to support a robust, many-to-many Language Exchange system where connections are strictly scoped to specific language pairs.

## 1. Database Schema Overhaul

### User Model (`User.js`)
- **Remove**: `nativeLanguage` (String), `learningLanguage` (String), `skillLevel` (String)
- **Add**:
  - `nativeLanguages`: Array of Strings (e.g., `['en', 'fr']`)
  - `learningLanguages`: Array of Objects
    ```javascript
    [
      { language: 'es', level: 'intermediate' },
      { language: 'de', level: 'beginner' }
    ]
    ```
  - `timezone`: String (e.g., 'UTC-5')
  - `isOnline`: Boolean

### Conversation/Connection Model (`Conversation.js`)
- **Add**:
  - `languages`: Array of Strings (e.g., `['en', 'es']`) representing the exchange pair.
  - `status`: String (`'pending'`, `'accepted'`, `'rejected'`) - acts as the Friend Request.
  - `requester`: ObjectId (User who sent the request).
  - `recipient`: ObjectId.
  - `learningMap`: Object defining roles for this specific connection:
    ```javascript
    {
      [userIdA]: 'es', // User A is learning Spanish
      [userIdB]: 'en'  // User B is learning English
    }
    ```

## 2. Backend Logic Updates

### Connection Controller (`chatController.js` or `connectionController.js`)
- **`findMatches`**: 
  - Complex aggregation: Find users where (My Native ∈ Their Learning) AND (My Learning ∈ Their Native).
- **`sendRequest`**: 
  - Create a `Conversation` with status `pending`.
  - Validate that this specific pair doesn't already exist.
- **`acceptRequest`**:
  - Update status to `active`.
- **`getConversations`**:
  - Return only `active` conversations.
- **`getRequests`**:
  - Return `pending` conversations where `recipient` is current user.

## 3. Frontend Overhaul

### Profile Setup (`Register.jsx` / `Profile.jsx`)
- Support adding multiple Native languages.
- Support adding multiple Learning languages with slider/select for proficiency.

### Discovery / Matching (`Sidebar.jsx` -> `MatchingView`)
- Show "Compatible Users" based on the new logic.
- "Connect" button opens a modal to choose *which* language pair to connect on (if multiple options exist).

### Sidebar (`Sidebar.jsx`)
- Tabs: "Chats" (Active), "Requests" (Pending), "Discover".
- Chat list items must show the *Language Pair* flag/icon (e.g., "🇺🇸 ↔ 🇪🇸") to distinguish connections with the same user.

### Chat Window
- Enforce the "Scope": Only allow translation/tools relevant to the specific language pair of the connection.

## 4. Migration Steps
1. Update Models.
2. Update Auth/Register Controllers.
3. Update Chat/Match Controllers.
4. Update Frontend Registration.
5. Update Frontend Sidebar & Discovery.
