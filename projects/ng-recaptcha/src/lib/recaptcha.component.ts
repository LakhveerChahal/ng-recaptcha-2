import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  model,
  NgZone,
  OnDestroy,
  Optional,
  output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { Subscription } from "rxjs";

import { RecaptchaLoaderService } from "./recaptcha-loader.service";
import { RecaptchaSettings } from "./recaptcha-settings";
import { RECAPTCHA_SETTINGS } from "./tokens";

let nextId = 0;

export type NeverUndefined<T> = T extends undefined ? never : T;

export type RecaptchaErrorParameters = Parameters<NeverUndefined<ReCaptchaV2.Parameters["error-callback"]>>;

@Component({
  exportAs: "reCaptcha",
  selector: "re-captcha",
  template: ``,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class RecaptchaComponent implements AfterViewInit, OnDestroy {
  @HostBinding("attr.id")
  public id = model<string>(`ngrecaptcha-${nextId++}`);

  public siteKey = model<string>();
  public theme = model<ReCaptchaV2.Theme>();
  public type = model<ReCaptchaV2.Type>();
  public size = model<ReCaptchaV2.Size>();
  public tabIndex = model<number>();
  public badge = model<ReCaptchaV2.Badge>();
  public errorMode = model<"handled" | "default">("default");

  public resolved = output<string | null>();
  /**
   * @deprecated `(error) output will be removed in the next major version. Use (errored) instead
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  public error = output<RecaptchaErrorParameters>();
  public errored = output<RecaptchaErrorParameters>();

  /** @internal */
  private subscription: Subscription;
  /** @internal */
  private widget: number;
  /** @internal */
  private grecaptcha: ReCaptchaV2.ReCaptcha;
  /** @internal */
  private executeRequested: boolean;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private loader: RecaptchaLoaderService,
    private zone: NgZone,
    @Optional() @Inject(RECAPTCHA_SETTINGS) settings?: RecaptchaSettings,
  ) {
    if (settings) {
      this.siteKey.set(settings.siteKey);
      if (settings.theme) {
        this.theme.set(settings.theme);
      }
      if (settings.type) {
        this.type.set(settings.type);
      }
      if (settings.size) {
        this.size.set(settings.size);
      }
      if (settings.badge) {
        this.badge.set(settings.badge);
      }
    }
  }

  public ngAfterViewInit(): void {
    this.subscription = this.loader.ready.subscribe((grecaptcha: ReCaptchaV2.ReCaptcha) => {
      if (grecaptcha != null && grecaptcha.render instanceof Function) {
        this.grecaptcha = grecaptcha;
        this.renderRecaptcha();
      }
    });
  }

  public ngOnDestroy(): void {
    // reset the captcha to ensure it does not leave anything behind
    // after the component is no longer needed
    this.grecaptchaReset();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Executes the invisible recaptcha.
   * Does nothing if component's size is not set to "invisible".
   */
  public execute(): void {
    if (this.size() !== "invisible") {
      return;
    }

    if (this.widget != null) {
      void this.grecaptcha.execute(this.widget);
    } else {
      // delay execution of recaptcha until it actually renders
      this.executeRequested = true;
    }
  }

  public reset(): void {
    if (this.widget != null) {
      if (this.grecaptcha.getResponse(this.widget)) {
        // Only emit an event in case if something would actually change.
        // That way we do not trigger "touching" of the control if someone does a "reset"
        // on a non-resolved captcha.
        this.resolved.emit(null);
      }

      this.grecaptchaReset();
    }
  }

  /**
   * ⚠️ Warning! Use this property at your own risk!
   *
   * While this member is `public`, it is not a part of the component's public API.
   * The semantic versioning guarantees _will not be honored_! Thus, you might find that this property behavior changes in incompatible ways in minor or even patch releases.
   * You are **strongly advised** against using this property.
   * Instead, use more idiomatic ways to get reCAPTCHA value, such as `resolved` EventEmitter, or form-bound methods (ngModel, formControl, and the likes).å
   */
  public get __unsafe_widgetValue(): string | null {
    return this.widget != null ? this.grecaptcha.getResponse(this.widget) : null;
  }

  /** @internal */
  private expired() {
    this.resolved.emit(null);
  }

  /** @internal */
  private onError(args: RecaptchaErrorParameters) {
    // eslint-disable-next-line deprecation/deprecation
    this.error.emit(args);
    this.errored.emit(args);
  }

  /** @internal */
  private captchaResponseCallback(response: string) {
    this.resolved.emit(response);
  }

  /** @internal */
  private grecaptchaReset() {
    if (this.widget != null) {
      this.zone.runOutsideAngular(() => this.grecaptcha.reset(this.widget));
    }
  }

  /** @internal */
  private renderRecaptcha() {
    // This `any` can be removed after @types/grecaptcha get updated
    const renderOptions: ReCaptchaV2.Parameters = {
      badge: this.badge(),
      callback: (response: string) => {
        this.zone.run(() => this.captchaResponseCallback(response));
      },
      "expired-callback": () => {
        this.zone.run(() => this.expired());
      },
      sitekey: this.siteKey(),
      size: this.size(),
      tabindex: this.tabIndex(),
      theme: this.theme(),
      type: this.type(),
    };

    if (this.errorMode() === "handled") {
      renderOptions["error-callback"] = (...args: RecaptchaErrorParameters) => {
        this.zone.run(() => this.onError(args));
      };
    }

    this.widget = this.grecaptcha.render(this.elementRef.nativeElement, renderOptions);

    if (this.executeRequested === true) {
      this.executeRequested = false;
      this.execute();
    }
  }
}
