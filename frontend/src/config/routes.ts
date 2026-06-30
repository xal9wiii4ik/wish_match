export const app_routes = {
  landing: "/",
  login: "/login",
  register: "/register",
  confirm_email: "/confirm-email",

  discover: "/app/discover",
  map: "/app/map",
  matches: "/app/matches",
  my_wishes: "/app/wishes",
  wish_create: "/app/wishes/new",
  wish_detail: "/app/wishes/:wish_id",
  profile: "/app/profile",
  settings: "/app/settings",
} as const;

export function build_wish_detail_path(wish_id: string): string {
  return app_routes.wish_detail.replace(":wish_id", wish_id);
}
