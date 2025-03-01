import {Component, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {State} from "./reducers";
import {selectMeetingIdRouterParam} from "./reducers/route.selectors";
import {VideochatComponent} from "./components/videochat/videochat.component";
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {UrlService} from "./services/url.service";
import {removeAllUsers} from "./reducers/participant.actions";
import {CallService} from "./services/call.service";
import {addChatOpenStatus} from "./reducers/interface.actions";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges {

  @ViewChild('videoElem') public videoElem: VideochatComponent | undefined;
  public isAuthorization = true;
  public meetingId$ = this.store$.pipe(select(selectMeetingIdRouterParam));
  public joinUrl = this.router.url;
  public previousUrl: any = null;
  public currentUrl: any = null;
  public IsRelogin: boolean = false;
  public IsPrejoin: any;

  constructor(
    private store$: Store<State>,
    private router: Router,
    private urlService: UrlService,
    private callService: CallService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon('fullscreen',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets//icons/fullscreen_white_24dp.svg"));
    this.matIconRegistry.addSvgIcon('connection',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets//icons/connection.svg"));

    router.events
      .subscribe((event: any) => {
        if (event.navigationTrigger === 'popstate') {
          this.router.navigateByUrl("/");
          this.callService.stopCall().then(() => {
            this.store$.dispatch(removeAllUsers());
          });
        }
      });
  }

  ngOnInit() {

    this.store$.dispatch(addChatOpenStatus({chatOpenStatus: false}));

    this.IsPrejoin = this.joinUrl.includes('join');

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.previousUrl = this.currentUrl;

      this.currentUrl = event.url;

      console.log(this.currentUrl);

      if (!this.IsRelogin) {
        this.urlService.setPreviousUrl(this.previousUrl);
      }
      else if (this.IsRelogin) {
        this.urlService.setPreviousUrl(null);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.warn("CHANGES", changes);
  }

}
