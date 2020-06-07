import React from 'react'
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom'
import { WakfuAPIProvider } from './Api'
import ShoppingList, { ShoppingListProvider } from './ShoppingList'
import Navbar from './Navbar'
import Jobs from './Jobs'
import Screen from './Screen'

const App = () => {
  return (
    <WakfuAPIProvider>
      <ShoppingListProvider>
        <BrowserRouter>
          <Navbar />

          <Screen>
            <Switch>
              <Route path="/jobs" component={Jobs} />
              <Route path="/crafts" component={ShoppingList} />

              <Redirect path="/" to="/crafts" />
            </Switch>
          </Screen>
        </BrowserRouter>
      </ShoppingListProvider>
    </WakfuAPIProvider>
  )
}

export default App
