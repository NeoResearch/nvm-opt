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

*Ideas*
- Use in C# opcode `6a DUPFROMALTSTACK` which can replace 3:
```
 6c FROMALTSTACK  # Puts the input onto the top of the main stack. Removes it from the alt stack.
 76 DUP  # Duplicates the top stack item.
 6b TOALTSTACK  # Puts the input onto the top of the alt stack. Removes it from the main stack.
```

*What does it currently do?*
- Updates JMP and CALL after NOP removal
- Project is integrated with Eco platform: https://neocompiler.io
- Results for C# ICO template with only NOP reduction strategy: operation reduction 9.31%; byte compression 3.51%
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

Generating: 00c56b5561650700616c756651c56b6c766b00527ac46c766b00c35a95616c7566
NOP removal (-3 => 9.09%): 00c56b556506006c756651c56b6c766b00527ac46c766b00c35a956c7566
#33 bytes
00 PUSH0  #An empty array of bytes is pushed onto the stack
c5 NEWARRAY  #
6b TOALTSTACK  # Puts the input onto the top of the alt stack. Removes it from the main stack.
55 PUSH5  # The number 5 is pushed onto the stack.
61 NOP  # Does nothing.
65 CALL 0700 # 7
61 NOP  # Does nothing.
6c FROMALTSTACK  # Puts the input onto the top of the main stack. Removes it from the alt stack.
75 DROP  # Removes the top stack item.
66 RET  #
51 PUSH1  # The number 1 is pushed onto the stack.
c5 NEWARRAY  #
6b TOALTSTACK  # Puts the input onto the top of the alt stack. Removes it from the main stack.
6c FROMALTSTACK  # Puts the input onto the top of the main stack. Removes it from the alt stack.
76 DUP  # Duplicates the top stack item.
6b TOALTSTACK  # Puts the input onto the top of the alt stack. Removes it from the main stack.
00 PUSH0  #An empty array of bytes is pushed onto the stack
52 PUSH2  # The number 2 is pushed onto the stack.
7a ROLL  # The item n back in the stack is moved to the top.
c4 SETITEM  #
6c FROMALTSTACK  # Puts the input onto the top of the main stack. Removes it from the alt stack.
76 DUP  # Duplicates the top stack item.
6b TOALTSTACK  # Puts the input onto the top of the alt stack. Removes it from the main stack.
00 PUSH0  #An empty array of bytes is pushed onto the stack
c3 PICKITEM  #
5a PUSH10  # The number 10 is pushed onto the stack.
95 MUL  # a is multiplied by b.
61 NOP  # Does nothing.
6c FROMALTSTACK  # Puts the input onto the top of the main stack. Removes it from the alt stack.
75 DROP  # Removes the top stack item.
66 RET  #
```

_NeoResearch team_

_Copyleft 2018 - MIT License_
