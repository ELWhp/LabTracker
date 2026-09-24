/**
 * Lab Tracker & Resource Manager - Google Apps Script Backend (Code.gs)
 *
 * How shared team access, concurrency control & notifications work:
 * 1. Data Storage: Stores all lab schedule state in Script Properties and/or an attached Google Sheet.
 * 2. Concurrency Lock: Uses LockService (LockService.getScriptLock()) to prevent race conditions when multiple team members edit at once.
 * 3. Version History: Appends timestamped version snapshots on each save for full audit trail & version restore.
 * 4. Notifications: Uses MailApp.sendEmail to alert test owners when another team member modifies their scheduled tests.
 * 5. Auto User Detection: Session.getActiveUser().getEmail() automatically identifies the logged-in user's Google account.
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Lab Tracker & Resource Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Automatically retrieve active Google Workspace user email
 */
function getUserEmail() {
  try {
    var email = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    return email || '';
  } catch (err) {
    Logger.log('Could not get active user email: ' + err.toString());
    return '';
  }
}

/**
 * Send email notification to test owner if modified by another user
 */
function sendTestModificationNotification(ownerEmail, testName, modifiedBy, changeSummary) {
  if (!ownerEmail || ownerEmail.indexOf('@') === -1) return;
  try {
    var subject = 'Lab Tracker Alert: Test "' + testName + '" was modified';
    var body = 'Hello,\n\n' +
      'This is an automated notification from Lab Tracker.\n\n' +
      'Your test "' + testName + '" was recently modified by ' + (modifiedBy || 'a team member') + '.\n' +
      'Change summary: ' + (changeSummary || 'Test schedule updated') + '\n\n' +
      'Timestamp: ' + new Date().toLocaleString() + '\n\n' +
      'Please open the Lab Tracker app to view the updated schedule.';

    MailApp.sendEmail(ownerEmail, subject, body);
  } catch (err) {
    Logger.log('Could not send notification email: ' + err.toString());
  }
}

/**
 * Fetch active schedule data from shared Google Sheet / Properties
 */
function getLabTrackerData() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Wait up to 10 seconds for concurrent read lock
    var props = PropertiesService.getScriptProperties();
    var rawData = props.getProperty('LAB_TRACKER_DATA');
    var versions = props.getProperty('LAB_TRACKER_VERSIONS');

    return {
      status: 'success',
      data: rawData ? JSON.parse(rawData) : null,
      historyVersions: versions ? JSON.parse(versions) : []
    };
  } catch (err) {
    return { status: 'error', message: 'Could not acquire read lock: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Thread-safe save operation with Google LockService & version history tracking
 */
function saveLabTrackerData(payload, userEmail, saveNote) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire exclusive write lock (waits up to 15 seconds)
    var hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return {
        status: 'lock_timeout',
        message: 'Another team member is currently saving changes. Please try saving again in a moment.'
      };
    }

    var props = PropertiesService.getScriptProperties();
    var timestamp = new Date().toLocaleString();
    var currentUser = userEmail || getUserEmail() || 'Team Member';

    // 1. Update current schedule payload
    props.setProperty('LAB_TRACKER_DATA', JSON.stringify(payload));

    // 2. Append new version snapshot to history log
    var versionsRaw = props.getProperty('LAB_TRACKER_VERSIONS');
    var historyVersions = versionsRaw ? JSON.parse(versionsRaw) : [];

    var newVersion = {
      id: 'ver-' + new Date().getTime(),
      timestamp: timestamp,
      savedBy: currentUser,
      note: saveNote || 'Manual save snapshot',
      data: payload
    };

    // Keep up to last 50 revisions
    historyVersions.unshift(newVersion);
    if (historyVersions.length > 50) {
      historyVersions = historyVersions.slice(0, 50);
    }

    props.setProperty('LAB_TRACKER_VERSIONS', JSON.stringify(historyVersions));

    return {
      status: 'success',
      timestamp: timestamp,
      savedBy: currentUser,
      versionId: newVersion.id
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
