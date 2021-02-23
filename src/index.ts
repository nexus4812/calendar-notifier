import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

function myFunction() {
    // This is clasp project
    // @see https://github.com/nexus4812/calendar-notifier/tree/main


    const now = new Date();

    getCalendarEventsByDate(now).forEach((event: CalendarEvent) => {
        sendMessage(`実施時間[${DateHelper.HHSS(event.getStartTime())}~${DateHelper.HHSS(event.getEndTime())}] イベント名[${event.getTitle()}]を開始します`);
    });
}

function sendMessage(message: string): void {
    const messageLink = (new ChatWork(Env.chatWorkApiToken())).sendMessage(Number(Env.chatWorkRoomId()), {body: message});
    Logger.log(`Send message! ${messageLink}`);
}

const getCalendarEventsByDate = (date: Date): CalendarEvent[] => (CalendarApp.getDefaultCalendar().getEventsForDay(date));



// ---------------------------------------------------------------------------------------------------



type sendMessagePayload = {
    selfUnread?: boolean,
    body: string;
}

type postMessageResponse = {
    "message_id": string
}

type httpMethod = 'post' | 'get';

class ChatWork {
    webBaseUrl: string;
    apiBaseUrl: string;
    headers: {};

    constructor(apiToken: string) {
        this.apiBaseUrl = 'https://api.chatwork.com/v2';
        this.webBaseUrl = 'https://www.chatwork.com';
        this.headers = {'X-ChatWorkToken': apiToken};
    }

    public sendMessage(roomId: number, payload: sendMessagePayload): string {
        const r : postMessageResponse = this.sendRequest({
            path: `/rooms/${roomId}/messages`,
            method: "post",
            payload: payload,
        });

        return `${this.webBaseUrl}/#!rid${roomId}-${r.message_id}`
    };

    private sendRequest(params: { path: string, method: httpMethod, payload: object }): any {
        const result = UrlFetchApp.fetch(this.apiBaseUrl + params.path, {
            'method': params.method,
            'headers': this.headers,
            'payload': params.payload || {}
        });

        if (result.getResponseCode() == 200) {
            return JSON.parse(result.getContentText())
        }

        return false;
    };
}



// ---------------------------------------------------------------------------------------------------



class Env {
    public static chatWorkApiToken(): string {
        return Env.getMyScriptProperties('chatwork_api_token');
    }

    public static chatWorkRoomId(): string {
        return Env.getMyScriptProperties('chatwork_room_id');
    }

    private static getMyScriptProperties(key: string): string {
        const prop = PropertiesService.getScriptProperties().getProperty(key);

        if (prop === null) {
            throw new Error(`The script property "${key}" is not set. Please set from the screen on the Web`);
        }

        return prop;
    };
}



// ------------------------------------------------------------------------------------------------------


class DateHelper {

    public static HHSS(date: any) {
        return DateHelper.formatDate(date, 'HH:mm')
    }

    private static formatDate (date: any, format: string) {
        format = format.replace(/yyyy/g, String(date.getFullYear()));
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
        return format;
    };
}

