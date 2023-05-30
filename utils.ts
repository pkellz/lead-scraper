export function sleep(seconds: number) {
  console.log(`💤 Sleeping for ${seconds}s...`);
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
