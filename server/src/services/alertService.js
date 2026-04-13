const Alert  = require('../models/Alert');
const Room   = require('../models/Room');
const Device = require('../models/Device');
const { NotFoundError } = require('../utils/AppError');

class AlertService {
  constructor() {
    if (AlertService._instance) return AlertService._instance;
    AlertService._instance = this;
  }

  // ── Private helper ─────────────────────────────────────────────────────────

  /**
   * Resolve all active device IDs that belong to a given home.
   *
   * The Alert model has no `home` field — it only references `device`.
   * The chain is:  Home --> Rooms --> Devices --> Alerts.device
   * So every alert query scopes by { device: { $in: deviceIds } }.
   *
   * Returns an empty array (not an error) if the home has no devices yet,
   * which naturally produces empty alert results.
   *
   *param {string} homeId
   * returns {Promise<ObjectId[]>}
   */
  async _getHomeDeviceIds(homeId) {
    const rooms = await Room.find({ home: homeId, isActive: true })
      .select('_id')
      .lean();

    if (!rooms.length) return [];

    const roomIds = rooms.map((r) => r._id);

    const devices = await Device.find({ room: { $in: roomIds }, isActive: true })
      .select('_id')
      .lean();

    return devices.map((d) => d._id);
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  /**
   * Unread count, critical count, total count, and 5 most recent alerts
   * — all scoped to devices that belong to the caller's home.
   *
   * param {string} homeId  Resolved from the caller's JWT by the controller.
   */
  async getAlertStats(homeId) {
    const deviceIds = await this._getHomeDeviceIds(homeId);
    const base = { device: { $in: deviceIds } };

    const [unread, critical, total, recentAlerts] = await Promise.all([
      Alert.countDocuments({ ...base, isRead: false }),
      Alert.countDocuments({ ...base, isRead: false, severity: 'critical' }),
      Alert.countDocuments(base),
      Alert.find(base)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('device', 'name')
        .lean(),
    ]);

    return { unread, critical, total, recentAlerts };
  }

  /**
   * All unread alerts for the caller's home.
   *param {string} homeId
   */
  async getUnreadAlerts(homeId) {
    const deviceIds = await this._getHomeDeviceIds(homeId);
    return Alert.find({ device: { $in: deviceIds }, isRead: false })
      .sort({ createdAt: -1 })
      .populate('device', 'name type')
      .lean();
  }

  /**
   * Unread critical-severity alerts for the caller's home.
   *param {string} homeId
   */
  async getCriticalAlerts(homeId) {
    const deviceIds = await this._getHomeDeviceIds(homeId);
    return Alert.find({ device: { $in: deviceIds }, isRead: false, severity: 'critical' })
      .sort({ createdAt: -1 })
      .populate('device', 'name type')
      .lean();
  }

  /**
   * Paginated alerts for a specific home, scoped via device ownership.
   *param {string} homeId
   *param {{ page?, limit?, severity? }} options
   */
  async getAlertsByHome(homeId, { page = 1, limit = 20, severity } = {}) {
    const deviceIds = await this._getHomeDeviceIds(homeId);
    const query = { device: { $in: deviceIds } };
    if (severity) query.severity = severity;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('device', 'name type')
        .lean(),
      Alert.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates an alert status to read.
   */
  async markAsRead(alertId) {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!alert) {
      throw new NotFoundError('Alert not found.', 'ALERT_NOT_FOUND');
    }

    return alert;
  }
}

module.exports = new AlertService();



// const Alert = require('../models/Alert');
// const { NotFoundError } = require('../utils/AppError');

// class AlertService {
//   constructor() {
//     if (AlertService._instance) return AlertService._instance;
//     AlertService._instance = this;
//   }

//   /**
//    * Basic counters for the dashboard and global stats.
//    */
//   async getAlertStats() {
//     const [unread, critical, total, totalAlerts] = await Promise.all([
//       Alert.countDocuments({ isRead: false }),
//       Alert.countDocuments({ isRead: false, severity: 'critical' }),
//       Alert.countDocuments({}),
//       Alert.find().sort({ createdAt: -1 }).limit(5).populate('device', 'name').lean()
//     ]);

//     return { unread, critical, total, totalAlerts};
//   }

//   async getUnreadAlerts() {
//     return await Alert.find({ isRead: false })
//       .sort({ createdAt: -1 })
//       .populate('device', 'name type')
//       .lean();
//     }

//   async getCriticalAlerts() {
//     return await Alert.find({ isRead: false, severity: 'critical' })
//       .sort({ createdAt: -1 })
//       .populate('device', 'name type')
//       .lean();
//   }

//   /**
//    * Fetches paginated alerts for a specific home.
//    * Scopes the search to devices or rooms belonging to that home.
//    */
//   async getAlertsByHome(homeId, { page = 1, limit = 20, severity }) {
//     const query = { home: homeId };
//     if (severity) query.severity = severity;

//     const skip = (page - 1) * limit;

//     const [data, total] = await Promise.all([
//       Alert.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate('device', 'name type')
//         .lean(),
//       Alert.countDocuments(query),
//     ]);

//     return {
//       data,
//       pagination: {
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   /**
//    * Updates an alert status to read.
//    */
//   async markAsRead(alertId) {
//     const alert = await Alert.findByIdAndUpdate(
//       alertId,
//       { isRead: true, readAt: new Date() },
//       { new: true }
//     );

//     if (!alert) {
//       throw new NotFoundError('Alert not found.', 'ALERT_NOT_FOUND');
//     }

//     return alert;
//   }
// }

// module.exports = new AlertService();