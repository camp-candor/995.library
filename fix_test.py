import re

with open("apps/995.library/test/fleet.menu.test.ts", "r") as f:
    test_content = f.read()

# Replace the multiple imports in the middle
middle_imports = """import sinon from 'sinon'
import * as ActLib from '../995.library/00.library.unit/library.action'
import * as ActTrm from '../995.library/80.terminal.unit/terminal.action'
import * as ActGrd from '../995.library/81.grid.unit/grid.action'
import * as ActCns from '../995.library/83.console.unit/console.action'
import * as ActChc from '../995.library/85.choice.unit/choice.action'
import * as ActMnu from '../995.library/98.menu.unit/menu.action'
import { MenuModel } from '../995.library/98.menu.unit/menu.model'
import { libraryMenu } from '../995.library/98.menu.unit/buz/menu.library'"""

test_content = test_content.replace(middle_imports, "")

# Add them to the top
top_imports = """import test from 'ava';
import sinon from 'sinon';
import * as ActMnu from '../995.library/98.menu.unit/menu.action';
import * as ActLib from '../995.library/00.library.unit/library.action';
import * as ActTrm from '../995.library/80.terminal.unit/terminal.action';
import * as ActGrd from '../995.library/81.grid.unit/grid.action';
import * as ActCns from '../995.library/83.console.unit/console.action';
import * as ActChc from '../995.library/85.choice.unit/choice.action';
import { reducer } from '../995.library/98.menu.unit/menu.reduce';
import { MenuModel } from '../995.library/98.menu.unit/menu.model';
import { fleetMenu, sagaTornStateMenu } from '../995.library/98.menu.unit/buz/menu.fleet';
import { updateMenu } from '../995.library/98.menu.unit/buz/menu.buzz';
import { libraryMenu } from '../995.library/98.menu.unit/buz/menu.library';"""

test_content = test_content.replace("""import test from 'ava';
import * as ActMnu from '../995.library/98.menu.unit/menu.action';
import { reducer } from '../995.library/98.menu.unit/menu.reduce';
import { MenuModel } from '../995.library/98.menu.unit/menu.model';
import { fleetMenu, sagaTornStateMenu } from '../995.library/98.menu.unit/buz/menu.fleet';
import { updateMenu } from '../995.library/98.menu.unit/buz/menu.buzz';""", top_imports)

with open("apps/995.library/test/fleet.menu.test.ts", "w") as f:
    f.write(test_content)
