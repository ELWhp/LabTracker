# Lab Tracker & Resource Management System

A web application designed for lab scheduling, station management, technician capacity constraint tracking, and team collaboration. It can be run locally or deployed directly to **Google Drive / Google Apps Script** as a web app.

---

## 🔰 Complete Beginner's Guide: Building & Deploying to Google Apps Script

If you are completely new to coding, don't worry! Follow these step-by-step instructions to get everything set up from scratch on your computer.

---

### Step 1: Install Required Software (One-Time Setup)

To build the application on your computer, you need two standard, free tools installed:

1. **Node.js** (This runs JavaScript tools on your computer):
   * Go to **[https://nodejs.org](https://nodejs.org)**.
   * Download the **LTS (Recommended for Most Users)** installer.
   * Double-click the downloaded file and follow the default installation prompts (click *Next* -> *Next* -> *Finish*).
2. **Git** (Required for downloading code repositories):
   * Go to **[https://git-scm.com/downloads](https://git-scm.com/downloads)**.
   * Download and run the installer for Windows or Mac with all default options selected.

---

### Step 2: Get the Project Files onto Your Computer

#### **Option A: Using Git (Recommended)**
1. Open Command Prompt (Windows) or Terminal (Mac).
2. Run the following command:
   ```bash
   git clone <REPOSITORY_URL>
   ```
3. Change into the project directory:
   ```bash
   cd lab-tracker
   ```

#### **Option B: Downloading as a ZIP file**
1. On the code repository page (e.g., GitHub or GitLab), click the green **Code** button and select **Download ZIP**.
2. Unzip the file into a folder on your computer (for example, `C:\LabTracker` or `Desktop/LabTracker`).

---

### Step 3: Open the Terminal in the Project Folder

* **Windows:**
  1. Open File Explorer and navigate to the folder where the project files are located.
  2. Click on the address bar at the top of the folder window.
  3. Type `cmd` and press **Enter**. A black command line window will open directly inside your project folder.
* **Mac:**
  1. Open Finder and locate the project folder.
  2. Right-click the folder and select **"New Terminal at Folder"** (or open Terminal app and type `cd ` followed by dragging the folder into the terminal window, then press Enter).

---

### Step 4: Run the Commands in the Terminal

Inside the terminal window that just opened, type the following commands **one by one**:

#### 1. Install Dependencies
Type the following command and press **Enter**:
```bash
npm install
```
* **What this does:** It automatically downloads all required helper packages (React, Tailwind CSS, icons, etc.) needed by the application. This takes about 10–30 seconds.

#### 2. Build the Application
Type the following command and press **Enter**:
```bash
npm run build
```
* **What this does:** It compiles all application code, styles, and logic into **one single HTML file** (`dist/index.html`) that Google Apps Script can run.
* When finished, you will see a message like `✓ built in ...` and a new folder named `dist` will appear in your project directory.

---

### Step 5: Add Code to Google Apps Script

1. Open your browser and go to **[Google Drive](https://drive.google.com/)** or **[script.google.com](https://script.google.com/)**.
2. Click **New** > **More** > **Google Apps Script**.
3. Name your project **"Lab Tracker"** at the top left.

#### A. Add Backend Code (`Code.gs`)
1. In the left menu of Apps Script, click on `Code.gs`.
2. Delete any default code inside it.
3. Open the `Code.gs` file from the project repository on your computer in Notepad or any text editor, select all text (`Ctrl + A` or `Cmd + A`), copy it (`Ctrl + C` or `Cmd + C`), and paste it (`Ctrl + V` or `Cmd + V`) into Apps Script's `Code.gs`.

#### B. Add Frontend Code (`Index.html`)
1. In Apps Script, click the **`+` (Plus)** button next to **Files** on the left menu and select **HTML**.
2. Name the file **`Index`** (Google will automatically add `.html`).
3. On your computer, open the newly generated file inside the project folder at **`dist/index.html`** using Notepad, TextEdit, or VS Code.
4. Select all text (`Ctrl + A` or `Cmd + A`), copy it (`Ctrl + C`), and paste it (`Ctrl + V`) into the `Index.html` file in Google Apps Script.
5. Click the **Disk icon (Save)** or press `Ctrl + S`.

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
