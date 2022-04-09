# VSCode - Enum Hamming Distance Generator

An extension to generate enums with variable number of members and values with a defined hamming distance between them

![animatedScreenshot](https://github.com/abdalmoniem/VSCode-Enum-Generator/raw/main/media/aimatedScreenshot.gif)

## Features
1. pre-made snippets for 8-16 bit enums with 5 members and 3 hamming distance between them, you can invoke these snippets by typing `ech`
2. if you want to create custom enums with defined bit width, member count and, hamming distance then type in `e[bw]c[mc]h[hd]` where:
   a. bw: bit width
   b. mc: member count
   c. hd: hamming distance

   so `e32c10h3` would generate a 32-bit enum with 10 members and hamming distance of 3 between them:

   ```c
   typedef enum {
      member_1 = 0xf29c9e9,
      /* hamming distance is 15 */
      member_2 = 0xc266a0f,
      /* hamming distance is 12 */
      member_3 = 0xf6c57dc8,
      /* hamming distance is 15 */
      member_4 = 0x92902e4f,
      /* hamming distance is 19 */
      member_5 = 0xaf61ff72,
      /* hamming distance is 13 */
      member_6 = 0x57ba1874,
      /* hamming distance is 17 */
      member_7 = 0xf5ebdf2e,
      /* hamming distance is 13 */
      member_8 = 0x4bc41eb3,
      /* hamming distance is 19 */
      member_9 = 0xc284b56b,
      /* hamming distance is 17 */
      member_10 = 0x127fc573
   } enum_name;
   ``` 

note that the hamming number generator generates random numbers and ensures minimum specified hamming distance between them, so you're not likely getting the same enum values twice anytime soon.