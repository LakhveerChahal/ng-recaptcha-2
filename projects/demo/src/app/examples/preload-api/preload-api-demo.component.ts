import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "recaptcha-demo",
  templateUrl: "./preload-api-demo.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PreloadApiDemoComponent {
  public resolved(captchaResponse: string | null): void {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
}
