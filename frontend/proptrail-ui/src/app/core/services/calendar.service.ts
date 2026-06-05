import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { LeadService } from './lead.service';
import { VisitService } from './visit.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(
    private leadService: LeadService,
    private visitService: VisitService
  ) {}

  getCalendarEvents(): Observable<any[]> {
    return forkJoin({
      leads: this.leadService.getLeads(),
      visits: this.visitService.getVisits(),
    }).pipe(
      map(({ leads, visits }) => {
        const events: any[] = [];

        visits.forEach((v: any) => {
          if (v.visitDate) {
            events.push({
              id: `visit-${v.visitId}`,
              title: `Site Visit: ${v.lead ? v.lead.customerName : 'Client'} @ ${v.property ? v.property.propertyName : 'Property'}`,
              date: new Date(v.visitDate),
              type: 'visit',
              status: v.status,
              notes: v.notes,
            });
          }
        });

        leads.forEach((l: any) => {
          if (l.followUpReminderDate) {
            events.push({
              id: `followup-${l.id}`,
              title: `Follow-up: ${l.customerName}`,
              date: new Date(l.followUpReminderDate),
              type: 'followup',
              status: l.status,
              notes: l.followUpNotes || 'Scheduled callback',
            });
          }
        });

        return events;
      })
    );
  }
}
