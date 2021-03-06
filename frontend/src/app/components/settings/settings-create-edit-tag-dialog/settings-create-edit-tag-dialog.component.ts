import { Component, HostListener, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileTag } from 'src/app/models/files-api-models';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-settings-create-edit-tag-dialog',
  templateUrl: './settings-create-edit-tag-dialog.component.html',
  styleUrls: ['./settings-create-edit-tag-dialog.component.scss'],
})
export class SettingsCreateEditTagDialogComponent {
  loading = false;
  name = new FormControl('', [Validators.required]);
  color = new FormControl('#ff0000', [Validators.required]);
  tagAlreadyExistsError = false;
  tag: FileTag;

  constructor(
    public dialogRef: MatDialogRef<SettingsCreateEditTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public tagOrNewTagName: FileTag | string | undefined,
    private usersService: UsersService,
  ) {
    if (tagOrNewTagName && typeof tagOrNewTagName === 'object') {
      this.name.setValue(tagOrNewTagName.name);
      this.color.setValue(tagOrNewTagName.hexColor);
      this.tag = tagOrNewTagName;
    } else if (tagOrNewTagName && typeof tagOrNewTagName === 'string') {
      this.name.setValue(tagOrNewTagName);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      this.onSaveBtnClicked();
    }
  }

  onSaveBtnClicked() {
    if (!this.name.valid) {
      return;
    }
    if (!this.color.valid) {
      return;
    }
    this.tagAlreadyExistsError = false;

    if (!this.tag || this.name.value !== this.tag.name) {
      for (const tag of this.usersService.getActiveUser().tags) {
        if (tag.name === this.name.value) {
          this.tagAlreadyExistsError = true;
          return;
        }
      }
    }

    this.dialogRef.disableClose = true;
    this.loading = true;
    if (this.tag) {
      this.tag.hexColor = this.color.value;
      this.tag.name = this.name.value;

      this.usersService
        .editTag(this.tag)
        .toPromise()
        .then(() => {
          this.usersService
            .refreshActiveUser()
            .toPromise()
            .then(() => {
              this.dialogRef.disableClose = false;
              this.loading = false;
              this.dialogRef.close(this.tag.name);
            });
        });
    } else {
      this.tag = new FileTag();
      this.tag.hexColor = this.color.value;
      this.tag.name = this.name.value;

      this.usersService
        .addTag(this.tag)
        .toPromise()
        .then(() => {
          this.usersService
            .refreshActiveUser()
            .toPromise()
            .then(() => {
              this.dialogRef.disableClose = false;
              this.loading = false;
              this.dialogRef.close(this.tag.name);
            });
        });
    }
  }

  onCancelBtnClicked() {
    this.dialogRef.close(undefined);
  }
}
