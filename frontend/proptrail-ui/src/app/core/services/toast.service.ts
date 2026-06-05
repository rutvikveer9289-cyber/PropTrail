import { Injectable } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: ToastMessage[] = [];
  private counter = 0;

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success', duration = 4000) {
    const id = ++this.counter;
    const toast: ToastMessage = { id, message, type };
    this.toasts.push(toast);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'danger');
  }

  showWarning(message: string) {
    this.show(message, 'warning');
  }

  showInfo(message: string) {
    this.show(message, 'info');
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
