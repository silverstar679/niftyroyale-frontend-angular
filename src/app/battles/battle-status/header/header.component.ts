import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { BattleState } from '../../../../models/nifty-royale.models';

@Component({
  selector: 'header',
  templateUrl: 'header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() battleState!: BattleState;
  @Input() dropName!: string;
  @Input() totalInPlay!: number;
  @Input() totalPlayers!: number;
  @Input() nextEliminationTimestamp!: number;
  @Input() isEliminationTriggered!: boolean;
  battleStates = BattleState;

  constructor(private cdr: ChangeDetectorRef) {}

  get battleStatus(): string {
    if (this.battleState === BattleState.STANDBY) {
      return 'Battle will start soon!';
    }
    if (this.battleState === BattleState.RUNNING) {
      return 'Next elimination:';
    }
    if (this.battleState === BattleState.ENDED) {
      return 'Battle has ended!';
    }
    return 'Loading...';
  }

  get dropTitle(): string {
    return Boolean(this.dropName) ? this.dropName : 'Loading...';
  }

  get remainingPlayers(): string {
    return this.totalInPlay && this.totalPlayers
      ? `${this.totalInPlay}/${this.totalPlayers} NFTs remain`
      : 'Loading...';
  }

  triggerElimination(): void {
    this.isEliminationTriggered = true;
    this.cdr.detectChanges();
  }
}
