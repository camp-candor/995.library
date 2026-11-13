import { HexagonModel } from '../hexagon.model.js';
import HexagonBit from '../fce/hexagon.bit.js';
import HexBit from '../fce/hex.bit.js';
import State from '../../99.core/state.js';
import * as Honeycomb from 'honeycomb-grid';
import * as PIXI from 'pixi.js';

//import * as HEXAGON from '../../val/hexagon.js';
import * as DIRECTION from '../../val/direction.js';

import * as ActCol from '../../97.collect.unit/collect.action.js';
import * as ActFce from '../../02.surface.unit/surface.action.js';
import * as ActCan from '../../03.container.unit/container.action.js';
import * as ActGph from '../../04.graphic.unit/graphic.action.js';
import * as ActTxt from '../../05.text.unit/text.action.js';
import * as ActSpr from '../../06.sprite.unit/sprite.action.js';
import * as ActHex from '../../07.hexagon.unit/hexagon.action.js';
import * as ActVsg from '../../21.visage.unit/visage.action.js';

var bit, val, idx, dex, lst, dat;

///https://www.npmjs.com/package/honeycomb-grid/v/3.1.8

export const initHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  return cpy;
};

export const updateHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  bit = await ste.hunt(ActHex.READ_HEXAGON, { idx: bal.idx });
  var dat: HexBit = bit.hexBit.dat;
  var frm = dat.frm;

  // const Hex = Honeycomb.extendHex({
  // size: 30, // sets the radius of the hex
  // /orientation: 'flat' // or 'pointy'
  //});

  console.log('form:' + frm);

  // 1. create a Grid factory that uses the Hex factory:
  //const Grid = Honeycomb.defineGrid(Hex);

  // 2. create a rectangular grid:
  //const grid = Grid.rectangle({ width: 4, height: 4 });

  switch (frm) {
    case 'Focus':
      await ste.hunt(ActHex.FOCUS_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Hexmap':
      await ste.hunt(ActHex.HEXMAP_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Parallelogram':
      await ste.hunt(ActHex.PARALLELOGRAM_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Ring':
      await ste.hunt(ActHex.RING_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Hexagon':
      await ste.hunt(ActHex.HEXAGON_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Rectangle':
      await ste.hunt(ActHex.RECTANGLE_HEXAGON, { dat, bit: bal.dat });
      break;

    case 'Triangle':
      await ste.hunt(ActHex.TRIANGLE_HEXAGON, { dat, bit: bal.dat });
      break;
  }

  bit = await ste.hunt(ActGph.READ_GRAPHIC, { idx: dat.gph });
  var graphic: PIXI.Graphics = bit.gphBit.dat.bit;

  //var hexmap = bal.dat.bit

  graphic.clear();

  //graphic.rect(0, 0, 200, 100)
  graphic.fill(0xffffff);

  var pct = 1;
  var scl = 2;

  graphic.lineStyle(3, 0x0000000, 10);
  const grid: Honeycomb.Grid = cpy.grid;

  grid.forEach((hex) => {
    const point = hex.toPoint();
    const corners = hex.corners().map((corner) => corner.add(point));
    const [firstCorner, ...otherCorners] = corners;

    graphic.moveTo(firstCorner.x * scl, firstCorner.y * scl * pct);
    otherCorners.forEach(({ x, y }) => graphic.lineTo(x * scl, y * scl * pct));
    graphic.lineTo(firstCorner.x * scl, firstCorner.y * scl * pct);

    graphic.stroke({ color: 0xff0000, pixelLine: true });
  });

  bal.slv({ hexBit: { idx: 'update-hexagon', dat: dat } });
  return cpy;
};

export const focusHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  return cpy;
};

export const hexmapHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  //var graphic = bal.dat.bit
  var hexmap = bal.bit;

  bit = await ste.hunt(ActGph.READ_GRAPHIC, { idx: bal.dat.src });
  var graphic: PIXI.Graphics = bit.gphBit.dat.bit;

  //var hexmap = bal.dat.bit

  graphic.clear();

  //graphic.rect(0, 0, 200, 100)
  //graphic.fill(0xffffff);

  //if (bal.slv != null)

  const Hex = Honeycomb.extendHex({
    size: Number(33), // default: 1
    orientation: 'pointy', // default: 'pointy'
  });

  const Grid: Honeycomb.GridFactory<any> = Honeycomb.defineGrid(Hex);
  const grid: Honeycomb.Grid = Grid(hexmap);

  var pct = 0.25;
  var scl = 640;

  //graphic.lineStyle(3, 0x0000000, 10);
  grid;

  grid.forEach((hex) => {
    const point = hex.toPoint();
    const corners = hex.corners().map((corner) => corner.add(point));
    const [firstCorner, ...otherCorners] = corners;

    graphic.moveTo(firstCorner.x * scl, firstCorner.y * scl * pct);
    otherCorners.forEach(({ x, y }) => graphic.lineTo(x * scl, y * scl * pct));
    graphic.lineTo(firstCorner.x * scl, firstCorner.y * scl * pct);

    graphic.stroke({ color: 0xff0000, pixelLine: true });
  });

  bal.slv({ hexBit: { idx: 'hexmap-hexagon', dat: hexmap } });

  return cpy;
};

export const readHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  var slv = bal.slv;
  if (bal.idx == null) bal.idx = 'hex00';
  bit = await ste.hunt(ActCol.READ_COLLECT, { idx: bal.idx, src: bal.src, bit: ActHex.CREATE_HEXAGON });
  if (slv != null) slv({ hexBit: { idx: 'read-hexagon', dat: bit.clcBit.dat } });

  return cpy;
};

export const writeHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  bit = await ste.hunt(ActCol.WRITE_COLLECT, { idx: bal.idx, src: bal.src, dat: bal.dat, bit: ActHex.CREATE_HEXAGON });

  ste.hunt(ActHex.UPDATE_HEXAGON, { idx: bal.idx, dat: bal.dat.dat });

  if (bal.slv != null) bal.slv({ hexBit: { idx: 'write-hexagon', dat: bit.clcBit.dat } });

  return cpy;
};

