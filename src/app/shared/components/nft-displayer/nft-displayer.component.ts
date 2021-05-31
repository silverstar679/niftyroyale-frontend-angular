import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMAGE_EXTENSION } from '../../../../models/image-extension';
import { VIDEO_EXTENSION } from '../../../../models/video-extension';

@Component({
  selector: 'app-nft-displayer',
  templateUrl: './nft-displayer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NftDisplayerComponent implements OnInit {
  @Input() nftURL!: string;
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
}
