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
}
