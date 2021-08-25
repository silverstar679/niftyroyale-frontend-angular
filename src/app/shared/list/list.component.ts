import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ListItem } from '../../../models/nifty-royale.models';

@Component({
  selector: 'app-list',
  templateUrl: 'list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() type!: string;
  @Input() activeList!: ListItem[];
  @Input() pastList!: ListItem[];
  @Output() redirect = new EventEmitter<string>();

  get pluralListType(): string {
    return `${this.type.toLowerCase()}s`;
  }
}
