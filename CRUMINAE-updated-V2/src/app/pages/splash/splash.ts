
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss']
})
export class Splash implements OnInit, OnDestroy {

  private timer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      this.router.navigateByUrl('/pages/dashboard', {
        replaceUrl: true
      });
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
