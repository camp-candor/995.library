with open('apps/995.library/995.library/81.grid.unit/fce/net.bit.ts', 'r') as f:
    content = f.read()
content = content.replace("left: number", "left: number | string")
content = content.replace("top: number", "top: number | string")
with open('apps/995.library/995.library/81.grid.unit/fce/net.bit.ts', 'w') as f:
    f.write(content)
