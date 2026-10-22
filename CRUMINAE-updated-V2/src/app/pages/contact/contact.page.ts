import { Component, inject } from '@angular/core';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.page.html',
  standalone: false,
})
export class ContactPage {
  private ui = inject(UiService);

  // PLACEHOLDER: replace with Cruminae's real contact details.
  info = {
    phone: '+63 900 000 0000',
    email: 'hello@cruminae.example',
    address: 'Quezon City, Metro Manila',
  };
  hours = [
    { days: 'Monday to Friday', time: '8:00 AM – 7:00 PM' },
    { days: 'Saturday', time: '9:00 AM – 6:00 PM' },
    { days: 'Sunday', time: '10:00 AM – 4:00 PM' },
  ];
  form = { name: '', email: '', message: '' };

  get valid(): boolean {
    return !!this.form.name.trim() && /\S+@\S+\.\S+/.test(this.form.email) && !!this.form.message.trim();
  }

  async send(): Promise<void> {
    if (!this.valid) { return this.ui.toast('Add your name, a valid email and a message', 'danger', 2000); }
    // Demo only: hook this up to your backend or an email service.
    this.form = { name: '', email: '', message: '' };
    await this.ui.toast('Message sent. We reply within a day.', 'success', 2200);
  }
}
