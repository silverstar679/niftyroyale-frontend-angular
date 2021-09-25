import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMAGE_EXTENSION } from '../../../constants/extensions/image-extension';
import { VIDEO_EXTENSION } from '../../../constants/extensions/video-extension';

@Component({
  selector: 'app-nft-displayer',
  templateUrl: './nft-displayer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftDisplayerComponent implements OnInit, OnDestroy {
  @Input() nftURL!: string;
  @Input() isAutoPlay = true;
  @Input() showControls = true;
  @Input() height = 'auto';
  isMuted = true;
  safeNftURL!: SafeResourceUrl;
  isImage = false;
  isVideo = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const extension = this.nftURL.split('.').pop() as string;
    this.isImage = IMAGE_EXTENSION.includes(extension);
    this.isVideo = VIDEO_EXTENSION.includes(extension);
    this.safeNftURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.nftURL
    );
  }

  ngOnDestroy(): void {
    this.isMuted = true;
  }
}
