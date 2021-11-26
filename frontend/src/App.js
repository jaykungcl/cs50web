import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import { useAuthContext } from './hooks/useAuthContext';
import Create from './pages/create/Create';
import Favorite from './pages/favorite/Favorite';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Recipe from './pages/recipe/Recipe';
import Signup from './pages/signup/Signup';
import User from './pages/user/User';

function App() {
  const { user, authIsReady } = useAuthContext()

  return (
    <div className="App">
      {authIsReady && (
        <BrowserRouter>
        <Navbar />
          <div className="container">
            <Switch>
              <Route exact path="/">
                {user && <Home />}
                {!user && <Redirect to="/login" />}
              </Route>
              <Route path="/create">
                {user && <Create />}
                {!user && <Redirect to="/" />}
              </Route>
              <Route path="/recipes/:id">
                {user && <Recipe />}
                {!user && <Redirect to="/" />}
              </Route>
              <Route path="/signup">
                {!user && <Signup />}
                {user && <Redirect to="/" />}
              </Route>
              <Route path="/login">
                {!user && <Login />}
                {user && <Redirect to="/" />}
              </Route>
              <Route path="/user/:id">
                {user && <User />}
                {!user && <Redirect to="/" />}
              </Route>
              <Route path="/favorite">
                {user && <Favorite />}
                {!user && <Redirect to="/" />}
              </Route>
            </Switch>
            
          </div>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
