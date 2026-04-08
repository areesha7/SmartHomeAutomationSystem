// // /**
// //  * eventService.js
// //  *
// //  * Design Pattern: SERVICE LAYER
// //  *
// //  * Slim service — only the two methods that involve non-trivial aggregation
// //  * logic and don't belong inline in a route handler:
// //  *
// //  *   getPoissonLambda     → λ = events per hour over a time window
// //  *   getActionFrequency   → % breakdown of ON / OFF / IDLE / FAULT for a device
// //  *
// //  * The /recent endpoint is a simple find().sort().limit() and stays inline
// //  * in eventRoutes.js — no service layer needed for that.
// //  */

// // const mongoose = require('mongoose');
// // const Event    = require('../models/Event');
// // const Device   = require('../models/Device');
// // const AppError = require('../utils/AppError');

// // const oid = (id) => new mongoose.Types.ObjectId(id.toString());

// // class EventService {
// //   constructor() {
// //     if (EventService._instance) return EventService._instance;
// //     EventService._instance = this;
// //   }

// //   /**
// //    * Estimate the Poisson arrival rate λ (events per hour) for a device.
// //    *
// //    * λ = total state-change events in the window / window length in hours
// //    *
// //    * A λ of 0.5 means the device changes state once every 2 hours on average.
// //    * A λ of 8 is unusually high and may indicate a feedback loop or fault.
// //    *
// //    * @param {string} deviceId
// //    * @param {number} windowHours  Observation window — default 24, max 720 (30 days)
// //    */
// //   async getPoissonLambda(deviceId, windowHours = 24) {
// //     const device = await Device.findById(deviceId).select('name type').lean();
// //     if (!device) throw new AppError('Device not found', 404);

// //     const since      = new Date(Date.now() - windowHours * 60 * 60 * 1000);
// //     const eventCount = await Event.countDocuments({
// //       device:    oid(deviceId),
// //       timestamp: { $gte: since },
// //     });

// //     const lambda = eventCount / windowHours;

// //     return {
// //       deviceId,
// //       deviceName:   device.name,
// //       windowHours,
// //       eventCount,
// //       lambdaPerHour: +lambda.toFixed(4),
// //       // Human-readable interpretation shown in admin dashboard tooltips
// //       interpretation: this._interpretLambda(lambda),
// //     };
// //   }

// //   /**
// //    * Action frequency breakdown for a device.
// //    *
// //    * Answers: "of all the times this device changed state, how often
// //    * did it land in ON vs OFF vs IDLE vs FAULT?"
// //    *
// //    * Use cases:
// //    *   - Device health: high FAULT% → investigate the hardware
// //    *   - Markov validation: sanity-check transition matrix rows
// //    *   - Usage pattern: low ON% on an AC → may be unnecessary/oversized
// //    *
// //    * @param {string} deviceId
// //    */
// //   async getActionFrequency(deviceId) {
// //     const device = await Device.findById(deviceId).select('name type').lean();
// //     if (!device) throw new AppError('Device not found', 404);

// //     const breakdown = await Event.aggregate([
// //       { $match: { device: oid(deviceId) } },
// //       { $group: { _id: '$action', count: { $sum: 1 } } },
// //       { $sort:  { count: -1 } },
// //       { $project: { _id: 0, action: '$_id', count: 1 } },
// //     ]);

// //     const total = breakdown.reduce((acc, b) => acc + b.count, 0);

// //     return {
// //       deviceId,
// //       deviceName: device.name,
// //       totalEvents: total,
// //       breakdown: breakdown.map((b) => ({
// //         action:     b.action,
// //         count:      b.count,
// //         percentage: total > 0 ? +((b.count / total) * 100).toFixed(1) : 0,
// //       })),
// //     };
// //   }

// //   // ── Private ────────────────────────────────────────────────────────────────

// //   _interpretLambda(lambda) {
// //     if (lambda === 0)  return 'No activity in the observation window.';
// //     if (lambda < 0.5)  return 'Low activity — device is relatively stable.';
// //     if (lambda < 2)    return 'Moderate activity — normal usage pattern.';
// //     if (lambda < 5)    return 'High activity — device changes state frequently.';
// //     return 'Very high activity — investigate for anomalies or automation loops.';
// //   }
// // }

// // module.exports = new EventService();

// class EventService {
//   constructor() {
//     if (EventService._instance) return EventService._instance;
//     EventService._instance = this;
//   }

//   // ── Other existing methods (getActionFrequency, etc.) stay here ──

//   /**
//    * Estimate Poisson arrival rate λ (events per hour) for a device.
//    * 
//    * FRONTEND FORMULA (exact match):
//    * λ = total events / time span in hours
//    * time span = last event timestamp - first event timestamp (minimum 1 hour)
//    * 
//    * This matches the frontend computeLambda() function exactly.
//    */
//   async getPoissonLambda(deviceId, windowHours = 24) {
//     const device = await Device.findById(deviceId).select('name type status').lean();
//     if (!device) throw new AppError('Device not found', 404);

