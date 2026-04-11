
// import { useState, useMemo, useEffect, useCallback, useRef } from "react";
// import Layout from "../Components/Layout";
// import {
//   Plus, Play, Settings, X, Moon, Sun, Plane, Zap, Home, Check, RotateCcw, Wifi, WifiOff, Clock
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// const BASE_URL = "http://localhost:5000";

// const apiFetch = async (path, token, options = {}) => {
//   const storedToken = token || localStorage.getItem("token");
//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
//       ...(options.headers || {}),
//     },
//   });
//   if (!res.ok) throw new Error(`API error ${res.status}`);
//   if (res.status === 204) return null;
//   return res.json();
// };

// const iconMap = {
//   schedule: Sun, motion: Home, manual: Zap,
//   moon: Moon, plane: Plane, TIME: Sun, CONDITION: Zap,
// };

// class AutomationFactory {
//   static create({ name, schedule = "Manual", trigger = "manual", actions = [], isOn = false, icon }) {
//     return {
//       id: Date.now() + Math.random(),
//       name, schedule, trigger, actions, isOn,
//       icon: icon || iconMap[trigger] || Zap,
//     };
//   }

//   static fromBackend(rule, devicesList = []) {
//     const triggerType = rule.trigger?.type || "manual";
//     const schedule = triggerType === "TIME"
//       ? `Every day at ${rule.trigger.time}`
//       : triggerType === "CONDITION"
//       ? `When ${rule.trigger.condition?.field} ${rule.trigger.condition?.operator} ${rule.trigger.condition?.value}`
//       : "Manual trigger";

//     const actionLabels = (rule.actions || []).map((a) => {
//       let deviceId = null;
//       if (typeof a.device === "string") {
//         deviceId = a.device;
//       } else if (a.device?._id) {
//         deviceId = a.device._id.toString();
//       } else if (a.device_id) {
//         deviceId = a.device_id;
//       } else if (a.device?.toString) {
//         deviceId = a.device.toString();
//       }
      
//       const found = devicesList.find(d => d._id?.toString() === deviceId);
//       if (found) return `Turn ${a.action} ${found.name}`;
//       return `Turn ${a.action} device`;
//     });

//     return {
//       id: rule._id,
//       _backendId: rule._id,
//       name: rule.name,
//       schedule,
//       trigger: triggerType.toLowerCase(),
//       actions: actionLabels,
//       isOn: rule.isActive,
//       icon: iconMap[triggerType] || Zap,
//       rawTrigger: rule.trigger,
//       rawActions: rule.actions,
//       lastRunAt: rule.lastRunAt,
//       createdBy: rule.createdBy,
//     };
//   }
// }

// class ToggleCommand {
//   constructor(id) { this.id = id; }
//   execute(list) { return list.map(a => a.id === this.id ? { ...a, isOn: !a.isOn } : a); }
//   undo(list) { return this.execute(list); }
// }
// class AddCommand {
//   constructor(auto) { this.auto = auto; }
//   execute(list) { return [...list, this.auto]; }
//   undo(list) { return list.filter(a => a.id !== this.auto.id); }
// }
// class DeleteCommand {
//   constructor(id) { this.id = id; this._deleted = null; this._index = null; }
//   execute(list) {
//     this._index = list.findIndex(a => a.id === this.id);
//     this._deleted = list[this._index];
//     return list.filter(a => a.id !== this.id);
//   }
//   undo(list) {
//     const result = [...list];
//     result.splice(this._index, 0, this._deleted);
//     return result;
//   }
// }
// class UpdateCommand {
//   constructor(updated) { this.updated = updated; this._prev = null; }
//   execute(list) {
//     this._prev = list.find(a => a.id === this.updated.id);
//     return list.map(a => a.id === this.updated.id ? { ...this.updated } : a);
//   }
//   undo(list) { return list.map(a => a.id === this._prev.id ? { ...this._prev } : a); }
// }

// class LiveAutomationStrategy {
//   async fetch(token, devicesList = [], currentUserId = null) {
//     const data = await apiFetch("/automations", token);
//     const rules = data?.data?.rules || data?.rules || [];
//     const filtered = currentUserId
//       ? rules.filter(r => r.createdBy?.toString() === currentUserId.toString())
//       : rules;
//     return filtered.map(r => AutomationFactory.fromBackend(r, devicesList));
//   }
// }

// const buildRoomIdSet = (rooms) => {
//   const ids = new Set();
//   rooms.forEach(r => {
//     if (r._id) ids.add(r._id.toString());
//     if (r.id) ids.add(r.id.toString());
//   });
//   return ids;
// };

// const deviceBelongsToUser = (device, roomIdSet) => {
//   if (!device.room) return false;
//   const roomId = typeof device.room === "object"
//     ? (device.room._id || device.room.id)
//     : device.room;
//   if (!roomId) return false;
//   return roomIdSet.has(roomId.toString());
// };

// const suggested = [
//   { id: "s1", name: "Bedtime Routine", desc: "Wind down your home at night", trigger: "schedule", icon: Moon },
//   { id: "s2", name: "Wake Up", desc: "Start your day right", trigger: "schedule", icon: Sun },
//   { id: "s3", name: "Vacation Mode", desc: "Simulate presence while away", trigger: "manual", icon: Plane },
// ];

// const ACCENT = "#5c35b0";
// const GREEN = "#63a17f";
// const ACTION_OPTIONS = ["ON", "OFF", "IDLE"];

// const Toggle = ({ isOn, onChange }) => (
//   <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer", flexShrink: 0 }}>
//     <input type="checkbox" checked={isOn} onChange={onChange} style={{ display: "none" }} />
//     <span style={{ position: "absolute", inset: 0, borderRadius: "24px", background: isOn ? `linear-gradient(135deg,${ACCENT},#7c5cc8)` : "#d0cce0", transition: "background 0.3s ease", boxShadow: isOn ? "0 0 10px rgba(92,53,176,0.45)" : "none" }} />
//     <span style={{ position: "absolute", width: "18px", height: "18px", background: "white", borderRadius: "50%", top: "3px", left: isOn ? "23px" : "3px", transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
//   </label>
// );

// const SectionHeader = ({ title }) => (
//   <div style={{ marginBottom: "20px", marginTop: "8px" }}>
//     <h5 style={{ margin: "0 0 10px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{title}</h5>
//     <hr style={{ margin: 0, border: "none", borderTop: "1.5px solid #e8e4f0" }} />
//   </div>
// );

// const Overlay = ({ onClick }) => (
//   <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, animation: "fadeIn 0.2s ease" }} />
// );

// const StatusPill = ({ online, loading }) => (
//   <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea", color: loading ? "#888" : online ? GREEN : "#c03030" }}>
//     {loading
//       ? <RotateCcw size={10} style={{ animation: "spin 1s linear infinite" }} />
//       : online ? <Wifi size={10} /> : <WifiOff size={10} />}
//     {loading ? "Loading..." : online ? "Live" : "Offline"}
//   </span>
// );

// const DeviceActionRow = ({ row, devices, loadingDevices, onChange, onRemove, showRemove }) => (
//   <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//     <select
//       value={row.device_id}
//       onChange={e => onChange({ ...row, device_id: e.target.value })}
//       style={{ flex: 2, padding: "9px 12px", borderRadius: "8px", border: `1.5px solid ${row.device_id ? "#e0dcea" : "#f0a0a0"}`, fontSize: "13px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" }}>
//       <option value="">
//         {loadingDevices ? "Loading devices..." : "Select device"}
//       </option>
//       {devices.map(d => (
//         <option key={d._id} value={d._id}>
//           {d.name} ({d.type})
//         </option>
//       ))}
//     </select>
//     <select
//       value={row.action}
//       onChange={e => onChange({ ...row, action: e.target.value })}
//       style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "13px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" }}>
//       {ACTION_OPTIONS.map(a => (
//         <option key={a} value={a}>{a}</option>
//       ))}
//     </select>
//     {showRemove && (
//       <button onClick={onRemove}
//         style={{ background: "#fee8e8", border: "none", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
//         <X size={14} color="#c03030" />
//       </button>
//     )}
//   </div>
// );

// const Automations = () => {
//   const { token, user } = useAuth();

//   const [automations, setAutomations] = useState([]);
//   const [devices, setDevices] = useState([]);
//   const [loadingAutos, setLoadingAutos] = useState(true);
//   const [loadingDevices, setLoadingDevices] = useState(false);
//   const [online, setOnline] = useState(false);

//   const [history, setHistory] = useState([]);
//   const [runningId, setRunningId] = useState(null);
//   const [newModal, setNewModal] = useState(false);
//   const [settingsAuto, setSettingsAuto] = useState(null);
//   const [submitError, setSubmitError] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [runResult, setRunResult] = useState(null);
//   const lastAutoRun = useRef({});

//   const emptyForm = {
//     name: "",
//     triggerType: "TIME",
//     triggerTime: "07:00",
//     actions: [{ device_id: "", action: "ON" }],
//   };
//   const [newForm, setNewForm] = useState(emptyForm);

//   const fetchDevices = useCallback(async (t) => {
//     setLoadingDevices(true);
//     try {
//       const tok = t || token || localStorage.getItem("token");
//       const homeData = await apiFetch("/homes/mine", tok);
//       const home = homeData?.data?.home || homeData?.home;
//       const homeId = home?.id || home?._id;
//       if (!homeId) { setDevices([]); return []; }
//       const roomData = await apiFetch(`/rooms/${homeId}/rooms`, tok);
//       const roomList = roomData?.data?.rooms || roomData?.rooms || [];
//       const roomIdSet = buildRoomIdSet(roomList);
//       const devData = await apiFetch("/devices", tok);
//       const allDevices = devData?.data?.devices || devData?.devices || [];
//       const filtered = allDevices.filter(d => deviceBelongsToUser(d, roomIdSet));
//       setDevices(filtered);
//       return filtered;
//     } catch {
//       setDevices([]);
//       return [];
//     } finally {
//       setLoadingDevices(false);
//     }
//   }, [token]);

