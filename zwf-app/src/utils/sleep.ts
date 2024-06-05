
export async function sleep(ms): Promise<void> {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
}
