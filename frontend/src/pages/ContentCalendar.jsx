import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft, Zap, Plus, ChevronLeft, ChevronRight,
  X, Trash2, Edit3, Check, Calendar
} from "lucide-react";

const TYPE_COLORS = {
  blog:     { bg: "bg-blue-500/20",   text: "text-blue-400",   dot: "bg-blue-400" },
  email:    { bg: "bg-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  ad:       { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  linkedin: { bg: "bg-cyan-500/20",   text: "text-cyan-400",   dot: "bg-cyan-400" },
  summary:  { bg: "bg-green-500/20",  text: "text-green-400",  dot: "bg-green-400" },
};

const STATUS_STYLES = {
  planned:   "bg-gray-700 text-gray-300",
  draft:     "bg-yellow-500/20 text-yellow-400",
  published: "bg-green-500/20 text-green-400",
};

const MONTHS = ["January","February","March","April","May","June",
                 "July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TYPES  = ["blog","email","ad","linkedin","summary"];

const today = new Date();

export default function ContentCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "", type: "blog", scheduledDate: "", status: "planned", notes: "", content: ""
  });
  const [saving, setSaving] = useState(false);

  const month = currentDate.getMonth();
  const year  = currentDate.getFullYear();

  useEffect(() => { fetchEvents(); }, [month, year]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/calendar?month=${month + 1}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.scheduledDate) {
      toast.error("Title and date are required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url   = selectedEvent
        ? `${import.meta.env.VITE_API_URL}/calendar/${selectedEvent._id}`
        : `${import.meta.env.VITE_API_URL}/calendar`;
      const method = selectedEvent ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(selectedEvent ? "Event updated!" : "Event created!");
      closeModal();
      fetchEvents();
    } catch (err) {
      toast.error(err.message || "Failed to save event");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${import.meta.env.VITE_API_URL}/calendar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Event deleted!");
      setShowEventModal(false);
      fetchEvents();
    } catch (err) { toast.error(err.message); }
  };

  const openCreateModal = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedEvent(null);
    setForm({ title: "", type: "blog", scheduledDate: dateStr, status: "planned", notes: "", content: "" });
    setSelectedDay(day);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setForm({
      title: event.title,
      type: event.type,
      scheduledDate: event.scheduledDate.split("T")[0],
      status: event.status,
      notes: event.notes || "",
      content: event.content || "",
    });
    setShowEventModal(false);
    setShowModal(true);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDay(null);
  };

  // Build calendar grid
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => {
      const d = new Date(e.scheduledDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Stats
  const totalEvents   = events.length;
  const published     = events.filter(e => e.status === "published").length;
  const planned       = events.filter(e => e.status === "planned").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <span className="font-bold">Content Calendar</span>
            </div>
          </div>
          <button onClick={() => openCreateModal(today.getDate())}
            className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus size={16} /> New Event
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Scheduled", value: totalEvents, color: "text-white" },
            { label: "Planned",         value: planned,     color: "text-yellow-400" },
            { label: "Published",       value: published,   color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm">
                Today
              </button>
              <button onClick={nextMonth}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={idx}
                    onClick={() => day && openCreateModal(day)}
                    className={`min-h-24 rounded-xl p-2 transition cursor-pointer border ${
                      !day
                        ? "border-transparent"
                        : isToday(day)
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-800 hover:border-gray-600 bg-gray-950/50"
                    }`}>
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                          isToday(day) ? "bg-purple-500 text-white" : "text-gray-400"
                        }`}>{day}</div>

                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => {
                            const c = TYPE_COLORS[event.type] || TYPE_COLORS.blog;
                            return (
                              <div key={event._id}
                                onClick={(e) => { e.stopPropagation(); openEventModal(event); }}
                                className={`text-xs px-1.5 py-1 rounded-md truncate cursor-pointer ${c.bg} ${c.text} hover:opacity-80 transition`}>
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {TYPES.map(t => {
            const c = TYPE_COLORS[t];
            return (
              <div key={t} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                <span className="text-xs text-gray-400 capitalize">{t}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{selectedEvent ? "Edit Event" : "New Content Event"}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Weekly Newsletter"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition" />
              </div>

              {/* Type & Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition">
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Date *</label>
                  <input type="date" value={form.scheduledDate}
                    onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                <div className="flex gap-2">
                  {["planned", "draft", "published"].map(s => (
                    <button key={s} onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-xl text-sm capitalize transition border ${
                        form.status === s
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any notes or ideas..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><Check size={16} /> {selectedEvent ? "Update" : "Create"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[selectedEvent.type]?.dot || "bg-gray-400"}`} />
                <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Type</span>
                <span className={`text-sm capitalize px-2 py-0.5 rounded-full ${TYPE_COLORS[selectedEvent.type]?.bg} ${TYPE_COLORS[selectedEvent.type]?.text}`}>
                  {selectedEvent.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Date</span>
                <span className="text-sm text-white">
                  {new Date(selectedEvent.scheduledDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[selectedEvent.status]}`}>
                  {selectedEvent.status}
                </span>
              </div>
              {selectedEvent.notes && (
                <div>
                  <span className="text-gray-400 text-sm">Notes</span>
                  <p className="text-sm text-gray-300 mt-1 bg-gray-800 rounded-xl px-3 py-2">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleDelete(selectedEvent._id)}
                className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-2">
                <Trash2 size={15} /> Delete
              </button>
              <button onClick={() => openEditModal(selectedEvent)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition flex items-center justify-center gap-2 font-semibold">
                <Edit3 size={15} /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
