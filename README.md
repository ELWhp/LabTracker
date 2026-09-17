# Lab Tracker & Resource Management System

A web application designed for lab scheduling, station management, technician capacity constraint tracking, and team collaboration. It can be run locally or deployed directly to **Google Drive / Google Apps Script** as a web app.

---

## 🚀 Step-by-Step Guide: Launching on Google Apps Script (Drive Scripts)

Follow these steps to deploy this Lab Tracker to Google Drive so everyone on your team can access and manage it:

### Step 1: Create a Google Apps Script Project
1. Go to [Google Drive](https://drive.google.com/) or [Google Apps Script](https://script.google.com/).
2. Click **New** > **More** > **Google Apps Script** (or create a new standalone script).
3. Name your project **"Lab Tracker & Resource Manager"**.

### Step 2: Add Backend Code (`Code.gs`)
1. In the Apps Script editor, open the default `Code.gs` file.
2. Replace all its content with the contents of `Code.gs` from this project repository.
3. Save the file (`Ctrl + S` or `Cmd + S`).

### Step 3: Bundle & Add Frontend (`Index.html`)
1. In the Apps Script editor, click **+** (Add a file) > **HTML** and name it `Index`.
2. Run `npm run build` locally in this project to generate the production single-file build artifact (or copy `dist/index.html`).
3. Paste the bundled HTML content into `Index.html` in Apps Script and save.

### Step 4: Deploy as a Web App for Team Usage
1. In the top right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment settings:
   - **Description:** Lab Tracker v1.0
   - **Execute as:** `Me` (your account)
   - **Who has access:** Choose `Anyone within [Your Company Domain]` (or `Anyone` depending on your team requirements).
4. Click **Deploy**.
5. Copy the generated **Web App URL** and share it with your team!

---

## 👥 How Team Sharing, Storage & Concurrency Work

### 1. How is data stored for the entire team?
* **Shared Backend Storage:** All schedule modifications (tests, stations, labs, personnel) are stored centrally in Google Apps Script `PropertiesService` or the connected Google Sheet spreadsheet.
* **Team Visibility:** When any team member accesses the Web App link using their company Google account, the application loads the exact same shared central database.

### 2. How are simultaneous edits handled?
* **Unsaved Changes State & Banner:** As soon as you drag a test, add a test, or modify station notes, a prominent top warning banner appears (`"You have unsaved changes! If you exit or reload without saving, your changes will be lost."`). A browser prompt prevents accidental page exit or refresh.
* **Explicit Save Function:** Edits remain local until you click the **"Save Changes"** button in the top navigation bar.
* **LockService Concurrency Control:** When a team member clicks **"Save Changes"**, the system uses `LockService.getScriptLock()` in `Code.gs` to hold an exclusive 15-second write lock.
* **Concurrency Protection:** If two people hit "Save" at the exact same moment, the second request safely waits for the lock to release rather than overwriting or corrupting the first person's edits. If a timeout occurs, a clear notification asks the user to re-try saving.

### 3. Version History & Snapshot Restores
* **Automatic Revisions:** Every time anyone saves changes, a timestamped snapshot is created with details on who saved it (`savedBy`) and what was modified.
* **Version History Modal:** Click **"Version History"** in the top navigation bar to open a complete timeline of past saved revisions.
* **One-Click Revert:** You can inspect any past schedule version and click **"Restore Version"** to instantly revert the schedule to that historical point in time.

---

## 🛠️ Local Development & Testing

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run Vitest unit tests
npx vitest run

# Run TypeScript build check
npx tsc -b
```
