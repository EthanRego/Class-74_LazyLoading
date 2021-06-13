import React from 'react';
import {StyleSheet,Image } from 'react-native';
import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/TransactionScreen';
import {createBottomTabNavigator} from 'react-navigation-tabs'
import {createAppContainer} from 'react-navigation'

export default class App extends React.Component {
  render(){
    return (
    <AppContainer/>
  );
    }
}

const TabNavigator = createBottomTabNavigator({
  Transaction:{screen:TransactionScreen},
  Search:{screen:SearchScreen},
},
{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:()=>{
      const routeName=navigation.state.routeName
      if (routeName === 'Transaction'){
        return(
          <Image
          style={{width:40,height:40}}
          source={require('./assets/book.png')}
          />
        )
      }
      else if (routeName === 'Search'){
        return(
          <Image
          style={{width:40,height:40}}
          source={require('./assets/searchingbook.png')}
          />
        )
      }
    }
  })
}
)

const AppContainer = createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
