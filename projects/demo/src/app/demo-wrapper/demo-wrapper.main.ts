import { enableProdMode, provideZoneChangeDetection } from "@angular/core";
import { platformBrowser } from "@angular/platform-browser";
import { DemoWrapperModule } from "./demo-wrapper.module";

enableProdMode();
platformBrowser()
  .bootstrapModule(DemoWrapperModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch((err) => console.error(err));
