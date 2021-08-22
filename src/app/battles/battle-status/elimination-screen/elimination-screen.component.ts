import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
  flipOnEnterAnimation,
  slideInRightOnEnterAnimation,
} from 'angular-animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { NiftyAssetModel } from '../../../../models/nifty-royale.models';
import { PlayersService } from '../../../services/players.service';

@Component({
  selector: 'elimination-screen',
  templateUrl: 'elimination-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation(),
    flipOnEnterAnimation(),
    slideInRightOnEnterAnimation(),
  ],
})
export class EliminationScreenComponent {
  @Input() name!: string;
  @Input() picture!: string;
  @Input() tokenIdEliminated!: string;
  @Input() totalPlayers!: number;
  @Output() onClose = new EventEmitter<void>();

  constructor(private playersService: PlayersService) {}

  playerData$(tokenId: string): Observable<NiftyAssetModel> {
    return this.playersService.select(tokenId);
  }
}
