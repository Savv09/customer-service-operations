import { inject, Injectable, signal } from '@angular/core';
import { Ticket } from '../models/ticket.model';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../contsants/base.const';
import { EMPTY, finalize, map, Observable, switchMap } from 'rxjs';
import { TicketFromApi, TicketListFromApi } from '../models/responses-from-api.model';
import { mapTicketFromApi } from '../utils/api-mapper';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private ticketList$ = signal<Ticket[]>([]);

  private isTicketListLoaded = signal<boolean>(true);

  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  private getTicketUrl(ticketId: string | null) {
    let ticketsUrl = `${BASE_URL}/tickets`;

    if (ticketId !== null) {
      ticketsUrl += `/${ticketId}`;
    }

    return ticketsUrl;
  }

  getTicketList$() {
    return this.ticketList$;
  }

  updateTicketList$(newTicketList: Ticket[]) {
    this.ticketList$.set(newTicketList);
  }

  clearTicketList$() {
    this.ticketList$.set([]);
  }

  getIsTicketListLoaded() {
    return this.isTicketListLoaded;
  }

  setIsTicketListLoaded(updatedStatus: boolean) {
    this.isTicketListLoaded.set(updatedStatus);
  }

  getTicketList(): Observable<Ticket[]> {
    const url = this.getTicketUrl(null);

    return this.http.get<TicketListFromApi>(url).pipe(
      map((ticketListFromApi) =>
        ticketListFromApi.documents.map((ticketFromApi) => mapTicketFromApi(ticketFromApi)),
      ),
      map((ticketList) => ticketList.sort((a, b) => b.priority - a.priority)),
      finalize(() => this.setIsTicketListLoaded(true)),
    );
  }

  getTicket(ticketId: string): Observable<Ticket> {
    const url = this.getTicketUrl(ticketId);

    return this.http
      .get<TicketFromApi>(url)
      .pipe(map((ticketFromApi) => mapTicketFromApi(ticketFromApi)));
  }

  createTicket(newTicket: Partial<Ticket>) {
    const url = this.getTicketUrl(null);
    const body = this.createTicketApiBody(newTicket);

    return this.dialogService
      .confirmOperation('Create ticket', 'Are you sure you want to create a new ticket?')
      .pipe(
        switchMap((confirmed) =>
          confirmed
            ? this.http.post(url, body).pipe(finalize(() => this.setIsTicketListLoaded(false)))
            : EMPTY,
        ),
      );
  }

  updateTicket(ticket: Partial<Ticket>, ticketId: string) {
    const url = this.getTicketUrl(ticketId);
    const body = this.createTicketApiBody(ticket);

    return this.http.patch(url, body).pipe(finalize(() => this.setIsTicketListLoaded(false)));
  }

  claimTicket(ticket: Partial<Ticket>) {
    return this.dialogService
      .confirmOperation('Claim ticket', 'Are you sure you want to claim this ticket?')
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.updateTicket(ticket, ticket.id as string) : EMPTY,
        ),
      );
  }

  changeTicketStatus(ticket: Partial<Ticket>) {
    return this.dialogService
      .confirmOperation(
        'Change ticket status',
        'Are you sure you want to change this ticket status?',
      )
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.updateTicket(ticket, ticket.id as string) : EMPTY,
        ),
      );
  }

  closeTicket(ticket: Partial<Ticket>) {
    return this.dialogService
      .confirmOperation('Close ticket', 'Are you sure you want to close this ticket?')
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.updateTicket(ticket, ticket.id as string) : EMPTY,
        ),
      );
  }

  private createTicketApiBody(ticket: Partial<Ticket>): Partial<TicketFromApi> {
    const {
      code,
      title,
      description,
      customerId,
      department,
      assignedManagerId,
      priority,
      status,
      closedAt,
      assignedAt,
    } = ticket;

    return {
      fields: {
        code: { stringValue: code || '' },
        title: { stringValue: title || '' },
        description: { stringValue: description || '' },
        customerId: { stringValue: customerId || '' },
        department: { stringValue: department || '' },
        assignedManagerId: { stringValue: assignedManagerId || '' },
        priority: { integerValue: priority || 0 },
        status: { integerValue: status || 0 },
        closedAt: { stringValue: closedAt?.toISOString() || '' },
        assignedAt: { stringValue: assignedAt?.toISOString() || '' },
      },
    };
  }

  logoutFromApp() {
    this.setIsTicketListLoaded(false);
    this.clearTicketList$();
  }
}
