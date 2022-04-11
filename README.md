# VSCode - Enum Generator

An extension to generate enums with variable number of members and values with a defined hamming distance between them

![animatedScreenshot](https://github.com/abdalmoniem/VSCode-Enum-Generator/raw/main/media/aimatedScreenshot.gif)

## Features
create custom enums with defined bit width, member count and, hamming distance by typing in `e[bw]c[mc]h[hd]` where:
   
   1. bw: bit width
   2. mc: member count
   3. hd: hamming distance


so `e32c10h3` would generate a 32-bit enum with 10 members and a hamming distance of 3 between them:

```c
typedef enum {
   MEMBER_1 = 0xdda458cf,
   /* hamming distance is 17 */
   MEMBER_2 = 0x3e8ccab,
   /* hamming distance is 19 */
   MEMBER_3 = 0x8fc3fa2a,
   /* hamming distance is 14 */
   MEMBER_4 = 0x5d1750d6,
   /* hamming distance is 17 */
   MEMBER_5 = 0x2653c801,
   /* hamming distance is 13 */
   MEMBER_6 = 0x50fac185,
   /* hamming distance is 11 */
   MEMBER_7 = 0xa400be4d,
   /* hamming distance is 18 */
   MEMBER_8 = 0xfc637176,
   /* hamming distance is 15 */
   MEMBER_9 = 0x62e1be02,
   /* hamming distance is 16 */
   MEMBER_10 = 0x3abf37f3
} ENUM_NAME;
``` 

note that the hamming number generator generates random numbers and ensures minimum specified hamming distance between them (so in case of the previous example, it would generate numbers with minimum distance of 3 and maximum distance of `bitWidth`-1), so you're not likely getting the same enum values twice anytime soon.