import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from "@angular/core";

import { OnExecuteData, OnExecuteErrorData, ReCaptchaV3Service } from "ng-recaptcha";
import { Subscription } from "rxjs";

@Component({
  selector: "recaptcha-demo",
  styles: [
    `
      .error {
        color: crimson;
      }
    `,
  ],
  templateUrl: "./v3-demo.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class RecaptchaV3DemoComponent implements OnInit, OnDestroy {
  public recentToken = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public recentError?: { error: any };
  public readonly successLog: OnExecuteData[] = [];
  public readonly errorLog: OnExecuteErrorData[] = [];

  private allExecutionsSubscription: Subscription | undefined;
  private allExecutionErrorsSubscription: Subscription | undefined;
  private singleExecutionSubscription: Subscription | undefined;

  constructor(private recaptchaV3Service: ReCaptchaV3Service) {}

  public executeAction(action: string): void {
    if (this.singleExecutionSubscription) {
      this.singleExecutionSubscription.unsubscribe();
    }
    this.singleExecutionSubscription = this.recaptchaV3Service.execute(action).subscribe(
      (token) => {
        this.recentToken = token;
        this.recentError = undefined;
      },
      (error) => {
        this.recentToken = "";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.recentError = { error };
      },
    );
  }

  public ngOnInit(): void {
    this.allExecutionsSubscription = this.recaptchaV3Service.onExecute.subscribe((data) => this.successLog.push(data));
    this.allExecutionErrorsSubscription = this.recaptchaV3Service.onExecuteError.subscribe((data) =>
      this.errorLog.push(data),
    );
  }

  public ngOnDestroy(): void {
    if (this.allExecutionsSubscription) {
      this.allExecutionsSubscription.unsubscribe();
    }
    if (this.allExecutionErrorsSubscription) {
      this.allExecutionErrorsSubscription.unsubscribe();
    }
    if (this.singleExecutionSubscription) {
      this.singleExecutionSubscription.unsubscribe();
    }
  }

  public formatToken(token: string): string {
    if (!token) {
      return "(empty)";
    }

    return `${token.substring(0, 7)}...${token.substring(token.length - 7)}`;
  }
}
