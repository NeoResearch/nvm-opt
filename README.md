# neon-opt: Neo AVM optimizer

*Notice:* this project is experimental is probably quite inefficient, it must
be considered as an inspiration for future developers to follow this path of
reducing avm size by removing useless opcodes.

Project will start with a simple algorithm for removing NOP opcodes.

*Next steps:*
- Update decompiler with newer opcodes (and adjust some opcode arguments)
- Adjusts of forward jumps (backward jumps are already done)
- Removal of useless JUMPS
- Unreachable code detection
- Removal of useless opcode pairs (toaltstack -> fromaltstack)
- Removal of unused local variables (reducing initial local array)
- Add unit testing


*What does it currently do?*

```
HelloWorld.cs
00c56b6168164e656f2e53746f726167652e476574436f6e746578740548
656c6c6f05576f726c64615272680f4e656f2e53746f726167652e507574
616c7566

After NOP removal (-3 NOPs):
00c56b68164e656f2e53746f726167652e476574436f6e746578740548656
c6c6f05576f726c645272680f4e656f2e53746f726167652e5075746c7566
```


_NeoResearch team_

_Copyleft 2018 - MIT License_
