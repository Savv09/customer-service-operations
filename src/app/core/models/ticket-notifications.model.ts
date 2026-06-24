export interface TicketNotification {
  ticketId: string;
  message: string;
  severity: 'warning' | 'danger';
}
