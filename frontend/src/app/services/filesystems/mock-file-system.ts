import { Observable } from 'rxjs';
import { FileSystem, Upload } from './file-system';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CloudDirectory, CloudFile, CloudNode, PathItem } from 'src/app/models/files-api-models';
import { EventEmitter } from '@angular/core';

interface InternalFileElement {
    parentID?: string;
    id: string;
    name: string
    date?: Date;
    mimetype: string;
    size?: number;
}

const DELAY = 500;
const OWNER = "John Doe"
const DIRECTORY_MIMETYPE = "application/x-dir";
export class MockFileSystem implements FileSystem {

    private filesMap = new Map<string, InternalFileElement>();
    private _refreshNeeded$ = new EventEmitter<void>();
    private _currentUpload$ = new EventEmitter<Upload>();

    constructor() {
        this.filesMap.set("root", { "name": "Root", "mimetype": DIRECTORY_MIMETYPE, id: "root" });
        this.filesMap.set("root.sub1", { "parentID": "root", "name": "sub1", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1" });
        this.filesMap.set("root.sub2", { "parentID": "root", "name": "sub2", mimetype: DIRECTORY_MIMETYPE, id: "root.sub2" });
        this.filesMap.set("root.sub3", { "parentID": "root", "name": "sub3", mimetype: DIRECTORY_MIMETYPE, id: "root.sub3" });
        this.filesMap.set("root.sub4", { "parentID": "root", "name": "sub4", mimetype: DIRECTORY_MIMETYPE, id: "root.sub4" });
        this.filesMap.set("root.sub1.sub", { "parentID": "root.sub1", "name": "subsub", mimetype: DIRECTORY_MIMETYPE, id: "root.sub1.sub" });

        this.filesMap.set("root.f1", { "parentID": "root", name: "file1A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f1" });
        this.filesMap.set("root.f2", { "parentID": "root", name: "file2A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f2" });
        this.filesMap.set("root.f3", { "parentID": "root", name: "file3A.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.f3" });

        this.filesMap.set("root.sub1.f1", { "parentID": "root.sub1", name: "file1B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f1" });
        this.filesMap.set("root.sub1.f2", { "parentID": "root.sub1", name: "file2B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f2" });
        this.filesMap.set("root.sub1.f3", { "parentID": "root.sub1", name: "file3B.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.f3" });

        this.filesMap.set("root.sub1.sub.f1", { "parentID": "root.sub1.sub", name: "file1C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f1" });
        this.filesMap.set("root.sub1.sub.f2", { "parentID": "root.sub1.sub", name: "file2C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f2" });
        this.filesMap.set("root.sub1.sub.f3", { "parentID": "root.sub1.sub", name: "file3C.pdf", mimetype: "application/pdf", size: 444, date: new Date(), id: "root.sub1.sub.f3" });
        this._printToConsole();
    }

    cancelUpload() {
        this._currentUpload$.emit(null);
    }

    currentUpload(): Observable<Upload> {
        return this._currentUpload$.asObservable();
    }

    refreshNeeded(): Observable<void> {
        return this._refreshNeeded$.asObservable();
    }

    upload(file: Blob, name: string, mimetype: string, folderID: string): Observable<void> {
        const parentFolder = this.filesMap.get(folderID);
        if (!parentFolder || parentFolder.mimetype !== DIRECTORY_MIMETYPE) {
            throw new Error(`404 unknow or wrong file ${folderID}`);
        }

        this._currentUpload$.emit({
            filename: name,
            progress: 0,
            remainingSeconds: 60
        });

        let newEntry: InternalFileElement = {
            id: parentFolder.name + "." + name,
            name: name,
            mimetype: mimetype,
            size: file ? file.size : 0,
            date: new Date(),
            parentID: folderID
        }

        this.filesMap.set(newEntry.id, newEntry);
        of(null).pipe(delay(DELAY * 5)).toPromise().then(() => this._currentUpload$.emit({
            filename: name,
            progress: 0.5,
            remainingSeconds: 30
        }));

        this._refreshNeeded$.emit(null);
        const observable = of(null).pipe(delay(DELAY * 10));
        observable.toPromise().then(() => this._currentUpload$.emit(null));
        return observable;
    }

    get(id: string): Observable<CloudNode> {
        const internalFile = this.filesMap.get(id);
        if (!internalFile) {
            throw new Error(`404 unknow file ${id}`);
        }

        let node = {
            id: internalFile.id,
            name: internalFile.name,
            ownerName: OWNER,
            mimetype: internalFile.mimetype
        }

        if (internalFile.mimetype === DIRECTORY_MIMETYPE) {
            const directoryContent = Array.from(this.filesMap.values()).filter(
                val => val.parentID === id
            ).map(val => {
                let node = {
                    id: val.id,
                    name: val.name,
                    ownerName: OWNER,
                    mimetype: val.mimetype
                }

                if (val.mimetype === DIRECTORY_MIMETYPE) {
                    return {
                        ...node,
                        directoryContent: [],
                        path: [],
                        mimetype: "application/x-dir",
                        isDirectory: true
                    } as CloudDirectory;
                } else {
                    return {
                        ...node,
                        size: val.size,
                        lastModified: val.date,
                        isDirectory: false
                    } as CloudFile;
                }
            });

            let path = [];
            let current = internalFile;
            while (current) {
                path.push({ name: current.name, id: current.id });
                if (current.parentID) {
                    current = Array.from(this.filesMap.values()).filter(val => val.id === current.parentID)[0];
                } else {
                    current = null;
                }
            }

            path = path.reverse();
            path.pop();

            return of<CloudDirectory>({
                ...node,
                path: path,
                directoryContent: directoryContent,
                mimetype: "application/x-dir",
                isDirectory: true
            }).pipe(delay(DELAY));

        } else {
            return of<CloudFile>({
                ...node,
                size: internalFile.size,
                lastModified: internalFile.date,
                isDirectory: false
            }).pipe(delay(DELAY));
        }
    }

    copy(sourceID: string, newFileName: string, destID: string): Observable<void> {
        if (!this.filesMap.get(sourceID)) {
            throw new Error('Unknow file sourceID.');
        }

        if (!this.filesMap.get(destID)) {
            throw new Error('Unknow file destID.');
        }

        if (this.filesMap.get(destID).mimetype !== DIRECTORY_MIMETYPE) {
            throw new Error('destID is not a directory.');
        }

        this._copyInternal(sourceID, newFileName, destID);
        this._printToConsole();

        this._refreshNeeded$.emit(null);
        return of(null).pipe(delay(DELAY));
    }

    move(sourceID: string, destID: string): Observable<void> {
        if (!this.filesMap.get(sourceID)) {
            throw new Error('Unknow file sourceID.');
        }

        if (!this.filesMap.get(destID)) {
            throw new Error('Unknow file destID.');
        }

        if (this.filesMap.get(destID).mimetype !== DIRECTORY_MIMETYPE) {
            throw new Error('destID is not a directory.');
        }

        let file = this.filesMap.get(sourceID);
        file.parentID = destID;
        this.filesMap.set(sourceID, file);
        this._printToConsole();

        this._refreshNeeded$.emit(null);
        return of(null).pipe(delay(DELAY));
    }

    rename(fileID: string, newName: string): Observable<void> {
        if (!this.filesMap.get(fileID)) {
            throw new Error('Unknow file.');
        }

        let file = this.filesMap.get(fileID);
        file.name = newName;
        this.filesMap.set(fileID, file);
        this._printToConsole();

        this._refreshNeeded$.emit(null);
        return of(null).pipe(delay(DELAY));
    }

    delete(fileID: string): Observable<void> {
        if (!this.filesMap.get(fileID)) {
            throw new Error('Unknow file.');
        }

        this._deleteInternal(fileID);
        this._printToConsole();

        this._refreshNeeded$.emit(null);
        return of(null).pipe(delay(DELAY));
    }

    private _deleteInternal(fileID: string) {
        const file = this.filesMap.get(fileID);
        if (file.mimetype === DIRECTORY_MIMETYPE) {
            for (const child of Array.from(this.filesMap.values()).filter(val => val.parentID === fileID)) {
                this._deleteInternal(child.id);
            }
        }
        this.filesMap.delete(fileID);
    }

    private _copyInternal(fileID: string, newFileName: string, destID: string) {
        const file = this.filesMap.get(fileID);
        this.filesMap.set(file.id + "_clone", {
            id: file.id + "_clone",
            parentID: destID,
            mimetype: file.mimetype,
            name: newFileName,
            date: file.date,
            size: file.size
        });

        if (file.mimetype === DIRECTORY_MIMETYPE) {
            for (const child of Array.from(this.filesMap.values()).filter(val => val.parentID === fileID)) {
                this._copyInternal(child.id, child.name, file.id + "_clone");
            }
        }
    }

    private _printToConsole() {
        console.log(this.filesMap);
    }
}