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
    console.log('>>> Selected Item', selectedItem);
    this.setState({
      // viewName : selectedItem.itemType,
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

  getDefaultProps : function() {
    return { friction : 2, mass : 1000, touchRatio : 1 };
  },

  componentDidMount : function() {
    this.startPoint = 0;
    this.lastPoint = 0;
    this.currentCoord = 0;
    this.lastCoord = 0;
    this.velocity = 0;
    this.lastTime = Date.now();
    this.inertiaTime = this.lastTime;
    this.configureEvents();
  },

  configureEvents : function() {
    var { uiWheel } = this.refs,
      wheelEl = uiWheel.getDOMNode();
    if ( typeof window.ontouchstart !== 'undefined' ) {
      wheelEl.addEventListener('touchstart', this.onTap);
      wheelEl.addEventListener('touchmove', this.onDrag);
      wheelEl.addEventListener('touchend', this.onRelease);
    }
    wheelEl.addEventListener('mousedown', this.onTap);
    wheelEl.addEventListener('mousemove', this.onDrag);
    wheelEl.addEventListener('mouseup', this.onRelease);
  },

  removeEvents : function() {
    var { uiWheel } = this.refs,
      wheelEl = uiWheel.getDOMNode();
    if ( typeof window.ontouchstart !== 'undefined' ) {
      wheelEl.removeEventListener('touchstart', this.onTap);
      wheelEl.removeEventListener('touchmove', this.onDrag);
      wheelEl.removeEventListener('touchend', this.onRelease);
    }
    wheelEl.removeEventListener('mousedown', this.onTap);
    wheelEl.removeEventListener('mousemove', this.onDrag);
    wheelEl.removeEventListener('mouseup', this.onRelease);
  },

  getPosY : function(e) {
    return (e.targetTouches && (e.targetTouches.length >= 1)) ?
      e.targetTouches[0].clientY : e.clientY;
  },

  calculateVelocity : function(e) {
    var { touchRatio } = this.props,
      time = Date.now(),
      deltaTime = time - this.lastTime,
      vel = this.velocity + ((this.lastCoord / deltaTime) / touchRatio );
    return !isNaN(vel) ? vel : 0;
  },

  onTap : function(e) {
    var y = this.getPosY(e);
    this.autoRotate();
    this.lastCoord = 0;
    this.startPoint = y;
    this.velocity = 0;
    this.rotate(this.currentCoord);
    this.preventDefaults(e);
  },

  onDrag : function(e) {
    this.lastTime = Date.now();
    var y = this.getPosY(e),
      deltaY = y - this.startPoint;
    if ( deltaY > 2 || deltaY < -2 ) {
      this.lastPoint = this.startPoint;
      this.startPoint = y;
      this.lastCoord = deltaY;
      this.currentCoord += deltaY;
      this.rotate(this.currentCoord);
    }
    this.preventDefaults(e);
  },

  onRelease : function(e) {
    this.velocity = this.calculateVelocity(e);
    if ( this.velocity < 10 || this.velocity > -10 ) {
      this.rotate(this.currentCoord);
      this.inertiaTime = null;
      this.removeEvents();
    }
    this.preventDefaults(e);
  },

  rotate : function(coordY) {
    var { itemsLength } = this.props,
      refs = this.refs,
      angle;
    this.angles = [];
    for ( var i=0; i<itemsLength; i++ ) {
      angle = -(coordY/2) + (360/itemsLength) * i;
      refs['wi' + i].getDOMNode().style.transform =
        this.getItem3DStyles(angle).transform;
      this.angles.push(angle);
    }
  },

  autoRotate : function() {
    var { friction, mass, onStop } = this.props;

    this.velocity = !isNaN(this.velocity) ? this.velocity : 0;

    if ( !(this.inertiaTime) ) {
      this.inertiaTime = Date.now();
    }

    else if ( this.velocity != 0 ) {
      var time = Date.now(),
        force = this.velocity * friction,
        acceleration = force / mass,
        deltaTime = time - this.inertiaTime,
        vel = this.velocity - (acceleration * deltaTime);

      vel = !isNaN(vel) ? vel : 0;
      this.velocity = vel;

      var delta = vel * deltaTime;
      this.lastCoord = this.currentCoord;
      this.currentCoord += delta;
      this.inertiaTime = time;
      this.rotate(this.currentCoord);
    }

    this.autoRotation = requestAnimationFrame(this.autoRotate);
    if ( Math.abs(0 - delta) < .01 ) {
      cancelAnimationFrame(this.autoRotation);
      if ( onStop ) onStop(this.angles);
    }
  },

  preventDefaults : function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
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