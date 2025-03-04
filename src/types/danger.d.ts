declare module 'danger' {
  interface TextDiff {
    diff: string;
    added: string;
    removed: string;
    before: string;
    after: string;
  }

  interface GitHubPRDSL {
    title: string;
    body: string;
    commits: any[];
    head: {
      ref: string;
    };
    mergeable: boolean;
    requested_reviewers: GitHubReviewers[];
  }

  interface GitHubReviewers {
    id: number;
    login: string;
    type: string;
  }

  interface GitDSL {
    modified_files: string[];
    created_files: string[];
    deleted_files: string[];
    diffForFile(path: string): Promise<TextDiff | null>;
  }

  interface DangerDSLType {
    github: GitHubPRDSL;
    git: GitDSL;
  }

  export const danger: DangerDSLType;
  export function warn(message: string): void;
  export function fail(message: string): void;
  export function message(message: string): void;
}
