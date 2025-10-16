/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_PROJECT_ID: string;
  readonly GOOGLE_PRIVATE_KEY_ID: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_CLIENT_EMAIL: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_DRIVE_FOLDER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}