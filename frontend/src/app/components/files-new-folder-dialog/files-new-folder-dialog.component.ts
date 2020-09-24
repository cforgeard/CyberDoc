import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CloudDirectory, DIRECTORY_MIMETYPE } from 'src/app/models/files-api-models';
import { FileSystemProviderService } from 'src/app/services/filesystems/file-system-provider';

@Component({
  selector: 'app-files-new-folder-dialog',
  templateUrl: './files-new-folder-dialog.component.html',
  styleUrls: ['./files-new-folder-dialog.component.css']
})
export class FilesNewFolderDialogComponent {

  loading = false;
  input = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<FilesNewFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CloudDirectory,
    private fsProvider: FileSystemProviderService) {
  }

  @HostListener("keydown", ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.onCreateBtnClicked();
    }
  }

  onCreateBtnClicked() {
    this.loading = true;
    this.input.disable();
    this.dialogRef.disableClose = true;
    this.fsProvider.default().upload(null, this.input.value, DIRECTORY_MIMETYPE, this.data.id).toPromise().then(() => {
      this.loading = false;
      this.input.enable();
      this.dialogRef.disableClose = false;
      this.dialogRef.close(true);
    })
  }

  onCancelBtnClicked() {
    this.dialogRef.close(false);
  }



}
