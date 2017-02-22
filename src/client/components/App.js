import React from 'react';
import styles from './App.css';
import { connect } from 'react-redux';

class App extends React.Component {
  
  render() {
    const { count, dispatch } = this.props;
    return (
      <div>
        <h1>Demosss</h1>
        <p>{count.num}</p>
        <button
          className={styles.increment}
          onClick={() => dispatch({type: "INC"})}
        >
          +1
        </button>
        <p>
          <a href="/whoami">Server-only route</a>
        </p>
      </div>
    );
  }

}

const select = (store) => {
  return {
    count: store
	};
} 

export default connect(select)(App);
