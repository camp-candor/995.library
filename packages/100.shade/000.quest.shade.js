window.SHADE = require('./dist/hunt');

window.MQTT = require('async-mqtt');

window.SHADE.ActShd = require('./dist/00.shade.unit/shade.action');
window.SHADE.ActCan = require('./dist/03.container.unit/container.action');
window.SHADE.ActGph = require('./dist/04.graphic.unit/graphic.action');
window.SHADE.ActTxt = require('./dist/05.text.unit/text.action');
window.SHADE.ActSpr = require('./dist/06.sprite.unit/sprite.action');
window.SHADE.ActHex = require('./dist/07.hexagon.unit/hexagon.action');
window.SHADE.ActFcg = require('./dist/08.focigon.unit/focigon.action');
window.SHADE.ActLop = require('./dist/09.loop.unit/loop.action');
window.SHADE.ActTun = require('./dist/10.toon.unit/toon.action');
window.SHADE.ActVid = require('./dist/11.video.unit/video.action');
window.SHADE.ActFme = require('./dist/12.frame.unit/frame.action');