//   const fetchAutomations = useCallback(async (devicesList = [], silent = false) => {
//     if (!silent) setLoadingAutos(true);
//     try {
//       const tok = token || localStorage.getItem("token");
//       const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
//       const userId = currentUser?._id || currentUser?.id;
//       const strategy = new LiveAutomationStrategy();
//       const data = await strategy.fetch(tok, devicesList, userId);
//       setAutomations(data);
//       setOnline(true);
//     } catch {
//       setOnline(false);
//     } finally {
//       if (!silent) setLoadingAutos(false);
//     }
//   }, [token, user]);

//   // Debug: Log all automations with their scheduled times
//   useEffect(() => {
//     if (automations.length > 0) {
//       console.log("=== ALL AUTOMATIONS DETAILS ===");
//       automations.forEach(auto => {
//         console.log(`Name: ${auto.name}`);
//         console.log(`  isOn: ${auto.isOn}`);
//         console.log(`  trigger type: ${auto.rawTrigger?.type}`);
//         console.log(`  scheduled time: ${auto.rawTrigger?.time}`);
//         console.log(`  full trigger:`, auto.rawTrigger);
//       });
//       console.log("================================");
//     }
//   }, [automations]);

// const checkAndExecuteDueAutomations = useCallback(async () => {
//   if (!token || automations.length === 0) return;
  
//   const now = new Date();
//   const currentHour = now.getHours();
//   const currentMinute = now.getMinutes();
//   const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  
//   console.log(`[Auto-Checker] Checking automations at ${currentTimeStr}`);
  
//   const timeBasedAutos = automations.filter(auto => 
//     auto.isOn && 
//     auto.rawTrigger?.type === 'TIME' &&
//     auto.rawTrigger?.time
//   );
  
//   if (timeBasedAutos.length > 0) {
//     console.log(`[Auto-Checker] Found ${timeBasedAutos.length} active time-based automations`);
//   }
  
//   for (const auto of timeBasedAutos) {
//     const scheduledTime = auto.rawTrigger.time;
//     const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
    
//     const timeMatch = currentHour === scheduledHour && currentMinute === scheduledMinute;
    
//     const lastRun = lastAutoRun.current[auto._backendId];
//     const alreadyRanRecently = lastRun && (now.getTime() - lastRun) < 120000;
    
//     if (timeMatch && !alreadyRanRecently) {
//       console.log(`[Auto-Checker] 🎯 Executing automation: ${auto.name} at ${currentTimeStr} (scheduled: ${scheduledTime})`);
      
//       // Check if automation has actions
//       if (!auto.rawActions || auto.rawActions.length === 0) {
//         console.error(`[Auto-Checker] ❌ Automation "${auto.name}" has no actions configured!`);
        
//         // Try to fetch fresh automation data from backend
//         try {
//           console.log(`[Auto-Checker] Attempting to fetch fresh data for ${auto.name}...`);
//           const freshData = await apiFetch(`/automations/${auto._backendId}`, token);
//           console.log(`[Auto-Checker] Fresh data:`, freshData);
          
//           const rule = freshData?.data?.rule || freshData?.rule;
//           if (rule && rule.actions && rule.actions.length > 0) {
//             console.log(`[Auto-Checker] Found ${rule.actions.length} actions in fresh data!`);
            
//             // Execute actions from fresh data
//             for (const action of rule.actions) {
//               let deviceId = null;
//               if (typeof action.device === 'string') {
//                 deviceId = action.device;
//               } else if (action.device?._id) {
//                 deviceId = action.device._id;
//               } else if (action.device_id) {
//                 deviceId = action.device_id;
//               }
              
//               if (deviceId) {
//                 console.log(`[Auto-Checker] Executing ${action.action} on device ${deviceId}`);
//                 try {
//                   await apiFetch(`/devices/${deviceId}/control`, token, {
//                     method: "POST",
//                     body: JSON.stringify({ action: action.action })
//                   });
//                   console.log(`[Auto-Checker] ✅ Executed ${action.action}`);
//                 } catch (err) {
//                   console.error(`[Auto-Checker] ❌ Failed to execute action:`, err);
//                 }
//               }
//             }
//           } else {
//             console.error(`[Auto-Checker] ❌ Still no actions found for "${auto.name}"`);
//           }
//         } catch (err) {
//           console.error(`[Auto-Checker] ❌ Failed to fetch fresh data:`, err);
//         }
//       } else {
//         // Execute actions from existing automation
//         console.log(`[Auto-Checker] Executing ${auto.rawActions.length} actions for "${auto.name}"`);
        
//         for (const action of auto.rawActions) {
//           let deviceId = null;
//           if (typeof action.device === 'string') {
//             deviceId = action.device;
//           } else if (action.device?._id) {
//             deviceId = action.device._id;
//           } else if (action.device_id) {
//             deviceId = action.device_id;
//           }
          
//           if (deviceId) {
//             console.log(`[Auto-Checker] Executing ${action.action} on device ${deviceId}`);
//             try {
//               await apiFetch(`/devices/${deviceId}/control`, token, {
//                 method: "POST",
//                 body: JSON.stringify({ action: action.action })
//               });
//               console.log(`[Auto-Checker] ✅ Executed ${action.action}`);
//             } catch (err) {
//               console.error(`[Auto-Checker] ❌ Failed to execute action:`, err);
//             }
//           }
//         }
//       }
      
//       lastAutoRun.current[auto._backendId] = now.getTime();
      
//       // Refresh devices after execution
//       setTimeout(async () => {
//         const devicesList = await fetchDevices();
//         await fetchAutomations(devicesList, true);
//       }, 30000);
//     }
//   }
// }, [automations, token, fetchDevices, fetchAutomations]);

//   useEffect(() => {
//     const tok = token || localStorage.getItem("token");
//     if (!tok) return;

//     setAutomations([]);
//     setDevices([]);

//     const init = async () => {
//       const devicesList = await fetchDevices(tok);
//       await fetchAutomations(devicesList);
//     };
//     init();

//     const pollId = setInterval(async () => {
//       const tok2 = token || localStorage.getItem("token");
//       if (!tok2) return;
//       try {
//         const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
//         const userId = currentUser?._id || currentUser?.id;
//         const devData = await apiFetch("/devices", tok2);
//         const allDevices = devData?.data?.devices || devData?.devices || [];

//         const homeData = await apiFetch("/homes/mine", tok2);
//         const home = homeData?.data?.home || homeData?.home;
//         const homeId = home?.id || home?._id;
//         let filteredDevs = allDevices;
//         if (homeId) {
//           const roomData = await apiFetch(`/rooms/${homeId}/rooms`, tok2);
//           const roomList = roomData?.data?.rooms || roomData?.rooms || [];
//           const roomIdSet = buildRoomIdSet(roomList);
//           filteredDevs = allDevices.filter(d => deviceBelongsToUser(d, roomIdSet));
//         }
//         setDevices(filteredDevs);

//         const strategy = new LiveAutomationStrategy();
//         const data = await strategy.fetch(tok2, filteredDevs, userId);
//         setAutomations(data);
//         setOnline(true);
//       } catch {
//         setOnline(false);
//       }
//     }, 15000);

//     return () => clearInterval(pollId);
//   }, [token]);

//   useEffect(() => {
//     if (newModal) {
//       fetchDevices();
//       setNewForm(emptyForm);
//       setSubmitError("");
//     }
//   }, [newModal]);

//   // Clear run result after 5 seconds
//   useEffect(() => {
//     if (runResult) {
//       const timer = setTimeout(() => setRunResult(null), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [runResult]);

//   const dispatch = (command, apiCall) => {
//     setAutomations(prev => {
//       const next = command.execute(prev);
//       setHistory(h => [...h, command]);
//       return next;
//     });
//     if (apiCall) {
//       apiCall().catch(() => {
//         setAutomations(prev => command.undo(prev));
//         setHistory(h => h.slice(0, -1));
//       });
//     }
//   };

//   const undoLast = () => {
//     if (!history.length) return;
//     const last = history[history.length - 1];
//     setAutomations(prev => last.undo(prev));
//     setHistory(h => h.slice(0, -1));
//   };

//   const stats = useMemo(() => ({
//     total: automations.length,
//     active: automations.filter(a => a.isOn).length,
//     inactive: automations.filter(a => !a.isOn).length,
//   }), [automations]);

//   const activeAutos = automations.filter(a => a.isOn);
//   const inactiveAutos = automations.filter(a => !a.isOn);

//   const updateActionRow = (index, updated) => {
//     setNewForm(f => ({ ...f, actions: f.actions.map((r, i) => i === index ? updated : r) }));
//   };
//   const addActionRow = () => {
//     setNewForm(f => ({ ...f, actions: [...f.actions, { device_id: "", action: "ON" }] }));
//   };
//   const removeActionRow = (index) => {
//     setNewForm(f => ({ ...f, actions: f.actions.filter((_, i) => i !== index) }));
//   };

//   const handleToggle = (auto) => {
//     const newIsActive = !auto.isOn;
//     dispatch(
//       new ToggleCommand(auto.id),
//       () => apiFetch(`/automations/${auto._backendId}/toggle`, token, {
//         method: "PATCH",
//         body: JSON.stringify({ isActive: newIsActive }),
//       })
//     );
//   };

