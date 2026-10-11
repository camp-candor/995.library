with open("apps/995.library/995.library/00.library.unit/library.reduce.ts", "r") as f:
    content = f.read()

content = content.replace("        case Act.CHECK_GIT_WORKING_TREE:\n            return Buzz.checkGitWorkingTree(act.bale.src || process.cwd()).then(() => clone(model, true))\n\n", "")

with open("apps/995.library/995.library/00.library.unit/library.reduce.ts", "w") as f:
    f.write(content)
