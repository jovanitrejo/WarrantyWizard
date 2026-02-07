import { useEffect, useState } from 'react';
import { api, type Warranty } from '../services/api';
import './WarrantyCalendar.css';

export default function WarrantyCalendar() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    try {
      setLoading(true);
      const response = await api.getWarranties();
      setWarranties(response.warranties);
    } catch (error) {
      console.error('Failed to load warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWarrantiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return warranties.filter(w => w.warranty_end === dateStr);
  };


  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="calendar-loading">Loading...</div>;
  }

  const calendarDays = renderCalendar();

  return (
    <div className="warranty-calendar">
      <div className="calendar-header">
        <h1>Warranty Calendar</h1>
        <p>Powered by Grainger - Visual timeline of warranty expirations</p>
      </div>

      <div className="calendar-container">
        <div className="calendar-nav">
          <button onClick={() => navigateMonth('prev')} className="nav-btn">←</button>
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={() => navigateMonth('next')} className="nav-btn">→</button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {calendarDays.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
            }

            const dayWarranties = getWarrantiesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayWarranties.length > 0 ? 'has-warranties' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day-number">{date.getDate()}</div>
                {dayWarranties.length > 0 && (
                  <div className="warranty-indicators">
                    {dayWarranties.slice(0, 3).map(w => (
                      <div
                        key={w.id}
                        className={`warranty-dot status-${w.status}`}
                        title={w.product_name}
                      />
                    ))}
                    {dayWarranties.length > 3 && (
                      <div className="warranty-more">+{dayWarranties.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="selected-date-warranties">
          <h3>Warranties expiring on {selectedDate.toLocaleDateString()}</h3>
          {getWarrantiesForDate(selectedDate).length === 0 ? (
            <p>No warranties expiring on this date.</p>
          ) : (
            <div className="warranty-list">
              {getWarrantiesForDate(selectedDate).map(w => (
                <div key={w.id} className="warranty-item">
                  <div className="warranty-item-main">
                    <h4>{w.product_name}</h4>
                    <div className="warranty-item-meta">
                      {w.category && <span>{w.category}</span>}
                      {w.supplier && <span>{w.supplier}</span>}
                    </div>
                  </div>
                  <span className={`status-badge status-${w.status}`}>
                    {w.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="warranty-dot status-active"></div>
          <span>Active</span>
        </div>
        <div className="legend-item">
          <div className="warranty-dot status-expiring_soon"></div>
          <span>Expiring Soon</span>
        </div>
        <div className="legend-item">
          <div className="warranty-dot status-expired"></div>
          <span>Expired</span>
        </div>
      </div>
    </div>
  );
}

