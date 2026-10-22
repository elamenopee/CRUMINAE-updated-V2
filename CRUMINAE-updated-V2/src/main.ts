
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

// Register all Ionicons globally
addIcons(icons);

platformBrowser()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
