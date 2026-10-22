import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ALLERGENS, Allergen, Profile } from '../../core/models';
import { LoyaltyService } from '../../core/loyalty.service';
import { ProfileService } from '../../core/profile.service';
import { StorageService } from '../../core/storage.service';
import { UiService } from '../../core/ui.service';
import { LocalAuthService } from '../../core/local-auth';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  loyalty = inject(LoyaltyService);
  auth = inject(LocalAuthService);

  private profiles = inject(ProfileService);
  private storage = inject(StorageService);
  private ui = inject(UiService);
  private router = inject(Router);

  allergens = ALLERGENS;
  state$ = this.loyalty.state$;

  form: Profile = {
    ...this.profiles.profile,
    avoid: [...this.profiles.profile.avoid]
  };

  showSettings = false;
  showEditProfile = false;

  profilePhoto = '';

  get userName(): string {
    return this.form.name || this.auth.currentUser?.name || 'Cruminae Member';
  }

  get userEmail(): string {
    return this.auth.currentUser?.email || '';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.auth.isLoggedIn) {
      this.profilePhoto = '';
      return;
    }

    const user = this.auth.currentUser;

    this.form = {
      ...this.profiles.profile,
      name: this.profiles.profile.name || user?.name || '',
      email: user?.email || this.profiles.profile.email,
      avoid: [...this.profiles.profile.avoid]
    };

    const photoKey = `cruminae_photo_${user?.id}`;
    this.profilePhoto = localStorage.getItem(photoKey) || '';
  }

  uploadPhoto(event: Event): void {
    if (!this.auth.isLoggedIn) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.ui.toast('Please select an image.', 'danger');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.ui.toast('Image must be below 2MB.', 'danger');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const photo = reader.result;

      if (typeof photo !== 'string') return;

      const userId = this.auth.currentUser?.id;
      if (!userId) return;

      try {
        localStorage.setItem(`cruminae_photo_${userId}`, photo);
        this.profilePhoto = photo;
        this.ui.toast('Profile photo updated!', 'success');
      } catch {
        this.ui.toast('Unable to save photo.', 'danger');
      }
    };

    reader.readAsDataURL(file);
  }

  toggle(a: Allergen): void {
    const i = this.form.avoid.indexOf(a);

    if (i >= 0) {
      this.form.avoid.splice(i, 1);
    } else {
      this.form.avoid.push(a);
    }
  }

  save(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.profiles.update(this.form);
    this.showEditProfile = false;
    this.ui.toast('Profile saved', 'success');
  }

  logout(): void {
    this.auth.logout();
    this.profilePhoto = '';
    this.showSettings = false;
    this.showEditProfile = false;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  resetDemo(): void {
    this.storage.clearAll();
    location.reload();
  }
}