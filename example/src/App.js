import React from "react";
import { Component } from "react";
import { Admin, Resource, ShowGuesser, ListGuesser } from "react-admin";
import warthogProvider from "ra-data-warthog";
import { UsersList, UserCreate, UserEdit } from "./Users";

class App extends Component {
  constructor() {
    super();
    this.state = { dataProvider: null };
  }
  componentDidMount() {
    warthogProvider({
      clientOptions: { uri: "https://warthog-starter.herokuapp.com/graphql" },
    }).then((dataProvider) => this.setState({ dataProvider }));
  }

  render() {
    const { dataProvider } = this.state;

    if (!dataProvider) {
      return <div>Loading</div>;
    }

    return (
      <Admin dataProvider={dataProvider}>
        <Resource name="FeatureFlag" list={ListGuesser} show={ShowGuesser} />
      </Admin>
    );
  }
}

export default App;
