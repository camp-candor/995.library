import sys

content = open('apps/995.library/995.library/98.menu.unit/buz/menu.library.ts').read()

# Restore original file first since it's unmodified currently (it was staged previously, but maybe unmodded)
# Actually, the file is modified in index, let's git restore it
import subprocess
subprocess.run(['git', 'restore', '--staged', 'apps/995.library/995.library/98.menu.unit/buz/menu.library.ts'])
subprocess.run(['git', 'restore', 'apps/995.library/995.library/98.menu.unit/buz/menu.library.ts'])

content = open('apps/995.library/995.library/98.menu.unit/buz/menu.library.ts').read()


# Add ActLib.AUDIT_LIBRARY.split(']')[1],
if "ActLib.AUDIT_LIBRARY.split(']')[1]," not in content:
    content = content.replace(
        "ActLib.LIST_LIBRARY.split(']')[1],",
        "ActLib.LIST_LIBRARY.split(']')[1],\n        ActLib.AUDIT_LIBRARY.split(']')[1],"
    )

# Add descriptions
if "[ActLib.AUDIT_LIBRARY.split(']')[1]]:" not in content:
    content = content.replace(
        "[ActLib.LIST_LIBRARY.split(']')[1]]:\n            '-List all the units\\ncurrently in the library.',",
        "[ActLib.LIST_LIBRARY.split(']')[1]]:\n            '-List all the units\\ncurrently in the library.',\n        [ActLib.AUDIT_LIBRARY.split(']')[1]]:\n            '-Compare fleet repositories against\\nthe Central Coordination Manifest.',"
    )

# Update descriptions mapping
if "text.split('\\n').forEach((src: string)" not in content:
    content = content.replace(
        "text.split('\\n').forEach((src)",
        "text.split('\\n').forEach((src: string)"
    )

# Add case ActLib.AUDIT_LIBRARY
if "case ActLib.AUDIT_LIBRARY.split(']')[1]:" not in content:
    content = content.replace(
        "case ActLib.LAUNCH_LIBRARY.split(']')[1]:",
        "case ActLib.AUDIT_LIBRARY.split(']')[1]:\n            await ste.hunt(ActCns.UPDATE_CONSOLE, {\n                idx: 'cns00',\n                src: '>> [TUI] Executing Fleet Drift Audit...',\n            })\n            bit = await ste.hunt(ActLib.AUDIT_LIBRARY, {})\n            bit = await ste.hunt(ActMnu.PRINT_MENU, bit)\n            break\n\n        case ActLib.LAUNCH_LIBRARY.split(']')[1]:"
    )

with open('apps/995.library/995.library/98.menu.unit/buz/menu.library.ts', 'w') as f:
    f.write(content)
