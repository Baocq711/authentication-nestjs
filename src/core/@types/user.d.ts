export {};

declare global {
  interface UserByAccessToken {
    id: string;
    role: {
      id: string;
    };
  }
}
