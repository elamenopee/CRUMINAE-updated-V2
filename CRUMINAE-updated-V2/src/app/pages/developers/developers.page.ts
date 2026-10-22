import { Component } from '@angular/core';

@Component({
  selector: 'app-developers',
  templateUrl: 'developers.page.html',
  standalone: false,
})
export class DevelopersPage {
  // PLACEHOLDER: replace with your team's real names, roles and contact details.
  team = [
    { name: 'Developer One', role: 'Lead Developer', email: 'dev1@example.com' },
    { name: 'Developer Two', role: 'UI / UX Designer', email: 'dev2@example.com' },
    { name: 'Developer Three', role: 'Front-end Developer', email: 'dev3@example.com' },
    { name: 'Developer Four', role: 'QA & Documentation', email: 'dev4@example.com' },
  ];

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
