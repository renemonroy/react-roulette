var React = require('react/addons'),
  $ = require('jquery'),
  AppStyles = require('./app.scss');

var UITransition = React.addons.CSSTransitionGroup;

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
      viewName : null,
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
      return {
        index : i,
        pos : Math.abs(Math.round(divider) - divider)
      };
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

  onWheelStops : function(positions) {
    var selectedItem = this.getSelectedItem(positions);
    console.log('>>> Selected Item', selectedItem);
    this.setState({
      viewName : selectedItem.itemType,
      selectedItem : selectedItem
    });
  },

  onTryingAgain : function() {
    this.setState({ viewName : 'wheel' });
  },

  renderItem : function(index) {
    var item = this.state.rouletteItems[index],
      itemContent = null;
    if ( index == 0 || index == 8 ) {
      itemContent = (
        <div className="item-content item-again">
          <span>{item.name}</span>
        </div>
      );
    } else if ( index == 4 || index == 12) {
      itemContent = (
        <div className="item-content item-nada">
          <span>Nada</span>
        </div>
      );
    } else {
      itemContent = (
        <div className="item-content item-fan">
          <span>{item.value}</span>
        </div>
      );
    }
    return (
      <div className="roulette-item" key={'ri' + index}>
        {itemContent}
      </div>
    );
  },

  renderView : function(viewName) {
    var { rouletteItems, selectedItem } = this.state;
    switch ( viewName ) {
      case 'wheel' :
        return rouletteItems.length > 0 ?
           <WheelView
             item={this.renderItem}
             itemsLength={rouletteItems.length}
             onStop={this.onWheelStops}
             key="wheelview"
           /> : null;
        break;
      case 'fan' :
        var fan = { jumps : selectedItem.value, username : selectedItem.name };
        return (
          <FanView
            jumps={selectedItem.value}
            fan={fan}
            key="fanview"
          />
        );
        break;
      case 'nada' :
        return <NadaView key="nadaview" />;
        break;
      case 'again' :
        return (
          <AgainView
            item={selectedItem}
            onTryAgain={this.onTryingAgain}
            key="againview"
          />
        );
        break;
      default :
        return null;
    }
  },

  render : function() {
    var { viewName } = this.state;
    return (
      <div className="superfan-roulette">
        <UITransition transitionName="fadeviews" component="div">
          {this.renderView(viewName)}
        </UITransition>
      </div>
    );
  }

});


/* FAN VIEW ----------------------------------------------------------------- */
var FanView = React.createClass({

  displayName : 'FanView',

  getDefaultProps : function() {
    return { user : null, fan : null };
  },

  render : function() {
    var { user, fan } = this.props;
    return (
      <div className="fan-view fadeviews">
        <h2>Getting Jumpy</h2>
        <p>You and {fan.username}<br/>
          both just got a<br/>
          <strong>+{fan.jumps} spot jump</strong>. Boom!</p>
      </div>
    );
  }

});


/* NADA VIEW ---------------------------------------------------------------- */
var NadaView = React.createClass({

  displayName : 'NadaView',

  render : function() {
    return (
      <div className="nada-view fadeviews">
        <h2>Sorry</h2>
        <p>You didn't earn a jump.<br/>Better luck next time!</p>
      </div>
    );
  }

});


/* AGAIN VIEW --------------------------------------------------------------- */
var AgainView = React.createClass({

  displayName : 'AgainView',

  spinAgain : function(e) {
    var { onTryAgain } = this.props;
    e.preventDefault();
    if ( onTryAgain ) onTryAgain();
  },

  render : function() {
    return (
      <div className="again-view fadeviews">
        <h2>Free Spin!</h2>
        <p>You just won another chance at the wheel. Go ahead,
        give it a spin!</p>
        <button type="button" onClick={this.spinAgain}>Spin Again</button>
      </div>
    );
  }

});


/* WHEEL VIEW --------------------------------------------------------------- */
// - It's only a wheel that rotates, nothing less and nothing more.
// - Does not render a list randomly, that's on charge of owner.
// - Creates a wheel depending on the number of fans size inside.
// - Only accepts 16 elements for now, mainly because of CSS translations.
// - It returns the 16 new angles of each one, owner manages its usage.

var WheelView = React.createClass({

  displayName : 'WheelView',

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

  componentWillUnmount : function() {
    if ( this.autoRotation ) cancelAnimationFrame(this.autoRotation);
    this.removeEvents();
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
    if ( Math.abs(0 - delta) < .02 ) {
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
      <div className="wheel-view fadeviews">
        <p>Which MegaFan's got the highest jump?</p>
        <div className="wheel-wrapper">
          <div className="ui-wheel" ref="uiWheel">
            {items}
          </div>
          <div className="ui-wheel-refs">
            <div className="ref-left-arrow"><div /></div>
            <div className="ref-background"></div>
            <div className="ref-right-arrow"><div /></div>
          </div>
        </div>
      </div>
    );
  }

});


document.addEventListener('DOMContentLoaded', function(e) {
  React.render(<MegaFanRoulette />, document.body);
});