//   const handleDelete = (auto) => {
//     dispatch(
//       new DeleteCommand(auto.id),
//       () => apiFetch(`/automations/${auto._backendId}`, token, { method: "DELETE" })
//     );
//     setSettingsAuto(null);
//   };

//   const handleUpdate = (updated) => {
//     dispatch(
//       new UpdateCommand(updated),
//       () => apiFetch(`/automations/${updated._backendId}`, token, {
//         method: "PATCH",
//         body: JSON.stringify({
//           name: updated.name,
//           isActive: updated.isOn,
//           trigger: updated.rawTrigger,
//         }),
//       })
//     );
//     setSettingsAuto(null);
//   };

//   const handleAddNew = async () => {
//     setSubmitError("");
//     if (!newForm.name.trim()) { setSubmitError("Automation name is required."); return; }
//     if (newForm.triggerType === "TIME" && !/^\d{2}:\d{2}$/.test(newForm.triggerTime)) {
//       setSubmitError("Please enter a valid time in HH:MM format."); return;
//     }
//     if (newForm.actions.length === 0) { setSubmitError("At least one action is required."); return; }
//     if (newForm.actions.find(a => !a.device_id)) {
//       setSubmitError("Please select a device for every action."); return;
//     }

//     const trigger = newForm.triggerType === "TIME"
//       ? { type: "TIME", time: newForm.triggerTime }
//       : { type: "CONDITION", condition: { field: "energy_kwh", operator: "gt", value: 10 } };

//     const payload = {
//       name: newForm.name.trim(),
//       trigger,
//       actions: newForm.actions.map(a => ({ device_id: a.device_id, action: a.action })),
//     };

//     setSubmitting(true);
//     try {
//       const data = await apiFetch("/automations", token, {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });
//       const newRule = AutomationFactory.fromBackend(data?.data?.rule || data?.rule, devices);
//       dispatch(new AddCommand(newRule));
//       setNewModal(false);
//       setNewForm(emptyForm);
//     } catch {
//       setSubmitError("Failed to save. Please check your inputs and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // FIXED: Complete runNow function that works with existing backend
//   const runNow = async (auto) => {
//     setRunningId(auto.id);
//     setRunResult(null);
    
//     try {
//       console.log("=== RUNNING AUTOMATION MANUALLY ===");
//       console.log("Automation:", auto.name);
//       console.log("Automation ID:", auto._backendId);
//       console.log("Raw Actions:", auto.rawActions);
      
//       // Check if there are actions
//       if (!auto.rawActions || auto.rawActions.length === 0) {
//         throw new Error("No actions configured for this automation");
//       }
      
//       // Execute actions directly via device control endpoint
//       const actionResults = [];
//       let allSuccessful = true;
      
//       for (let i = 0; i < auto.rawActions.length; i++) {
//         const action = auto.rawActions[i];
        
//         // Extract device ID from various possible formats
//         let deviceId = null;
//         if (typeof action.device === 'string') {
//           deviceId = action.device;
//         } else if (action.device?._id) {
//           deviceId = action.device._id;
//         } else if (action.device_id) {
//           deviceId = action.device_id;
//         } else if (action.device?.toString && action.device.toString() !== '[object Object]') {
//           deviceId = action.device.toString();
//         }
        
//         if (!deviceId) {
//           console.error(`Action ${i}: Could not extract device ID from:`, action);
//           actionResults.push({ 
//             actionNumber: i + 1,
//             action: action.action, 
//             error: "No device ID found",
//             success: false 
//           });
//           allSuccessful = false;
//           continue;
//         }
        
//         console.log(`Action ${i + 1}: Executing ${action.action} on device ${deviceId}`);
        
//         try {
//           // Call the device control endpoint
//           const controlResponse = await apiFetch(`/devices/${deviceId}/control`, token, {
//             method: "POST",
//             body: JSON.stringify({ action: action.action })
//           });
          
//           actionResults.push({
//             actionNumber: i + 1,
//             deviceId: deviceId,
//             action: action.action,
//             success: true,
//             response: controlResponse
//           });
          
//           console.log(`Action ${i + 1}: ✅ Successfully executed ${action.action}`);
          
//           // Small delay between actions
//           if (i < auto.rawActions.length - 1) {
//             await new Promise(resolve => setTimeout(resolve, 500));
//           }
          
//         } catch (actionError) {
//           console.error(`Action ${i + 1}: ❌ Failed:`, actionError);
//           actionResults.push({
//             actionNumber: i + 1,
//             action: action.action,
//             error: actionError.message,
//             success: false
//           });
//           allSuccessful = false;
//         }
//       }
      
//       // Set result message
//       if (allSuccessful) {
//         setRunResult({
//           success: true,
//           automationName: auto.name,
//           message: `✅ "${auto.name}" executed successfully! ${actionResults.length} action(s) completed.`,
//           details: actionResults,
//           timestamp: new Date().toLocaleTimeString()
//         });
//       } else {
//         const successCount = actionResults.filter(r => r.success).length;
//         setRunResult({
//           success: false,
//           automationName: auto.name,
//           message: `⚠️ "${auto.name}" partially executed. ${successCount}/${actionResults.length} actions succeeded.`,
//           details: actionResults,
//           timestamp: new Date().toLocaleTimeString()
//         });
//       }
      
//       // Refresh devices and automations after execution
//       setTimeout(async () => {
//         const devicesList = await fetchDevices();
//         await fetchAutomations(devicesList, true);
//       }, 1000);
      
//     } catch (err) {
//       console.error("Run failed:", err);
//       setRunResult({
//         success: false,
//         automationName: auto.name,
//         message: `❌ Failed to execute "${auto.name}": ${err.message}`,
//         timestamp: new Date().toLocaleTimeString()
//       });
//     } finally {
//       setTimeout(() => setRunningId(null), 1500);
//     }
//   };

//   const handleAddSuggested = async (s) => {
//     const trigger = { type: "TIME", time: "22:00" };
//     const firstDevice = devices[0];
//     const actions = firstDevice ? [{ device_id: firstDevice._id, action: "ON" }] : [];
//     try {
//       if (!actions.length) throw new Error("No devices");
//       const data = await apiFetch("/automations", token, {
//         method: "POST",
//         body: JSON.stringify({ name: s.name, trigger, actions }),
//       });
//       const newRule = AutomationFactory.fromBackend(data?.data?.rule || data?.rule, devices);
//       dispatch(new AddCommand(newRule));
//     } catch {
//       const local = AutomationFactory.create({ name: s.name, trigger: s.trigger, icon: s.icon });
//       dispatch(new AddCommand(local));
//     }
//   };

//   const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "20px" };
//   const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" };
//   const btnPrimary = { background: submitting ? "#aaa" : GREEN, color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" };
//   const btnSecondary = { background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
//   const modalBox = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.20)", padding: "28px", width: "min(500px, 92vw)", zIndex: 1001, maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.25s ease" };

//   const FieldLabel = ({ text }) => <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>{text}</p>;
//   const ModalHeader = ({ title, onClose }) => (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//       <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{title}</h5>
//       <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
//         <X size={20} color="#888" strokeWidth={2} />
//       </button>
//     </div>
//   );

//   const AutoCard = ({ auto, showRun }) => {
//     const Icon = auto.icon;
//     const isRunning = runningId === auto.id;
//     return (
//       <div style={{ ...card, transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
//         onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(92,53,176,0.10)"; }}
//         onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.06)"; }}>
//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//             <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: auto.isOn ? "rgba(92,53,176,0.10)" : "#f0eef8", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${auto.isOn ? "rgba(92,53,176,0.22)" : "#e4e0f0"}` }}>
//               <Icon size={22} color={auto.isOn ? ACCENT : "#a098c0"} strokeWidth={1.8} />
//             </div>
//             <div>
//               <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{auto.name}</p>
//               <p style={{ margin: 0, fontSize: "12px", color: "#888", marginTop: "2px" }}>{auto.schedule}</p>
//               {auto.lastRunAt && (
//                 <p style={{ margin: 0, fontSize: "11px", color: "#63a17f", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
//                   <Clock size={10} /> Last ran {new Date(auto.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <button onClick={() => setSettingsAuto({ ...auto })}
//               style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}>
//               <Settings size={15} color="#aaa" strokeWidth={1.8} />
//             </button>
//             <Toggle isOn={auto.isOn} onChange={() => handleToggle(auto)} />
//           </div>
//         </div>
//         <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
//           {auto.actions.length === 0
//             ? <li style={{ fontSize: "13px", color: "#bbb", fontStyle: "italic" }}>No actions configured</li>
//             : auto.actions.map((a, i) => (
//               <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555" }}>
//                 <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
//                 {a}
//               </li>
//             ))}
//         </ul>
//         {showRun && (
//           <button onClick={() => runNow(auto)}
//             style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "9px 0", borderRadius: "8px", border: "1.5px solid #e0dcea", background: isRunning ? "rgba(92,53,176,0.08)" : "white", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: isRunning ? ACCENT : "#444", transition: "all 0.2s ease" }}>
//             <Play size={13} color={isRunning ? ACCENT : "#666"} strokeWidth={2.5} />
//             {isRunning ? "Running..." : "Run Now"}
//           </button>
//         )}
//       </div>
//     );
//   };

//   const statCards = [
//     { label: "Total", value: stats.total, accent: ACCENT, bg: "#f3f0fc" },
//     { label: "Active", value: stats.active, accent: "#b8860b", bg: "#fdf8e8" },
//     { label: "Inactive", value: stats.inactive, accent: "#5a85c8", bg: "#eef3fb" },
//   ];

//   return (
//     <Layout>
//       <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f9fa,#eef3f7)" }}>

