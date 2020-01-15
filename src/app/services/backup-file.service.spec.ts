import { TestBed } from '@angular/core/testing';

import { BackupFileService } from './backup-file.service';

describe('BackupFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackupFileService = TestBed.get(BackupFileService);
    expect(service).toBeTruthy();
  });
});
