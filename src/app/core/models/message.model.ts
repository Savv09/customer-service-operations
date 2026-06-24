import { MessageSeverity } from '../../shared/enums/message-severity.enum';

export interface Message {
  id: string;
  message: string;
  recipients: string[];
  readBy: string[];
  archivedBy: string[];
  createdAt: Date;
  severity: MessageSeverity;
  ticketId?: string;
}
