import Model from './99.core/interface/model.interface.js';

import ShadeUnit from './00.shade.unit/shade.unit.js';
import ApplicationUnit from './01.application.unit/application.unit.js';
import SurfaceUnit from './02.surface.unit/surface.unit.js';
import ContainerUnit from './03.container.unit/container.unit.js';
import GraphicUnit from './04.graphic.unit/graphic.unit.js';
import TextUnit from './05.text.unit/text.unit.js';
import SpriteUnit from './06.sprite.unit/sprite.unit.js';
import HexagonUnit from './07.hexagon.unit/hexagon.unit.js';
import FocigonUnit from './08.focigon.unit/focigon.unit.js';
import LoopUnit from './09.loop.unit/loop.unit.js';
import ToonUnit from './10.toon.unit/toon.unit.js';
import VideoUnit from './11.video.unit/video.unit.js';
import FrameUnit from './12.frame.unit/frame.unit.js';
import CameraUnit from './13.camera.unit/camera.unit.js';
import SpritesheetUnit from './15.spritesheet.unit/spritesheet.unit.js';
import VisageUnit from './21.visage.unit/visage.unit.js';
import ChromeUnit from './24.chrome.unit/chrome.unit.js';
import CollectUnit from './97.collect.unit/collect.unit.js';
import BusUnit from './99.bus.unit/bus.unit.js';

import Shade from './00.shade.unit/fce/shade.interface.js';
import { ShadeModel } from './00.shade.unit/shade.model.js';
import Application from './01.application.unit/fce/application.interface.js';
import { ApplicationModel } from './01.application.unit/application.model.js';
import Surface from './02.surface.unit/fce/surface.interface.js';
import { SurfaceModel } from './02.surface.unit/surface.model.js';
import Container from './03.container.unit/fce/container.interface.js';
import { ContainerModel } from './03.container.unit/container.model.js';
import Graphic from './04.graphic.unit/fce/graphic.interface.js';
import { GraphicModel } from './04.graphic.unit/graphic.model.js';
import Text from './05.text.unit/fce/text.interface.js';
import { TextModel } from './05.text.unit/text.model.js';
import Sprite from './06.sprite.unit/fce/sprite.interface.js';
import { SpriteModel } from './06.sprite.unit/sprite.model.js';
import Hexagon from './07.hexagon.unit/fce/hexagon.interface.js';
import { HexagonModel } from './07.hexagon.unit/hexagon.model.js';
import Focigon from './08.focigon.unit/fce/focigon.interface.js';
import { FocigonModel } from './08.focigon.unit/focigon.model.js';
import Loop from './09.loop.unit/fce/loop.interface.js';
import { LoopModel } from './09.loop.unit/loop.model.js';
import Toon from './10.toon.unit/fce/toon.interface.js';
import { ToonModel } from './10.toon.unit/toon.model.js';
import Video from './11.video.unit/fce/video.interface.js';
import { VideoModel } from './11.video.unit/video.model.js';
import Frame from './12.frame.unit/fce/frame.interface.js';
import { FrameModel } from './12.frame.unit/frame.model.js';
import Camera from './13.camera.unit/fce/camera.interface.js';
import { CameraModel } from './13.camera.unit/camera.model.js';
import Spritesheet from './15.spritesheet.unit/fce/spritesheet.interface.js';
import { SpritesheetModel } from './15.spritesheet.unit/spritesheet.model.js';
import Visage from './21.visage.unit/fce/visage.interface.js';
import { VisageModel } from './21.visage.unit/visage.model.js';
import Chrome from './24.chrome.unit/fce/chrome.interface.js';
import { ChromeModel } from './24.chrome.unit/chrome.model.js';
import Collect from './97.collect.unit/fce/collect.interface.js';
import { CollectModel } from './97.collect.unit/collect.model.js';
import Bus from './99.bus.unit/fce/bus.interface.js';
import { BusModel } from './99.bus.unit/bus.model.js';

export const list: Array<any> = [ShadeUnit, ApplicationUnit, SurfaceUnit, ContainerUnit, GraphicUnit, TextUnit, SpriteUnit, HexagonUnit, FocigonUnit, LoopUnit, ToonUnit, VideoUnit, FrameUnit, CameraUnit, SpritesheetUnit, VisageUnit, ChromeUnit, CollectUnit, BusUnit];

import * as reduceFromShade from './00.shade.unit/shade.reduce.js';
import * as reduceFromApplication from './01.application.unit/application.reduce.js';
import * as reduceFromSurface from './02.surface.unit/surface.reduce.js';
import * as reduceFromContainer from './03.container.unit/container.reduce.js';
import * as reduceFromGraphic from './04.graphic.unit/graphic.reduce.js';
import * as reduceFromText from './05.text.unit/text.reduce.js';
import * as reduceFromSprite from './06.sprite.unit/sprite.reduce.js';
import * as reduceFromHexagon from './07.hexagon.unit/hexagon.reduce.js';
import * as reduceFromFocigon from './08.focigon.unit/focigon.reduce.js';
import * as reduceFromLoop from './09.loop.unit/loop.reduce.js';
import * as reduceFromToon from './10.toon.unit/toon.reduce.js';
import * as reduceFromVideo from './11.video.unit/video.reduce.js';
import * as reduceFromFrame from './12.frame.unit/frame.reduce.js';
import * as reduceFromCamera from './13.camera.unit/camera.reduce.js';
import * as reduceFromSpritesheet from './15.spritesheet.unit/spritesheet.reduce.js';
import * as reduceFromVisage from './21.visage.unit/visage.reduce.js';
import * as reduceFromChrome from './24.chrome.unit/chrome.reduce.js';
import * as reduceFromCollect from './97.collect.unit/collect.reduce.js';
import * as reduceFromBus from './99.bus.unit/bus.reduce.js';

export const reducer: any = {
  shade: reduceFromShade.reducer,
  application: reduceFromApplication.reducer,
  surface: reduceFromSurface.reducer,
  container: reduceFromContainer.reducer,
  graphic: reduceFromGraphic.reducer,
  text: reduceFromText.reducer,
  sprite: reduceFromSprite.reducer,
  hexagon: reduceFromHexagon.reducer,
  focigon: reduceFromFocigon.reducer,
  loop: reduceFromLoop.reducer,
  toon: reduceFromToon.reducer,
  video: reduceFromVideo.reducer,
  frame: reduceFromFrame.reducer,
  camera: reduceFromCamera.reducer,
  spritesheet: reduceFromSpritesheet.reducer,
  visage: reduceFromVisage.reducer,
  chrome: reduceFromChrome.reducer,
  collect: reduceFromCollect.reducer,
  bus: reduceFromBus.reducer,
};

export default class UnitData implements Model {
  shade: Shade = new ShadeModel();
  application: Application = new ApplicationModel();
  surface: Surface = new SurfaceModel();
  container: Container = new ContainerModel();
  graphic: Graphic = new GraphicModel();
  text: Text = new TextModel();
  sprite: Sprite = new SpriteModel();
  hexagon: Hexagon = new HexagonModel();
  focigon: Focigon = new FocigonModel();
  loop: Loop = new LoopModel();
  toon: Toon = new ToonModel();
  video: Video = new VideoModel();
  frame: Frame = new FrameModel();
  camera: Camera = new CameraModel();
  spritesheet: Spritesheet = new SpritesheetModel();
  visage: Visage = new VisageModel();
  chrome: Chrome = new ChromeModel();
  collect: Collect = new CollectModel();
  bus: Bus = new BusModel();
}
