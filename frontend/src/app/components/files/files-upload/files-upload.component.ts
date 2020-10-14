import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CloudDirectory } from 'src/app/models/files-api-models';
import { FileSystemProvider } from 'src/app/services/filesystems/file-system-provider';
import { FilesNewFolderDialogComponent } from '../files-new-folder-dialog/files-new-folder-dialog.component';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss']
})
export class FilesUploadComponent implements AfterViewInit {

  @Input() currentDirectory: CloudDirectory;
  @ViewChild('dropDiv') dropDiv: ElementRef<HTMLDivElement>;
  @ViewChild('file') input: ElementRef<HTMLInputElement>;

  showDragZone = false;
  setTimeoutID: number;
  currentlyUploading = false;

  constructor(
    private fsProvider: FileSystemProvider,
    private dialog: MatDialog
  ) {
    fsProvider.default().getCurrentFileUpload().subscribe(val => {
      this.currentlyUploading = (val != undefined);
    })
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    if (this.currentlyUploading) return;

    evt.preventDefault();
    evt.stopPropagation();
    this.showDragZone = true;
    window.clearTimeout(this.setTimeoutID);
    this.setTimeoutID = window.setTimeout(() => this.showDragZone = false, 250);
  }

  @HostListener('document:drop', ['$event'])
  onDrop(evt: DragEvent) {
    if (this.currentlyUploading) return;

    evt.preventDefault();
    evt.stopPropagation();
    this.showDragZone = false;
    if (evt.dataTransfer.files.length === 1) {
      this.uploadSelectedFile(evt.dataTransfer.files[0]);
    }
  }

  uploadSelectedFile(file: File) {
    this.fsProvider.default().startFileUpload(
      file,
      this.currentDirectory
    );
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.addEventListener("change", (e) => {
      if (this.input.nativeElement.files.length === 1) {
        this.uploadSelectedFile(this.input.nativeElement.files[0]);
      }
    })
  }

  uploadFile() {
    this.input.nativeElement.click();
  }

  createFolder() {
    this.dialog.open(FilesNewFolderDialogComponent, {
      maxWidth: "400px",
      data: this.currentDirectory
    });
  }
}
