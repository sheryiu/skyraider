import { isPlatformServer } from '@angular/common';
import { Component, inject, isDevMode, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MultiplayerService } from '../core/multiplayer.service';
import { RtcManagerService } from '../core/rtc-manager.service';

@Component({
  selector: 'app-host-game',
  standalone: true,
  imports: [
    RouterLink,
  ],
  template: `
  <div class="absolute inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center">
    <div class="flex items-center justify-center flex-col max-w-screen-md min-w-60 w-4/12 bg-white rounded-2xl p-6 gap-4 relative before:absolute before:inset-1 before:rounded-xl before:border-2 before:border-black/50 before:pointer-events-none">
      <p class="text-xl font-medium">Send this URL to your friend</p>
      <p class="-my-2">Click URL to copy</p>
      @if (url()) {
        <p class="truncate w-full border border-black rounded-md p-1 select-all" (click)="onCopyUrl()">{{ url() }}</p>
      } @else {
        <p class="truncate w-full border border-black rounded-md p-1 text-stone-800">Loading...</p>
      }
      <p class="text-xl font-medium">Then, paste code from your friend</p>
      <input class="rounded-md outline-none w-full px-2 py-1 border border-black" (input)="onCodeInput($event)" placeholder="Paste here">
      <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent"></div>
      <button [routerLink]="['../']">Back</button>
    </div>
  </div>
  `,
})
export class HostGameComponent {
  private rtcManager = inject(RtcManagerService);
  private multiplayer = inject(MultiplayerService);
  url = signal<string>('');
  private router = inject(Router);

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) return;
    this.rtcManager.initialize().then((data) => {
      return RtcManagerService.formatAsUrl(data)
    }).then(formatted => {
      this.url.set(`${ location.origin }${ isDevMode() ? '' : '/skyraider' }/join-game?code=${ formatted }`);
    })
    this.rtcManager.onChannelOpen.pipe(
      takeUntilDestroyed(),
    ).subscribe(isOpen => {
      if (isOpen) {
        this.multiplayer.startGameAsHost();
        this.router.navigate(['../'], { replaceUrl: true })
      }
    })
  }

  onCopyUrl() {
    navigator.clipboard.writeText(this.url())
  }

  onCodeInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    try {
      const [iceCandidates, answer] = RtcManagerService.parseFromUrl(input.value);
      this.rtcManager.setAnswer(answer);
      this.rtcManager.addIceCandidates(iceCandidates);
    } catch (e) {}
  }
}
