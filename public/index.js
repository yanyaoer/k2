var touch = {
  _index: 0,
  reboudSpeed: 0.3,
  startTime: Date.now(),
  lastMoveTime: Date.now(),
  endTime: Date.now(),
  status: 'end',
  events: ['touchstart', 'touchend','touchmove','touchcancel'],
  slideTo: function(idx) {
    touch._index += idx;
    var section = [].slice.call(document.querySelectorAll('section'));
    if (touch._index < 0) {
      touch._index = section.length - 1;
    }
    if (touch._index >= section.length) {
      touch._index = 0;
    }
    document.querySelector('section.active').classList.remove('active');
    section[touch._index].classList.add('active');
    document.body.dataset.index = touch._index;
  }
};

var touchHandler = function(event) {
  //console.log(event.type);
  var delta = {};
  switch (event.type) {
    case 'touchstart':
      {
        if (touch.status !== 'end') {
          return;
        }

        if (Date.now() - touch.endTime < touch.reboudSpeed * 1000) {
          return;
        }
        touch.status = 'start';
        touch.startTime = touch.lastMoveTime = Date.now();
        touch.last = event.touches[0];
        touch.start = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
        break;
      }
    case 'touchmove':
      {
        event.preventDefault();
        if (touch.status !== 'start' && touch.status !== 'moving') {
          return;
        }

        if (Date.now() - touch.lastMoveTime < 26) {
          return;
        }

        touch.status = 'moving';
        touch.lastMoveTime = Date.now();
        touch.last = event.touches[0];
        //console.log(touch.start.x, touch.last.clientX);
        break;
      }
    case 'touchend':
    case 'touchcancel':
      {
        if (touch.status !== 'start' && touch.status !== 'moving') {
          return;
        }
        touch.status = 'end';
        touch.endTime = Date.now();
        delta.X = touch.start.x - touch.last.clientX;
        delta.Y = touch.start.y - touch.last.clientY;
        delta.d = (Math.abs(delta.X) > Math.abs(delta.Y)) ? delta.X : delta.Y;
        //console.log(delta.X, touchMoveDirection, '::dir::vertical');
        //console.log(delta.Y, touchMoveDirection, '::dir::horizon');

        if (Math.abs(delta.d) > document.body.clientWidth / 4) {
          var direction = delta.d / Math.abs(delta.d);
          touch.slideTo(direction);
        }
        break;
      }
  }
};


touch.events.forEach(function(eventName) {
  document.addEventListener(eventName, touchHandler, false);
});


var form = document.querySelector('form');
document.addEventListener('click', function(e) {
  var el = e.target;
  if (el.classList.contains('submit')) {
    e.preventDefault();
    var data = new FormData(form);
    var request = new XMLHttpRequest();
    request.open('POST', '/api');
    request.onload = function(){
      if (request.responseText === 'ok') {
        form.parentNode.innerHTML = "<h3>欢迎光临...</h3>";
      }
    };
    request.send(data);
    return false;
  }
}, false);

window.onload = function(){
  document.querySelector('#app').removeAttribute('hide');
}
