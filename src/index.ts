import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;
import env from "./env";
import dateDecorator from "./dateDecortor";
import ChatWork from "./chatwork";


// >  Trigger function
//
// This is clasp project
// @see https://github.com/nexus4812/calendar-notifier
function myFunction() {
    if(isHoliday()) {
        Logger.log(`Stop : Today is holiday`);
        return;
    }

    const now : dateType = new Date();

    if(now.getHours() < 9 || 18 < now.getHours()) {
        Logger.log(`Stop : After business hours`);
        return;
    }

    const intervalMinutes = 10;
    const minutesAfter : dateType = new Date();

    minutesAfter.setMinutes(now.getMinutes() + intervalMinutes);

    // 終了します
    getCalendarEventsByDate(now).forEach((event: CalendarEvent): void => {
        if(now < event.getEndTime() && event.getEndTime() < minutesAfter) {
            sendEndEvent(event);
        }
    });

    // 開始します
    getCalendarEventsByDate(now).forEach((event: CalendarEvent): void => {
        if(now < event.getStartTime() && event.getStartTime() < minutesAfter) {
            sendStartEvent(event);
        }
    });


}


// ---- Helpers ------------------------

type dateType = GoogleAppsScript.Base.Date & Date;

function sendStartEvent(event: CalendarEvent): void {
    sendMessage(`【${event.getTitle()}】を開始します(${dateDecorator.HHSS(event.getStartTime())}~${dateDecorator.HHSS(event.getEndTime())}) `);
}

function sendEndEvent(event: CalendarEvent): void {
    sendMessage(`【${event.getTitle()}】を終了します(${dateDecorator.HHSS(event.getStartTime())}~${dateDecorator.HHSS(event.getEndTime())}) `);
}

function sendMessage(message: string): void {
    const messageLink = (new ChatWork(env('chatwork_api_token'))).sendMessage(Number(env('chatwork_room_id')), {body: message});
    Logger.log(`Send message! ${messageLink}`);
}

const getCalendarEventsByDate = (date: Date): CalendarEvent[] => (CalendarApp.getDefaultCalendar().getEventsForDay(date));


// 祝日判定関数
function isHoliday(): boolean{
    const today = new Date();

    //土日か判定
    const weekInt = today.getDay();
    if(weekInt <= 0 || 6 <= weekInt){
        return true;
    }

    //祝日か判定
    const calendarId = "ja.japanese#holiday@group.v.calendar.google.com";
    const calendar = CalendarApp.getCalendarById(calendarId);
    const todayEvents = calendar.getEventsForDay(today);
    return todayEvents.length > 0;
}