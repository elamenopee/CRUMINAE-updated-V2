import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  standalone: false,
})
export class AboutPage {
  version = '1.0.0';
  features = [
    { icon: 'gift-outline', title: 'Cookie Box Builder', text: 'Mix flavors in boxes of 6, 12 or 24 and save up to 15%.' },
    { icon: 'flame-outline', title: 'Freshness Timer', text: 'See how long ago each flavor came out of the oven.' },
    { icon: 'help-circle-outline', title: 'Taste Quiz', text: 'Answer four questions and get your top three matches.' },
    { icon: 'ribbon-outline', title: 'Loyalty Crumbs', text: 'Earn crumbs on every order and redeem them for savings.' },
    { icon: 'heart-circle-outline', title: 'Gift Mode', text: 'Add gift wrap and a message card to any order.' },
    { icon: 'repeat-outline', title: 'Craving Tracker', text: 'See your most-ordered cookies and reorder in one tap.' },
    { icon: 'time-outline', title: 'Delivery Slots', text: 'Choose a day and two-hour window for delivery or pickup.' },
    { icon: 'shield-checkmark-outline', title: 'Allergen Filter', text: 'Hide cookies with nuts, gluten, dairy, eggs or soy.' },
  ];
}
