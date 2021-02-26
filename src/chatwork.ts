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

export default ChatWork;