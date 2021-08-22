import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

export enum FilterOptions {
  ALL = 'all',
  OWNER = 'owner',
  STILL_IN_PLAY = 'still-in-play',
  ELIMINATED = 'eliminated',
  FOR_SALE = 'for-sale',
  WITH_OFFERS = 'with-offers',
}

@Component({
  selector: 'filters',
  templateUrl: 'filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  @Output() onFilter = new EventEmitter<FilterOptions>();

  filterOptions = [
    {
      label: 'All NFTs',
      value: null,
    },
    {
      label: 'NFTs Owned',
      value: FilterOptions.OWNER,
    },
    {
      label: 'NFTs Still in Battle',
      value: FilterOptions.STILL_IN_PLAY,
    },
    {
      label: 'NFTs Eliminated',
      value: FilterOptions.ELIMINATED,
    },
    {
      label: 'NFTs For Sale',
      value: FilterOptions.FOR_SALE,
    },
    {
      label: 'NFTs With Offers',
      value: FilterOptions.WITH_OFFERS,
    },
  ];
}
