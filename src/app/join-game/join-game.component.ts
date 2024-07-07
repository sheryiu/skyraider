import { isPlatformServer } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { MultiplayerService } from '../core/multiplayer.service';
import { RtcManagerService } from '../core/rtc-manager.service';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [
  ],
  template: `
  <div class="absolute inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center">
    <div class="flex items-center justify-center flex-col max-w-screen-md w-4/12 bg-white/40 rounded-2xl p-6 gap-4">
      <p class="text-xl font-medium">Send this code back to your friend</p>
      <p class="truncate w-full border border-black rounded-md p-1 select-all" (click)="onCopyCode()">{{ code() }}</p>
    </div>
  </div>
  `
})
export class JoinGameComponent {
  private route = inject(ActivatedRoute);
  private rtcManager = inject(RtcManagerService);
  private multiplayer = inject(MultiplayerService);
  code = signal<string>('')
  private router = inject(Router);

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) return;
    this.route.queryParamMap.pipe(
      map(p => p.get('code')),
      filter(code => !!code),
      map(code => RtcManagerService.parseFromUrl(code!)),
      takeUntilDestroyed(),
    ).subscribe(([iceCandidates, offer]) => {
      this.rtcManager.initialize(offer).then((data) => {
        this.rtcManager.addIceCandidates(iceCandidates);
        return RtcManagerService.formatAsUrl(data);
      }).then(formatted => {
        this.code.set(formatted);
      });
    })
    this.rtcManager.onChannelOpen.pipe(
      takeUntilDestroyed(),
    ).subscribe(isOpen => {
      if (isOpen) {
        this.multiplayer.startGameAsParticipant();
        this.router.navigate(['../'], { replaceUrl: true })
      }
    })
  }

  onCopyCode() {
    navigator.clipboard.writeText(this.code())
  }
  // offer = toSignal(
  //   this.route.queryParams.pipe(
  //     map(params => params['offer']),
  //     map(offer => JSON.parse(decodeURIComponent(offer))),
  //   )
  // )
  // remoteCandidates = toSignal(
  //   this.route.queryParams.pipe(
  //     map(params => params['candidate']),
  //     map(offer => JSON.parse(decodeURIComponent(offer))),
  //   )
  // )
  // answer = signal<any>({})
  // localCandidates = signal<RTCIceCandidate[] | null>(null)

  // private pc?: RTCPeerConnection;
  // private sendChannel?: RTCDataChannel;
  // private injector = inject(Injector);

  // constructor() {
  //   afterNextRender(() => {
  //     const iceConfiguration: RTCConfiguration = {
  //       iceServers: [
  //         {
  //           urls: 'stun:stun1.l.google.com:19302'
  //         }
  //       ]
  //     }
  //     this.pc = new RTCPeerConnection(iceConfiguration)
  //     this.sendChannel = this.pc.createDataChannel('Chess')
  //     const iceCandidate = [] as RTCIceCandidate[];
  //     this.pc.onicecandidate = e => {
  //       if (e.candidate) {
  //         iceCandidate.push(e.candidate);
  //       } else {
  //         this.localCandidates.set(iceCandidate)
  //       }
  //     }
  //     this.pc.ondatachannel = (e) => {
  //       console.log('receive data channel')
  //       e.channel.onmessage = (e) => {
  //         console.log('message', e.data)
  //       }
  //     }
  //     effect(() => {
  //       if (this.remoteCandidates()) {
  //         this.remoteCandidates().forEach((candidate: RTCIceCandidate) => {
  //           this.pc?.addIceCandidate(candidate).then((e) => console.log('add ice candidate success', e))
  //         })
  //       }
  //     }, { injector: this.injector })
  //     effect(() => {
  //       if (this.offer() != null) {
  //         this.pc?.setRemoteDescription(this.offer()!)
  //         this.pc?.createAnswer().then((desc) => {
  //           console.log('answer desc', desc)
  //           console.log(desc)
  //           this.answer.set(desc)
  //           this.pc?.setLocalDescription(desc)
  //         });
  //       }
  //     }, { allowSignalWrites: true, injector: this.injector })
  //   })
  // }
}
