import { UserDataBackup } from './user-data-backup';

export interface Manifest {
    name: string;
    creationDate: string;
    version: number;
    type: number;
    userDataBackup: UserDataBackup
}