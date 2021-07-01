import { DateTime } from 'luxon';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
})
export class CountdownComponent implements OnInit {
  @Input() title = '';
  @Input() fromDate?: string;
  @Input() fromTimestamp?: number;
  @Input() timezone?: string;
  public countdownTimer = '';

  ngOnInit(): void {
    if (this.fromDate && this.timezone) {
      const dateTime = DateTime.fromISO(this.fromDate, { zone: this.timezone });
      return this.initCountdown(dateTime.toMillis());
    }
    if (this.fromTimestamp) {
      return this.initCountdown(this.fromTimestamp);
    }
  }

  private initCountdown(eventTimestamp: number): void {
    const x = setInterval(() => {
      // Get today's date and time
      const now = new Date().getTime();

      // Find the distance between now and the count down date
      const distance = eventTimestamp - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownTimer = '';

      if (days > 0) {
        if (`${days}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + days + ':';
        if (hours === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (hours > 0) {
        if (`${hours}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + hours + ':';
        if (minutes === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (minutes > 0) {
        if (`${minutes}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + minutes + ':';
        if (seconds === 0) {
          this.countdownTimer = this.countdownTimer + '00';
        }
      }

      if (seconds > 0) {
        if (`${seconds}`.length === 1) {
          this.countdownTimer = this.countdownTimer + '0';
        }
        this.countdownTimer = this.countdownTimer + seconds;
      }

      if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
        clearInterval(x);
        this.countdownTimer = '';
      }
    }, 1000);
  }
}
