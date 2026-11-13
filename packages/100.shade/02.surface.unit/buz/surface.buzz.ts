import type { SurfaceModel } from '../surface.model.js';
import type SurfaceBit from '../fce/surface.bit.js';
import type State from '../../99.core/state.js';
import type StageBit from '../fce/stage.bit.js';

import { Application, Assets, Container, Sprite } from 'pixi.js';

import * as ActCol from '../../97.collect.unit/collect.action.js';
import * as ActFce from '../../02.surface.unit/surface.action.js';
import * as ActCan from '../../03.container.unit/container.action.js';
import * as ActGph from '../../04.graphic.unit/graphic.action.js';
import * as ActTxt from '../../05.text.unit/text.action.js';
import * as ActSpr from '../../06.sprite.unit/sprite.action.js';

let bit, val, idx, dex, lst, dat;

const testing = false;

export const initSurface = (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  return cpy;
};

// Add VERSION to your top pixi.js imports if you want to log it:
// import { Application, Assets, Container, Sprite, VERSION } from 'pixi.js';

export const createSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  if (bal.dat == null) bal.dat = {};
  if (bal.idx != null) bal.dat.src = bal.idx;
  if (bal.dat.src == null) bal.dat.src = 'indexCanvas';

  const dat: StageBit = { idx: bal.idx, src: bal.dat.src, bit: null };

  // 1. Direct Local DOM Target (Since we are already inside the iframe context)
  const el: HTMLElement | null = document.getElementById(dat.src);
  if (!el) {
    console.error(`❌ [ENGINE] Target container element #${dat.src} not found in local iframe DOM layout.`);
    return cpy;
  }

  // 2. Create the canvas inside the current document context
  const iframeCanvas = document.createElement('canvas');
  el.appendChild(iframeCanvas);

  console.log('🏁 [ENGINE] Local canvas element mounted. Instantiating Pixi Application...');

  // 3. Initialize PixiJS Application
  dat.bit = new Application();
  const app = dat.bit;

  var width = 1400;
  var height = 1873;
  if (bal.dat.w != null) width = bal.dat.w;
  if (bal.dat.h != null) height = bal.dat.h;

  try {
    // Pass options matching PixiJS v8 architecture
    await app.init({
      background: '#ffff00',
      width,
      height,
      canvas: iframeCanvas,
    });

    console.log('✅ [ENGINE] PixiJS context successfully initialized on canvas layer.');

    // Crucial for pointer events (clicks/touches) to resolve correctly inside sandbox constraints
    if (app.renderer && app.renderer.events) {
      app.renderer.events.setTargetElement(iframeCanvas);
    }
  } catch (initError) {
    console.error('💥 [ENGINE] PixiJS Application init failed critically:', initError);
    return cpy;
  }

  bal.slv({ fceBit: { idx: 'create-surface', dat: { bit: app } } });
  return cpy;
};
export const updateSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  const idx = bal.idx;

  bit = await ste.hunt(ActFce.READ_SURFACE, { idx: bal.idx });
  dat = bit.fceBit.dat;

  const app = dat.bit;

  if (app == null) return bal.slv({ fceBit: { idx: 'error-update-surface' } });

  //app.renderer.resize(dat.width, dat.height);

  return cpy;
};

export const readSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  const slv = bal.slv;
  if (bal.idx == null) bal.idx = 'fce00';
  bit = await ste.hunt(ActCol.READ_COLLECT, { idx: bal.idx, bit: ActFce.CREATE_SURFACE });
  if (slv != null) slv({ fceBit: { idx: 'read-surface', dat: bit.clcBit.dat } });
  return cpy;
};
export const writeSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  bit = await ste.hunt(ActCol.WRITE_COLLECT, { idx: bal.idx, dat: bal.dat, bit: ActFce.CREATE_SURFACE });
  ste.hunt(ActFce.UPDATE_SURFACE, { idx: bal.idx });

  if (bal.slv != null) bal.slv({ fceBit: { idx: 'write-surface', dat: bit.clcBit.dat } });

  return cpy;
};

export const removeSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  if (typeof window != 'object') return bal.slv({ fceBit: { idx: 'error-create-visage', dat: {} } });

  //gotcha-- making sure that the src is present on the collect bale once caused a tremendous issue
  bit = await ste.hunt(ActCol.REMOVE_COLLECT, { idx: bal.idx, src: bal.src, dat: bal.dat, bit: ActFce.DELETE_SURFACE });

  if (bal.slv != null) bal.slv({ fceBit: { idx: 'remove-surface', dat: bit.clcBit } });

  return cpy;
};

export const deleteSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  bit = await ste.hunt(ActFce.READ_SURFACE, { idx: bal.idx });
  dat = bit.fceBit.dat;

  const app = dat.bit;
  app.destroy();

  if (bal.slv != null) return bal.slv({ fceBit: { idx: 'delete-surface', dat } });

  return cpy;
};

export const dimensionSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  const idx = bal.idx;
  bit = await ste.hunt(ActFce.READ_SURFACE, { idx: bal.idx });

  if (bal.slv != null) return bal.slv({ fceBit: { idx: 'dimension-surface', dat: bal.dat } });

  return cpy;
};

export const extractSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  const idx = bal.idx;
  bit = await ste.hunt(ActFce.READ_SURFACE, { idx });

  dat = bit.fceBit.dat;

  const app = dat.bit;

  app.renderer.extract.download({ target: app.stage, filename: bal.src + '.png' });

  //const canvas = app.renderer.plugins.extract.canvas();
  //const context = canvas.getContext('2d');
  //const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

  //if (bal.slv != null) return bal.slv({ fceBit: { idx: 'extract-surface', dat: imgData } });
  return bal.slv({ fceBit: { idx: 'extract-surface', src: {} } });

  return cpy;
};

export const listSurface = async (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  dat = null;

  bit = await ste.hunt(ActCol.FETCH_COLLECT, { val: 0, bit: ActFce.CREATE_SURFACE });

  if (bit.clcBit.dat == null) lst = [];
  else dat = bit.clcBit.dat;

  dat;

  if (dat != null) {
    lst = [];

    dat.bitList.forEach((a) => {
      lst.push(a.idx);
    });
  }

  lst;

  //process.chdir("../002.space")

  //src = cpy.hexmapLoc
  //bit = await ste.bus(ActDsk.LIST_DISK, { idx: null, src })

  //lst = bit.dskBit.lst

  //if (bal.idx != null) process.chdir(bal.idx)

  //var dex = lst.length()

  bal.slv({ fceBit: { idx: 'list-surface', lst } });

  return cpy;
};

export const testSurface = (cpy: SurfaceModel, bal: SurfaceBit, ste: State) => {
  debugger;
  return cpy;
};
