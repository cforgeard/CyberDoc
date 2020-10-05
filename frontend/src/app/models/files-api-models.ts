import { FileType } from '../services/files-utils/files-utils.service';

export type PathItem = {
  name: string;
  id: string;
}

export type CloudNode = CloudFile | CloudDirectory;

export class CloudFile {
  public id: string;
  public ownerName: string;
  public name: string;
  public mimetype: Exclude<string, "application/x-dir">;
  public size: number;
  public lastModified: Date;
  public tagIDs: string[];
  isDirectory: false;
}

export class CloudDirectory {
  public id: string;
  public ownerName: string;
  public name: string;
  public mimetype: "application/x-dir";
  public path: PathItem[];
  public directoryContent: CloudNode[];
  public tagIDs: string[];
  isDirectory: true;
}

export const NO_TYPE_FILTER = "any";
export const NO_DATEDIFF_DEFAULT = -1;
export const VALID_DATEDIFF_VALUES = [-1, 0, 1, 2, 30, 60, 90, 365];
export const NO_NAME_FILTER = "";

export const EMPTY_SEARCH_PARAMS: SearchParams = {
  name: NO_NAME_FILTER,
  type: NO_TYPE_FILTER,
  dateDiff: NO_DATEDIFF_DEFAULT,
  tagIDs: []
};

export interface SearchParams {
  name: string;
  type: string;
  dateDiff: number;
  tagIDs: string[];
}

export function isValidSearchParams(obj: any, userTagIDs: string[]) {
  if (typeof obj !== "object") return false;

  const objKeys = Object.keys(obj);
  if (objKeys.length !== 4) return false;
  if (objKeys.indexOf("name") === -1) return false;
  if (objKeys.indexOf("type") === -1) return false;
  if (objKeys.indexOf("dateDiff") === -1) return false;
  if (objKeys.indexOf("tagIDs") === -1) return false;

  if (typeof obj.name !== "string") return false;
  if ([NO_TYPE_FILTER, ...Object.keys(FileType)].indexOf(obj.type) === -1) return false;
  if (VALID_DATEDIFF_VALUES.indexOf(obj.dateDiff) === -1) return false; 
  if (!Array.isArray(obj.tagIDs)) return false;

  for (const item of obj.tagIDs){
    if (userTagIDs.indexOf(item) === -1)return false;
  }

  return true;
}