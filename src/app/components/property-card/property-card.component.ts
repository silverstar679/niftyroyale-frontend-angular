import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCardComponent {
  @Input() type = '';
  @Input() value = '';

  capitalizeFirstLetter(str: string): string {
    if (!str.length) {
      return str;
    }
    if (str.length === 1) {
      return str.charAt(0).toUpperCase();
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
