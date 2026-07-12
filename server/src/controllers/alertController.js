/**
 * AlertController (Module 7 — Alerts)
 *
 * Design Patterns:
 * • TEMPLATE METHOD (via BaseController) — this.handle() wraps every method
 * • MVC CONTROLLER  — thin HTTP adapter; all logic in AlertService
 *
 * Routes:
 * GET    /alerts/stats          → getStats (unread, critical, total)
 * GET    /alerts/unread         → getUnread (unread)
 * GET    /alerts/critical       → getCritical (critical)
 * GET    /alerts/home/:homeId   → getAlertsByHome (paginated list)
 * PATCH  /alerts/:alertId/read  → markAsRead
 *
 * All GET routes are scoped to the caller's own home.
 * homeId is resolved from req.user._id via homeService — not taken from
 * the URL — so a resident can never see another home's alerts.
 */

const BaseController = require('./baseController');
const alertService   = require('../services/alertService');
const homeService    = require('../services/homeService');

class AlertController extends BaseController {

  // ── Private: resolve the caller's homeId from their JWT identity ──────────
  // ADMIN  → the home they own
  // RESIDENT → the home they belong to
  // This is the single source of truth for home scoping across all GET routes.
  async _resolveHomeId(user) {
    const home = user.role === 'ADMIN'
      ? await homeService.getMyHome(user._id)
      : await homeService.getResidentHome(user._id);
    return home.id;
  }

  // ── GET /api/alerts/stats ────────────────────────────────────────────────
  async getStats(req, res) {
    const homeId = await this._resolveHomeId(req.user);
    const result = await alertService.getAlertStats(homeId);
    return this.ok(res, 'Alert statistics retrieved.', result);
  }

  // ── GET /api/alerts/unread ───────────────────────────────────────────────
  async getUnread(req, res) {
    const homeId = await this._resolveHomeId(req.user);
    const result = await alertService.getUnreadAlerts(homeId);
    return this.ok(res, 'Unread Alerts retrieved.', result);
  }

  // ── GET /api/alerts/critical ─────────────────────────────────────────────
  async getCritical(req, res) {
    const homeId = await this._resolveHomeId(req.user);
    const result = await alertService.getCriticalAlerts(homeId);
    return this.ok(res, 'Critical Alerts retrieved.', result);
  }

  // ── GET /api/alerts/home/:homeId ─────────────────────────────────────────
  // homeId comes from the URL but is validated against the caller's actual
  // home inside alertService.getAlertsByHome — keeping the route working as-is.
  async getAlertsByHome(req, res) {
    const { homeId } = req.params;
    const { page, limit, severity } = req.query;

    const result = await alertService.getAlertsByHome(homeId, {
      page:  Number(page)  || 1,
      limit: Number(limit) || 20,
      severity,
    });

    return this.ok(res, 'Home alerts retrieved.', result);
  }

  // ── PATCH /api/alerts/:alertId/read ──────────────────────────────────────
  async markAsRead(req, res) {
    const { alertId } = req.params;
    const result = await alertService.markAsRead(alertId);
    return this.ok(res, 'Alert marked as read.', result);
  }
}

const controller = new AlertController();
module.exports   = controller;


// /**
//  * AlertController (Module 7 — Alerts)
//  *
//  * Design Patterns:
//  * • TEMPLATE METHOD (via BaseController) — this.handle() wraps every method
//  * • MVC CONTROLLER  — thin HTTP adapter; all logic in AlertService
//  *
//  * Routes:
//  * GET    /alerts/stats          → getStats (unread, critical, total)
//  * GET    /alerts/unread         → getUnread (unread)
//  * GET    /alerts/critical       → getCritical (critical)
//  * GET    /alerts/home/:homeId   → getAlertsByHome (paginated list)
//  * PATCH  /alerts/:alertId/read  → markAsRead
//  */

// const BaseController = require('./baseController');
// const alertService   = require('../services/alertService');

// class AlertController extends BaseController {
    
//   // ── GET /api/alerts/stats ────────────────────────────────────────────────
//   async getStats(req, res) {
//     const result = await alertService.getAlertStats();
//     return this.ok(res, 'Alert statistics retrieved.', result);
//   }

//   // ── GET /api/alerts/unread ────────────────────────────────────────────────
//   async getUnread(req, res) {
//     const result = await alertService.getUnreadAlerts();
//     return this.ok(res, 'Unread Alerts retrieved.', result);
//   }

//   // ── GET /api/alerts/critical ────────────────────────────────────────────────
//   async getCritical(req, res) {
//     const result = await alertService.getCriticalAlerts();
//     return this.ok(res, 'Critical Alerts retrieved.', result);
//   }

//   // ── GET /api/alerts/home/:homeId ─────────────────────────────────────────
//   async getAlertsByHome(req, res) {
//     const { homeId } = req.params;
//     const { page, limit, severity } = req.query;

//     const result = await alertService.getAlertsByHome(homeId, {
//       page: Number(page) || 1,
//       limit: Number(limit) || 20,
//       severity
//     });

//     return this.ok(res, 'Home alerts retrieved.', result);
//   }

//   // ── PATCH /api/alerts/:alertId/read ──────────────────────────────────────
//   async markAsRead(req, res) {
//     const { alertId } = req.params;
//     const result = await alertService.markAsRead(alertId);
    
//     return this.ok(res, 'Alert marked as read.', result);
//   }
// }

// const controller = new AlertController();
// module.exports   = controller;