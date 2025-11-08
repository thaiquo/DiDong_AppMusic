
// export type RootStackParamList = {
//   LaunchWelcomeScreen: undefined;
//   LoginScreen: undefined;
//   RegisterScreen: undefined;
//   HomeScreen: undefined;
//   ProfileScreen: undefined;
//   ArtistScreen: { artistId: string };
//    PlaylistScreen: { playlistId: string };
//   FollowingScreen: { userId: string };
//   HistoryScreen: { userId: string };
// };
export type RootStackParamList = {
  LaunchWelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  MainTabs: undefined;
  ProfileScreen: undefined;
  FeedStack: undefined;
  ArtistScreen: { artistId: string };
  PlaylistScreen: { playlistId: string };
  FollowingScreen: { userId: string };
  HistoryScreen: { userId: string };
};
