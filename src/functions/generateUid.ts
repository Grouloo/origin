export function generateUid(seed: number): string {
   return seed.toString() + (Math.random() * 100).toFixed(0).toString()
}
