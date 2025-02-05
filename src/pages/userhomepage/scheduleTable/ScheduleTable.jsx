import React from 'react';
import './ScheduleTable.css';

const ScheduleTable = ({ schedule, currentWeek }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="schedule-table">
      {daysOfWeek.map((day) => (
        <div className="">
            <div key={day} className={`schedule-cell ${schedule.lichtaptrongtuan.find(session => session.day === day) && currentWeek <= schedule.sobuoitap / schedule.lichtaptrongtuan.length ? 'has-schedule' : ''}`}>
                <div className="day">{day}</div>
                <div className="schedule-content">
                    {schedule.lichtaptrongtuan.find(session => session.day === day) && currentWeek <= schedule.sobuoitap / schedule.lichtaptrongtuan.length &&
                    <p>{schedule.lichtaptrongtuan.find(session => session.day === day).start_time} - {schedule.lichtaptrongtuan.find(session => session.day === day).end_time}</p>
                    }
                    
                </div>
            </div>

        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;