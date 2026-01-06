export interface VideoPath {
  quality: number;
  videoPath: string;
}

export interface CdnList {
  cdnDomain: string;
  videoPathList: VideoPath[];
}

export interface Episode {
  chapterId: string;
  chapterIndex: number;
  chapterName: string;
  cdnList: CdnList[];
}

export interface Drama {
  bookId: string;
  bookName: string;
  coverWap: string;
  introduction: string;
  chapterCount: number;
  tagNames: string[];
  playCount: string;
}