//     // Get events for this device (unbounded by windowHours - use ALL events)
//     const events = await Event.find({
//       device: oid(deviceId),
//     }).sort({ timestamp: 1 }).lean();

//     const eventCount = events.length;
    
//     let lambda = 0;
//     let spanHours = 1;
    
//     if (eventCount >= 2) {
//       // Same calculation as frontend computeLambda()
//       const firstTimestamp = new Date(events[0].timestamp).getTime();
//       const lastTimestamp = new Date(events[eventCount - 1].timestamp).getTime();
//       spanHours = Math.max(1, (lastTimestamp - firstTimestamp) / (1000 * 60 * 60));
//       lambda = eventCount / spanHours;
//     } else if (eventCount === 1) {
//       // Frontend returns events.length for < 2 events
//       lambda = 1;
//     } else {
//       lambda = 0;
//     }

//     return {
//       deviceId,
//       deviceName: device.name,
//       deviceType: device.type,
//       currentStatus: device.status,
//       windowHours: spanHours,  // Actual time span, not the input windowHours
//       eventCount: eventCount,
//       lambdaPerHour: +lambda.toFixed(4),
//       interpretation: this._interpretLambdaSimple(lambda),
//     };
//   }

//   // ── Private helper methods ──
  
//   _interpretLambdaSimple(lambda) {
//     if (lambda === 0) return 'No activity recorded for this device.';
//     if (lambda < 0.5) return 'Low activity — device changes state rarely.';
//     if (lambda < 2) return 'Moderate activity — normal usage pattern.';
//     if (lambda < 5) return 'High activity — device changes state frequently.';
//     return 'Very high activity — investigate for anomalies or automation loops.';
//   }
// }

// module.exports = new EventService();


/**
 * eventService.js
 *
 * Design Pattern: SERVICE LAYER
 */

const mongoose = require('mongoose');
const Event = require('../models/Event');
const Device = require('../models/Device');
const AppError = require('../utils/AppError');

const oid = (id) => new mongoose.Types.ObjectId(id.toString());

class EventService {
  constructor() {
    if (EventService._instance) return EventService._instance;
    EventService._instance = this;
  }

  /**
   * Estimate Poisson arrival rate λ (events per hour) for a device.
   * 
   * MATCHES FRONTEND computeLambda() EXACTLY:
   * λ = total events / time span (minimum 1 hour)
   * time span = last event timestamp - first event timestamp
   */
  async getPoissonLambda(deviceId, windowHours = 24) {
    // Find device
    const device = await Device.findById(deviceId).select('name type status').lean();
    if (!device) throw new AppError('Device not found', 404);

    // Get ALL events for this device (no time filter)
    const events = await Event.find({
      device: oid(deviceId),
    }).sort({ timestamp: 1 }).lean();

    const eventCount = events.length;
    
    let lambda = 0;
    let spanHours = 1;
    
    if (eventCount >= 2) {
      // Same calculation as frontend
      const firstTimestamp = new Date(events[0].timestamp).getTime();
      const lastTimestamp = new Date(events[eventCount - 1].timestamp).getTime();
      spanHours = Math.max(1, (lastTimestamp - firstTimestamp) / (1000 * 60 * 60));
      lambda = eventCount / spanHours;
    } else if (eventCount === 1) {
      // Frontend returns events.length for < 2 events
      lambda = 1;
    }

    return {
      deviceId: device._id.toString(),
      deviceName: device.name,
      deviceType: device.type,
      currentStatus: device.status,
      windowHours: parseFloat(spanHours.toFixed(1)),
      eventCount: eventCount,
      lambdaPerHour: parseFloat(lambda.toFixed(4)),
      interpretation: this._interpretLambda(lambda),
    };
  }

  /**
   * Action frequency breakdown for a device.
   */
  async getActionFrequency(deviceId) {
    const device = await Device.findById(deviceId).select('name type').lean();
    if (!device) throw new AppError('Device not found', 404);

    const breakdown = await Event.aggregate([
      { $match: { device: oid(deviceId) } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, action: '$_id', count: 1 } },
    ]);

    const total = breakdown.reduce((acc, b) => acc + b.count, 0);

    return {
      deviceId,
      deviceName: device.name,
      totalEvents: total,
      breakdown: breakdown.map((b) => ({
        action: b.action,
        count: b.count,
        percentage: total > 0 ? +((b.count / total) * 100).toFixed(1) : 0,
      })),
    };
  }

  // ── Private ──
  _interpretLambda(lambda) {
    if (lambda === 0) return 'No activity recorded for this device.';
    if (lambda < 0.5) return 'Low activity — device changes state rarely.';
    if (lambda < 2) return 'Moderate activity — normal usage pattern.';
    if (lambda < 5) return 'High activity — device changes state frequently.';
    return 'Very high activity — investigate for anomalies or automation loops.';
  }
}

module.exports = new EventService();