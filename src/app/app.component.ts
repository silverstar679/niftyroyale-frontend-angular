import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenSeaService } from './services/open-sea.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  assets$: Observable<any[]>;
  total = 0;
  remaining = 0;
  countdownTimer = '';

  constructor(private openSeaService: OpenSeaService) {
    this.initCountdown();
    this.assets$ = this.openSeaService.getAssets().pipe(
      map((assets: any[]) => {
        this.total = assets.length;
        this.remaining = assets.length;
        return assets.map((asset) => {
          const eliminated = Math.random() > 0.5;
          let placement = 0;
          if (eliminated) {
            placement = this.remaining;
            this.remaining = this.remaining - 1;
          }
          return {
            ...asset,
            eliminated,
            placement,
          };
        });
      }),
      map((assets: any[]) => {
        const winnerIndex = Math.floor(Math.random() * assets.length);
        assets[winnerIndex].placement = 1;
        return assets;
      })
    );
  }

  initCountdown(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const countDownDate = tomorrow.getTime();

    const x = setInterval(() => {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownTimer = '';

      if (days > 0) {
        this.countdownTimer = this.countdownTimer + days + 'd ';
      }

      if (hours > 0) {
        this.countdownTimer = this.countdownTimer + hours + 'h ';
      }

      if (minutes > 0) {
        this.countdownTimer = this.countdownTimer + minutes + 'm ';
      }

      if (seconds > 0) {
        this.countdownTimer = this.countdownTimer + seconds + 's ';
      }

      if (distance < 0) {
        clearInterval(x);
        this.countdownTimer = 'NEW ELIMINATION!';
      }
    }, 1000);
  }

  formatAddress(address: string): string {
    const length = address.length;
    const firstChar = address.slice(0, 6);
    const lastChar = address.slice(length - 4, length);
    return `${firstChar}...${lastChar}`;
  }
}
