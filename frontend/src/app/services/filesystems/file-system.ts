import { Observable } from 'rxjs';
import { CloudDirectory, CloudFile, CloudNode, FileTag, RespondAnswerSign, RespondShare, RespondSign, SearchParams } from 'src/app/models/files-api-models';

export interface Upload {
    filename: string;
    progress: number;
    remainingSeconds: number;
    error: Error;
}

export interface FileSystem {

    get(nodeID: string): Observable<CloudNode>;
    createDirectory(name: string, parentFolder: CloudDirectory): Observable<void>;
    search(searchParams: SearchParams): Observable<CloudDirectory>;

    copy(file: CloudFile, fileName: string, destination: CloudDirectory): Observable<void>;
    move(node: CloudNode, destination: CloudDirectory): Observable<void>;
    rename(node: CloudNode, newName: string): Observable<void>;
    delete(node: CloudNode): Observable<void>;
    setPreviewEnabled(file: CloudFile, enabled: boolean): Observable<void>;
    setShareMode(file: CloudFile, shareMode: string): Observable<void>;

    share(fileID: string, email: string): Observable<void>;
    // MOCK : share(fileID: string, email: String): Observable<RespondShare>;
    getSharedWith(fileID: string): Observable<RespondShare[]>;
    getSharedFiles(): Observable<CloudDirectory>;
    getSharedWithPending(fileID: String): Observable<string[]>;
    deleteShare(fileID: string, email: String): Observable<void>;

    sign(fileID: string): Observable<void>;
    listSignatories(fileID: string): Observable<RespondAnswerSign[]>;
  
    addTag(node: CloudNode, tag: FileTag): Observable<void>;
    removeTag(node: CloudNode, tag: FileTag): Observable<void>;

    getDownloadURL(node: CloudNode): string;
    getExportURL(node: CloudNode): string;
    getFilePreviewImageURL(node: CloudNode): string;
    getEtherpadURL(file: CloudFile): Observable<string>;

    startFileUpload(file: File, destination: CloudDirectory): void;
    cancelFileUpload(): void;
    getCurrentFileUpload(): Observable<Upload>;

    refreshNeeded(): Observable<void>;
}
