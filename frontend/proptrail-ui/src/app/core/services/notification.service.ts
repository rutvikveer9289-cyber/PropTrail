import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastService } from './toast.service';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string; // Success, Warning, Info, Error
  isRead: boolean;
  brokerId?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationReceivedSubject = new Subject<AppNotification>();
  public notificationReceived$ = this.notificationReceivedSubject.asObservable();

  private hubConnection!: HubConnection;

  constructor(private http: HttpClient, private toast: ToastService) {
    // Don't connect SignalR here — call connect() only after user logs in
  }

  /** Call this once the user is authenticated */
  connect(): void {
    if (this.hubConnection && this.hubConnection.state !== 'Disconnected') return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/notificationHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Notification Hub Connection Started.'))
      .catch(err => console.error('Error connecting to SignalR Notification Hub: ', err));

    this.hubConnection.on('ReceiveNotification', (title: string, message: string, type: string) => {
      this.showToast(title, message, type);

      const newNotif: AppNotification = {
        id: 0,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      this.notificationReceivedSubject.next(newNotif);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    });
  }

  private showToast(title: string, message: string, type: string): void {
    const lowerType = type.toLowerCase();
    const fullMsg = title ? `${title}: ${message}` : message;
    if (lowerType === 'success') {
      this.toast.showSuccess(fullMsg);
    } else if (lowerType === 'warning') {
      this.toast.showWarning(fullMsg);
    } else if (lowerType === 'error' || lowerType === 'danger') {
      this.toast.showError(fullMsg);
    } else {
      this.toast.showInfo(fullMsg);
    }
  }

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>('/api/notification');
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('/api/notification/unread-count').pipe(
      tap(res => this.unreadCountSubject.next(res.count))
    );
  }

  markAsRead(id: number): Observable<AppNotification> {
    return this.http.put<AppNotification>(`/api/notification/${id}/read`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.put('/api/notification/mark-all-read', {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/notification/${id}`);
  }

  refreshCount(): void {
    this.getUnreadCount().subscribe();
  }
}
