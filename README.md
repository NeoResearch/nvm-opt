# neon-opt: Neo AVM optimizer

*Notice:* this project is experimental is probably quite inefficient, it must
be considered as an inspiration for future developers to follow this path of
reducing avm size by removing useless opcodes.

Project will start with a simple algorithm for removing NOP opcodes.

*Next steps:*
- Update decompiler with newer opcodes (and adjust some opcode arguments)
- *automatically inline function calls*
- Removal of useless JUMPS
- Unreachable code detection
- Removal of useless opcode pairs (toaltstack -> fromaltstack)
- Removal of unused local variables (reducing initial local array)
- Add unit testing
- Create direct dependency graph, which makes removals easier and also detection of unreachable code


*What does it currently do?*
- Updates `JMP` and `CALL` after `NOP` removal
- Tries to replace `FROMALTSTACK,DUP,TOALTSTACK` with `DUPFROMALTSTACK`
- Project is integrated with Eco platform: https://neocompiler.io
- NOP strategy: results for C# ICO template with only NOP reduction strategy: operation reduction 9.31%; byte compression 3.51%
- General strategy (NOP+DUP): results for C# ICO template bytes -12.51%, ops -28.68%

*Examples*
- Optimization tested on basic `HelloWorld` example
```
HelloWorld.cs
00c56b6168164e656f2e53746f726167652e476574436f6e746578740548
656c6c6f05576f726c64615272680f4e656f2e53746f726167652e507574
616c7566

00c56b68164e656f2e53746f726167652e476574436f6e74657874054865
6c6c6f05576f726c645272680f4e656f2e53746f726167652e5075746c75
66
#OPTIMIZED AVM USING neon-opt: bytes 4.69% | ops 20.00%

============================================================

HelloWorld.py (Python is returning zero, not void, that explains the extra byte)
53c56b68164e656f2e53746f726167652e476574436f6e74657874610548
656c6c6f05576f726c645272680f4e656f2e53746f726167652e50757461
006c7566

After NOP removal (-2 NOPs)
53c56b68164e656f2e53746f726167652e476574436f6e74657874054865
6c6c6f05576f726c645272680f4e656f2e53746f726167652e507574006c
7566
```

- Optimization tested on basic `CheckWitness` example
```
CheckWitness.cs (base) # USING SCRIPTHASH, SHORTER...
00c56b611423ba2703c53263e8d6e522dc32203339dcd8eee96168184e65
6f2e52756e74696d652e436865636b5769746e65737364320051c576000f
4f574e45522069732063616c6c6572c46168124e656f2e52756e74696d65
2e4e6f7469667951616c756600616c7566

CheckWitness.cs (opt)
00c56b1423ba2703c53263e8d6e522dc32203339dcd8eee968184e656f2e
52756e74696d652e436865636b5769746e657373642f0051c576000f4f57
4e45522069732063616c6c6572c468124e656f2e52756e74696d652e4e6f
74696679516c7566006c7566
#OPTIMIZED AVM USING neon-opt: bytes 4.67% | ops 19.23%

============================================================

CheckWitness.py (base) # USING PUBLICKEY, EXPECTS TO BE LONGER...
58c56b21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b754
8ca2a46c4fcf4a6a00527ac46a00c368184e656f2e52756e74696d652e43
6865636b5769746e657373616a51527ac46a51c36428000f4f574e455220
69732063616c6c6572680f4e656f2e52756e74696d652e4c6f67516c7566
61006c7566

58c56b21031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b754
8ca2a46c4fcf4a6a00527ac46a00c368184e656f2e52756e74696d652e43
6865636b5769746e6573736a51527ac46a51c36427000f4f574e45522069
732063616c6c6572680f4e656f2e52756e74696d652e4c6f67516c756600
6c7566
#OPTIMIZED AVM USING neon-opt: bytes 1.60% | ops 5.88%
```

- This simple contract seems to indicate many things to remove:
```
public static int teste(int x)
{
    return x*10;
}
public static int Main()
{
    return teste(5);
}

00c56b5561650700616c756651c56b6c766b00527ac46c766b00c35a9561
6c7566

00c56b556506006c756651c56b6a00527ac46a00c35a956c7566
#OPTIMIZED AVM USING neon-opt: bytes 21.21% | ops 22.58%
```

_NeoResearch team_

_Copyleft 2018 - MIT License_
