import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanySettingsService {
  private apiUrl = '/api/CompanySettings';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((settings: any) => {
        if (settings && settings.themeColor) {
          this.applyThemeColor(settings.themeColor);
        }
      })
    );
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(this.apiUrl, settings).pipe(
      tap((updated: any) => {
        if (updated && updated.themeColor) {
          this.applyThemeColor(updated.themeColor);
        }
      })
    );
  }

  applyThemeColor(color: string): void {
    document.documentElement.style.setProperty('--primary-color', color);
    // Support material color theme adjustments or other themes if necessary
  }
}