//         <div className="container-fluid d-flex align-items-center justify-content-between" style={{ padding: "16px 24px" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
//             <StatusPill online={online} loading={loadingAutos} />
//             {history.length > 0 && (
//               <button onClick={undoLast}
//                 style={{ background: "#63a17f", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", color: "white", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
//                 <RotateCcw size={13} /> Undo
//               </button>
//             )}
//           </div>
//           <button onClick={() => setNewModal(true)}
//             className="btn text-white d-flex align-items-center"
//             style={{ background: "#63a17f", border: "1px solid #63a17f", borderRadius: "8px", gap: "6px", fontSize: "13px", fontWeight: 600, padding: "6px 14px" }}>
//             <Plus size={16} /> New Automation
//           </button>
//         </div>

//         <div className="p-4" style={{ maxWidth: "960px", margin: "0 auto" }}>

//           <div style={{ marginBottom: "24px" }}>
//             <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>Automations</h2>
//             <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>Create and manage your smart home routines</p>
//           </div>

//           {/* Run Result Notification */}
//           {runResult && (
//             <div style={{ 
//               ...card, 
//               marginBottom: "20px", 
//               background: runResult.success ? "#e8f5ee" : "#fee8e8", 
//               border: `1px solid ${runResult.success ? "#63a17f" : "#c03030"}`,
//               animation: "slideDown 0.3s ease"
//             }}>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                 <div style={{ flex: 1 }}>
//                   <p style={{ margin: 0, fontWeight: "600", color: runResult.success ? GREEN : "#c03030" }}>
//                     {runResult.message}
//                   </p>
//                   <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#888" }}>
//                     {runResult.timestamp}
//                   </p>
//                   {runResult.details && runResult.details.length > 0 && (
//                     <details style={{ marginTop: "8px" }}>
//                       <summary style={{ fontSize: "11px", cursor: "pointer", color: "#666" }}>View details</summary>
//                       <div style={{ marginTop: "6px", fontSize: "11px" }}>
//                         {runResult.details.map((detail, idx) => (
//                           <div key={idx} style={{ padding: "2px 0", color: detail.success ? GREEN : "#c03030" }}>
//                             Action {detail.actionNumber}: {detail.action} - {detail.success ? "✓ Success" : `✗ ${detail.error}`}
//                           </div>
//                         ))}
//                       </div>
//                     </details>
//                   )}
//                 </div>
//                 <button onClick={() => setRunResult(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
//                   <X size={16} color="#888" />
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="row g-3" style={{ marginBottom: "32px" }}>
//             {statCards.map((s, i) => (
//               <div key={i} className="col-6 col-md-3">
//                 <div style={{ background: s.bg, borderRadius: "14px", padding: "18px 20px", border: `1px solid ${s.accent}22` }}>
//                   <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: s.accent, letterSpacing: "0.04em" }}>{s.label}</p>
//                   <p style={{ margin: 0, fontSize: "32px", fontWeight: "700", color: s.accent, lineHeight: 1 }}>{s.value}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {loadingAutos && (
//             <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" }}>
//               <RotateCcw size={20} style={{ animation: "spin 1s linear infinite", marginBottom: "8px" }} />
//               <p style={{ margin: 0 }}>Loading automations...</p>
//             </div>
//           )}

//           {!loadingAutos && (
//             <>
//               <SectionHeader title="Active Automations" />
//               <div className="row g-3" style={{ marginBottom: "32px" }}>
//                 {activeAutos.length === 0
//                   ? <p style={{ color: "#aaa", fontSize: "14px", padding: "0 12px" }}>No active automations.</p>
//                   : activeAutos.map(auto => (
//                     <div key={auto.id} className="col-md-6">
//                       <AutoCard auto={auto} showRun={false} />
//                     </div>
//                   ))}
//               </div>

//               <SectionHeader title="Inactive Automations" />
//               <div className="row g-3" style={{ marginBottom: "32px" }}>
//                 {inactiveAutos.length === 0
//                   ? <p style={{ color: "#aaa", fontSize: "14px", padding: "0 12px" }}>No inactive automations.</p>
//                   : inactiveAutos.map(auto => (
//                     <div key={auto.id} className="col-md-6">
//                       <AutoCard auto={auto} showRun={true} />
//                     </div>
//                   ))}
//               </div>