export const removeHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  bit = await ste.hunt(ActCol.REMOVE_COLLECT, { idx: bal.idx, src: bal.src, dat: bal.dat, bit: ActHex.DELETE_HEXAGON });
  if (bal.slv != null) bal.slv({ hexBit: { idx: 'replace-hexagon', dat: bit.clcBit } });

  return cpy;
};

export const createHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  var dat: HexBit = { idx: bal.idx, src: bal.src };

  for (var key in bal.dat) {
    if (key == 'dat') continue;
    dat[key] = bal.dat[key];
  }

  var hexagon = bal.dat.dat;
  if (hexagon != null) {
    dat.frm = hexagon.typ;
    dat.gph = hexagon.gph;
  }

  if (dat.clr == null) dat.clr = 0x0000000;
  if (dat.lne == null) dat.lne = 2;
  if (dat.wpe == null) dat.wpe = true;
  if (dat.a == null) dat.a = 1;
  if (dat.pct == null) dat.pct = 1;
  if (dat.sze == null) dat.sze = 3;

  if (dat.frm == null) dat.frm = 'Rectangle';

  //if (bal.src != null) bit = await ste.hunt(ActVsg.NEST_VISAGE, { src: bal.src, dat })

  bal.slv({ usrBit: { idx: 'create-hexagon', dat: dat } });
  return cpy;
};

export const deleteHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  debugger;
  return cpy;
};

export const rectangleHexagon = async (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  const Hex = Honeycomb.extendHex({
    size: Number(33), // default: 1
    orientation: 'pointy', // default: 'pointy'
  });

  const Grid: Honeycomb.GridFactory<any> = Honeycomb.defineGrid(Hex);
  const grid: Honeycomb.Grid = Grid.rectangle({ width: 4, height: 4 });

  cpy.grid = grid;
  bal.slv({ hexBit: { idx: 'rectangle-hexagon', dat: dat } });
  return cpy;
};

export const parallelogramHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  const Hex = Honeycomb.extendHex({
    size: Number(33), // default: 1
    orientation: 'pointy', // default: 'pointy'
  });

  const Grid: Honeycomb.GridFactory<any> = Honeycomb.defineGrid(Hex);
  const grid: Honeycomb.Grid = Grid.parallelogram({
    width: 10, // value:		number (with in hexes)
    height: 10, // value:		number (height in hexes)
    start: [0, 0], // value: 	any point
    // default:	[0, 0]
    direction: 1, // value:		1, 3 or 5
    // default:	1
    onCreate: null,
  });

  cpy.grid = grid;
  bal.slv({ hexBit: { idx: 'parallelogram-hexagon', dat: dat } });

  return cpy;
};

export const ringHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  debugger;
  return cpy;
};

export const hexagonHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  const Hex = Honeycomb.extendHex({
    size: Number(33), // default: 1
    orientation: 'pointy', // default: 'pointy'
  });

  const Grid: Honeycomb.GridFactory<any> = Honeycomb.defineGrid(Hex);
  const grid: Honeycomb.Grid = Grid.hexagon({
    radius: 5, // value:		number (excluding center hex)
    center: [5, 5], // value: 	any point
    // default:	[0, 0]
    onCreate: null,
  });

  cpy.grid = grid;
  bal.slv({ hexBit: { idx: 'hexagon-hexagon', dat: dat } });

  return cpy;
};

export const triangleHexagon = (cpy: HexagonModel, bal: HexagonBit, ste: State) => {
  const Hex = Honeycomb.extendHex({
    size: Number(33), // default: 1
    orientation: 'pointy', // default: 'pointy'
  });

  const Grid: Honeycomb.GridFactory<any> = Honeycomb.defineGrid(Hex);
  const grid: Honeycomb.Grid = Grid.triangle({
    size: 10, // value:		number (side in hexes)
    start: [0, 0], // value: 	any point
    // default:	[0, 0]
    direction: 1, // value:		1 or 5
    // default:	1
    onCreate: null,
  });

  cpy.grid = grid;
  bal.slv({ hexBit: { idx: 'parallelogram-hexagon', dat: dat } });
  return cpy;
};
