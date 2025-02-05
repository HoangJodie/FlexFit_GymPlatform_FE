import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './UserSchedule.css';

const UserSchedule = () => {
  const [events, setEvents] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState('timeGridWeek'); // Thêm trạng thái cho chế độ xem
  const calendarRef = useRef(null);

  // Hàm gọi API
  const fetchData = async (offset) => {
    console.log("Fetching data for week offset:", offset);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/schedule/user?weekOffset=${offset}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      console.log("API Response:", data);

      const formattedEvents = data.schedules.map((schedule) => ({
        id: schedule.schedule_id,
        title: `${schedule.class_name} - ${schedule.class_description}`,
        start: `${schedule.date.slice(0, 10)}T${schedule.start_hour.slice(11, 19)}`,
        end: `${schedule.date.slice(0, 10)}T${schedule.end_hour.slice(11, 19)}`,
        extendedProps: {
          students: schedule.students.map(student => student.username).join(', '),
          instructor: data.pt_id,
        },
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
        textColor: 'white',
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
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
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        firstDay={1}
        events={events}
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
        eventClick={(info) => {
          const { title, extendedProps } = info.event;
          alert(`Chi tiết lớp học: ${title}\nHọc viên: ${extendedProps.students}`);
        }}
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
              setView(view); // Đặt lại chế độ xem hiện tại về tuần hoặc ngày
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
            <b>{eventInfo.timeText}</b> {/* Hiển thị thời gian ở dòng đầu tiên */}
            <div>{eventInfo.event.title}</div> {/* Hiển thị tên lớp học */}
          </div>
        )}
      />
    </div>
  );
};

export default UserSchedule;
