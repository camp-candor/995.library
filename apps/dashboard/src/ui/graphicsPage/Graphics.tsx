import { Assets, Graphics } from 'pixi.js';
import { Texture, Sprite, CanvasSource } from 'pixi.js';
import * as PIXI from 'pixi.js';

const Map = () => {
  setTimeout(async () => {
    const WRITE_SURFACE = '[Write action] Write Surface';
    var bit = await window['SHADE'](WRITE_SURFACE, {
      idx: 'surface00',
      src: 'surface00',
      dat: { w: 550, h: 550 },
    });

    var stage = bit.fceBit.dat.bit.stage;

    const WRITE_GRAPHIC = '[Write action] Write Graphic';
    var graphic = await window['SHADE'](WRITE_GRAPHIC, { idx: 'graphic00', dat: { w: 1500, h: 500, x: 100, y: 100 } });
    graphic = graphic.gphBit.dat.bit;

    graphic
      .rect(3, 600, 1457, 300) // x, y, width, height for the rectangle
      .fill({ color: 0x00ff00 }) // Fill with red
      .stroke({ width: 2, color: 0x000000 }); // Stroke with black

    graphic.alpha = 0.8;
    stage.addChild(graphic);
  }, 222);

  //pay the ghost
  //the desire to compile lifes purpose but they forgotten it; but they have this need,
  //kidnapp children

  return (
    <div className="app-container">
      <div id="surface00"> </div>
    </div>
  );
};

export default Map;
