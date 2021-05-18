import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMAGE_EXTENSION } from '../../../../models/image-extension';
import { VIDEO_EXTENSION } from '../../../../models/video-extension';

@Component({
  selector: 'app-nft-displayer',
  templateUrl: './nft-displayer.component.html',
})
export class NftDisplayerComponent implements OnInit {
  @Input() nftURL!: string;
  extension!: string;
  safeNftURL!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  get isImage(): boolean {
    return IMAGE_EXTENSION.includes(this.extension);
  }

  get isVideo(): boolean {
    return VIDEO_EXTENSION.includes(this.extension);
  }

  ngOnInit(): void {
    this.extension = this.nftURL.split('.').pop() as string;
    this.safeNftURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.nftURL
    );
  }
}
