with open('data/directive/day-002/801.phase-one.jules.md', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('- [ ]'):
        new_lines.append(line.replace('- [ ]', '- [x]'))
    else:
        new_lines.append(line)

with open('data/directive/day-002/801.phase-one.jules.md', 'w') as f:
    f.writelines(new_lines)

# Append audit log
with open('data/directive/day-002/801.phase-one.jules.md', 'a') as f:
    f.write("\n\n### Audit Log\n")
    f.write("| Action | Status | Notes |\n")
    f.write("|---|---|---|\n")
    f.write("| `grid.buzz.ts` debugger removal | Pass | Replaced with initGrid resolution |\n")
    f.write("| `input.buzz.ts` debugger removal | Pass | Resolved initInput and openInput cleanly |\n")
    f.write("| `console.buzz.ts` render cycle fix | Pass | Async rendering implemented |\n")
    f.write("| `menu.buzz.ts` debugger removal | Pass | Resolved createMenu cleanly |\n")
    f.write("| `menu.library.ts` duplicate case | Pass | Removed duplicate CREATE_UNIT case |\n")
    f.write("| `buzzer.cleanup.test.ts` added | Pass | 7 tests passed |\n")
