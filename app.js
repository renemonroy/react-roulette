var React = require('react'),
  $ = require('jquery'),
  AppStyles = require('./app.scss');

var rouletteData = [
  { name : 'Swipe to Spin', itemType : 'again' },
  { name : '1', value : 30, itemType : 'fan' },
  { name : '2', value : 10, itemType : 'fan' },
  { name : '3', value : 20, itemType : 'fan' },
  { name : 'Nada', itemType : 'nada' },
  { name : '4', value : 10, itemType : 'fan' },
  { name : '5', value : 5, itemType : 'fan' },
  { name : '6', value : 30, itemType : 'fan' },
  { name : 'Spin Again', itemType : 'again' },
  { name : '7', value : 10, itemType : 'fan' },
  { name : '8', value : 5, itemType : 'fan' },
  { name : '9', value : 30, itemType : 'fan' },
  { name : 'Nada', itemType : 'nada' },
  { name : '10', value : 20, itemType : 'fan' },
  { name : '11', value : 10, itemType : 'fan' },
  { name : '12', value : 5, itemType : 'fan' }
];

/* MEGA FAN ROULETTE COMPONENT ---------------------------------------------- */
// - This component only manages data and children components.
// - Passes an array list of random fans (objects) to UIWheel.
// - Renders an item on the wheel depending the index.

var MegaFanRoulette = React.createClass({

  displayName : 'MegaFanRoulette',

  getInitialState : function() {
    return {
      rouletteItems : [],
      viewName : 'wheel',
      selectedItem : null
    };
  },

  componentDidMount : function() {
    this.setState({
      rouletteItems : rouletteData,
      viewName : 'wheel'
    });
  },

  getSelectedItem : function(positions) {
    var list = positions.map( function(pos, i) {
      var divider = pos / 360;
      return { index : i, pos : Math.abs(Math.round(divider) - divider) };
    });
    var selected = list[0].pos,
      listSize = list.length,
      index = 0;
    for (var i=1; i<listSize; i++) {
      if ( list[i].pos < selected ) {
        selected = list[i].pos;
        index = i;
      }
    }
    return this.state.rouletteItems[index];
  },

  onWheelStop : function(positions) {
    var selectedItem = this.getSelectedItem(positions);
    this.setState({
      viewName : selectedItem.itemType,
      selectedItem : selectedItem
    });
  },

  renderItem : function(index) {
    var item = this.state.rouletteItems[index],
      itemName = item.name;
    return (
      <div className="roulette-item" key={'ri' + index}>
        <span>{itemName}</span>
      </div>
    );
  },

  renderView : function(viewName) {
    var { rouletteItems, selectedItem } = this.state;
    switch ( viewName ) {
      case 'wheel' :
        return rouletteItems.length > 0 ?
           <UIWheel
             item={this.renderItem}
             itemsLength={rouletteItems.length}
             onStop={this.onWheelStop}
           /> : null;
        break;
      case 'fan' :
        return <FanView item={selectedItem} />;
        break;
      case 'nada' :
        return <NadaView />;
        break;
      case 'again' :
        return <AgainView item={selectedItem} />;
        break;
    }
  },

  render : function() {
    var { viewName } = this.state;
    return (
      <div className="app">
        <h3>Roulette Wheel</h3>
        {this.renderView(viewName)}
      </div>
    );
  }

});


/* FAN VIEW ----------------------------------------------------------------- */
var FanView = React.createClass({
  render : function() {
    return (
      <div className="fan-view">
        <p>Getting Jumpy</p>
      </div>
    );
  }
});


/* NADA VIEW ---------------------------------------------------------------- */
var NadaView = React.createClass({
  render : function() {
    return (
      <div className="nada-view">
        <p>Sorry</p>
      </div>
    );
  }
});


/* AGAIN VIEW --------------------------------------------------------------- */
var AgainView = React.createClass({

  spinAgain : function(e) {
    e.preventDefault();
    console.log('One more chance!');
  },

  render : function() {
    return (
      <div className="again-view">
        <p>Spin Again</p>
        <button type="button" onClick={this.spinAgain}>Sping Again</button>
      </div>
    );
  }

});


/* UI WHEEL COMPONENT ------------------------------------------------------- */
// - Does not render a list randomly, that's on charge of owner.
// - Creates a wheel depending on the number of fans size inside.

var UIWheel = React.createClass({

  displayName : 'UIWheel',

  componentDidMount : function() {
    this.currentY = 0;
    this.configureEvents();
  },

  configureEvents : function() {
    var { uiWheel } = this.refs,
      wheelEl = uiWheel.getDOMNode();
    if ( typeof window.ontouchstart !== 'undefined' ) {
      wheelEl.addEventListener('touchstart', this.onTrap);
      wheelEl.addEventListener('touchmove', this.onDrag);
      wheelEl.addEventListener('touchend', this.onRelease);
    }
    wheelEl.addEventListener('mousedown', this.onTrap);
    wheelEl.addEventListener('mousemove', this.onDrag);
    wheelEl.addEventListener('mouseup', this.onRelease);
  },

  onTrap : function(e) {
    this.pressed = true;
    this.initialY = this.getPosY(e);
    this.preventDefaults(e);
  },

  onDrag : function(e) {
    var y = null, deltaY = null;
    if ( this.pressed ) {
      y = this.getPosY(e);
      deltaY = y - this.initialY;
      if ( deltaY > 2 || deltaY < -2 ) {
        this.initialY = y;
        this.currentY += deltaY;
        this.rotate(this.currentY);
      }
    }
    this.preventDefaults(e);
  },

  onRelease : function(e) {
    this.pressed = false;
    this.preventDefaults(e);
    this.stopRotation();
  },

  rotate : function(posY) {
    var { itemsLength } = this.props,
      angle = null,
      refs = this.refs;
    this.angles = [];
    for ( var i=0; i<itemsLength; i++ ) {
      angle = -(posY/2) + (360/itemsLength)*i;
      refs['wi' + i].getDOMNode().style.transform =
        this.getItem3DStyles(angle).transform;
      this.angles.push(angle);
    }
  },

  stopRotation : function() {
    var { onStop } = this.props;
    if ( onStop ) onStop(this.angles);
  },

  preventDefaults : function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  },

  getPosY : function(e) {
    return (e.targetTouches && (e.targetTouches.length >= 1)) ?
      e.targetTouches[0].clientY : e.clientY;
  },

  getItem3DStyles : function(angle) {
    var transform = 'perspective(500px) ' +
      'rotate3d(1, 0, 0, ' + angle + 'deg) ' +
      'translate3d(0, 0, 158px)';
    return {
      transform : transform
    }
  },

  getItems : function() {
    var uiWheel = this,
      { item, itemsLength } = this.props,
      angle = 360/itemsLength,
      items = [], styles = null, itemKey = null;
    for ( var i=0; i<itemsLength; i++ ) {
      styles = this.getItem3DStyles( angle*i );
      itemKey = 'wi' + i;
      items.push(
        <div
          className="ui-wheel-item"
          style={styles}
          ref={itemKey}
          key={itemKey}>
          {item(i)}
        </div>
      );
    }
    return items;
  },

  render : function() {
    var items = this.getItems();
    return (
      <div className="ui-wheel-wrapper">
        <div className="ui-wheel" ref="uiWheel">
          {items}
        </div>
      </div>
    );
  }

});


document.addEventListener('DOMContentLoaded', function(e) {
  React.render(<MegaFanRoulette />, document.body);
});