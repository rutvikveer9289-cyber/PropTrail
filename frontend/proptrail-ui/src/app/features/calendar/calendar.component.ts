import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../core/services/calendar.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  daysInMonth: Date[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  events: any[] = [];
  isLoading = true;

  selectedEvent: any = null;

  constructor(
    private calendarService: CalendarService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.calendarService.getCalendarEvents().subscribe({
      next: (data: any[]) => {
        this.events = data;
        this.generateCalendarGrid();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toast.showError('Failed to load calendar events.');
        this.isLoading = false;
      }
    });
  }

  generateCalendarGrid(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const daysGrid: Date[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      daysGrid.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    for (let day = 1; day <= totalDays; day++) {
      daysGrid.push(new Date(year, month, day));
    }

    const remainingCells = 42 - daysGrid.length;
    for (let day = 1; day <= remainingCells; day++) {
      daysGrid.push(new Date(year, month + 1, day));
    }

    this.daysInMonth = daysGrid;
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendarGrid();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendarGrid();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendarGrid();
  }

  getEventsForDate(date: Date): any[] {
    return this.events.filter((e: any) => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getMonthYearLabel(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  selectEvent(event: any): void {
    this.selectedEvent = event;
  }

  closeEventModal(): void {
    this.selectedEvent = null;
  }
}
