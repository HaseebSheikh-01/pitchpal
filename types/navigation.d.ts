import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  '(auth)': NavigatorScreenParams<AuthStackParamList>;
  '(tabs)': NavigatorScreenParams<TabsStackParamList>;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  roleSelection: undefined;
  startupDataCollection: undefined;
  investorDataCollection: undefined;
  '(tabs)': undefined;
  '(auth)': undefined;
  _sitemap: undefined;
};

export type TabsStackParamList = {
  index: undefined;
};
