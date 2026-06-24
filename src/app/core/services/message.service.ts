import { inject, Injectable, signal } from '@angular/core';
import { Message } from '../models/message.model';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../contsants/base.const';
import { finalize, map, Observable, switchMap, tap } from 'rxjs';
import { MessageListFromApi } from '../models/responses-from-api.model';
import { mapMessageFromApi } from '../utils/api-mapper';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageList$ = signal<Message[]>([]);

  private isMessageListLoaded = signal<boolean>(true);

  private http = inject(HttpClient);

  private getMessageUrl(messageId: string | null) {
    let messageUrl = `${BASE_URL}/messages`;

    if (messageId !== null) {
      messageUrl += `/${messageId}`;
    }

    return messageUrl;
  }

  getMessageList$() {
    return this.messageList$;
  }

  updateMessageList$(newMessageList: Message[]) {
    this.messageList$.set(newMessageList);
  }

  clearMessageList$() {
    this.messageList$.set([]);
  }

  getIsMessageListLoaded() {
    return this.isMessageListLoaded;
  }

  setIsMessageListLoaded(updatedStatus: boolean) {
    this.isMessageListLoaded.set(updatedStatus);
  }

  getMessageList(): Observable<Message[]> {
    const url = this.getMessageUrl(null);

    return this.http.get<MessageListFromApi>(url).pipe(
      map((messageListFromApi) =>
        messageListFromApi.documents.map((messageFromApi) => mapMessageFromApi(messageFromApi)),
      ),
      map((messageList) =>
        messageList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      ),
      tap((res) => this.updateMessageList$(res)),
    );
  }

  createMessage(message: Partial<Message>) {
    const url = this.getMessageUrl(null);
    const body = this.createMessageApiBody(message);
    this.http
      .post(url, body)
      .pipe(switchMap((res) => this.getMessageList()))
      .subscribe();
  }

  markMessageAsRead(message: Partial<Message>) {
    const url = this.getMessageUrl(message.id as string);
    console.log(url);
    const body = this.createMessageApiBody(message);

    return this.http.patch(url, body).pipe(switchMap((res) => this.getMessageList()));
  }

  archiveMessage(message: Partial<Message>) {
    const url = this.getMessageUrl(message.id as string);

    const body = this.createMessageApiBody(message);

    return this.http.patch(url, body).pipe(switchMap((res) => this.getMessageList()));
  }

  createMessageApiBody(mex: Partial<Message>) {
    const { message, recipients, readBy, archivedBy, severity, ticketId } = mex;
    return {
      fields: {
        message: {
          stringValue: message || '',
        },
        recipients: {
          arrayValue: {
            values: recipients
              ? recipients.map((r) => ({
                  stringValue: r,
                }))
              : [],
          },
        },
        readBy: {
          arrayValue: {
            values: readBy
              ? readBy.map((id) => ({
                  stringValue: id,
                }))
              : [],
          },
        },
        archivedBy: {
          arrayValue: {
            values: archivedBy
              ? archivedBy.map((id) => ({
                  stringValue: id,
                }))
              : [],
          },
        },
        severity: {
          integerValue: severity || 0,
        },
        ticketId: {
          stringValue: ticketId ?? '',
        },
      },
    };
  }
}
