import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

function myFunction() {
    // This is clasp project
    // @see https://github.com/nexus4812/calendar-notifier/tree/main
    getCalendarEventsByDate(new Date()).forEach((event: CalendarEvent) => {
        sendMessage(`${event.getStartTime()} ~ ${event.getEndTime()} ${event.getTitle()} です`);
    });
}

function sendMessage(message: string): void {
    (new ChatWork(Env.chatWorkApiToken())).sendMessage(Number(Env.chatWorkRoomId()), {body: message});
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
    baseUrl: string;
    headers: {};

    constructor(apiToken: string) {
        this.baseUrl = 'https://api.chatwork.com/v2';
        this.headers = {'X-ChatWorkToken': apiToken};
    }

    public sendMessage(roomId: number, payload: sendMessagePayload): postMessageResponse {
        return this.sendRequest({
            path: `/rooms/${roomId}/messages`,
            method: "post",
            payload: payload,
        })
    };

    private sendRequest(params: { path: string, method: httpMethod, payload: object }): any {
        const result = UrlFetchApp.fetch(this.baseUrl + params.path, {
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
