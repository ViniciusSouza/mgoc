export interface Ticket {
  id: string;
}

export interface TicketStatus {
  phase: TicketPhase;
  message: string;
}

export interface TicketOutput {
  ticketId: String;
  outputs: object;
}

export enum TicketPhase {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Error = 'Error',
}
