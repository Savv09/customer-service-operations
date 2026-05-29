import { inject, Injectable, signal } from '@angular/core';
import { Ticket } from '../models/ticket.model';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../contsants/base.const';
import { finalize, map, Observable, tap } from 'rxjs';
import { TicketFromApi, TicketListFromApi } from '../models/responses-from-api.model';
import { formatTicketFromApi } from '../utils/api-formatter';
import { TicketStatus } from '../../shared/enums/tickets.enum';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private ticketList$ = signal<Ticket[]>([]);

  private isTicketListLoaded = false;

  private http = inject(HttpClient);

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

  setisTicketListLoaded(updatedStatus: boolean) {
    this.isTicketListLoaded = updatedStatus;
  }

  getTicketList(): void {
    if (this.isTicketListLoaded) return;

    const url = this.getTicketUrl(null);

    this.http
      .get<TicketListFromApi>(url)
      .pipe(
        map((res) => res.documents.map((ticketFromApi) => formatTicketFromApi(ticketFromApi))),
        tap((tickets) => this.updateTicketList$(tickets)),
        finalize(() => this.setisTicketListLoaded(true)),
      )
      .subscribe();
  }

  getTicket(ticketId: string): Observable<Ticket> {
    const url = this.getTicketUrl(ticketId);

    return this.http.get<TicketFromApi>(url).pipe(map((res) => formatTicketFromApi(res)));
  }

  createTicket(newTicket: Partial<Ticket>) {
    const url = this.getTicketUrl(null);
    const body = this.createTicketApiBody(newTicket);

    return this.http.post(url, body).pipe(finalize(() => this.setisTicketListLoaded(false)));
  }

  updateTicket(ticket: Partial<Ticket>, ticketId: string) {
    const url = this.getTicketUrl(ticketId);
    const body = this.createTicketApiBody(ticket);

    return this.http.patch(url, body).pipe(finalize(() => this.setisTicketListLoaded(false)));
  }

  private createTicketApiBody(ticket: Partial<Ticket>): Partial<TicketFromApi> {
    const {
      title,
      description,
      customerId,
      department,
      assignedManagerId,
      priority,
      status,
      closedAt,
    } = ticket;

    return {
      fields: {
        title: { stringValue: title || '' },
        description: { stringValue: description || '' },
        customerId: { stringValue: customerId || '' },
        department: { stringValue: department || '' },
        assignedManagerId: { stringValue: assignedManagerId || '' },
        priority: { integerValue: priority || 0 },
        status: { integerValue: status || 0 },
        closedAt: { stringValue: closedAt || '' },
      },
    };
  }

  logoutFromApp() {
    this.setisTicketListLoaded(false);
    this.clearTicketList$();
  }
}
