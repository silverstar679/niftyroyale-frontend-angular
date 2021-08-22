import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'list-item',
  templateUrl: 'list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  @Input() type!: string;
  @Input() title!: string;
  @Input() image!: string;
  @Output() onClick = new EventEmitter<void>();
}
