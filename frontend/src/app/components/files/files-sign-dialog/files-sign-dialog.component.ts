import { Component, HostListener, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CloudFile } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { UserServiceProvider } from 'src/app/services/users/user-service-provider';

@Component({
  selector: 'app-files-sign-dialog',
  templateUrl: './files-sign-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss']
})
export class FilesSignDialogComponent {

  loading = false;
  hasAlreadySign = false;
  isEmpty = false;
  displayedColumns = ['user_email', 'created_at'];
  dataSource = new MatTableDataSource([]);

  constructor(public dialogRef: MatDialogRef<FilesSignDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider,
    private userServiceProvider: UserServiceProvider) {

    this.update();
    fsProvider.default().refreshNeeded().subscribe(() => {
      this.update();
    });
  }

  update() {
    this.fsProvider.default().listSignatories(this.file._id).toPromise().then(values => {
      this.dataSource.data = values;
      for (const element of values) {
        //TODO i18n
        element.created_at = `${element.created_at.slice(0, 10)} / ${element.created_at.slice(11, 19)}`;
        if (element.user_email === this.userServiceProvider.default().getActiveUser().email) {
          this.hasAlreadySign = true;
        }
      }
    })
  }

  addSignature() {
    this.dialog.open(FilesSignConfirmDialogComponent, {
      maxWidth: '400px',
      data: this.file
    });
  }

  onCloseBtnClicked() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'app-files-sign-confirm-dialog',
  templateUrl: './files-sign-confirm-dialog.component.html',
  styleUrls: ['./files-sign-dialog.component.scss']
})
export class FilesSignConfirmDialogComponent {

  loading = false;
  translateParams = { name: this.file.name };

  constructor(public dialogRef: MatDialogRef<FilesSignConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public file: CloudFile,
    private fsProvider: FileSystemProvider) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onSignBtnClicked();
    }
  }

  onSignBtnClicked() {
    this.dialogRef.disableClose = true;
    this.loading = true;
    this.fsProvider.default().sign(this.file._id).toPromise().then(() => {
      this.dialogRef.disableClose = false;
      this.loading = false;
      this.dialogRef.close(true);
    })
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }

}