//               <SectionHeader title="Suggested Automations" />
//               <div className="row g-3">
//                 {suggested.map(s => {
//                   const Icon = s.icon;
//                   const already = automations.some(a => a.name === s.name);
//                   return (
//                     <div key={s.id} className="col-md-4">
//                       <div
//                         onClick={() => !already && handleAddSuggested(s)}
//                         style={{ ...card, textAlign: "center", cursor: already ? "default" : "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", opacity: already ? 0.65 : 1 }}
//                         onMouseEnter={e => { if (!already) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(92,53,176,0.10)"; }}}
//                         onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.06)"; }}>
//                         <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#f3f0fc", border: "1px solid rgba(92,53,176,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
//                           {already ? <Check size={24} color={GREEN} strokeWidth={2} /> : <Icon size={26} color={ACCENT} strokeWidth={1.8} />}
//                         </div>
//                         <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{s.name}</p>
//                         <p style={{ margin: 0, fontSize: "12px", color: already ? GREEN : "#888" }}>{already ? "Added" : s.desc}</p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {newModal && (
//         <>
//           <Overlay onClick={() => setNewModal(false)} />
//           <div style={modalBox}>
//             <ModalHeader title="New Automation" onClose={() => setNewModal(false)} />
//             <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//               <div>
//                 <FieldLabel text="Automation Name" />
//                 <input style={inputStyle} placeholder="e.g. Morning Routine"
//                   value={newForm.name}
//                   onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
//               </div>
//               <div>
//                 <FieldLabel text="Trigger Type" />
//                 <select style={inputStyle} value={newForm.triggerType}
//                   onChange={e => setNewForm(f => ({ ...f, triggerType: e.target.value }))}>
//                   <option value="TIME">Time-based</option>
//                   <option value="CONDITION">Condition-based</option>
//                 </select>
//               </div>
//               {newForm.triggerType === "TIME" && (
//                 <div>
//                   <FieldLabel text="Scheduled Time" />
//                   <input style={inputStyle} type="time" value={newForm.triggerTime}
//                     onChange={e => setNewForm(f => ({ ...f, triggerTime: e.target.value }))} />
//                 </div>
//               )}
//               <div>
//                 <FieldLabel text="Actions" />
//                 <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#aaa" }}>Select a device and what it should do</p>
//                 {loadingDevices ? (
//                   <div style={{ padding: "12px", background: "#f8f8f8", borderRadius: "8px", fontSize: "13px", color: "#aaa", textAlign: "center" }}>
//                     <RotateCcw size={13} style={{ animation: "spin 1s linear infinite", marginRight: "6px" }} />
//                     Loading your devices...
//                   </div>
//                 ) : devices.length === 0 ? (
//                   <div style={{ padding: "12px", background: "#fef9e8", borderRadius: "8px", fontSize: "13px", color: "#b8860b", border: "1px solid #e0de80" }}>
//                     No devices found. Add devices first before creating automations.
//                   </div>
//                 ) : (
//                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//                     {newForm.actions.map((row, i) => (
//                       <DeviceActionRow
//                         key={i} row={row} devices={devices} loadingDevices={loadingDevices}
//                         onChange={updated => updateActionRow(i, updated)}
//                         onRemove={() => removeActionRow(i)}
//                         showRemove={newForm.actions.length > 1}
//                       />
//                     ))}
//                     <button onClick={addActionRow}
//                       style={{ background: "none", border: `1.5px dashed ${ACCENT}55`, borderRadius: "8px", padding: "8px", cursor: "pointer", color: ACCENT, fontSize: "13px", fontWeight: "600" }}>
//                       + Add Another Action
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {submitError && (
//                 <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fdd", fontSize: "13px", color: "#c03030" }}>
//                   {submitError}
//                 </div>
//               )}
//             </div>
//             <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
//               <button style={btnSecondary} onClick={() => setNewModal(false)}>Cancel</button>
//               <button style={btnPrimary} onClick={handleAddNew} disabled={submitting}>
//                 {submitting
//                   ? <><RotateCcw size={13} style={{ animation: "spin 1s linear infinite", marginRight: "6px" }} />Saving...</>
//                   : "Create Automation"}
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {settingsAuto && (
//         <>
//           <Overlay onClick={() => setSettingsAuto(null)} />
//           <div style={modalBox}>
//             <ModalHeader title={`Settings — ${settingsAuto.name}`} onClose={() => setSettingsAuto(null)} />
//             <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//               <div>
//                 <FieldLabel text="Automation Name" />
//                 <input style={inputStyle} value={settingsAuto.name}
//                   onChange={e => setSettingsAuto(s => ({ ...s, name: e.target.value }))} />
//               </div>
//               <div>
//                 <FieldLabel text="Trigger Type" />
//                 <input style={{ ...inputStyle, background: "#f8f8f8", color: "#999" }}
//                   value={settingsAuto.rawTrigger?.type || "—"} disabled />
//                 <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#bbb" }}>Trigger type cannot be changed after creation</p>
//               </div>
//               {settingsAuto.rawTrigger?.type === "TIME" && (
//                 <div>
//                   <FieldLabel text="Scheduled Time" />
//                   <input style={inputStyle} type="time"
//                     value={settingsAuto.rawTrigger?.time || ""}
//                     onChange={e => setSettingsAuto(s => ({
//                       ...s,
//                       rawTrigger: { ...s.rawTrigger, time: e.target.value },
//                       schedule: `Every day at ${e.target.value}`,
//                     }))} />
//                 </div>
//               )}
//               <div>
//                 <FieldLabel text="Status" />
//                 <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                   <Toggle isOn={settingsAuto.isOn} onChange={() => setSettingsAuto(s => ({ ...s, isOn: !s.isOn }))} />
//                   <span style={{ fontSize: "13px", color: "#555" }}>{settingsAuto.isOn ? "Active" : "Inactive"}</span>
//                 </div>
//               </div>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fdd" }}>
//                 <span style={{ fontSize: "13px", fontWeight: "600", color: "#c03030" }}>Delete this automation</span>
//                 <button onClick={() => handleDelete(settingsAuto)}
//                   style={{ background: "#c03030", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
//                   Delete
//                 </button>
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
//               <button style={btnSecondary} onClick={() => setSettingsAuto(null)}>Cancel</button>
//               <button style={{ ...btnPrimary, background: GREEN }} onClick={() => handleUpdate(settingsAuto)}>Save Changes</button>
//             </div>
//           </div>
//         </>
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
//         @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
//         @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
//         @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
//         h5 { font-size: 1.1rem; }
//       `}</style>
//     </Layout>
//   );
// };

// export default Automations;


import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Layout from "../Components/Layout";
import {
  Plus, Play, Settings, X, Moon, Sun, Plane, Zap, Home, Check, RotateCcw, Wifi, WifiOff, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const apiFetch = async (path, token, options = {}) => {
  const storedToken = token || localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
};

const iconMap = {
  schedule: Sun, motion: Home, manual: Zap,
  moon: Moon, plane: Plane, TIME: Sun, CONDITION: Zap,
};

// 
// STRATEGY PATTERN - Trigger Strategy
// 

/**
 * Strategy Interface - 
 * All trigger strategies must implement this
 */
class TriggerStrategy {
  getDescription(trigger) {
    throw new Error("Method must be implemented");
  }
  
  shouldExecute(trigger, lastRunTime) {
    throw new Error("Method must be implemented");
  }
  
  getScheduleDisplay(trigger) {
    throw new Error("Method must be implemented");
  }
}

/**
 * Concrete Strategy - Time-based trigger
 */
class TimeTriggerStrategy extends TriggerStrategy {
  getDescription(trigger) {
    return `Every day at ${trigger.time}`;
  }
  
  shouldExecute(trigger, lastRunTime, currentTime = new Date()) {
    if (!trigger.time) return false;
    
    const [scheduledHour, scheduledMinute] = trigger.time.split(':').map(Number);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    const timeMatch = currentHour === scheduledHour && currentMinute === scheduledMinute;
    const alreadyRanRecently = lastRunTime && (currentTime.getTime() - lastRunTime) < 120000;
    
    return timeMatch && !alreadyRanRecently;
  }
  
  getScheduleDisplay(trigger) {
    return `Every day at ${trigger.time}`;
  }
}

/**
 * Concrete Strategy - Condition-based trigger
 */
class ConditionTriggerStrategy extends TriggerStrategy {
  getDescription(trigger) {
    const condition = trigger.condition || {};
    return `When ${condition.field || 'device'} ${condition.operator || 'changes'} ${condition.value || ''}`;
  }
  
  shouldExecute(trigger, lastRunTime, currentTime = new Date()) {
    // Condition-based triggers are evaluated by the backend

    return false;
  }
  
  getScheduleDisplay(trigger) {
    const condition = trigger.condition || {};
    const field = condition.field || 'device';
    const operator = condition.operator || 'changes';
    const value = condition.value || '';
    
    const operatorMap = {
      'gt': '>',
      'lt': '<',
      'eq': '=',
      'gte': '≥',
      'lte': '≤',
      'changes': 'changes'
    };
    
    return `${field} ${operatorMap[operator] || operator} ${value}`.trim();
  }
}

/**
 * Context - Uses the selected strategy
 */
class TriggerContext {
  constructor(strategy) {
    this._strategy = strategy;
  }
  
  setStrategy(strategy) {
    this._strategy = strategy;
  }
  
  getDescription(trigger) {
    return this._strategy.getDescription(trigger);
  }
  
  shouldExecute(trigger, lastRunTime, currentTime) {
    return this._strategy.shouldExecute(trigger, lastRunTime, currentTime);
  }
  
  getScheduleDisplay(trigger) {
    return this._strategy.getScheduleDisplay(trigger);
  }
}

// Strategy factory
const TriggerStrategyFactory = {
  create(triggerType) {
    switch (triggerType) {
      case 'TIME':
        return new TimeTriggerStrategy();
      case 'CONDITION':
        return new ConditionTriggerStrategy();
      default:
        return new TimeTriggerStrategy();
    }
  }
};


class AutomationFactory {
  static create({ name, schedule = "Manual", trigger = "manual", actions = [], isOn = false, icon }) {
    return {
      id: Date.now() + Math.random(),
      name, schedule, trigger, actions, isOn,
      icon: icon || iconMap[trigger] || Zap,
    };
  }

  static fromBackend(rule, devicesList = []) {
    const triggerType = rule.trigger?.type || "manual";
    
    // Use Strategy Pattern to get the schedule description
    const strategy = TriggerStrategyFactory.create(triggerType);
    const context = new TriggerContext(strategy);
    const schedule = context.getScheduleDisplay(rule.trigger);

    const actionLabels = (rule.actions || []).map((a) => {
      let deviceId = null;
      if (typeof a.device === "string") {
        deviceId = a.device;
      } else if (a.device?._id) {
        deviceId = a.device._id.toString();
      } else if (a.device_id) {
        deviceId = a.device_id;
      } else if (a.device?.toString) {
        deviceId = a.device.toString();
      }
      
      const found = devicesList.find(d => d._id?.toString() === deviceId);
      if (found) return `Turn ${a.action} ${found.name}`;
      return `Turn ${a.action} device`;
    });

    return {
      id: rule._id,
      _backendId: rule._id,
      name: rule.name,
      schedule,
      trigger: triggerType.toLowerCase(),
      actions: actionLabels,
      isOn: rule.isActive,
      icon: iconMap[triggerType] || Zap,
      rawTrigger: rule.trigger,
      rawActions: rule.actions,
      lastRunAt: rule.lastRunAt,
      createdBy: rule.createdBy,
    };
  }
}

class ToggleCommand {
  constructor(id) { this.id = id; }
  execute(list) { return list.map(a => a.id === this.id ? { ...a, isOn: !a.isOn } : a); }
  undo(list) { return this.execute(list); }
}
class AddCommand {
  constructor(auto) { this.auto = auto; }
  execute(list) { return [...list, this.auto]; }
  undo(list) { return list.filter(a => a.id !== this.auto.id); }
}
class DeleteCommand {
  constructor(id) { this.id = id; this._deleted = null; this._index = null; }
  execute(list) {
    this._index = list.findIndex(a => a.id === this.id);
    this._deleted = list[this._index];
    return list.filter(a => a.id !== this.id);
  }
  undo(list) {
    const result = [...list];
    result.splice(this._index, 0, this._deleted);
    return result;
  }
}
class UpdateCommand {
  constructor(updated) { this.updated = updated; this._prev = null; }
  execute(list) {
    this._prev = list.find(a => a.id === this.updated.id);
    return list.map(a => a.id === this.updated.id ? { ...this.updated } : a);
  }
  undo(list) { return list.map(a => a.id === this._prev.id ? { ...this._prev } : a); }
}

class LiveAutomationStrategy {
  async fetch(token, devicesList = [], currentUserId = null) {
    const data = await apiFetch("/automations", token);
    const rules = data?.data?.rules || data?.rules || [];
    const filtered = currentUserId
      ? rules.filter(r => r.createdBy?.toString() === currentUserId.toString())
      : rules;
    return filtered.map(r => AutomationFactory.fromBackend(r, devicesList));
  }
}

const buildRoomIdSet = (rooms) => {
  const ids = new Set();
  rooms.forEach(r => {
    if (r._id) ids.add(r._id.toString());
    if (r.id) ids.add(r.id.toString());
  });
  return ids;
};

const deviceBelongsToUser = (device, roomIdSet) => {
  if (!device.room) return false;
  const roomId = typeof device.room === "object"
    ? (device.room._id || device.room.id)
    : device.room;
  if (!roomId) return false;
  return roomIdSet.has(roomId.toString());
};

const suggested = [
  { id: "s1", name: "Bedtime Routine", desc: "Wind down your home at night", trigger: "schedule", icon: Moon },
  { id: "s2", name: "Wake Up", desc: "Start your day right", trigger: "schedule", icon: Sun },
  { id: "s3", name: "Vacation Mode", desc: "Simulate presence while away", trigger: "manual", icon: Plane },
];

const ACCENT = "#5c35b0";
const GREEN = "#63a17f";
const ACTION_OPTIONS = ["ON", "OFF", "IDLE"];

const Toggle = ({ isOn, onChange }) => (
  <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer", flexShrink: 0 }}>
    <input type="checkbox" checked={isOn} onChange={onChange} style={{ display: "none" }} />
    <span style={{ position: "absolute", inset: 0, borderRadius: "24px", background: isOn ? `linear-gradient(135deg,${ACCENT},#7c5cc8)` : "#d0cce0", transition: "background 0.3s ease", boxShadow: isOn ? "0 0 10px rgba(92,53,176,0.45)" : "none" }} />
    <span style={{ position: "absolute", width: "18px", height: "18px", background: "white", borderRadius: "50%", top: "3px", left: isOn ? "23px" : "3px", transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
  </label>
);

const SectionHeader = ({ title }) => (
  <div style={{ marginBottom: "20px", marginTop: "8px" }}>
    <h5 style={{ margin: "0 0 10px", fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{title}</h5>
    <hr style={{ margin: 0, border: "none", borderTop: "1.5px solid #e8e4f0" }} />
  </div>
);

const Overlay = ({ onClick }) => (
  <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, animation: "fadeIn 0.2s ease" }} />
);

const StatusPill = ({ online, loading }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: loading ? "#f0f0f0" : online ? "#e8f5ee" : "#fdecea", color: loading ? "#888" : online ? GREEN : "#c03030" }}>
    {loading
      ? <RotateCcw size={10} style={{ animation: "spin 1s linear infinite" }} />
      : online ? <Wifi size={10} /> : <WifiOff size={10} />}
    {loading ? "Loading..." : online ? "Live" : "Offline"}
  </span>
);

const DeviceActionRow = ({ row, devices, loadingDevices, onChange, onRemove, showRemove }) => (
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <select
      value={row.device_id}
      onChange={e => onChange({ ...row, device_id: e.target.value })}
      style={{ flex: 2, padding: "9px 12px", borderRadius: "8px", border: `1.5px solid ${row.device_id ? "#e0dcea" : "#f0a0a0"}`, fontSize: "13px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" }}>
      <option value="">
        {loadingDevices ? "Loading devices..." : "Select device"}
      </option>
      {devices.map(d => (
        <option key={d._id} value={d._id}>
          {d.name} ({d.type})
        </option>
      ))}
    </select>
    <select
      value={row.action}
      onChange={e => onChange({ ...row, action: e.target.value })}
      style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "13px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" }}>
      {ACTION_OPTIONS.map(a => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
    {showRemove && (
      <button onClick={onRemove}
        style={{ background: "#fee8e8", border: "none", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
        <X size={14} color="#c03030" />
      </button>
    )}
  </div>
);

const Automations = () => {
  const { token, user } = useAuth();

  const [automations, setAutomations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingAutos, setLoadingAutos] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [online, setOnline] = useState(false);

  const [history, setHistory] = useState([]);
  const [runningId, setRunningId] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [settingsAuto, setSettingsAuto] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const lastAutoRun = useRef({});

  const emptyForm = {
    name: "",
    triggerType: "TIME",
    triggerTime: "07:00",
    actions: [{ device_id: "", action: "ON" }],
  };
  const [newForm, setNewForm] = useState(emptyForm);

  const fetchDevices = useCallback(async (t) => {
    setLoadingDevices(true);
    try {
      const tok = t || token || localStorage.getItem("token");
      const homeData = await apiFetch("/homes/mine", tok);
      const home = homeData?.data?.home || homeData?.home;
      const homeId = home?.id || home?._id;
      if (!homeId) { setDevices([]); return []; }
      const roomData = await apiFetch(`/rooms/${homeId}/rooms`, tok);
      const roomList = roomData?.data?.rooms || roomData?.rooms || [];
      const roomIdSet = buildRoomIdSet(roomList);
      const devData = await apiFetch("/devices", tok);
      const allDevices = devData?.data?.devices || devData?.devices || [];
      const filtered = allDevices.filter(d => deviceBelongsToUser(d, roomIdSet));
      setDevices(filtered);
      return filtered;
    } catch {
      setDevices([]);
      return [];
    } finally {
      setLoadingDevices(false);
    }
  }, [token]);

  const fetchAutomations = useCallback(async (devicesList = [], silent = false) => {
    if (!silent) setLoadingAutos(true);
    try {
      const tok = token || localStorage.getItem("token");
      const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
      const userId = currentUser?._id || currentUser?.id;
      const strategy = new LiveAutomationStrategy();
      const data = await strategy.fetch(tok, devicesList, userId);
      setAutomations(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      if (!silent) setLoadingAutos(false);
    }
  }, [token, user]);


  useEffect(() => {
    if (automations.length > 0) {
      console.log("=== ALL AUTOMATIONS DETAILS ===");
      automations.forEach(auto => {
        console.log(`Name: ${auto.name}`);
        console.log(`  isOn: ${auto.isOn}`);
        console.log(`  trigger type: ${auto.rawTrigger?.type}`);
        console.log(`  scheduled time: ${auto.rawTrigger?.time}`);
        console.log(`  full trigger:`, auto.rawTrigger);
      });
      console.log("================================");
    }
  }, [automations]);

const checkAndExecuteDueAutomations = useCallback(async () => {
  if (!token || automations.length === 0) return;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  
  console.log(`[Auto-Checker] Checking automations at ${currentTimeStr}`);
  
  const timeBasedAutos = automations.filter(auto => 
    auto.isOn && 
    auto.rawTrigger?.type === 'TIME' &&
    auto.rawTrigger?.time
  );
  
  if (timeBasedAutos.length > 0) {
    console.log(`[Auto-Checker] Found ${timeBasedAutos.length} active time-based automations`);
  }
  
  for (const auto of timeBasedAutos) {
    const scheduledTime = auto.rawTrigger.time;
    const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
    
    const timeMatch = currentHour === scheduledHour && currentMinute === scheduledMinute;
    
    const lastRun = lastAutoRun.current[auto._backendId];
    const alreadyRanRecently = lastRun && (now.getTime() - lastRun) < 120000;
    
    if (timeMatch && !alreadyRanRecently) {
      console.log(`[Auto-Checker] Executing automation: ${auto.name} at ${currentTimeStr} (scheduled: ${scheduledTime})`);

      if (!auto.rawActions || auto.rawActions.length === 0) {
        console.error(`[Auto-Checker] Automation "${auto.name}" has no actions configured!`);
        
        // Try to fetch fresh automation data from backend
        try {
          console.log(`[Auto-Checker] Attempting to fetch fresh data for ${auto.name}...`);
          const freshData = await apiFetch(`/automations/${auto._backendId}`, token);
          console.log(`[Auto-Checker] Fresh data:`, freshData);
          
          const rule = freshData?.data?.rule || freshData?.rule;
          if (rule && rule.actions && rule.actions.length > 0) {
            console.log(`[Auto-Checker] Found ${rule.actions.length} actions in fresh data!`);
      
            for (const action of rule.actions) {
              let deviceId = null;
              if (typeof action.device === 'string') {
                deviceId = action.device;
              } else if (action.device?._id) {
                deviceId = action.device._id;
              } else if (action.device_id) {
                deviceId = action.device_id;
              }
              
              if (deviceId) {
                console.log(`[Auto-Checker] Executing ${action.action} on device ${deviceId}`);
                try {
                  await apiFetch(`/devices/${deviceId}/control`, token, {
                    method: "POST",
                    body: JSON.stringify({ action: action.action })
                  });
                  console.log(`[Auto-Checker] Executed ${action.action}`);
                } catch (err) {
                  console.error(`[Auto-Checker] Failed to execute action:`, err);
                }
              }
            }
          } else {
            console.error(`[Auto-Checker] Still no actions found for "${auto.name}"`);
          }
        } catch (err) {
          console.error(`[Auto-Checker] Failed to fetch fresh data:`, err);
        }
      } else {
      
        console.log(`[Auto-Checker] Executing ${auto.rawActions.length} actions for "${auto.name}"`);
        
        for (const action of auto.rawActions) {
          let deviceId = null;
          if (typeof action.device === 'string') {
            deviceId = action.device;
          } else if (action.device?._id) {
            deviceId = action.device._id;
          } else if (action.device_id) {
            deviceId = action.device_id;
          }
          
          if (deviceId) {
            console.log(`[Auto-Checker] Executing ${action.action} on device ${deviceId}`);
            try {
              await apiFetch(`/devices/${deviceId}/control`, token, {
                method: "POST",
                body: JSON.stringify({ action: action.action })
              });
              console.log(`[Auto-Checker]  Executed ${action.action}`);
            } catch (err) {
              console.error(`[Auto-Checker] Failed to execute action:`, err);
            }
          }
        }
      }
      
      lastAutoRun.current[auto._backendId] = now.getTime();

      setTimeout(async () => {
        const devicesList = await fetchDevices();
        await fetchAutomations(devicesList, true);
      }, 60000);
    }
  }
}, [automations, token, fetchDevices, fetchAutomations]);

  useEffect(() => {
    const tok = token || localStorage.getItem("token");
    if (!tok) return;

    setAutomations([]);
    setDevices([]);

    const init = async () => {
      const devicesList = await fetchDevices(tok);
      await fetchAutomations(devicesList);
    };
    init();

    const pollId = setInterval(async () => {
      const tok2 = token || localStorage.getItem("token");
      if (!tok2) return;
      try {
        const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
        const userId = currentUser?._id || currentUser?.id;
        const devData = await apiFetch("/devices", tok2);
        const allDevices = devData?.data?.devices || devData?.devices || [];

        const homeData = await apiFetch("/homes/mine", tok2);
        const home = homeData?.data?.home || homeData?.home;
        const homeId = home?.id || home?._id;
        let filteredDevs = allDevices;
        if (homeId) {
          const roomData = await apiFetch(`/rooms/${homeId}/rooms`, tok2);
          const roomList = roomData?.data?.rooms || roomData?.rooms || [];
          const roomIdSet = buildRoomIdSet(roomList);
          filteredDevs = allDevices.filter(d => deviceBelongsToUser(d, roomIdSet));
        }
        setDevices(filteredDevs);

        const strategy = new LiveAutomationStrategy();
        const data = await strategy.fetch(tok2, filteredDevs, userId);
        setAutomations(data);
        setOnline(true);
      } catch {
        setOnline(false);
      }
    }, 15000);

    return () => clearInterval(pollId);
  }, [token]);

  useEffect(() => {
    if (newModal) {
      fetchDevices();
      setNewForm(emptyForm);
      setSubmitError("");
    }
  }, [newModal]);

  useEffect(() => {
    if (runResult) {
      const timer = setTimeout(() => setRunResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [runResult]);

  const dispatch = (command, apiCall) => {
    setAutomations(prev => {
      const next = command.execute(prev);
      setHistory(h => [...h, command]);
      return next;
    });
    if (apiCall) {
      apiCall().catch(() => {
        setAutomations(prev => command.undo(prev));
        setHistory(h => h.slice(0, -1));
      });
    }
  };

  const undoLast = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setAutomations(prev => last.undo(prev));
    setHistory(h => h.slice(0, -1));
  };

  const stats = useMemo(() => ({
    total: automations.length,
    active: automations.filter(a => a.isOn).length,
    inactive: automations.filter(a => !a.isOn).length,
  }), [automations]);

  const activeAutos = automations.filter(a => a.isOn);
  const inactiveAutos = automations.filter(a => !a.isOn);

  const updateActionRow = (index, updated) => {
    setNewForm(f => ({ ...f, actions: f.actions.map((r, i) => i === index ? updated : r) }));
  };
  const addActionRow = () => {
    setNewForm(f => ({ ...f, actions: [...f.actions, { device_id: "", action: "ON" }] }));
  };
  const removeActionRow = (index) => {
    setNewForm(f => ({ ...f, actions: f.actions.filter((_, i) => i !== index) }));
  };

  const handleToggle = (auto) => {
    const newIsActive = !auto.isOn;
    dispatch(
      new ToggleCommand(auto.id),
      () => apiFetch(`/automations/${auto._backendId}/toggle`, token, {
        method: "PATCH",
        body: JSON.stringify({ isActive: newIsActive }),
      })
    );
  };

  const handleDelete = (auto) => {
    dispatch(
      new DeleteCommand(auto.id),
      () => apiFetch(`/automations/${auto._backendId}`, token, { method: "DELETE" })
    );
    setSettingsAuto(null);
  };

  const handleUpdate = (updated) => {
    dispatch(
      new UpdateCommand(updated),
      () => apiFetch(`/automations/${updated._backendId}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          name: updated.name,
          isActive: updated.isOn,
          trigger: updated.rawTrigger,
        }),
      })
    );
    setSettingsAuto(null);
  };

  const handleAddNew = async () => {
    setSubmitError("");
    if (!newForm.name.trim()) { setSubmitError("Automation name is required."); return; }
    if (newForm.triggerType === "TIME" && !/^\d{2}:\d{2}$/.test(newForm.triggerTime)) {
      setSubmitError("Please enter a valid time in HH:MM format."); return;
    }
    if (newForm.actions.length === 0) { setSubmitError("At least one action is required."); return; }
    if (newForm.actions.find(a => !a.device_id)) {
      setSubmitError("Please select a device for every action."); return;
    }

    const trigger = newForm.triggerType === "TIME"
      ? { type: "TIME", time: newForm.triggerTime }
      : { type: "CONDITION", condition: { field: "energy_kwh", operator: "gt", value: 10 } };

    const payload = {
      name: newForm.name.trim(),
      trigger,
      actions: newForm.actions.map(a => ({ device_id: a.device_id, action: a.action })),
    };

    setSubmitting(true);
    try {
      const data = await apiFetch("/automations", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const newRule = AutomationFactory.fromBackend(data?.data?.rule || data?.rule, devices);
      dispatch(new AddCommand(newRule));
      setNewModal(false);
      setNewForm(emptyForm);
    } catch {
      setSubmitError("Failed to save. Please check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const runNow = async (auto) => {
    setRunningId(auto.id);
    setRunResult(null);
    
    try {
      console.log("=== RUNNING AUTOMATION MANUALLY ===");
      console.log("Automation:", auto.name);
      console.log("Automation ID:", auto._backendId);
      console.log("Raw Actions:", auto.rawActions);

      if (!auto.rawActions || auto.rawActions.length === 0) {
        throw new Error("No actions configured for this automation");
      }
      

      const actionResults = [];
      let allSuccessful = true;
      
      for (let i = 0; i < auto.rawActions.length; i++) {
        const action = auto.rawActions[i];

        let deviceId = null;
        if (typeof action.device === 'string') {
          deviceId = action.device;
        } else if (action.device?._id) {
          deviceId = action.device._id;
        } else if (action.device_id) {
          deviceId = action.device_id;
        } else if (action.device?.toString && action.device.toString() !== '[object Object]') {
          deviceId = action.device.toString();
        }
        
        if (!deviceId) {
          console.error(`Action ${i}: Could not extract device ID from:`, action);
          actionResults.push({ 
            actionNumber: i + 1,
            action: action.action, 
            error: "No device ID found",
            success: false 
          });
          allSuccessful = false;
          continue;
        }
        
        console.log(`Action ${i + 1}: Executing ${action.action} on device ${deviceId}`);
        
        try {
      
          const controlResponse = await apiFetch(`/devices/${deviceId}/control`, token, {
            method: "POST",
            body: JSON.stringify({ action: action.action })
          });
          
          actionResults.push({
            actionNumber: i + 1,
            deviceId: deviceId,
            action: action.action,
            success: true,
            response: controlResponse
          });
          
          console.log(`Action ${i + 1}: Successfully executed ${action.action}`);
          
          if (i < auto.rawActions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (actionError) {
          console.error(`Action ${i + 1}: ❌ Failed:`, actionError);
          actionResults.push({
            actionNumber: i + 1,
            action: action.action,
            error: actionError.message,
            success: false
          });
          allSuccessful = false;
        }
      }
    
      if (allSuccessful) {
        setRunResult({
          success: true,
          automationName: auto.name,
          message: ` "${auto.name}" executed successfully! ${actionResults.length} action(s) completed.`,
          details: actionResults,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const successCount = actionResults.filter(r => r.success).length;
        setRunResult({
          success: false,
          automationName: auto.name,
          message: `⚠️ "${auto.name}" partially executed. ${successCount}/${actionResults.length} actions succeeded.`,
          details: actionResults,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      

      setTimeout(async () => {
        const devicesList = await fetchDevices();
        await fetchAutomations(devicesList, true);
      }, 1500);
      
    } catch (err) {
      console.error("Run failed:", err);
      setRunResult({
        success: false,
        automationName: auto.name,
        message: `❌ Failed to execute "${auto.name}": ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTimeout(() => setRunningId(null), 1500);
    }
  };

  const handleAddSuggested = async (s) => {
    const trigger = { type: "TIME", time: "22:00" };
    const firstDevice = devices[0];
    const actions = firstDevice ? [{ device_id: firstDevice._id, action: "ON" }] : [];
    try {
      if (!actions.length) throw new Error("No devices");
      const data = await apiFetch("/automations", token, {
        method: "POST",
        body: JSON.stringify({ name: s.name, trigger, actions }),
      });
      const newRule = AutomationFactory.fromBackend(data?.data?.rule || data?.rule, devices);
      dispatch(new AddCommand(newRule));
    } catch {
      const local = AutomationFactory.create({ name: s.name, trigger: s.trigger, icon: s.icon });
      dispatch(new AddCommand(local));
    }
  };

  const card = { background: "white", borderRadius: "14px", boxShadow: "0 6px 15px rgba(0,0,0,0.06)", padding: "20px" };
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e0dcea", fontSize: "14px", outline: "none", color: "#1a1a1a", background: "white", boxSizing: "border-box" };
  const btnPrimary = { background: submitting ? "#aaa" : GREEN, color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" };
  const btnSecondary = { background: "#f0f0f0", color: "#555", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
  const modalBox = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.20)", padding: "28px", width: "min(500px, 92vw)", zIndex: 1001, maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.25s ease" };

  const FieldLabel = ({ text }) => <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#444" }}>{text}</p>;
  const ModalHeader = ({ title, onClose }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <h5 style={{ margin: 0, fontWeight: "700", fontSize: "17px", color: "#1a1a1a" }}>{title}</h5>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
        <X size={20} color="#888" strokeWidth={2} />
      </button>
    </div>
  );

  const AutoCard = ({ auto, showRun }) => {
    const Icon = auto.icon;
    const isRunning = runningId === auto.id;
    return (
      <div style={{ ...card, transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(92,53,176,0.10)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.06)"; }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: auto.isOn ? "rgba(92,53,176,0.10)" : "#f0eef8", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${auto.isOn ? "rgba(92,53,176,0.22)" : "#e4e0f0"}` }}>
              <Icon size={22} color={auto.isOn ? ACCENT : "#a098c0"} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{auto.name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888", marginTop: "2px" }}>{auto.schedule}</p>
              {auto.lastRunAt && (
                <p style={{ margin: 0, fontSize: "11px", color: "#63a17f", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={10} /> Last ran {new Date(auto.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setSettingsAuto({ ...auto })}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}>
              <Settings size={15} color="#aaa" strokeWidth={1.8} />
            </button>
            <Toggle isOn={auto.isOn} onChange={() => handleToggle(auto)} />
          </div>
        </div>
        <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
          {auto.actions.length === 0
            ? <li style={{ fontSize: "13px", color: "#bbb", fontStyle: "italic" }}>No actions configured</li>
            : auto.actions.map((a, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                {a}
              </li>
            ))}
        </ul>
        {showRun && (
          <button onClick={() => runNow(auto)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "9px 0", borderRadius: "8px", border: "1.5px solid #e0dcea", background: isRunning ? "rgba(92,53,176,0.08)" : "white", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: isRunning ? ACCENT : "#444", transition: "all 0.2s ease" }}>
            <Play size={13} color={isRunning ? ACCENT : "#666"} strokeWidth={2.5} />
            {isRunning ? "Running..." : "Run Now"}
          </button>
        )}
      </div>
    );
  };

  const statCards = [
    { label: "Total", value: stats.total, accent: ACCENT, bg: "#f3f0fc" },
    { label: "Active", value: stats.active, accent: "#b8860b", bg: "#fdf8e8" },
    { label: "Inactive", value: stats.inactive, accent: "#5a85c8", bg: "#eef3fb" },
  ];

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8f9fa,#eef3f7)" }}>

        <div className="container-fluid d-flex align-items-center justify-content-between" style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <StatusPill online={online} loading={loadingAutos} />
            {history.length > 0 && (
              <button onClick={undoLast}
                style={{ background: "#63a17f", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", color: "white", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                <RotateCcw size={13} /> Undo
              </button>
            )}
          </div>
          <button onClick={() => setNewModal(true)}
            className="btn text-white d-flex align-items-center"
            style={{ background: "#63a17f", border: "1px solid #63a17f", borderRadius: "8px", gap: "6px", fontSize: "13px", fontWeight: 600, padding: "6px 14px" }}>
            <Plus size={16} /> New Automation
          </button>
        </div>

        <div className="p-4" style={{ maxWidth: "960px", margin: "0 auto" }}>

          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#1a1a1a" }}>Automations</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#777" }}>Create and manage your smart home routines</p>
          </div>


          {runResult && (
            <div style={{ 
              ...card, 
              marginBottom: "20px", 
              background: runResult.success ? "#e8f5ee" : "#fee8e8", 
              border: `1px solid ${runResult.success ? "#63a17f" : "#c03030"}`,
              animation: "slideDown 0.3s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "600", color: runResult.success ? GREEN : "#c03030" }}>
                    {runResult.message}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#888" }}>
                    {runResult.timestamp}
                  </p>
                  {runResult.details && runResult.details.length > 0 && (
                    <details style={{ marginTop: "8px" }}>
                      <summary style={{ fontSize: "11px", cursor: "pointer", color: "#666" }}>View details</summary>
                      <div style={{ marginTop: "6px", fontSize: "11px" }}>
                        {runResult.details.map((detail, idx) => (
                          <div key={idx} style={{ padding: "2px 0", color: detail.success ? GREEN : "#c03030" }}>
                            Action {detail.actionNumber}: {detail.action} - {detail.success ? "✓ Success" : `✗ ${detail.error}`}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
                <button onClick={() => setRunResult(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={16} color="#888" />
                </button>
              </div>
            </div>
          )}

          <div className="row g-3" style={{ marginBottom: "32px" }}>
            {statCards.map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div style={{ background: s.bg, borderRadius: "14px", padding: "18px 20px", border: `1px solid ${s.accent}22` }}>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: s.accent, letterSpacing: "0.04em" }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: "32px", fontWeight: "700", color: s.accent, lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {loadingAutos && (
            <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" }}>
              <RotateCcw size={20} style={{ animation: "spin 1s linear infinite", marginBottom: "8px" }} />
              <p style={{ margin: 0 }}>Loading automations...</p>
            </div>
          )}

          {!loadingAutos && (
            <>
              <SectionHeader title="Active Automations" />
              <div className="row g-3" style={{ marginBottom: "32px" }}>
                {activeAutos.length === 0
                  ? <p style={{ color: "#aaa", fontSize: "14px", padding: "0 12px" }}>No active automations.</p>
                  : activeAutos.map(auto => (
                    <div key={auto.id} className="col-md-6">
                      <AutoCard auto={auto} showRun={false} />
                    </div>
                  ))}
              </div>

              <SectionHeader title="Inactive Automations" />
              <div className="row g-3" style={{ marginBottom: "32px" }}>
                {inactiveAutos.length === 0
                  ? <p style={{ color: "#aaa", fontSize: "14px", padding: "0 12px" }}>No inactive automations.</p>
                  : inactiveAutos.map(auto => (
                    <div key={auto.id} className="col-md-6">
                      <AutoCard auto={auto} showRun={true} />
                    </div>
                  ))}
              </div>

              <SectionHeader title="Suggested Automations" />
              <div className="row g-3">
                {suggested.map(s => {
                  const Icon = s.icon;
                  const already = automations.some(a => a.name === s.name);
                  return (
                    <div key={s.id} className="col-md-4">
                      <div
                        onClick={() => !already && handleAddSuggested(s)}
                        style={{ ...card, textAlign: "center", cursor: already ? "default" : "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", opacity: already ? 0.65 : 1 }}
                        onMouseEnter={e => { if (!already) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(92,53,176,0.10)"; }}}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.06)"; }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#f3f0fc", border: "1px solid rgba(92,53,176,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                          {already ? <Check size={24} color={GREEN} strokeWidth={2} /> : <Icon size={26} color={ACCENT} strokeWidth={1.8} />}
                        </div>
                        <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "15px", color: "#1a1a1a" }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: already ? GREEN : "#888" }}>{already ? "Added" : s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {newModal && (
        <>
          <Overlay onClick={() => setNewModal(false)} />
          <div style={modalBox}>
            <ModalHeader title="New Automation" onClose={() => setNewModal(false)} />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <FieldLabel text="Automation Name" />
                <input style={inputStyle} placeholder="e.g. Morning Routine"
                  value={newForm.name}
                  onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel text="Trigger Type" />
                <select style={inputStyle} value={newForm.triggerType}
                  onChange={e => setNewForm(f => ({ ...f, triggerType: e.target.value }))}>
                  <option value="TIME">Time-based</option>
                  <option value="CONDITION">Condition-based</option>
                </select>
              </div>
              {newForm.triggerType === "TIME" && (
                <div>
                  <FieldLabel text="Scheduled Time" />
                  <input style={inputStyle} type="time" value={newForm.triggerTime}
                    onChange={e => setNewForm(f => ({ ...f, triggerTime: e.target.value }))} />
                </div>
              )}
              <div>
                <FieldLabel text="Actions" />
                <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#aaa" }}>Select a device and what it should do</p>
                {loadingDevices ? (
                  <div style={{ padding: "12px", background: "#f8f8f8", borderRadius: "8px", fontSize: "13px", color: "#aaa", textAlign: "center" }}>
                    <RotateCcw size={13} style={{ animation: "spin 1s linear infinite", marginRight: "6px" }} />
                    Loading your devices...
                  </div>
                ) : devices.length === 0 ? (
                  <div style={{ padding: "12px", background: "#fef9e8", borderRadius: "8px", fontSize: "13px", color: "#b8860b", border: "1px solid #e0de80" }}>
                    No devices found. Add devices first before creating automations.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {newForm.actions.map((row, i) => (
                      <DeviceActionRow
                        key={i} row={row} devices={devices} loadingDevices={loadingDevices}
                        onChange={updated => updateActionRow(i, updated)}
                        onRemove={() => removeActionRow(i)}
                        showRemove={newForm.actions.length > 1}
                      />
                    ))}
                    <button onClick={addActionRow}
                      style={{ background: "none", border: `1.5px dashed ${ACCENT}55`, borderRadius: "8px", padding: "8px", cursor: "pointer", color: ACCENT, fontSize: "13px", fontWeight: "600" }}>
                      + Add Another Action
                    </button>
                  </div>
                )}
              </div>
              {submitError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fdd", fontSize: "13px", color: "#c03030" }}>
                  {submitError}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button style={btnSecondary} onClick={() => setNewModal(false)}>Cancel</button>
              <button style={btnPrimary} onClick={handleAddNew} disabled={submitting}>
                {submitting
                  ? <><RotateCcw size={13} style={{ animation: "spin 1s linear infinite", marginRight: "6px" }} />Saving...</>
                  : "Create Automation"}
              </button>
            </div>
          </div>
        </>
      )}

      {settingsAuto && (
        <>
          <Overlay onClick={() => setSettingsAuto(null)} />
          <div style={modalBox}>
            <ModalHeader title={`Settings — ${settingsAuto.name}`} onClose={() => setSettingsAuto(null)} />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <FieldLabel text="Automation Name" />
                <input style={inputStyle} value={settingsAuto.name}
                  onChange={e => setSettingsAuto(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel text="Trigger Type" />
                <input style={{ ...inputStyle, background: "#f8f8f8", color: "#999" }}
                  value={settingsAuto.rawTrigger?.type || "—"} disabled />
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#bbb" }}>Trigger type cannot be changed after creation</p>
              </div>
              {settingsAuto.rawTrigger?.type === "TIME" && (
                <div>
                  <FieldLabel text="Scheduled Time" />
                  <input style={inputStyle} type="time"
                    value={settingsAuto.rawTrigger?.time || ""}
                    onChange={e => setSettingsAuto(s => ({
                      ...s,
                      rawTrigger: { ...s.rawTrigger, time: e.target.value },
                      schedule: `Every day at ${e.target.value}`,
                    }))} />
                </div>
              )}
              <div>
                <FieldLabel text="Status" />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Toggle isOn={settingsAuto.isOn} onChange={() => setSettingsAuto(s => ({ ...s, isOn: !s.isOn }))} />
                  <span style={{ fontSize: "13px", color: "#555" }}>{settingsAuto.isOn ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fdd" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#c03030" }}>Delete this automation</span>
                <button onClick={() => handleDelete(settingsAuto)}
                  style={{ background: "#c03030", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
              <button style={btnSecondary} onClick={() => setSettingsAuto(null)}>Cancel</button>
              <button style={{ ...btnPrimary, background: GREEN }} onClick={() => handleUpdate(settingsAuto)}>Save Changes</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        h5 { font-size: 1.1rem; }
      `}</style>
    </Layout>
  );
};

export default Automations;