import { DateTime } from 'luxon';
import { CountdownEvent } from 'ngx-countdown';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements OnInit {
  @Input() title?: string;
  @Input() fromTimestamp?: number;
  @Input() fromDate?: string;
  @Input() timezone?: string;
  @Output() onNextElimination = new EventEmitter<void>();
  leftTime!: number;

  ngOnInit(): void {
    const now = new Date().getTime();
    if (this.fromTimestamp) {
      this.leftTime = (this.fromTimestamp - now) / 1000;
    }
    if (this.fromDate && this.timezone) {
      const dateTime = DateTime.fromISO(this.fromDate, { zone: this.timezone });
      this.leftTime = (dateTime.toMillis() - now) / 1000;
    }
  }

  handleEvent(e: CountdownEvent): void {
    if (e.action === 'notify') {
      this.onNextElimination.emit();
    }
  }
}
