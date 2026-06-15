/**
 * Phylo-pipeline usage logging — Google Apps Script web app.
 *
 * One sheet (tab) per unique device_id. Each sheet has headers:
 *   timestamp | session_id | action | species
 *
 * doPost:  append the event. If the event carries N species, write N rows
 *          (same timestamp/session_id/action, one species each). If it
 *          carries none, write a single row with an empty species cell.
 * doGet?admin=1:  collect every sheet's rows, grouped by device_id, as JSON.
 *                 Supports &callback=fn for JSONP (served as JavaScript so the
 *                 browser will execute the injected <script>).
 *
 * Deploy: Deploy > New deployment > Web app, "Execute as: Me",
 *         "Who has access: Anyone". Re-deploy a new version after edits.
 */

var HEADERS = ['timestamp', 'session_id', 'action', 'species'];

// Sheet names can't contain \ / ? * [ ] : and max 100 chars.
function sheetNameFor(deviceId) {
  return String(deviceId || 'unknown').replace(/[\\\/\?\*\[\]:]/g, '_').slice(0, 100);
}

function getOrCreateSheet(deviceId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = sheetNameFor(deviceId);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}

  var sheet = getOrCreateSheet(data.device_id);
  var ts = data.timestamp || new Date().toISOString();
  var sid = data.session_id || '';
  var action = data.action || '';

  var species = data.species_list;
  if (typeof species === 'string') {
    try { species = JSON.parse(species); } catch (err2) { species = species ? [species] : []; }
  }
  if (!Array.isArray(species)) species = [];

  if (species.length === 0) {
    sheet.appendRow([ts, sid, action, '']);
  } else {
    species.forEach(function (sp) { sheet.appendRow([ts, sid, action, sp]); });
  }

  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  var p = e.parameter || {};

  if (p.admin === '1') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var byDevice = {};
    ss.getSheets().forEach(function (sheet) {
      var values = sheet.getDataRange().getValues();
      if (values.length < 2) return;            // header-only or empty tab
      var headers = values.shift();
      byDevice[sheet.getName()] = values.map(function (row) {
        var o = {};
        headers.forEach(function (h, i) {
          var v = row[i];
          o[h] = (v instanceof Date) ? v.toISOString() : v;
        });
        return o;
      });
    });

    var json = JSON.stringify(byDevice);
    if (p.callback) {
      return ContentService
        .createTextOutput(p.callback + '(' + json + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);   // JSONP must be JS
    }
    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput('ok');
}
