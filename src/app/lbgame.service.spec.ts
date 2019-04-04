import { TestBed } from '@angular/core/testing';

import { LbgameService } from './lbgame.service';

describe('LbgameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LbgameService = TestBed.get(LbgameService);
    expect(service).toBeTruthy();
  });
});
