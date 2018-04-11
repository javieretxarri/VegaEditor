import React, { Component } from 'react';
import Vega from 'react-vega';
import _ from 'lodash';
import { JsonTree } from 'react-editable-json-tree';

import './App.css';

const GRAPH_SPEC = {
                "$schema": "https://vega.github.io/schema/vega/v3.json",
                "width": 400,
                "height": 200,
                "padding": 5,

                "data": [
                  {
                    "name": "table",
                    "values": [
                      {"category": "A", "amount": 28},
                      {"category": "B", "amount": 55},
                      {"category": "C", "amount": 43},
                      {"category": "D", "amount": 91},
                      {"category": "E", "amount": 81},
                      {"category": "F", "amount": 53},
                      {"category": "G", "amount": 19},
                      {"category": "H", "amount": 87}
                    ]
                  }
                ],

                "signals": [
                  {
                    "name": "tooltip",
                    "value": {},
                    "on": [
                      {"events": "rect:mouseover", "update": "datum"},
                      {"events": "rect:mouseout",  "update": "{}"}
                    ]
                  }
                ],

                "scales": [
                  {
                    "name": "xscale",
                    "type": "band",
                    "domain": {"data": "table", "field": "category"},
                    "range": "width",
                    "padding": 0.05,
                    "round": true
                  },
                  {
                    "name": "yscale",
                    "domain": {"data": "table", "field": "amount"},
                    "nice": true,
                    "range": "height"
                  }
                ],

                "axes": [
                  { "orient": "bottom", "scale": "xscale" },
                  { "orient": "left", "scale": "yscale" }
                ],

                "marks": [
                  {
                    "type": "rect",
                    "from": {"data":"table"},
                    "encode": {
                      "enter": {
                        "x": {"scale": "xscale", "field": "category"},
                        "width": {"scale": "xscale", "band": 1},
                        "y": {"scale": "yscale", "field": "amount"},
                        "y2": {"scale": "yscale", "value": 0}
                      },
                      "update": {
                        "fill": {"value": "steelblue"}
                      },
                      "hover": {
                        "fill": {"value": "red"}
                      }
                    }
                  },
                  {
                    "type": "text",
                    "encode": {
                      "enter": {
                        "align": {"value": "center"},
                        "baseline": {"value": "bottom"},
                        "fill": {"value": "#333"}
                      },
                      "update": {
                        "x": {"scale": "xscale", "signal": "tooltip.category", "band": 0.5},
                        "y": {"scale": "yscale", "signal": "tooltip.amount", "offset": -2},
                        "text": {"signal": "tooltip.amount"},
                        "fillOpacity": [
                          {"test": "datum === tooltip", "value": 0},
                          {"value": 1}
                        ]
                      }
                    }
                  }
                ]
              };

const RIGHT_MARGIN = 200;
const SPEC_SPACE = 500;

class App extends Component {

  constructor(props) {
    super(props);
    this.resize = this.resize.bind(this);
    this.toggleRichMode = this.toggleRichMode.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
          width: null,
          richEditing: false,
          spec: GRAPH_SPEC,
          error: null
      };
  }

  componentDidMount(){
   
    window.addEventListener('resize',  this.resize_debounced);

    this.resize();
  }

  componentWillMount(){

    this.resize_debounced = _.debounce(this.resize, 800);
  }

  componentWillUnmount() {

      window.removeEventListener('resize', this.resize_debounced);
  }

  resize() {

    var width = window.innerWidth;
    this.setState({
      width: width
    });
  }

  toggleRichMode() {
    if (this.state.richEditing) {
      this.setState({
        richEditing: false
      });
    } else {
      this.setState({
        richEditing: true
      });
    }
  }

  onChange(data) {
    try {
      var spec = data;
      if (!this.state.richEditing){
        spec = JSON.parse(data, null, 2);
      }else {
        spec = JSON.parse(JSON.stringify(data, null, 2));
      }
      this.setState({
        spec: spec,
        error: null
      });
    }catch(e) {
      console.error(e);
      this.setState({
        error: e.message
      });
    }
  }


  render() {

    var spec = this.state.spec;
    spec.width = this.state.width - SPEC_SPACE - RIGHT_MARGIN;


    return (
      <div className='screen'>
        <div className='specs'>
          { this.state.error != null ?
              <div className='error' >{this.state.error}</div>
            :
              null
          }
          <div className='btnView'>
            <button onClick={this.toggleRichMode}>{this.state.richEditing ? 'Plain mode' : 'Rich mode'}</button>
          </div>
          { this.state.richEditing ?
            <div className='codeView'>
              <JsonTree data={this.state.spec} isCollapsed={(keyPath, deep) => (deep === 3)} onFullyUpdate={this.onChange}/>
            </div>
          :
            <textarea className='codeView' onChange={(e) => this.onChange(e.target.value)}>{JSON.stringify(this.state.spec, null, 2)}</textarea>
          }
        </div>
        <div className='graph'>
          <Vega key={spec.width} spec={spec} renderer="svg"/> 
        </div>
      </div>
    );
  }
}

export default App;
