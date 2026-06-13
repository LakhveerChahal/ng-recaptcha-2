import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "recaptcha-demo",
  templateUrl: "./global-config-demo.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GlobalConfigDemoComponent {
  public resolved(captchaResponse: string | null): void {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
}
