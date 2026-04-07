declare module '@react-navigation/bottom-tabs' {
  import { ComponentType } from 'react';
  export const BottomTabBar: ComponentType<any>;
  export const createBottomTabNavigator: any;
  export interface BottomTabBarButtonProps {
    onPress?: () => void;
    [key: string]: any;
  }
  export const Tabs: any;
  export default Tabs;
}
