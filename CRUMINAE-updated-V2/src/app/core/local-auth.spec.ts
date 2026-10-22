import { TestBed } from '@angular/core/testing';

import { LocalAuth } from './local-auth';

describe('LocalAuth', () => {
  let service: LocalAuth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalAuth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
