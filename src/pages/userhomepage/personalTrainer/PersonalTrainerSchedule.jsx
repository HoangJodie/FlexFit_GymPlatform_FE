import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './PersonalTrainerSchedule.css';

const PersonalTrainerSchedule = () => {
  const [events, setEvents] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState('timeGridWeek');
  const calendarRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [scheduleConflictError, setScheduleConflictError] = useState('');
  const [dragError, setDragError] = useState('');

  const handleEventClick = (info) => {
    const { event, jsEvent } = info;
    jsEvent.preventDefault();
    
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const formatTime = (date) => {
      return date.toTimeString().split(' ')[0].slice(0, 5);
    };

    setSelectedEvent(event);
    setEditDate(formatDate(startDate));
    setEditStartTime(formatTime(startDate));
    setEditEndTime(formatTime(endDate));
    
    setPopupPosition({
      x: jsEvent.pageX,
      y: jsEvent.pageY
    });
    
    setShowPopup(true);
  };

  const handleUpdateSchedule = async () => {
    if (!selectedEvent) return;

    const newStart = new Date(`${editDate}T${editStartTime}`);
    const newEnd = new Date(`${editDate}T${editEndTime}`);

    if (newEnd <= newStart) {
      setTimeError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    const updateSuccess = await updateScheduleTime(
      selectedEvent.id,
      selectedEvent.extendedProps.class_id,
      newStart,
      newEnd
    );

    if (updateSuccess) {
      setTimeError('');
      setScheduleConflictError('');
      setShowPopup(false);
    }
  };

  const checkScheduleConflict = (newStart, newEnd, currentScheduleId) => {
    const otherEvents = events.filter(event => event.id !== currentScheduleId);
    
    for (const event of otherEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      if (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      ) {
        return {
          hasConflict: true,
          conflictEvent: event
        };
      }
    }
    
    return {
      hasConflict: false,
      conflictEvent: null
    };
  };

  const EditPopup = () => {
    if (!showPopup) return null;

    return (
      <div 
        className="edit-popup"
        style={{
          position: 'absolute',
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
          zIndex: 1000
        }}
      >
        <div className="popup-content">
          <div className="popup-header">
            <h3>Chỉnh sửa lịch</h3>
            <button 
              className="close-button"
              onClick={() => {
                setShowPopup(false);
                setTimeError('');
                setScheduleConflictError('');
              }}
            >
              ×
            </button>
          </div>
          <div className="popup-body">
            <div className="form-group">
              <label>Ngày:</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => {
                  setEditDate(e.target.value);
                  setScheduleConflictError('');
                }}
              />
            </div>
            <div className="form-group">
              <label>Giờ bắt đầu:</label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => {
                  setEditStartTime(e.target.value);
                  setTimeError('');
                  setScheduleConflictError('');
                }}
              />
            </div>
            <div className="form-group">
              <label>Giờ kết thúc:</label>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => {
                  setEditEndTime(e.target.value);
                  setTimeError('');
                  setScheduleConflictError('');
                }}
              />
            </div>
            {timeError && (
              <div className="error-message">
                {timeError}
              </div>
            )}
            {scheduleConflictError && (
              <div className="error-message schedule-conflict">
                {scheduleConflictError}
              </div>
            )}
            <div className="popup-footer">
              <button 
                className="update-button"
                onClick={handleUpdateSchedule}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fetchData = async (offset) => {
    console.log("Fetching data for week offset:", offset);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/schedule/pt?weekOffset=${offset}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      console.log("API Response:", data);

      const formattedEvents = data.schedules.map((schedule) => ({
        id: schedule.schedule_id,
        title: `${schedule.className || schedule.class_name} - ${schedule.classDescription || schedule.class_description || ''}`,
        start: `${schedule.date.slice(0, 10)}T${schedule.start_hour.slice(11, 19)}`,
        end: `${schedule.date.slice(0, 10)}T${schedule.end_hour.slice(11, 19)}`,
        extendedProps: {
          class_id: schedule.classId || schedule.class_id,
          students: schedule.students?.map(student => student.username).join(', ') || '',
          instructor: data.pt_id,
        },
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
        textColor: 'white',
      }));

      console.log("Formatted Events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateScheduleTime = async (scheduleId, classId, newStart, newEnd) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const formatToVNTime = (date) => {
        const vnDate = new Date(date);
        const year = vnDate.getFullYear();
        const month = String(vnDate.getMonth() + 1).padStart(2, '0');
        const day = String(vnDate.getDate()).padStart(2, '0');
        const hours = String(vnDate.getHours()).padStart(2, '0');
        const minutes = String(vnDate.getMinutes()).padStart(2, '0');
        const seconds = String(vnDate.getSeconds()).padStart(2, '0');
        
        return {
          fullDateTime: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`,
          dateOnly: `${year}-${month}-${day}`
        };
      };

      const startTime = formatToVNTime(newStart);
      const endTime = formatToVNTime(newEnd);

      const requestBody = {
        classId: classId,
        days: startTime.dateOnly,
        startHour: startTime.fullDateTime,
        endHour: endTime.fullDateTime,
      };

      const response = await fetch(`http://localhost:3000/schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      console.log('Server Response:', data);
      fetchData(weekOffset);
      setShowPopup(false);
      setDragError('');
      
    } catch (error) {
      console.error('Error updating schedule:', error);
      if (showPopup) {
        setScheduleConflictError(error.message);
      } else {
        setDragError(error.message);
      }
      return false;
    }
    return true;
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    const { id, start, end, extendedProps } = event;

    if (!start || !end) {
      info.revert();
      return;
    }

    if (end <= start) {
      info.revert();
      return;
    }

    const updateSuccess = await updateScheduleTime(id, extendedProps.class_id, start, end);
    
    if (!updateSuccess) {
      info.revert();
      setTimeout(() => {
        setDragError('');
      }, 3000);
    }
  };

  const DragErrorMessage = () => {
    if (!dragError) return null;

    return (
      <div className="drag-error-message">
        {dragError}
      </div>
    );
  };

  useEffect(() => {
    console.log("Current events:", events);
    fetchData(weekOffset);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(new Date());
    if (view === 'timeGridWeek') {
      calendarApi.incrementDate({ weeks: weekOffset });
    } else {
      calendarApi.incrementDate({ days: weekOffset });
    }
  }, [weekOffset, view]);

  return (
    <div className="user-schedule">
      <h2>Lịch tập của bạn</h2>
      {dragError && <DragErrorMessage />}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        firstDay={1}
        events={events}
        editable={true}
        droppable={true}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotMinTime="05:00:00"
        slotMaxTime="21:00:00"
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: 'prevButton,nextButton,todayButton',
          center: 'title',
          right: 'weekViewButton,dayViewButton',
        }}
        customButtons={{
          prevButton: {
            text: '←',
            click: () => setWeekOffset((prevOffset) => prevOffset - 1),
          },
          nextButton: {
            text: '→',
            click: () => setWeekOffset((prevOffset) => prevOffset + 1),
          },
          todayButton: {
            text: 'Today',
            click: () => {
              setWeekOffset(0);
              setView(view);
            },
          },
          weekViewButton: {
            text: 'Week View',
            click: () => {
              setView('timeGridWeek');
              setWeekOffset(0);
            },
          },
          dayViewButton: {
            text: 'Day View',
            click: () => {
              setView('timeGridDay');
              setWeekOffset(0);
            },
          },
        }}
        eventBackgroundColor="#4a90e2"
        eventContent={(eventInfo) => (
          <div className="event-content">
            <b>{eventInfo.timeText}</b>
            <div>
              <div className="event-title">{eventInfo.event.title.split(' - ')[0]}</div>
              <div className="event-description text-sm">{eventInfo.event.title.split(' - ')[1]}</div>
            </div>
          </div>
        )}
        eventClick={handleEventClick}
      />
      <EditPopup />
    </div>
  );
};


export default PersonalTrainerSchedule;
