/**
 * file: hammingNumberGenerator.js
 * 
 * date: 08-Apr-22
 * 
 * author: AbdAlMoniem AlHifnawy
 * 
 * description: Generates an array of numbers of configurable length and configurable
 *                hamming distance between its items
 */

export enum Integers {
   BINARY = 2,
   DECIMAL = 10,
   HEXADECIMAL = 16
}

export function generateCodebook(
   bitWidth: number,
   size: number,
   hammingDistance: number,
   representation: Integers,
   loopIterations: number,
   allowReduction: boolean,
   autoGenerate: boolean,
   timeout: number): { hammingCodes: Array<string> | undefined, minHam: number | undefined } {

   if (hammingDistance >= bitWidth) {
      return { hammingCodes: undefined, minHam: undefined };
   }

   let seen: Array<string> = new Array();
   let hammingCodes: Array<string> = new Array();
   let iterations = loopIterations;
   let currentHammingDistance = hammingDistance;

   let start = Date.now();

   while (true) {
      let testCandidate = getRandomBinStr(bitWidth);

      while (seen.includes(testCandidate)) { testCandidate = getRandomBinStr(bitWidth); }

      seen.push(testCandidate);

      if (hammingCodes.length === 0) { hammingCodes.push(testCandidate); }
      else {
         let valid = true;
         for (let word of hammingCodes) {
            if ((testCandidate === word) || calculateHammingDistance(testCandidate, word) < currentHammingDistance) {
               valid = false;
               break;
            }
         }

         if (valid) { hammingCodes.push(testCandidate); }
      }

      if ((hammingCodes.length >= size) && !autoGenerate) { break; }

      if (timeout > 0) {
         if (Date.now() - start >= timeout) { break; }
      } else {
         iterations -= 1;
         if (iterations <= 0) {
            if (!allowReduction) { break; }
            currentHammingDistance -= 1;
            iterations = loopIterations;
         }

         if (currentHammingDistance <= 0) { break; }
      }
   }

   if (hammingCodes.length > 0) {
      let minimums = [];

      for (let index = 0; index < hammingCodes.length - 1; index++) {
         minimums.push(calculateHammingDistance(hammingCodes[index], hammingCodes[index + 1]));
      }

      let minHam = minimums[0];

      for (let item of minimums) {
         if (minHam < item) { minHam = item; }
      }

      if (hammingCodes.length > 0) {
         minHam = currentHammingDistance;
      }

      if (hammingCodes.length !== size) {
         console.error(`could not find more than ${hammingCodes.length} code(s) with minimum hamming distance of ${minHam} between them`);
      }

      if (currentHammingDistance !== hammingDistance) {
         console.error(`could not generate ${hammingCodes.length} code(s) with minimum hamming distance of more than ${minHam} between them`);
      }

      for (let code of hammingCodes.splice(0, hammingCodes.length)) {
         hammingCodes.push(convertBinarCodeToNumberString(code, bitWidth, representation) as string);
      }

      return { hammingCodes, minHam };
   }
   else {
      console.error('Could not generate any codes with the given parameters');
   }

   return { hammingCodes: undefined, minHam: undefined };
}
export function getRandomBinStr(width: number): string {
   let binaryString = '';
   for (let i = 0; i < width; i++) {
      let randomBit = Math.floor(Math.random() * 2);

      binaryString += randomBit.toString();
   }

   return binaryString;
}

export function calculateHammingDistance(s1: string, s2: string) {
   let n1 = parseInt(s1, 2);
   let n2 = parseInt(s2, 2);

   let onesCount = 0;

   for (let bit of dec2Bin(n1 ^ n2)) {
      if (bit === '1') { onesCount += 1; }
   }

   return onesCount;
}

export function convertBinarCodeToNumberString(code: string, bitWidth: number, representation: Integers): string | undefined {
   if (representation === Integers.BINARY) { return code.padStart(bitWidth, '0'); }
   else if (representation === Integers.DECIMAL) { return `${parseInt(code, 2)}`; }
   else if (representation === Integers.HEXADECIMAL) { return (`0x${parseInt(code, 2).toString(16)}`).padStart(bitWidth / 4, '0'); }
}

export function dec2Bin(dec: number) {
   if (dec >= 0) {
      return dec.toString(2);
   }
   else {
      /* Here you could represent the number in 2s compliment but this is not what 
         JS uses as its not sure how many bits are in your number range. There are 
         some suggestions https://stackoverflow.com/questions/10936600/javascript-decimal-to-binary-64-bit 
      */
      return (~dec).toString(2);
   }
}