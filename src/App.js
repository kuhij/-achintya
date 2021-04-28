import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from './login'
import Spaces from './spaces';
import Campaign from './campaign/campaign'
import firebase from "./config";
import 'antd/dist/antd.css';
import './campaign/countdown.css';

import Dashboard from "./campaign/dashboard";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Login />

          </Route>
          <Route exact path="/space/:spaceId">
            <Spaces />
          </Route>
          {/* <Route exact path="/campaign/:spaceId">
            <Campaign />
          </Route> */}

        </Switch>
      </Router>
    </div>
  );
}

export default App;
