# neon-opt: Neo AVM optimizer

*Notice:* this project is experimental is probably quite inefficient, it must
be considered as an inspiration for future developers to follow this path of
reducing avm size by removing useless opcodes.

Project will start with a simple algorithm for removing NOP opcodes.

*Next steps:*
- Update decompiler with newer opcodes (and adjust some opcode arguments)
- Removal of useless JUMPS
- Unreachable code detection
- Removal of useless opcode pairs (toaltstack -> fromaltstack)
- Removal of unused local variables (reducing initial local array)
- Add unit testing
- Create direct dependency graph, which makes removals easier and also detection of unreachable code


*What does it currently do?*
- Project is integrated with Eco platform: https://neocompiler.io
- NOP removal was tested on basic `HelloWorld` example
```
HelloWorld.cs
00c56b6168164e656f2e53746f726167652e476574436f6e746578740548
656c6c6f05576f726c64615272680f4e656f2e53746f726167652e507574
616c7566

After NOP removal (-3 NOPs):
00c56b68164e656f2e53746f726167652e476574436f6e74657874054865
6c6c6f05576f726c645272680f4e656f2e53746f726167652e5075746c75
66
```

```
HelloWorld.py (Python is returning zero, not void, that explains the extra byte)
53c56b68164e656f2e53746f726167652e476574436f6e74657874610548
656c6c6f05576f726c645272680f4e656f2e53746f726167652e50757461
006c7566

After NOP removal (-2 NOPs)
53c56b68164e656f2e53746f726167652e476574436f6e74657874054865
6c6c6f05576f726c645272680f4e656f2e53746f726167652e507574006c
7566
```

- NOP removal was also tested on basic `CheckWitness` example
```
00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e65
6f2e52756e74696d652e436865636b5769746e65737364320051c576000f
4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d65
2e4e6f7469667951616c756600616c7566

After NOP removal (-5 NOPs)
00c56b1423ba2703c53263e8d6e522dc32203339dcd8eee968184e656f2e
52756e74696d652e436865636b5769746e657373642f0051c576000f4f57
4e45522069732063616c6c6572c468124e656f2e52756e74696d652e4e6f
74696679516c7566006c7566
```

_NeoResearch team_

_Copyleft 2018 - MIT License_
